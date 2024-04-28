// Modified from the code from (https://github.com/Neuton-tinyML/magic_wand/tree/master)

#include "Arduino_BMI270_BMM150.h" //#include <Arduino_LSM9DS1.h>
#include <Arduino_HS300x.h>           // HS3003 Temp & Humidity sensor
#include <Arduino_APDS9960.h>         // Proximity Sensor


#include "src/neuton.h"
#include "src/preprocessing/blocks/timeseries/timeseries.h"
#include "src/postprocessing/blocks/moving_average/moving_average.h"

#define CONVERT_G_TO_MS2    (9.80665f)
#define FREQUENCY_HZ        (100)
#define INTERVAL_MS         (1000 / (FREQUENCY_HZ + 1))

#define THRESHOLD           (0.95f)
#define SUPPRESSION_COUNT   (NEUTON_MODEL_WINDOW_SIZE / 4)
#define AVERAGING_WINDOW    (5)

//#define NO_CALC
//#define DUMP_ALL_PREDICTIONS

static unsigned long last_interval_ms = 0;

static neuton_preprocessing_block_timeseries_instance ts = {0};
static neuton_postprocessing_block_moving_average_instance avg = {0};

static input_t tsWindowBuffer[NEUTON_MODEL_WINDOW_SIZE * NEUTON_MODEL_INPUTS_COUNT_ORIGINAL];
static float ppWindowBuffer[AVERAGING_WINDOW * NEUTON_MODEL_OUTPUTS_COUNT];
static float ppAveragesBuffer[NEUTON_MODEL_OUTPUTS_COUNT];

void OnDataReady(void *ctx, void *data)
{
  input_t *inputs = (input_t*)data;
  size_t inputsCount = neuton_model_inputs_count();
  size_t windowSize = neuton_model_window_size();
  
  for (size_t i = 0; i < windowSize; i++)
  {
#ifndef NO_CALC
    if (neuton_model_set_inputs(inputs) == 0)
    {
      float* outputs;
      uint16_t index;
      uint64_t start_time = micros();
      if (neuton_model_run_inference(&index, &outputs) == 0)
      {

        uint64_t stop_time = micros();

#ifdef DUMP_ALL_PREDICTIONS
        Serial.print(index, DEC);
        Serial.print(": ");
        Serial.print(outputs[0], 2);
        Serial.print(", ");
        Serial.print(outputs[1], 2);
        Serial.print(", ");
        Serial.print(outputs[2], 2);
        Serial.print(", ");
        Serial.print(outputs[3], 2);
        Serial.println();
#endif

#if 0
        Serial.print("Inference time: ");
        Serial.print(stop_time - start_time);
        Serial.print(" us\n");
#endif

        if (NeutonPostprocessingBlockMovingAverageProcess(&avg, outputs, &outputs, &index) == 0)
        {
          if (index == 0)
          {
            Serial.println("Ring"); // Serial.print(" Ring: O      ");
            delay(500);
          }
          if (index == 1)
          {
            Serial.println("Slope");  //Serial.print("Slope: /_     ");
            delay(500);
          }
          if (index == 2)
          {
            Serial.println("Wing"); //Serial.print(" Wing: \\/\\/   ");
            delay(500);
          }
          if (index == 3)
          {
//            Serial.print("Ooops! Nothing");
            avg.suppressionCurrentCounter = 0;
            continue;
          }

          // Serial.print("     score: ");
          // Serial.println(outputs[index], 2);
        }
      }
    }
#endif
    
    inputs += inputsCount;
  }
}


int LED_PIN = 5;
int BUTTON_PIN = 2;
int buttonState = 0;


void setup() {
  Serial.begin(9600); //Serial.begin(115200);
  while (!Serial);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  digitalWrite(LED_PIN, LOW);  // Initialize LED state


  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  ts.dataStride = sizeof(input_t);
  ts.windowSize = neuton_model_window_size() * neuton_model_inputs_count();
  ts.windowHop = neuton_model_inputs_count();
  ts.windowBuffer = tsWindowBuffer;
  ts.onWindow = OnDataReady;

  avg.elementsCount = neuton_model_outputs_count();
  avg.suppressionCount = SUPPRESSION_COUNT;
  avg.threshold = THRESHOLD;
  avg.windowSize = AVERAGING_WINDOW;
  avg.windowBuffer = ppWindowBuffer;
  avg.averages = ppAveragesBuffer;


  if (!APDS.begin()) {
    Serial.println("Error initializing APDS9960 sensor!");
  }
  // Initialize the HTS221 sensor
  if (!HS300x.begin()) {
    Serial.println("Failed to initialize humidity and temperature sensor!");
    while (1);
  }
  float temperature = HS300x.readTemperature();
  float humidity = HS300x.readHumidity();

  //Serial.print("Temperature(°C)Humidity(%): ");
  Serial.print(temperature);
  Serial.print(",");
  Serial.println(humidity);
}



void proximityAction()
{
  if (APDS.proximityAvailable()) {
    int proximity = APDS.readProximity();   // Proximity reading -- 0 : close || 255 : far || -1 : error
    if (proximity==0){
        Serial.println("reset");
        delay(1000);
    }
  }
}


void buttonAction() {
    buttonState = digitalRead(BUTTON_PIN);  // Read the button state
    digitalWrite(LED_PIN, buttonState);
    if(buttonState == HIGH)
    {
        Serial.println("Button");
        delay(500); 
    }
}

void loop() {
  float x, y, z;
  proximityAction();
  buttonAction();

  if (millis() > last_interval_ms + INTERVAL_MS) {
    last_interval_ms = millis();

    input_t inputs[3];

    IMU.readAcceleration(x, y, z);
    
    inputs[0] = x * CONVERT_G_TO_MS2;
    inputs[1] = y * CONVERT_G_TO_MS2;
    inputs[2] = z * CONVERT_G_TO_MS2;

#ifndef NO_CALC
    NeutonPreprocessingBlockTimeseriesProcess(&ts, inputs, 3);
#endif
  }
}

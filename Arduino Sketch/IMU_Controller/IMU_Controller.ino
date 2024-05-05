// original code from 'Classifying IMU Data' of 'Get Started With Machine Learning on Arduino'
// (https://docs.arduino.cc/tutorials/nano-33-ble-sense-rev2/get-started-with-machine-learning/)
// Code is modified to work with Arduino Nano BLE 33 Sense Rev2

#include "Arduino_BMI270_BMM150.h" //IMU
#include <Arduino_APDS9960.h>      // Proximity Sensor
#include <Arduino_HS300x.h>        // HS3003 Temp & Humidity sensor

// Define Constants
int LED_PIN = 5;
int BUTTON_PIN = 2;
int buttonState = 0;

const float tiltThreshold = 0.5;
const int delayTime = 100;

const float accelerationThreshold = 2.5; // threshold of significant in G's
const int numSamples = 119;

int samplesRead = numSamples;

void setup()
{
  Serial.begin(9600);
  while (!Serial)
    ;

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  digitalWrite(LED_PIN, LOW); // Initialize LED state

  if (!APDS.begin())
  {
    Serial.println("Error initializing APDS9960 sensor!");
  }

  // initialize the IMU
  if (!IMU.begin())
  {
    Serial.println("Failed to initialize IMU!");
    while (1)
      ;
  }

  // print out the samples rates of the IMUs
  Serial.print("Accelerometer sample rate = ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println(" Hz");
  Serial.print("Gyroscope sample rate = ");
  Serial.print(IMU.gyroscopeSampleRate());
  Serial.println(" Hz");
  Serial.println();

  // Initialize the HTS221 sensor
  if (!HS300x.begin())
  {
    Serial.println("Failed to initialize humidity and temperature sensor!");
    while (1)
      ;
  }
  float temperature = HS300x.readTemperature();
  float humidity = HS300x.readHumidity();

  // Serial.print("Temperature(°C)Humidity(%): ");
  Serial.print(temperature);
  Serial.print(",");
  Serial.println(humidity);
}

// Action functions
// Function to get proximity sensor reading
// Output key "reset"
void proximityAction()
{
  if (APDS.proximityAvailable())
  {
    int proximity = APDS.readProximity(); // Proximity reading -- 0 : close || 255 : far || -1 : error
    if (proximity == 0)
    {
      Serial.println("reset");
      delay(3000);
    }
  }
}

// Function to read Button state
// if Button state is on -- OUTPUT key "Button"
void buttonAction()
{
  buttonState = digitalRead(BUTTON_PIN); // Read the button state
  digitalWrite(LED_PIN, buttonState);
  if (buttonState == HIGH)
  {
    Serial.println("Button");
    delay(2000);
  }
}

// Function to output tilt direction from Accelerator reading
void tiltAction(float axis, const char *direction)
{
  if (axis > tiltThreshold || axis < -tiltThreshold)
  {
    // Scale and calculate degrees
    int degrees = map(axis * 100, -100, 100, -90, 90);
    // Output based on direction
    // Serial.print("Tilting ");
    if (strcmp(direction, "Y") == 0)
    {
      Serial.println((axis < 0) ? "right " : "left ");
      delay(delayTime);
    }
    else if (strcmp(direction, "X") == 0)
    {
      Serial.println((axis < 0) ? "down " : "up ");
      delay(delayTime);
    }
  }
}

void loop()
{
  buttonAction();
  proximityAction();

  // static bool isCollecting = false;  // debug
  float aX, aY, aZ;

  if (IMU.accelerationAvailable())
  {
    IMU.readAcceleration(aX, aY, aZ);
    // Handle Y-axis tilting
    tiltAction(aY, "Y");
    // Handle X-axis tilting
    tiltAction(aX, "X");
  }
}

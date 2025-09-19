# IoT_Artmaker

# Introduction

Previously, variations of Arduino-powered magic wand project garnered a lot of attention and became very popular–an easy-to-implement and fun way to record training data and train the model to output inference to the serial monitor on Arduino IDE. This invites users to easily interact with the program utilizing sensors equipped on the Arduino Nano board in creative ways. The project aims to create a smaller-scale immersive visual creation. With a controller and a monitor using web sketch editors, this project allows users to create mesmerizing patterns.
Rather than using conventional input methods, we will utilize motion to connect the user in the space in an interactive way to increase the interactive potentials of the technologies involved. The Wand is equipped with Arduino Nano BLE board with various onboard sensors including an accelerometer, gyroscope, proximity sensor, humidity and temperature sensor, and more, and serves as an original alternative to regular remote controllers, or keyboards, and mice. Using Arduino libraries including tinyML, the project utilizes various sensors (IMU sensors, temperature & humidity sensor, proximity sensor, etc) to measure the user’s interaction/action in real-time and translate it into 2D visual arts. The user’s movements recorded through the Wand will be reflected in the movements of the visualization imagery.

![App demo]()

## Technical approach:

- Arduino Nano 33 BLE Sense Rev2 board is used as a controller. Various on-board sensors including IMU, Temperature and Humidity sensor, and Proximity sensor are used to get readings and a button and a LED are connected to the board. These are output to p5.js web editor via serial server/port to control the p5.js sketch that is setup to modify attributes that create visuals.

- Overall Flow  
  ![Overall Flow Diagram](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand1.png)
- tinyML workflow  
  ![tinyML workflow Diagram](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand2.png)
- Circuit Diagram: Arduino Nano BLE Sense Rev2, Button, LED  
  ![Circuit Diagram](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand3.png)  
  ![Arduino Diagram](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand4.png)
- Prototype  
  ![Image of Device Prototype](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand5.png)

## Implementation

- Hardware:
  Arduino Nano BLE Sense Rev 2, Computer, Display, breadboard, LED, button, resisters, and wires.
- Software, Library & Tools:
  - Arduino Create Web Editor
  - Arduino Library:
    - Arduino_TensorFlowLite
    - Arduino_BMI270_BMM150 – for IMU Sensor
    - Arduino_APDS9960 – for Proximity Sensor
    - Arduino_HS300x – for Temperature and Humidity Sensor
  - p5.js Web Editor
  - Serial Communication - p5.serialserver open-source library
- References:

  - [codelabMagicwand Tutorial](https://codelabs.developers.google.com/magicwand#5)
  - [Arduino Nano BLE Sense Rev2 Tutorials](https://docs.arduino.cc/tutorials/nano-33-ble-sense-rev2/cheat-sheet/) - [Accessing Accelerometer Data on Nano 33 BLE Sense Rev2](https://docs.arduino.cc/tutorials/nano-33-ble-sense-rev2/imu-accelerometer/) - [Accessing Gyroscope Data on Nano 33 BLE Sense Rev2](https://docs.arduino.cc/tutorials/nano-33-ble-sense-rev2/imu-gyroscope/)
  - [Gesture Recognition with the Nano 33 BLE Sense](https://docs.arduino.cc/tutorials/nano-33-ble-sense-rev2/gesture-sensor/)
  - [Get Started With Machine Learning on Arduino](https://docs.arduino.cc/tutorials/nano-33-ble-sense-rev2/get-started-with-machine-learning/)
  - [Neuton.AI model](https://github.com/Neuton-tinyML/magic-wand-neuton-on-tensorflow-data)
  - P5.js Codes
    - [CodingTrain-Falling Sand](https://editor.p5js.org/codingtrain/sketches/AoH40T6fV) sketch
    - Serial implementation adapted from [p5.serial code examples](https://github.com/p5-serial/p5.serialport/tree/main)

---

- Sketch 1: Falling Sand  
  This sketch is inspired by the Falling Sand simulation. The p5.js sketch is based on Codingtrain’s code (https://editor.p5js.org/codingtrain/sketches/Ij5i7a3w4)
  Through serial, p5.js receives commands(gesture inferences) from Arduino board and controls the Direction of falling sand, Hue, Saturation, Density of sand grain, Background color, and toggle for Blur.
  After many attempts to use tinyML tensorflowLT model to control the attributes were unsuccessful due to heavy memory usage on Arduino Nano to handle the inferences and Arduino would freeze and the computer would freeze as well. To reduce the memory usage, I’ve used the model from Neuton.AI (https://github.com/Neuton-tinyML/magic-wand-neuton-on-tensorflow-data) This model was about much lighter and faster with about 1/3 of file size compared to tensorflow model which allowed inference and other sensor readings could be run together.
  The ML model recognizes three gestures: Wing(\/\/), Slope(/\_), Ring(O)
  Theses respectively control the Hue value, Direction of falling sand(left or right), Sand grain density(toggle between 0.5 & 0.75)
  Also, the initial reading of the Temperature and Humidity sensor translates to the starting Hue and Saturation values for the sand.
  The button toggles apply a blur effect on and off and the proximity sensor toggles between black and white and halt the movement of falling sand for 2 seconds.

- Sketch 2: Educated Toast  
  This sketch creates a grid of points that are displaced using noise (https://p5js.org/reference/#/p5/noise) and attractor point. The location of the point is manipulated by the Arduino controller left, right, up, and down, and by the distance between this control point, the amount of displacement and translation is computed and visualized. As the attractor point is incremented by the Arduino IMU sensor output, also hue value and saturation value are incremented according to the direction of the movement(right: +, left: -, up: +, down: -) The initial temperature and humidity sensor reading setup the starting hue and saturation values. The proximity sensor reading toggles reset the point field back to a flat state and the button toggles the background color between black and white making the visual more interesting with higher contrast.

- Sketch 3: Columnar Basalt  
  This sketch is built on the idea of Educated Toast by introducing WebGL, 3D, Light, and rendering. It uses a similar approach to the relationship between the controlling attributes, colored light, and rotation of the camera are controlled by the Arduino board.

---

## Results

- Sketch 1: Falling Sand  
   ![Sample of Sketch Visuals](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand6.png)
- Sketch 2: Educated Toast  
   ![Sample of Sketch Visuals](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand7.png)
- Sketch 3: Columnar Basalt  
   ![Sample of Sketch Visuals](https://github.com/slyncrafty/laughing-giggle/blob/main/img/wand8.png)

## Discussion

- What did not work  
  A lot of resources/tutorials use Arduino Nano BLE 33 Sense, not the new Rev2. There were some significant changes for the libraries(including tensorflowLT, IMU, etc) and some were not compatible with the new Rev2 board. TinyML/Tensorflow has been updated since the tutorial and directory/file structure have changed so debugging took longer than expected. The provided Tensorflow gesture model (using Arduino Nano BLE 33 Sense) was performing very poorly as well with the updated Rev2 board. I had to train a model, however, it turned out to be too heavy for Arduino Nano board to handle inference. The accuracy was much better but the performance was lagging and often resulting crash/freeze after some inference especially when used along with other sensors. So instead of using tinyML/Tensorflow, I found another model that uses Neuton.ai which was much lighter compared to tensorflowLT. There is room to improve in terms of the accuracy and performance of the model, but I was able to run multiple sensor readings and relay that information to p5.js sketch. It was hard to control the p5.js sketch as intended with gestures, in terms of timing and the weight of the gesture on the visual sketch. I created a much simpler control using Temperature & Humidity, Button, LED, and Gyroscope Sensor to measure the tilting of the controller which was much easier to handle and much faster.
  Also in terms of serial connection, I’ve used the p5.js library tool(p5.serialserver) It worked but sometimes it would require several attempts to make the connection successfully.

- Takeaway  
  Utilizing the microcontroller to create interesting visuals is a way to connect physical sense to virtual space. There are many different ways to interpret the sensor readings from the Arduino. One of the further development possibilities would be implementing a Bluetooth connection between Arduino and p5.js and getting a custom PCB board to streamline the whole circuit setup. This can lead to placing the unit on the body, head, or hand for example rather than using a handheld device which can lead to a more interesting relationship between the body in physical space and the virtual space.
  Also, in terms of utilizing tinyML, a better-trained model that is also lighter and faster to infer would be another further development that can help the performance and design of interaction better.
  It was also a good attempt to create an experience between human and computer and learning that this process needs multi-faceted considerations including figuring out meaningful and intuitive user input/gestures to connect to visual sketch and making the visuals interesting and engaging.
  Current development does not have an integrated platform and one of the next steps would be building a user interface.
  There are many possibilities for applications with Arduino Nano board utilizing the onboard sensors and making it part of an interactive art project. This was an enjoyable project. I’ve learned more about Arduino programming, tinyML, and p5.js programming working through this project.

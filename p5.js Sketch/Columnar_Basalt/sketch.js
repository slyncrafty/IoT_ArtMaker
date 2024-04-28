//////////
//Columnar Basalt
//receive command from Arduino Nano board 
//via serial communication p5.js sketch 
//to control pattern
//////////


const boxSize = 20;
let amount = 400;
let speed = 0.005;
let factor = 0.008;

// Control setup
let bgValue = 0;
let hueValue = 0;
let satValue = 0;
let hueOffset = 15;
let satOffset = 15;
let attractorX;
let attractorY;
let step = 10; // 0.5;  
let blurToggle =0;
let angle1;
let angle2;


let port_num = "/dev/tty.usbmodem11401";
let serial;

function setup() {
  createCanvas(600, 600, WEBGL);
  camera(0, 200, (height/2) / tan(PI/7), 0, 0, 0, 0, 1, -1);
  attractorX = width%4;
  attractorY = height%4;
  frameRate(30);
  //setupSerial();
}



function draw() {
  background(bgValue);
  ambientLight(100);
  angle1 = map(attractorX*0.01, 0, 1, radians(-15), radians(15));
  angle2 = map(attractorY*0.01, 0, 1, radians(-45), radians(45));
  //rotateX(angle2);
  rotateY(angle1);
  //console.log(attractorX);
  //colorMode(HSB, 360, 255, 255)
  directionalLight(360, satValue, hueValue, -0.25, 0, 0);
  directionalLight(satValue, hueValue, 255, 0.25, 0, 0);
  pointLight(0, satValue, 255, -width/2 + 100, -height/2 + 100, 200);
  
  drawBoxes();
  addBlur(tog=blurToggle);
}



function drawBoxes() {
  for (let x = 0; x < width; x += boxSize) {
    for (let y = 0; y < height; y += boxSize) {
      push();
      translate(x - width / 2 + boxSize / 2, y - height / 2 + boxSize / 2, 0);
      let depth = constrain(noise((x + attractorX) * factor, (y + attractorY) * factor, frameCount * speed) * amount, 0, 1000);
      box(boxSize, boxSize, depth);
      pop();
    }
  }
}



function keyPressed() {
  // Adjust attractor position and hue/saturation based on arrow keys
  processCommands(key);
}


function processCommands(direction) {
  switch (direction) {
    case 'a': //left
      attractorX -= step;
      hueValue = (hueValue - hueOffset + 360) % 360;
      console.log("left");
      break;
    case 'd':  //right
      attractorX += step;
      hueValue = (hueValue + hueOffset) % 360;
      console.log("right");
      break;
    case 'w':  //up
      attractorY += step;
      satValue = (satValue - satOffset + 255) % 255;
      console.log("up");
      break;
    case 's':  //ArrowDown
      attractorY -= step;
      satValue = (satValue + satOffset) % 255;
      console.log("down");
      break;
    case 'r':
      resetView();
      amount = amount === 400 ? 200: 400;
      console.log("r");
      break;
    case 'b':
      satValue = (satValue + satOffset*2 + 255) % 255;
      console.log("b")
      break;
  }
  // handle out of bound
  attractorX = constrain(attractorX, 0, width);
  attractorY = constrain(attractorY, 0, height);
}



function setupSerial() {
    serial = new p5.SerialPort();
    serial.list();
    serial.open(port_num);
    serial.on('connected', () => console.log("Connected to Server"));
    serial.on('list', (thelist) => console.log("List of Serial Ports:", thelist));
    serial.on('open', () => console.log("Serial Port is Open"));
    serial.on('close', () => console.log("Serial Port is Closed"));
    serial.on('error', (theerror) => console.log(theerror));
    serial.on('data', serialEvent);
}


// function serialEvent() {
//   let data = serial.readStringUntil('\r\n').trim();
//   serial.log(data);
//   if (data.includes(',')) { // Assuming initial setup values for 'temperature, humidity'
//     let values = data.split(',');
//     adjustLighting(parseFloat(values[0]), parseFloat(values[1]));
//   } else if (data === 'button') {
//     bgValue = bgValue === 220 ? 0 : 220;
//   } else if (data === 'reset') {
//     resetView();
//   }
//    //adjustAttractor(data);
// }


// function serialEvent() {
//     let data = serial.readLine().trim();  // Read and trim incoming data
//     if (data.length > 0) {
//         console.log("Received:", data);  // Log received data for debugging
//         if (data.includes(',')) {
//             // Expected to be the initial temperature and humidity data
//             let values = data.split(',');
//             if (values.length == 2) {
//                 let temperature = parseFloat(values[0]);
//                 let humidity = parseFloat(values[1]);
//                 setInitialConditions(temperature, humidity);
//             }
//         } else if (data === 'button') {
//             bgValue = bgValue === 220 ? 0 : 220;
//         } else if (data === 'reset') {
//           resetView(); 
//         } else {
//             processCommands(data);  // Process other commands
//         }
//     }
// }

function setInitialConditions(temperature, humidity) {
    // Map temperature to a hue value 
    hueValue = map(temperature, 15, 40, 0, 360);
    // Set saturation based on humidity 
    salValue = map(humidity, 20, 100, 50, 255);
    console.log(`Initial conditions set: Hue = ${hueValue}, Saturation = ${salValue}`);
}




function adjustLighting(temperature, humidity) {
  let lightColor = map(temperature, 0, 40, 0, 255);
  directionalLight(lightColor, lightColor, lightColor, 0.25, 0.25, 0);
}


function resetView() {
  // Reset visual parameters or other stateful properties
  camera(0, 200, (height/2) / tan(PI/7), 0, 0, 0, 0, 1, -1);
  bgValue = 0; 
  angle = 0; 
  angle2 = 0;
}


function addBlur(tog = 0, blur = 30, blur_color = color(255,255,255)) {
  if(tog == 1)
  {
    drawingContext.shadowBlur = blur;
    drawingContext.shadowColor = blur_color;    
  }else
  {
    drawingContext.shadowBlur = 0;
  }
}
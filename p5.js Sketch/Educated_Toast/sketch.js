//////////
//Educated Toast 
//receive command from Arduino Nano board 
//via serial communication p5.js sketch 
//to control pattern
//////////

// Define serial connection
let serial;
let inputLine = "waiting for data";
let port_num = "/dev/tty.usbmodem11401";

// The canvas and properties setup
let w = 800;            //  width of canvas
let h = 600;            //  height of canvas
let scl = 5;            // Grid spacing
let num_cols;
let num_rows;
let margin = 50;        // margin around the grid
let noiseScale = 0.05;  

// Control setup
let bgValue = 0;
let hueValue = 0;
let satValue = 0;
let hueOffset = 5;
let satOffset = 5;
let attractorX;
let attractorY;
let step = 20;  


function setup() {
  createCanvas(w + margin, h + margin);
  num_cols = floor((w - margin * 2) / scl);
  num_rows = floor((h - margin * 2) / scl);

  attractorX = width % 2;  // Start in the middle of the canvas
  attractorY = height % 2;
  
  colorMode(HSB, 360, 255, 255);
  strokeWeight(5); 
  noFill();
  
  // Serial setup
  setupSerial();

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



function serialEvent() {
  let data = serial.readStringUntil('\r\n').trim();
  if (data) {
    console.log(data); 
    inputLine = data;
    if (data.includes(',')) { // Initial setup for temperature and humidity
      let values = data.split(',');
      hueValue = map(parseFloat(values[0]), 5, 50, 0, 360); // Map temperature to hue range
      satValue = map(parseFloat(values[1]), 5, 90, 0, 100); // Map humidity to saturation range
    } else if (data === 'Button') {
      bgValue = bgValue === 255 ? 0 : 255; 
    } else if (data === 'reset') {
      attractorX = width / 2;
      attractorY = height / 2;
      stroke(0, 0, 250);
    } else {
      adjustAttractor(data); 
    }
  }
}


function adjustAttractor(direction) {
  if (direction === 'left') {
    attractorX -= step;
    hueValue -= hueOffset;
    if(hueValue < 0)
      {
        hueValue = 1;
      }
  } else if (direction === 'right') {
    attractorX += step;
    hueValue += hueOffset;
    if(hueValue > 360)
    {
      hueValue = 1;
    }
  } else if (direction === 'up') {
    attractorY -= step;
    satValue += satOffset;
    if(satValue > 255)
    {
      satValue = 1;
    }
  } else if (direction === 'down') {
    attractorY += step;
    satValue -= satOffset;
    if(satValue < 0)
      {
        satValue = 255;
      }
  }
  // handle out of bound
  attractorX = constrain(attractorX, 0, width);
  attractorY = constrain(attractorY, 0, height);
}


function displayGrid() {
  let xOffsetStart = 0;
  for (let y = 0; y <= num_rows; y++) {
    let yOffset = 0;
    let ny = map(y, 0, num_rows, margin, h - margin);
    for (let x = 0; x <= num_cols; x++) {
      let nx = map(x, 0, num_cols, margin, w - margin);
      let xoff = xOffsetStart + x * noiseScale;
      let yoff = yOffset + y * noiseScale;
      
      let distance = dist(nx, ny, attractorX, attractorY);
      let colorIntensity = map(distance, 0, dist(0, 0, width%2, height%2), 0, 255);

      stroke(hueValue, satValue, colorIntensity); // Adjust color based on distance

      // Calculate noise-based offsets with attractor modulation
      let noiseValX = noise(xoff, yoff) * 100;
      let noiseValY = noise(xoff + 100, yoff + 100) * 100;
      let posX = nx + noiseValX * map(attractorX, 0, width, -0.5, 0.5);
      let posY = ny + noiseValY * map(attractorY, 0, height, -0.5, 0.5);
      //stroke(hueValue, satValue, 255)
      point(posX, posY);
    }
    yOffset += 0.1;
  }
  xOffsetStart += 0.1;
}


function draw() {
  background(bgValue);
  displayGrid();
}


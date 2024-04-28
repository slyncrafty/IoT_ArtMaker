// Original Code from https://thecodingtrain.com/challenges/180-falling-sand
//////////
//Falling Sand 
//receive command from Arduino Nano board 
//via serial communication p5.js sketch 
//to control pattern
//////////

// Define serial connection
let serial;
let inputLine = "waiting for data...";  // the latest incoming serial data
let port_num = "/dev/tty.usbmodem11401";
let buffer = "";  

// The grid and its properties
let grid;
let velocityGrid;
let w = 8;
let cols, rows;
let hueValue = 220;
let gravity = 0.1;
let currentCol;  // Horizontal start position

// Movement and sand control
let movingRight = true;
let grainDensity = 0.5;  // Initial density of sand

let startTime;  // start time
let delayTime = 5000;
let bgValue = 0;    
let blurToggle =0;

// Create a 2D array
function make2DArray(cols, rows) {
    return Array.from({length: cols}, () => Array.from({length: rows}, () => 0));
}

function withinCols(i){
    return i>=0 && i <= cols-1;
}

function withinRows(j){
    return j>=0 && j <= rows-1;
}


function setup()
{
    createCanvas(800, 600);
    colorMode(HSB, 360, 255, 255);
    cols = width / w;
    rows = height / w;
    currentCol = width % 2;
    grid = make2DArray(cols, rows);
    velocityGrid = make2DArray(cols, rows);

    currerntRow = rows/2;

    frameRate(30);
    setupSerial();
  
    startTime = millis(); 
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
    let data = serial.readLine().trim();  // Read and trim incoming data
    if (data.length > 0) {
        console.log("Received:", data);  // for debugging
        if (data.includes(',')) {        // initial temperature and humidity data
            let values = data.split(',');
            if (values.length == 2) {
                let temperature = parseFloat(values[0]);
                let humidity = parseFloat(values[1]);
                setInitialConditions(temperature, humidity);
            }
        } else {
            processCommands(data);  // Process other commands
        }
    }
}

function setInitialConditions(temperature, humidity) {
    // Map temperature to a hue value 
    hueValue = map(temperature, 15, 40, 0, 360);
    // Set saturation based on humidity 
    salValue = map(humidity, 20, 100, 50, 255);
    console.log(`Initial conditions set: Hue = ${hueValue}, Saturation = ${salValue}`);
}

function processCommands(command) {
  if (command === "Slope") {
    movingRight = !movingRight;
  } else if (command === "Wing") {
    hueValue = (hueValue + 20) % 360;
    if (hueValue > 360) hueValue = 1;
  } else if (command === "Ring") {
    grainDensity = (grainDensity === 0.5) ? 0.75 : 0.5;
  }  else if (command === "Button") {    // pause attractorX location for 2 sec
    blurToggle = blurToggle === 0 ? 1: 0;
  }  else if (command === "reset") {
    bgValue = bgValue === 255 ? 0 : 255;
    dropSand = true;
    dropStartTime = millis();
  }
}



let dropSand = false;
let dropStartTime = 0;
let dropDuration = 2000;

function draw() {
  background(bgValue);
  if (dropSand && millis() - dropStartTime < dropDuration) {
    // Only drop sand vertically for 2 seconds
    currentCol = movingRight ? currentCol : currentCol;
    dropSandFromColumn(currentCol);
  } else {
    dropSand = false; // Reset dropping sand
    if (millis() - startTime > delayTime) {
      if (movingRight) {
        currentCol++;
        if (currentCol >= cols) currentCol = 0;  // Wrap around
      } else {
        currentCol--;
        if (currentCol < 0) currentCol = cols - 1;  // Wrap around
      }
      let matrix = 3; // making collection of sand grains
      let grain_range = floor(matrix / 2);
      for(let i = -grain_range; i <= grain_range; i++)
      {
          for(let j = -grain_range; j <= grain_range; j++)
          {
              if(random(1) < grainDensity)
              {    
                  let _col = currentCol + i;
                  let _row = j;
                  // out of bound 
                  if(withinCols(_col) && withinRows(_row))
                  {
                      grid[_col][_row] = hueValue;
                      velocityGrid[_col][_row] = 1;
                      hueValue += 0.01
                      if(hueValue > 360)
                      {
                          hueValue = 1;
                      }
                  }
              }
          }
      }
    }
  }

  renderSand();
  updateSand();
  addBlur(tog = blurToggle);
}

function dropSandFromColumn(col) {
  let matrix = 3;
  let grain_range = floor(matrix / 2);
  for (let j = -grain_range; j <= grain_range; j++) {
    if (random(1) < grainDensity) {
      let _row = j;
      if (withinCols(col) && withinRows(_row)) {
        grid[col][_row] = hueValue;
        velocityGrid[col][_row] = 1;
      }
    }
  }
}

function renderSand() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();
      if (grid[i][j] > 0) {  // anything that is non-zero
        fill(grid[i][j], 255, 255);
        square(i * w, j * w, w);
      }
    }
  }
}




function updateSand() {
  let nextGrid = make2DArray(cols, rows);
  let nextVelocityGrid = make2DArray(cols, rows);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let velocity = velocityGrid[i][j];
      let moved = false;

      if (state > 0) {
        let newPos = int(j + velocity);
        if (newPos >= rows) newPos = rows - 1;  // Clamp position within bounds
        let below = grid[i][newPos];
        if (below === 0) {
          nextGrid[i][newPos] = state;
          nextVelocityGrid[i][newPos] = velocity + gravity;
          moved = true;
        }
      }
      if (!moved && state > 0) {
        nextGrid[i][j] = state;
        nextVelocityGrid[i][j] = min(velocity + gravity, rows - j - 1);  // Avoid skipping out of bounds
      }
    }
  }
  grid = nextGrid;
  velocityGrid = nextVelocityGrid;
}



function addBlur(tog = 0, blur = 30, blur_color = color(200,200,200)) {
  if(tog == 1)
  {
    drawingContext.shadowBlur = blur;
    drawingContext.shadowColor = blur_color;    
  }else
  {
    drawingContext.shadowBlur = 0;
  }
}
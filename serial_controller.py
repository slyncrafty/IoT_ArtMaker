import serial
from pynput.keyboard import Key, Controller
import time


my_port = '/dev/cu.usbmodem1401'    # Arduino Port Number
ser = serial.Serial(my_port, 9600)
keyboard = Controller()
while True:
    data = ser.readline()
    keyword = data.decode().strip()

    if keyword:
        print(f"Received command: {keyword}")

    if keyword == "reset":
        keyboard.press("r")
        keyboard.release("r")
    elif keyword == "left":
        keyboard.press("a")
        keyboard.release("a")
    elif keyword == "right":
        keyboard.press("d")
        keyboard.release("d")
    elif keyword == "up":
        keyboard.press("w")
        keyboard.release("w")
    elif keyword == "down":
        keyboard.press("s")
        keyboard.release("s")
    elif keyword == "Button":
        keyboard.press("b")
        keyboard.release("b")
    elif keyword == "Slope":
        keyboard.press("z")
        keyboard.release("z")
    elif keyword == "Wing":
        keyboard.press("x")
        keyboard.release("x")
    elif keyword == "Ring":
        keyboard.press("c")
        keyboard.release("c")

    time.sleep(0.1)

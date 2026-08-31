import cv2
import os

print("Current folder:", os.getcwd())
print("Files in folder:", os.listdir())

image = cv2.imread("input.jpg")

if image is None:
    print("Error: Could not read input.jpg")
else:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imwrite("grayscale_output.jpg", gray)
    print("Success! Grayscale image saved.")
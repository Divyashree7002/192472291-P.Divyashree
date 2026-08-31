import cv2
import numpy as np

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Convert image to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Calculate Sobel gradients
gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

# Calculate gradient magnitude
gradient = cv2.magnitude(gx, gy)

# Convert gradient to 8-bit
gradient = cv2.convertScaleAbs(gradient)

# Create gradient mask
mask = gradient

# Sharpen the image
sharpened = cv2.addWeighted(gray, 1.0, mask, 0.5, 0)

# Save output
cv2.imwrite("gradient_mask_output.jpg", sharpened)

# Display images
cv2.imshow("Original Image", gray)
cv2.imshow("Gradient Masked Image", sharpened)

cv2.waitKey(0)
cv2.destroyAllWindows()

print("Gradient Masking completed successfully!")
print("Output saved as gradient_mask_output.jpg")
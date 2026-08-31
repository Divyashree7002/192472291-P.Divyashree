import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Convert image to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply Sobel operator along X-axis
sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)

# Apply Sobel operator along Y-axis
sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

# Combine X and Y gradients
sobel_xy = cv2.magnitude(sobel_x, sobel_y)

# Convert result to 8-bit
sobel_xy = cv2.convertScaleAbs(sobel_xy)

# Save output
cv2.imwrite("sobel_xy_output.jpg", sobel_xy)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Sobel XY Edge Detection", sobel_xy)

# Wait for key press
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("Sobel XY Edge Detection completed successfully!")
print("Output saved as sobel_xy_output.jpg")
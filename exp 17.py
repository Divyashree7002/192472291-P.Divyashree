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

# Convert result to 8-bit image
sobel_x = cv2.convertScaleAbs(sobel_x)

# Save the output
cv2.imwrite("sobel_x_output.jpg", sobel_x)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Sobel X Edge Detection", sobel_x)

# Wait for a key press
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("Sobel X Edge Detection completed successfully!")
print("Output saved as sobel_x_output.jpg")
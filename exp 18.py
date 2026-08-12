import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Convert image to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply Sobel operator along Y-axis
sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

# Convert result to 8-bit image
sobel_y = cv2.convertScaleAbs(sobel_y)

# Save the output
cv2.imwrite("sobel_y_output.jpg", sobel_y)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Sobel Y Edge Detection", sobel_y)

# Wait for a key press
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("Sobel Y Edge Detection completed successfully!")
print("Output saved as sobel_y_output.jpg")
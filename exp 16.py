import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Convert image to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply Canny edge detection
edges = cv2.Canny(gray, 100, 200)

# Save the output
cv2.imwrite("canny_output.jpg", edges)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Canny Edge Detection", edges)

# Wait for a key press
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("Canny Edge Detection completed successfully!")
print("Output saved as canny_output.jpg")
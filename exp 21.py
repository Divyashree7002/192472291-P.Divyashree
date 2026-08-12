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

# Laplacian mask with diagonal extension
kernel = np.array([
    [1,  1,  1],
    [1, -8,  1],
    [1,  1,  1]
], dtype=np.float32)

# Apply Laplacian mask
laplacian = cv2.filter2D(gray, cv2.CV_64F, kernel)

# Sharpen the image
sharpened = gray - laplacian

# Convert to 8-bit
sharpened = cv2.convertScaleAbs(sharpened)

# Save the output
cv2.imwrite("laplacian_diagonal_output.jpg", sharpened)

# Display images
cv2.imshow("Original Image", gray)
cv2.imshow("Laplacian with Diagonal Extension", sharpened)

# Wait for a key press
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("Laplacian sharpening with diagonal extension completed!")
print("Output saved as laplacian_diagonal_output.jpg")
import cv2
import numpy as np

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: Image not found.")
    exit()

# Get image dimensions
rows, cols = image.shape[:2]

# Four corner points in the original image
pts1 = np.float32([
    [50, 50],
    [cols - 50, 50],
    [50, rows - 50],
    [cols - 50, rows - 50]
])

# New positions of the four points
pts2 = np.float32([
    [0, 0],
    [cols, 50],
    [50, rows],
    [cols, rows]
])

# Create perspective transformation matrix
matrix = cv2.getPerspectiveTransform(pts1, pts2)

# Apply perspective transformation
output = cv2.warpPerspective(image, matrix, (cols, rows))

# Save the output image
cv2.imwrite("perspective_output.jpg", output)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Perspective Transformation", output)

cv2.waitKey(0)
cv2.destroyAllWindows()

print("Perspective Transformation completed successfully!")
print("Output saved as perspective_output.jpg")
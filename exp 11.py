import cv2
import numpy as np

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: Image not found.")
    exit()

# Get image size
rows, cols = image.shape[:2]

# Select three points from the original image
pts1 = np.float32([[50, 50], [200, 50], [50, 200]])

# Select new positions for those points
pts2 = np.float32([[10, 100], [200, 50], [100, 250]])

# Create the affine transformation matrix
matrix = cv2.getAffineTransform(pts1, pts2)

# Apply the affine transformation
output = cv2.warpAffine(image, matrix, (cols, rows))

# Save the output image
cv2.imwrite("affine_output.jpg", output)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Affine Transformed Image", output)

cv2.waitKey(0)
cv2.destroyAllWindows()

print("Affine Transformation completed successfully!")
print("Output saved as affine_output.jpg")
import cv2
import numpy as np

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Get image dimensions
height, width = image.shape[:2]

# Four points from the original image
src_points = np.float32([
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1]
])

# Four new points
dst_points = np.float32([
    [50, 50],
    [width - 50, 0],
    [0, height - 50],
    [width - 1, height - 1]
])

# Calculate Homography matrix
H, status = cv2.findHomography(src_points, dst_points)

# Apply Homography transformation
output = cv2.warpPerspective(image, H, (width, height))

# Save output
cv2.imwrite("homography_output.jpg", output)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Homography Transformation", output)

# Wait for key
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("Homography transformation completed successfully!")
print("Output saved as homography_output.jpg")
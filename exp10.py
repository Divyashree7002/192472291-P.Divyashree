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

# Translation values
tx = 100   # Move 100 pixels to the right
ty = 50    # Move 50 pixels downward

# Create the translation matrix
translation_matrix = np.float32([[1, 0, tx],
                                 [0, 1, ty]])

# Apply the translation
translated_image = cv2.warpAffine(image, translation_matrix, (cols, rows))

# Save the translated image
cv2.imwrite("translated_image.jpg", translated_image)

# Display the images
cv2.imshow("Original Image", image)
cv2.imshow("Translated Image", translated_image)

# Wait for a key press
cv2.waitKey(0)

# Close all windows
cv2.destroyAllWindows()

print("Image moved successfully!")
print("Translated image saved as: translated_image.jpg")
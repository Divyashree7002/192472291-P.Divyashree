import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: Image not found.")
    exit()

# Get original dimensions
height, width = image.shape[:2]

# Scale the image to a bigger size (2x)
bigger = cv2.resize(image, (width * 2, height * 2))

# Scale the image to a smaller size (50%)
smaller = cv2.resize(image, (width // 2, height // 2))

# Save the output images
cv2.imwrite("bigger_image.jpg", bigger)
cv2.imwrite("smaller_image.jpg", smaller)

# Display all images
cv2.imshow("Original Image", image)
cv2.imshow("Bigger Image", bigger)
cv2.imshow("Smaller Image", smaller)

# Wait until a key is pressed
cv2.waitKey(0)

# Close all windows
cv2.destroyAllWindows()

print("Scaling completed successfully!")
print("Bigger image saved as: bigger_image.jpg")
print("Smaller image saved as: smaller_image.jpg")
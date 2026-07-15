import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: Image not found.")
    exit()

# Rotate 90 degrees clockwise
clockwise = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)

# Rotate 90 degrees counter-clockwise
counter_clockwise = cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)

# Save the rotated images
cv2.imwrite("clockwise_image.jpg", clockwise)
cv2.imwrite("counter_clockwise_image.jpg", counter_clockwise)

# Display the images
cv2.imshow("Original Image", image)
cv2.imshow("Clockwise Rotation", clockwise)
cv2.imshow("Counter Clockwise Rotation", counter_clockwise)

# Wait until a key is pressed
cv2.waitKey(0)

# Close all windows
cv2.destroyAllWindows()

print("Rotation completed successfully!")
print("Clockwise image saved as: clockwise_image.jpg")
print("Counter-clockwise image saved as: counter_clockwise_image.jpg")
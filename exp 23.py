import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Create a blurred version of the image
blurred = cv2.GaussianBlur(image, (5, 5), 0)

# Apply unsharp masking
sharpened = cv2.addWeighted(image, 1.5, blurred, -0.5, 0)

# Save the output
cv2.imwrite("unsharp_output.jpg", sharpened)

# Display images
cv2.imshow("Original Image", image)
cv2.imshow("Unsharp Masked Image", sharpened)

# Wait for a key press
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("Unsharp masking completed successfully!")
print("Output saved as unsharp_output.jpg")
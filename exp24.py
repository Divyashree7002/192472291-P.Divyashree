import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Convert image to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Blur the image
blurred = cv2.GaussianBlur(gray, (5, 5), 0)

# High-boost filtering
# A > 1 gives high-boost effect
A = 2.0

high_boost = cv2.addWeighted(gray, A, blurred, -(A - 1), 0)

# Save the output
cv2.imwrite("high_boost_output.jpg", high_boost)

# Display images
cv2.imshow("Original Image", gray)
cv2.imshow("High-Boost Sharpened Image", high_boost)

# Wait for key press
cv2.waitKey(0)

# Close windows
cv2.destroyAllWindows()

print("High-Boost Sharpening completed successfully!")
print("Output saved as high_boost_output.jpg")
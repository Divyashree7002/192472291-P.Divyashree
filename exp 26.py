import cv2

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Watermark text
text = "MY IMAGE"

# Position of watermark
position = (50, 50)

# Font
font = cv2.FONT_HERSHEY_SIMPLEX

# Add watermark
cv2.putText(
    image,
    text,
    position,
    font,
    1,
    (255, 255, 255),
    2,
    cv2.LINE_AA
)

# Save output
cv2.imwrite("watermarked_output.jpg", image)

# Display image
cv2.imshow("Watermarked Image", image)

cv2.waitKey(0)
cv2.destroyAllWindows()

print("Watermark added successfully!")
print("Output saved as watermarked_output.jpg")
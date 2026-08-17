import cv2

# Read source and destination images
source = cv2.imread("input.jpg")
destination = cv2.imread("background.jpg")

# Check if images are loaded
if source is None:
    print("Error: input.jpg not found.")
    exit()

if destination is None:
    print("Error: background.jpg not found.")
    exit()

# Crop a region from source image
crop = source[50:200, 50:200]

# Get crop dimensions
h, w = crop.shape[:2]

# Check if crop fits in destination
if h > destination.shape[0] or w > destination.shape[1]:
    print("Error: Cropped region is too large.")
    exit()

# Paste crop into destination image
destination[20:20+h, 20:20+w] = crop

# Save output
cv2.imwrite("crop_copy_paste_output.jpg", destination)

# Display images
cv2.imshow("Source Image", source)
cv2.imshow("Cropped and Pasted Image", destination)

cv2.waitKey(0)
cv2.destroyAllWindows()

print("Cropping, copying and pasting completed successfully!")
print("Output saved as crop_copy_paste_output.jpg")
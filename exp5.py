import cv2
import numpy as np

# Step 1: Read the image
image = cv2.imread("input.jpg")

# Step 2: Check if the image is loaded
if image is None:
    print("Error: Image not found.")
else:
    # Step 3: Create a 5x5 kernel
    kernel = np.ones((5, 5), np.uint8)

    # Step 4: Erode the image
    eroded_image = cv2.erode(image, kernel, iterations=1)

    # Step 5: Save the output image
    cv2.imwrite("eroded_image.jpg", eroded_image)

    # Step 6: Display the original image
    cv2.imshow("Original Image", image)

    # Step 7: Display the eroded image
    cv2.imshow("Eroded Image", eroded_image)

    # Step 8: Wait for a key press
    cv2.waitKey(0)

    # Step 9: Close all windows
    cv2.destroyAllWindows()

    print("Eroded image saved as eroded_image.jpg")
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

    # Step 4: Dilate the image
    dilated_image = cv2.dilate(image, kernel, iterations=1)

    # Step 5: Save the output image
    cv2.imwrite("dilated_image.jpg", dilated_image)

    # Step 6: Display the original image
    cv2.imshow("Original Image", image)

    # Step 7: Display the dilated image
    cv2.imshow("Dilated Image", dilated_image)

    # Step 8: Wait for a key press
    cv2.waitKey(0)

    # Step 9: Close all windows
    cv2.destroyAllWindows()

    print("Dilated image saved as dilated_image.jpg")
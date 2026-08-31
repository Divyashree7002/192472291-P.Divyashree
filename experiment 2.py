import cv2

# Step 1: Read the original image
image = cv2.imread("input.jpg")

# Step 2: Check if the image is loaded
if image is None:
    print("Error: Image not found.")
else:
    # Step 3: Apply blur
    blurred_image = cv2.blur(image, (15, 15))

    # Step 4: Save the blurred image
    cv2.imwrite("blurred_image.jpg", blurred_image)

    # Step 5: Display the original image
    cv2.imshow("Original Image", image)

    # Step 6: Display the blurred image
    cv2.imshow("Blurred Image", blurred_image)

    # Step 7: Wait for a key press
    cv2.waitKey(0)

    # Step 8: Close all windows
    cv2.destroyAllWindows()

    print("Blurred image saved as blurred_image.jpg")
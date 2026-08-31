import cv2

# Step 1: Read the image
image = cv2.imread("input.jpg")

# Step 2: Check if the image is loaded
if image is None:
    print("Error: Image not found.")
else:
    # Step 3: Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Step 4: Apply Canny Edge Detection
    edges = cv2.Canny(gray, 100, 200)

    # Step 5: Save the output image
    cv2.imwrite("canny_output.jpg", edges)

    # Step 6: Display the original image
    cv2.imshow("Original Image", image)

    # Step 7: Display the edge image
    cv2.imshow("Canny Edge Image", edges)

    # Step 8: Wait for a key press
    cv2.waitKey(0)

    # Step 9: Close all windows
    cv2.destroyAllWindows()

    print("Canny edge image saved as canny_output.jpg")
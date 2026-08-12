import cv2
import numpy as np

# Read the input image
image = cv2.imread("input.jpg")

# Check if image is loaded
if image is None:
    print("Error: input.jpg not found.")
    exit()

# Get image dimensions
height, width = image.shape[:2]

# Four source points
src = np.float64([
    [0, 0],
    [width - 1, 0],
    [width - 1, height - 1],
    [0, height - 1]
])

# Four destination points
dst = np.float64([
    [50, 50],
    [width - 50, 0],
    [width - 1, height - 50],
    [0, height - 1]
])

# Create matrix A for DLT
A = []

for i in range(4):
    x, y = src[i]
    X, Y = dst[i]

    A.append([
        -x, -y, -1,
        0, 0, 0,
        x * X, y * X, X
    ])

    A.append([
        0, 0, 0,
        -x, -y, -1,
        x * Y, y * Y, Y
    ])

A = np.array(A)

# Solve using Singular Value Decomposition (SVD)
U, S, Vt = np.linalg.svd(A)

# Last row of Vt gives the solution
H = Vt[-1].reshape(3, 3)

# Normalize the Homography matrix
H = H / H[2, 2]

print("DLT Transformation Matrix:")
print(H)

# Apply transformation
output = cv2.warpPerspective(image, H, (width, height))

# Save output
cv2.imwrite("dlt_output.jpg", output)

# Display original and transformed images
cv2.imshow("Original Image", image)
cv2.imshow("DLT Transformed Image", output)

cv2.waitKey(0)
cv2.destroyAllWindows()

print("DLT transformation completed successfully!")
print("Output saved as dlt_output.jpg")
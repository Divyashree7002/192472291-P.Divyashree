import cv2
import numpy as np

# Open the input video
video = cv2.VideoCapture("input.mp4")

# Check if video is opened
if not video.isOpened():
    print("Error: Cannot open video.")
    exit()

# Get video properties
width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = video.get(cv2.CAP_PROP_FPS)

# Create output video
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
output = cv2.VideoWriter("perspective_output.mp4", fourcc, fps, (width, height))

# Source points
pts1 = np.float32([
    [50, 50],
    [width - 50, 50],
    [50, height - 50],
    [width - 50, height - 50]
])

# Destination points
pts2 = np.float32([
    [0, 0],
    [width, 50],
    [50, height],
    [width, height]
])

# Perspective transformation matrix
matrix = cv2.getPerspectiveTransform(pts1, pts2)

while True:
    ret, frame = video.read()

    if not ret:
        break

    # Apply perspective transformation
    transformed = cv2.warpPerspective(frame, matrix, (width, height))

    # Save frame
    output.write(transformed)

    # Display videos
    cv2.imshow("Original Video", frame)
    cv2.imshow("Perspective Video", transformed)

    # Press q to quit
    if cv2.waitKey(25) & 0xFF == ord('q'):
        break

# Release resources
video.release()
output.release()
cv2.destroyAllWindows()

print("Perspective Transformation on Video completed successfully!")
print("Output video saved as perspective_output.mp4")
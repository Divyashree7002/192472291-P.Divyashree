import cv2

# Open the input video
video = cv2.VideoCapture("input.mp4")

# Check if the video opened successfully
if not video.isOpened():
    print("Error: Cannot open video file.")
    exit()

# Get video properties
width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = video.get(cv2.CAP_PROP_FPS)

# Create VideoWriter object to save the processed video
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
output = cv2.VideoWriter("output.mp4", fourcc, fps, (width, height), False)

# Process each frame
while True:
    ret, frame = video.read()

    # Stop if the video ends
    if not ret:
        break

    # Convert frame to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Save grayscale frame to output video
    output.write(gray)

    # Display original and processed videos
    cv2.imshow("Original Video", frame)
    cv2.imshow("Grayscale Video", gray)

    # Press 'q' to stop
    if cv2.waitKey(25) & 0xFF == ord('q'):
        break

# Release resources
video.release()
output.release()
cv2.destroyAllWindows()

print("Video processing completed successfully!")
print("Output video saved as: output.mp4")
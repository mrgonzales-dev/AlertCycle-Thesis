import cv2
import threading
from flask import Flask, Response
import queue

app = Flask(__name__)

# Initialize the video capture from the device
cap = cv2.VideoCapture(2)  # For your second camera, change the index accordingly

# Queue to store frames for multiple requests
frame_queue = queue.Queue(maxsize=10)

# Function to continuously capture frames from the webcam
def capture_frames():
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # If the queue is full, discard the oldest frame
        if not frame_queue.full():
            frame_queue.put(frame)

# Start the frame capture thread
capture_thread = threading.Thread(target=capture_frames, daemon=True)
capture_thread.start()

# This function is used to stream the video to the mobile app
def generate_video():
    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()

            # Convert frame to JPEG
            ret, jpeg = cv2.imencode('.jpg', frame)
            
            # Create a byte stream to send the video data
            if ret:
                frame = jpeg.tobytes()
                # Yield the video frame in MJPEG format
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

# Route to stream the video
@app.route('/video')
def video():
    return Response(generate_video(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, threaded=True)

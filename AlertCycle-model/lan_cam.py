import cv2
from flask import Flask, Response

# Initialize the Flask app
app = Flask(__name__)

# VideoCapture to capture video from camera (device 2)
camera = cv2.VideoCapture(2)

def generate_frames():
    while True:
        # Capture frame-by-frame
        success, frame = camera.read()
        if not success:
            break
        else:
            # Encode the frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            # Yield the output frame in byte format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Route to serve the video stream
@app.route('/video_feed')
def video_feed():
    # Return the generated frames
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# Route to serve the web page
@app.route('/')
def index():
    return '''
        <html>
        <head><title>Live Video Stream</title></head>
        <body>
        <h1>Live Video Feed</h1>
        <img src="/video_feed">
        </body>
        </html>
    '''

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np

app = Flask(__name__)

# Allow all origins for debugging (adjust for production)
CORS(app, resources={r"/*": {"origins": "*"}})

# Placeholder function to simulate AI processing
def process_frame(frame):
    return "Processed Frame"

def process_audio(audio_chunk):
    return "Processed Audio"

@app.route('/video', methods=['POST'])
def handle_video():
    try:
        # Log request data size
        print(f"Received video data of size: {len(request.data)} bytes")

        # Decode video bytes
        video_bytes = np.frombuffer(request.data, np.uint8)
        frame = cv2.imdecode(video_bytes, cv2.IMREAD_COLOR)

        # Check if decoding was successful
        if frame is None:
            print("Error: Unable to decode the video frame")
            return jsonify({"error": "Invalid video frame"}), 400

        # Process the frame
        response = process_frame(frame)
        print(f"Processed frame response: {response}")

        return jsonify({"message": response})
    except Exception as e:
        # Log the error for debugging
        print(f"Error in handle_video: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/audio', methods=['POST'])
def handle_audio():
    try:
        audio_bytes = request.data
        response = process_audio(audio_bytes)
        return jsonify({"message": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

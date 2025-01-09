import React, { useRef, useState } from "react";

const IdkBruh = () => {
  const videoRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [audio, setAudio] = useState(null);

  const sendVideoFrame = async () => {
    try {
      if (!videoRef.current) {
        console.error("Video element is not available.");
        return;
      }

      const videoElement = videoRef.current;

      // Ensure the video element is ready
      if (videoElement.readyState < 2) {
        console.error("Video element is not ready.");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Check if videoWidth and videoHeight are non-zero
      if (canvas.width === 0 || canvas.height === 0) {
        console.error("Video dimensions are not set.");
        return;
      }

      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );

      if (!blob) {
        console.error("Failed to create a blob from the canvas.");
        return;
      }

      console.log("Sending video frame with size:", blob.size, "bytes");

      const response = await fetch("http://127.0.0.1:5000/video", {
        method: "POST",
        body: blob,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response from server:", error);
        return;
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const sendAudioChunk = async () => {
    if (audio) {
      const response = await fetch("http://127.0.0.1:5000/audio", {
        method: "POST",
        body: audio,
      });

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Real-Time Conversational Bot</h1>
      <div>
        <video
          ref={videoRef}
          autoPlay
          muted
          className="border w-full h-96 mb-4"
        ></video>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendVideoFrame}
        >
          Send Video Frame
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          onClick={sendAudioChunk}
        >
          Send Audio Chunk
        </button>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Messages:</h2>
        <ul className="list-disc ml-5">
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IdkBruh;

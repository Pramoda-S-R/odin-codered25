import React, { useRef, useState } from "react";

const IdkBruh = () => {
  const videoRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [audio, setAudio] = useState(null);

  const sendVideoFrame = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );

      const response = await fetch("http://127.0.0.1:5000/video", {
        method: "POST",
        body: blob,
      });

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
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

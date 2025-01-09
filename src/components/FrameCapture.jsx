import React, { useRef } from "react";
import { uploadFrame } from "../lib/api";

const FrameCapture = () => {
  const videoRef = useRef(null);

  const captureFrame = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      try {
        const response = await uploadFrame(blob);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    }, "image/jpeg");
  };

  return (
    <div className="frame-capture">
      <video ref={videoRef} autoPlay muted className="w-full h-auto" />
      <button
        onClick={captureFrame}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Capture Frame
      </button>
    </div>
  );
};

export default FrameCapture;

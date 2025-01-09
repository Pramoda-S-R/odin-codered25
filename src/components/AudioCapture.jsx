import React, { useState } from "react";
import { uploadAudio } from "../lib/api";

const AudioCapture = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = async (e) => {
      try {
        const response = await uploadAudio(e.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setMediaRecorder(null);
  };

  return (
    <div className="audio-capture">
      <button
        onClick={startRecording}
        className="bg-green-500 text-white py-2 px-4 rounded"
      >
        Start Recording
      </button>
      <button
        onClick={stopRecording}
        className="ml-4 bg-red-500 text-white py-2 px-4 rounded"
      >
        Stop Recording
      </button>
    </div>
  );
};

export default AudioCapture;

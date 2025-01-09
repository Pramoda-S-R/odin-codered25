import React, { useRef, useEffect, useState } from "react";

const LiveStreamComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioStream, setAudioStream] = useState(null);

  useEffect(() => {
    // Initialize video and audio streams
    async function initMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setAudioStream(stream);
    }

    initMedia();

    // Setup WebSocket
    const socket = new WebSocket("ws://yourserver.com/socket");
    socket.onmessage = handleSocketMessage;
    socketRef.current = socket;

    return () => {
      if (socket) socket.close();
    };
  }, []);

  useEffect(() => {
    if (audioStream) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      audioContextRef.current = audioContext;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      mediaRecorder.start(1000); // Capture audio chunks every second
    }
  }, [audioStream]);

  const handleSocketMessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "audio") {
      playAudio(data.audioData);
    }

    // Handle other types like text or image here
  };

  const playAudio = (pcmData) => {
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 44100);
    const channel = audioBuffer.getChannelData(0);

    for (let i = 0; i < pcmData.length; i++) {
      channel[i] = pcmData[i];
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const sendFrameToServer = () => {
    if (!canvasRef.current || !videoRef.current || !socketRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const socket = socketRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg");
    socket.send(JSON.stringify({ type: "image", image: base64Image }));
  };

  const sendAudioChunksToServer = () => {
    if (socketRef.current && audioChunks.length > 0) {
      socketRef.current.send(JSON.stringify({ type: "audio", audioChunks }));
      setAudioChunks([]);
    }
  };

  useEffect(() => {
    const frameInterval = setInterval(sendFrameToServer, 2000); // Send frame every 2 seconds
    const audioInterval = setInterval(sendAudioChunksToServer, 2000); // Send audio every 2 seconds

    return () => {
      clearInterval(frameInterval);
      clearInterval(audioInterval);
    };
  }, [audioChunks]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: "100%", height: "auto" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div>
        <p>Streaming video and audio...</p>
      </div>
    </div>
  );
};

export default LiveStreamComponent;

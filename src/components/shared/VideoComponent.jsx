import React, { useEffect, useRef } from 'react';

const VideoComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startWebcam = async () => {
    try {
      const constraints = {
        video: { width: { max: 640 }, height: { max: 480 } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing the webcam:', err);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg').split(',')[1].trim();
    }
  };

  useEffect(() => {
    startWebcam();
  }, []);

  return (
    <div>
      <video ref={videoRef} id="videoElement" autoPlay style={{ borderRadius: '20px', width: '320px', height: '240px' }} />
      <canvas ref={canvasRef} id="canvasElement" style={{ display: 'none' }} />
    </div>
  );
};

export default VideoComponent;

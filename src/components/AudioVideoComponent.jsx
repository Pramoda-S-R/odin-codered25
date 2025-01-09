import React, { useEffect, useRef, useState } from "react";

function AudioVideoComponent({ websocketUrl }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [webSocket, setWebSocket] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [processor, setProcessor] = useState(null);
  const [pcmData, setPcmData] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [audioInputContext, setAudioInputContext] = useState(null);
  const [workletNode, setWorkletNode] = useState(null);

  useEffect(() => {
    initializeWebcam();
    const interval = setInterval(captureImage, 3000);
    connectWebSocket();
    return () => {
      clearInterval(interval);
      disconnectWebSocket();
    };
  }, []);

  const initializeWebcam = async () => {
    try {
      const constraints = {
        video: { width: { max: 640 }, height: { max: 480 } },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing the webcam:", err);
    }
  };

  const captureImage = () => {
    if (stream && canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg").split(",")[1].trim();
      return imageData;
    }
    return null;
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(websocketUrl);
    setWebSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      sendInitialSetupMessage(ws);
    };

    ws.onmessage = handleWebSocketMessage;

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const disconnectWebSocket = () => {
    if (webSocket) {
      webSocket.close();
    }
  };

  const sendInitialSetupMessage = (ws) => {
    const setupMessage = {
      setup: {
        generation_config: { response_modalities: ["AUDIO"] },
      },
    };
    ws.send(JSON.stringify(setupMessage));
  };

  const sendVoiceAndVideoMessage = (b64PCM) => {
    if (!webSocket) {
      console.error("WebSocket not connected");
      return;
    }

    const currentFrameB64 = captureImage();
    if (!currentFrameB64) return;

    const payload = {
      realtime_input: {
        media_chunks: [
          { mime_type: "audio/pcm", data: b64PCM },
          { mime_type: "image/jpeg", data: currentFrameB64 },
        ],
      },
    };
    webSocket.send(JSON.stringify(payload));
    console.log("Sent:", payload);
  };

  const handleWebSocketMessage = (event) => {
    const messageData = JSON.parse(event.data);
    const response = new Response(messageData);

    if (response.text) {
      displayMessage("GEMINI: " + response.text);
    }

    if (response.audioData) {
      processAudioChunk(response.audioData);
    }
  };

  const initializeAudioProcessing = async () => {
    if (initialized) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000,
    });
    await audioCtx.audioWorklet.addModule("pcm-processor.js");
    const node = new AudioWorkletNode(audioCtx, "pcm-processor");
    node.connect(audioCtx.destination);

    setAudioInputContext(audioCtx);
    setWorkletNode(node);
    setInitialized(true);
  };

  const processAudioChunk = async (base64AudioChunk) => {
    try {
      if (!initialized) await initializeAudioProcessing();

      if (audioInputContext.state === "suspended") {
        await audioInputContext.resume();
      }
      const arrayBuffer = base64ToArrayBuffer(base64AudioChunk);
      const float32Data = convertPCM16LEToFloat32(arrayBuffer);

      workletNode.port.postMessage(float32Data);
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  };

  const startAudioInput = async () => {
    const audioCtx = new AudioContext({ sampleRate: 16000 });
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000 },
    });

    const source = audioCtx.createMediaStreamSource(mediaStream);
    const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = inputData[i] * 0x7fff;
      }
      setPcmData((prev) => [...prev, ...pcm16]);
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioCtx.destination);

    setAudioContext(audioCtx);
    setProcessor(scriptProcessor);

    setInterval(() => {
      if (pcmData.length > 0) {
        const buffer = new ArrayBuffer(pcmData.length * 2);
        const view = new DataView(buffer);
        pcmData.forEach((value, index) => {
          view.setInt16(index * 2, value, true);
        });

        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(buffer))
        );
        sendVoiceAndVideoMessage(base64);
        setPcmData([]);
      }
    }, 3000);
  };

  const stopAudioInput = () => {
    if (processor) {
      processor.disconnect();
    }
    if (audioContext) {
      audioContext.close();
    }
  };

  const displayMessage = (message) => {
    console.log(message);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: "640px", height: "480px" }}></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <button onClick={startAudioInput} className="p-5 bg-green-500">Start Audio</button>
      <button onClick={stopAudioInput} className="p-5 bg-red-500">Stop Audio</button>
    </div>
  );
}

class Response {
  constructor(data) {
    this.text = data.text || null;
    this.audioData = data.audio || null;
  }
}

const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const convertPCM16LEToFloat32 = (pcmData) => {
  const inputArray = new Int16Array(pcmData);
  const float32Array = new Float32Array(inputArray.length);
  for (let i = 0; i < inputArray.length; i++) {
    float32Array[i] = inputArray[i] / 32768;
  }
  return float32Array;
};

export default AudioVideoComponent;

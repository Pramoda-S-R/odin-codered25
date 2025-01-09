import React, { useEffect, useRef, useState } from "react";

const GeminiLiveDemo = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const chatLogRef = useRef(null);
  const [webSocket, setWebSocket] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [pcmData, setPcmData] = useState([]);
  const [stream, setStream] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const workletNodeRef = useRef(null);
  const audioInputContextRef = useRef(null);
  const currentFrameB64Ref = useRef("");

  const URL = "ws://localhost:9082";

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const constraints = {
          video: { width: { max: 640 }, height: { max: 480 } },
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        console.log("Webcam started");
      } catch (err) {
        console.error("Error accessing the webcam:", err);
      }
    };

    const connectWebSocket = () => {
      console.log("Connecting to WebSocket:", URL);
      const ws = new WebSocket(URL);

      ws.onopen = () => {
        console.log("WebSocket connection established");
        sendInitialSetupMessage(ws);
      };

      ws.onmessage = (event) => {
        console.log("Message received:", event.data);
        receiveMessage(JSON.parse(event.data));
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.warn("WebSocket connection closed:", event);
        alert("Connection closed");
      };

      setWebSocket(ws);
    };

    const captureImage = () => {
      if (stream && videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg").split(",")[1].trim();
        currentFrameB64Ref.current = imageData;
        console.log("Image captured");
      }
    };

    startWebcam();
    connectWebSocket();

    const interval = setInterval(captureImage, 3000);
    setIntervalId(interval);

    return () => {
      clearInterval(interval);
      if (webSocket) {
        webSocket.close();
      }
    };
  }, []);

  const sendInitialSetupMessage = (ws) => {
    const setupMessage = {
      setup: {
        generation_config: { response_modalities: ["AUDIO"] },
      },
    };
    console.log("Sending setup message:", setupMessage);
    ws.send(JSON.stringify(setupMessage));
  };

  const sendVoiceMessage = (b64PCM) => {
    if (!webSocket) {
      console.warn("WebSocket not initialized");
      return;
    }
    const payload = {
      realtime_input: {
        media_chunks: [
          { mime_type: "audio/pcm", data: b64PCM },
          { mime_type: "image/jpeg", data: currentFrameB64Ref.current },
        ],
      },
    };
    console.log("Sending voice message:", payload);
    webSocket.send(JSON.stringify(payload));
  };

  const receiveMessage = (data) => {
    console.log("Received message:", data);
    if (data.text) {
      displayMessage("GEMINI: " + data.text);
    }
    if (data.audio) {
      injectAudioChunkToPlay(data.audio);
    }
  };

  const initializeAudioContext = async () => {
    if (initialized) return;
    try {
      const audioContext = new AudioContext({ sampleRate: 24000 });
      await audioContext.audioWorklet.addModule("pcm-processor.js");
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
      workletNode.connect(audioContext.destination);
      audioInputContextRef.current = audioContext;
      workletNodeRef.current = workletNode;
      setInitialized(true);
      console.log("Audio context initialized");
    } catch (error) {
      console.error("Error initializing audio context:", error);
    }
  };

  const injectAudioChunkToPlay = async (base64AudioChunk) => {
    try {
      if (!initialized) {
        await initializeAudioContext();
      }
      if (audioInputContextRef.current.state === "suspended") {
        await audioInputContextRef.current.resume();
      }
      const arrayBuffer = base64ToArrayBuffer(base64AudioChunk);
      const float32Data = convertPCM16LEToFloat32(arrayBuffer);
      workletNodeRef.current.port.postMessage(float32Data);
      console.log("Audio chunk injected for playback");
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
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

  const displayMessage = (message) => {
    console.log(message);
    if (chatLogRef.current) {
      const newParagraph = document.createElement("p");
      newParagraph.textContent = message;
      chatLogRef.current.appendChild(newParagraph);
    }
  };

  const startAudioInput = async () => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    setAudioContext(audioContext);
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000 },
    });

    const source = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = inputData[i] * 0x7fff;
      }
      setPcmData((prev) => [...prev, ...pcm16]);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    const interval = setInterval(() => recordChunk(pcmData), 3000);
    setIntervalId(interval);
    console.log("Audio input started");
  };

  const stopAudioInput = () => {
    if (audioContext) {
      audioContext.close();
    }
    clearInterval(intervalId);
    console.log("Audio input stopped");
  };

  const recordChunk = (pcmData) => {
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    pcmData.forEach((value, index) => {
      view.setInt16(index * 2, value, true);
    });
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    sendVoiceMessage(base64);
    setPcmData([]);
    console.log("Audio chunk recorded and sent");
  };

  return (
    <div className="demo-content">
      <div className="button-group">
        <button onClick={startAudioInput}>Start</button>
        <button onClick={stopAudioInput}>Stop</button>
      </div>
      <video
        id="videoElement"
        ref={videoRef}
        autoPlay
        style={{ borderRadius: "20px", width: "320px", height: "240px" }}
      ></video>
      <canvas
        id="canvasElement"
        ref={canvasRef}
        style={{ display: "none" }}
      ></canvas>
      <div id="chatLog" ref={chatLogRef}></div>
    </div>
  );
};

export default GeminiLiveDemo;

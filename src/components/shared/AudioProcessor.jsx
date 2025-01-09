import React, { useState, useEffect, useRef } from 'react';
import WebSocketClient from './WebSocketClient';

const AudioProcessor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const pcmDataRef = useRef([]);
  const intervalRef = useRef(null);

  const webSocketClient = useRef(null);

  // Declare `handleWebSocketMessage` before assigning it to WebSocketClient
  const handleWebSocketMessage = (message) => {
    if (message.text) {
      setMessages((prev) => [...prev, `GEMINI: ${message.text}`]);
    }
    if (message.audioData) {
      injestAudioChunkToPlay(message.audioData);
    }
  };

  useEffect(() => {
    webSocketClient.current = new WebSocketClient('ws://localhost:9082', handleWebSocketMessage);
    webSocketClient.current.connect();

    return () => {
      webSocketClient.current.disconnect();
    };
  }, []);

  const startAudioInput = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContextRef.current.createMediaStreamSource(stream);

    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = inputData[i] * 0x7fff;
      }
      pcmDataRef.current.push(...pcm16);
    };

    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);

    intervalRef.current = setInterval(recordChunk, 3000);
    setIsRecording(true);
  };

  const stopAudioInput = () => {
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();

    clearInterval(intervalRef.current);
    setIsRecording(false);
  };

  const recordChunk = () => {
    const buffer = new ArrayBuffer(pcmDataRef.current.length * 2);
    const view = new DataView(buffer);
    pcmDataRef.current.forEach((value, index) => {
      view.setInt16(index * 2, value, true);
    });

    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    webSocketClient.current.sendVoiceMessage(base64);
    pcmDataRef.current = [];
  };

  const injestAudioChunkToPlay = (base64AudioChunk) => {
    // Add playback logic here
  };

  return (
    <div className="button-group">
      <button
        onClick={isRecording ? stopAudioInput : startAudioInput}
        className="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored"
      >
        <i className="material-icons">{isRecording ? 'mic_off' : 'mic'}</i>
      </button>
    </div>
  );
};

export default AudioProcessor;

export default class WebSocketClient {
    constructor(url, onMessage) {
      this.url = url;
      this.webSocket = null;
      this.onMessage = onMessage;
    }
  
    connect() {
      this.webSocket = new WebSocket(this.url);
  
      this.webSocket.onopen = () => {
        console.log('WebSocket connected');
      };
  
      this.webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      };
  
      this.webSocket.onclose = () => {
        console.log('WebSocket disconnected');
      };
  
      this.webSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  
    disconnect() {
      if (this.webSocket) this.webSocket.close();
    }
  
    sendVoiceMessage(base64PCM) {
      if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not open');
        return;
      }
  
      const payload = {
        realtime_input: {
          media_chunks: [
            { mime_type: 'audio/pcm', data: base64PCM },
          ],
        },
      };
  
      this.webSocket.send(JSON.stringify(payload));
    }
  }
  
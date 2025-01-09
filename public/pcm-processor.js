class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.port.onmessage = (e) => {
            console.log("PCMProcessor received message:", e.data);
        };
    }

    process(inputs, outputs) {
        const input = inputs[0];
        if (input) {
            this.port.postMessage(input[0]); // Send data to the client
            console.log("PCMProcessor processed input data");
        }
        return true;
    }
}

registerProcessor("pcm-processor", PCMProcessor);

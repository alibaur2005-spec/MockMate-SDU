/**
 * AudioWorkletProcessor for Gemini Multimodal Live API
 * 
 * Captures audio from the microphone, downsamples it if necessary (Gemini expects 16kHz),
 * converts to 16-bit PCM, and sends it to the main thread as Base64.
 */

class AudioRecordingWorklet extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Int16Array(2048);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const channelData = input[0];

            // Expected input from browser is usually Float32 between -1 and 1
            for (let i = 0; i < channelData.length; i++) {
                // Convert Float32 [-1, 1] to Int16 [-32768, 32767]
                let sample = Math.max(-1, Math.min(1, channelData[i]));
                sample = sample < 0 ? sample * 32768 : sample * 32767;

                this.buffer[this.bufferIndex++] = Math.round(sample);

                // When buffer is full, send to main thread and reset
                if (this.bufferIndex >= this.buffer.length) {
                    // Send a copy of the buffer
                    const bufferCopy = new Int16Array(this.buffer);
                    this.port.postMessage(bufferCopy.buffer, [bufferCopy.buffer]);
                    this.bufferIndex = 0;
                }
            }
        }
        return true;
    }
}

registerProcessor('audio-recorder-worklet', AudioRecordingWorklet);

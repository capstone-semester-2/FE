class RevoiceRecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0 || !input[0]) {
      return true;
    }

    // Copy the channel data to avoid transferring the same buffer reference.
    const channelData = input[0];
    this.port.postMessage(channelData.slice(0));
    return true;
  }
}

registerProcessor('revoice-recorder-processor', RevoiceRecorderProcessor);

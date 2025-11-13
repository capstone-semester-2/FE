import { useCallback, useEffect, useRef, useState } from 'react';

const TARGET_SAMPLE_RATE = 16000;
const WORKLET_NAME = 'revoice-recorder-processor';

const floatTo16BitPCM = (view, offset, input) => {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, s, true);
  }
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWav = (samples, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, 1, true); // channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);
  return buffer;
};

const mergeChunks = (chunks, totalLength) => {
  const result = new Float32Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
};

const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const chunksRef = useRef([]);
  const samplesLengthRef = useRef(0);
  const sampleRateRef = useRef(TARGET_SAMPLE_RATE);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const cleanupAudioGraph = useCallback(async () => {
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    gainNodeRef.current?.disconnect();
    gainNodeRef.current = null;
    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;

    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch (err) {
        console.error(err);
      }
    }
    audioContextRef.current = null;
    cleanupStream();
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      return;
    }

    setError('');

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass || !window.AudioWorkletNode) {
      const message = '이 브라우저는 AudioWorklet을 지원하지 않습니다.';
      setError(message);
      throw new Error(message);
    }

    chunksRef.current = [];
    samplesLengthRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContextClass({ sampleRate: TARGET_SAMPLE_RATE });
      sampleRateRef.current = audioContext.sampleRate;
      audioContextRef.current = audioContext;
      await audioContext.audioWorklet.addModule(new URL('../worklets/recorderProcessor.js', import.meta.url));
      await audioContext.resume();

      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const recorderNode = new AudioWorkletNode(audioContext, WORKLET_NAME);
      workletNodeRef.current = recorderNode;
      recorderNode.port.onmessage = (event) => {
        const chunk = event.data;
        chunksRef.current.push(chunk);
        samplesLengthRef.current += chunk.length;
      };

      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;
      gainNodeRef.current = silentGain;

      sourceNode.connect(recorderNode);
      recorderNode.connect(silentGain);
      silentGain.connect(audioContext.destination);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioBlob(null);
      setAudioUrl('');
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError(err.message || '마이크 권한을 확인하거나 다른 장치를 선택해주세요.');
      await cleanupAudioGraph();
      throw err;
    }
  }, [audioUrl, cleanupAudioGraph, isRecording]);

  const stopRecording = useCallback(async () => {
    if (!audioContextRef.current) {
      await cleanupAudioGraph();
      setIsRecording(false);
      return null;
    }

    try {
      await cleanupAudioGraph();
      setIsRecording(false);

      if (!samplesLengthRef.current) {
        return null;
      }

      const mergedSamples = mergeChunks(chunksRef.current, samplesLengthRef.current);
      const wavBuffer = encodeWav(mergedSamples, sampleRateRef.current);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      setAudioBlob(blob);

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      return blob;
    } catch (err) {
      console.error(err);
      setError('녹음 파일을 만드는 중 문제가 발생했습니다.');
      throw err;
    } finally {
      chunksRef.current = [];
      samplesLengthRef.current = 0;
    }
  }, [cleanupAudioGraph]);

  useEffect(() => () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => () => {
    cleanupAudioGraph();
  }, [cleanupAudioGraph]);

  return {
    audioBlob,
    audioUrl,
    error,
    isRecording,
    startRecording,
    stopRecording,
  };
};

export default useVoiceRecorder;

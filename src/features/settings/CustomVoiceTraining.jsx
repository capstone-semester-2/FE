import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Mic } from 'lucide-react';
import useVoiceRecorder from '../../hooks/useVoiceRecorder';

const TRAINING_SENTENCES = [
  '안녕하세요, 반갑습니다.',
  '오늘 날씨가 참 좋네요.',
  '제 이름을 말씀드릴게요.',
  '조금만 더 크게 말해 주세요.',
  '물을 한 잔 주세요.',
  '다시 한 번 부탁드립니다.',
  '이 길로 가면 되나요?',
  '도와주셔서 감사합니다.',
  '잠시만 기다려 주세요.',
  '지금 몇 시인가요?',
  '천천히 말씀해 주세요.',
  '제가 이해한 게 맞나요?',
  '다음에 또 뵙겠습니다.',
  '연락처를 알려주실 수 있나요?',
  '불편을 드려 죄송합니다.',
  '무엇을 도와드릴까요?',
  '여기서 얼마나 걸릴까요?',
  '다시 시도해 볼게요.',
  '확인 부탁드립니다.',
  '정말 고맙습니다.',
];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const createEmptyRecordings = (length) => Array(length).fill(null);

const CustomVoiceTraining = ({ onClose, onSubmit }) => {
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recorderError,
  } = useVoiceRecorder();

  const totalSentences = TRAINING_SENTENCES.length;
  const [recordings, setRecordings] = useState(() => createEmptyRecordings(totalSentences));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerRef = useRef(null);

  const recordedCount = useMemo(
    () => recordings.filter(Boolean).length,
    [recordings],
  );

  const progressPercent = useMemo(
    () => Math.round((recordedCount / totalSentences) * 100),
    [recordedCount, totalSentences],
  );

  const currentSentence = TRAINING_SENTENCES[currentIndex];
  const isLastSentence = currentIndex === totalSentences - 1;
  const hasCurrentRecording = Boolean(recordings[currentIndex]);
  const canProceed = hasCurrentRecording && !isSaving && !isRecording;

  const resetTrainingState = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setRecordings(createEmptyRecordings(totalSentences));
    setCurrentIndex(0);
    setRecordingTime(0);
    setIsSaving(false);
    setShowExitConfirm(false);
  };

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      clearInterval(timerRef.current);
      timerRef.current = null;
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  useEffect(() => () => {
    stopRecording()?.catch(() => {});
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, [stopRecording]);

  const handleRecordToggle = async () => {
    if (isSaving) return;

    if (isRecording) {
      setIsSaving(true);
      const durationSec = recordingTime;
      const blob = await stopRecording();
      setIsSaving(false);

      if (blob) {
        setRecordings((prev) => {
          const next = [...prev];
          next[currentIndex] = { blob, duration: durationSec };
          return next;
        });
      }
      return;
    }

    setRecordingTime(0);
    await startRecording();
  };

  const handleRequestClose = () => {
    if (isRecording || recordedCount > 0) {
      setShowExitConfirm(true);
      return;
    }
    onClose?.();
  };

  const handleConfirmExit = async () => {
    if (isRecording) {
      try {
        await stopRecording();
      } catch (err) {
        console.error(err);
      }
    }
    resetTrainingState();
    onClose?.();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleNextSentence = () => {
    if (currentIndex < totalSentences - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!hasCurrentRecording || recordedCount < totalSentences) {
      return;
    }
    onSubmit?.({ recordings, sentences: TRAINING_SENTENCES });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleRequestClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden animate-scale-in">
        <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
          <button
            type="button"
            onClick={handleRequestClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-gray-500">나만의 목소리</p>
            <h2 className="text-lg font-bold text-gray-900">AI 학습하기</h2>
          </div>
        </header>

        <div className="px-5 py-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>진행률</span>
              <span className="font-semibold text-gray-800">{recordedCount} / {totalSentences}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 shadow-inner">
            <p className="text-center text-xl font-bold text-gray-900 leading-relaxed min-h-[80px] flex items-center justify-center">
              {currentSentence}
            </p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700 font-semibold">
              버튼을 눌러 위 문장을 또렷하게 읽어주세요
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="h-6 text-sm font-semibold text-indigo-600">
              {isRecording ? `녹음 중... ${formatTime(recordingTime)}` : hasCurrentRecording ? '녹음 완료' : '대기 중'}
            </div>
            <button
              type="button"
              onClick={handleRecordToggle}
              disabled={isSaving}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-red-500 hover:bg-red-600'
              } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isRecording ? (
                <div className="w-10 h-10 bg-white rounded" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
            {recorderError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{recorderError}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-6">
          <button
            type="button"
            onClick={isLastSentence ? handleSubmit : handleNextSentence}
            disabled={!canProceed}
            className={`w-full py-3 rounded-2xl text-white font-semibold shadow-md transition-colors ${
              !canProceed
                ? 'bg-indigo-200 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            {isLastSentence ? '완료 및 제출' : '다음 문장'}
          </button>
          {!isLastSentence && (
            <p className="mt-2 text-center text-xs text-gray-500">현재 문장을 먼저 녹음하면 다음으로 이동할 수 있습니다.</p>
          )}
          {isLastSentence && (
            <p className="mt-2 text-center text-xs text-gray-500">20개 모두 녹음 후 제출하면 학습을 시작할 수 있어요.</p>
          )}
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelExit} aria-hidden="true" />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 text-center">녹음을 중단하고 나갈까요?</h3>
            <p className="text-sm text-gray-600 text-center">지금까지 진행한 녹음이 모두 사라집니다.</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelExit}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                계속하기
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVoiceTraining;

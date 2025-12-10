import React, { useMemo, useState, useEffect } from 'react';
import { Settings, X, Ear, Brain, GraduationCap, Play, Mic, RotateCcw } from 'lucide-react';

const speedMarks = { min: '느림', max: '빠름' };
const fontMarks = { min: '작게', max: '크게' };

const statusStyles = {
  training: { text: '학습 중', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  ready: { text: '사용 가능', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  failed: { text: '실패', className: 'bg-red-50 text-red-600 border border-red-200' },
};

const SettingsModal = ({
  onClose,
  onApply,
  settings,
  onStartTraining,
  onResetCustomVoice,
  customVoiceStatus = 'idle',
  isResettingCustomVoice = false,
}) => {
  const [voiceSpeed, setVoiceSpeed] = useState(settings?.voiceSpeed ?? 1);
  const [fontSize, setFontSize] = useState(settings?.fontSize ?? 20);
  const [voiceGender, setVoiceGender] = useState(settings?.voiceGender ?? '남성');
  const [selectedModel, setSelectedModel] = useState(settings?.aiModel ?? 'hearing'); // hearing | cp | custom
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const statusBadge = statusStyles[customVoiceStatus];
  const isCustomReady = customVoiceStatus === 'ready';
  const isCustomTraining = customVoiceStatus === 'training';

  const formattedSpeed = useMemo(() => `${voiceSpeed.toFixed(1)}x`, [voiceSpeed]);
  const modelLabel = useMemo(() => {
    if (selectedModel === 'hearing') return '언어청각장애';
    if (selectedModel === 'cp') return '뇌성마비';
    return '나만의 목소리';
  }, [selectedModel]);

  useEffect(() => {
    if (!settings) return;
    setVoiceSpeed(settings.voiceSpeed ?? 1);
    setFontSize(settings.fontSize ?? 20);
    setVoiceGender(settings.voiceGender ?? '남성');
    setSelectedModel(settings.aiModel ?? 'hearing');
  }, [settings]);

  const handleApply = () => {
    if (selectedModel === 'custom' && !isCustomReady) {
      return;
    }
    onApply?.({
      voiceSpeed,
      fontSize,
      voiceGender,
      aiModel: selectedModel,
    });
    onClose?.();
  };

  const handleOpenConfirm = () => setShowConfirm(true);
  const handleCancelConfirm = () => setShowConfirm(false);
  const handleStartConfirm = () => {
    setShowConfirm(false);
    onStartTraining?.();
  };
  const handleOpenResetConfirm = () => setShowResetConfirm(true);
  const handleCancelResetConfirm = () => setShowResetConfirm(false);
  const handleResetConfirm = () => {
    setShowResetConfirm(false);
    onResetCustomVoice?.();
  };
  const handleCustomCardClick = () => {
    if (isCustomReady) {
      setSelectedModel('custom');
      return;
    }
    if (!isCustomTraining) {
      handleOpenConfirm();
    }
  };

  return (
    <div className="bg-white rounded-[28px] w-full p-6 relative space-y-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="설정 닫기"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#EEF0FF] flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#6366F1]" />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-semibold text-gray-900">설정</h2>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              음성 속도 : <span className="font-semibold text-gray-900">{formattedSpeed}</span>
            </span>
            <span className="text-xs text-gray-400">{speedMarks.min} — {speedMarks.max}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={voiceSpeed}
            onChange={(event) => setVoiceSpeed(Number(event.target.value))}
            className="w-full accent-[#6366F1]"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              글자 크기 : <span className="font-semibold text-gray-900">{fontSize}px</span>
            </span>
            <span className="text-xs text-gray-400">{fontMarks.min} — {fontMarks.max}</span>
          </div>
          <input
            type="range"
            min="14"
            max="24"
            step="1"
            value={fontSize}
            onChange={(event) => setFontSize(Number(event.target.value))}
            className="w-full accent-[#6366F1]"
          />
        </div>

        <div className="pt-1 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
            <span>AI 인공지능 모델</span>
            {statusBadge && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge.className}`}>
                {statusBadge.text}
              </span>
            )}
            <span className="text-xs text-gray-500">{modelLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedModel('hearing')}
              className={`flex flex-col items-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-colors ${
                selectedModel === 'hearing'
                  ? 'border-[#6366F1] bg-[#EEF2FF] text-[#4F46E5]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
              }`}
            >
              <Ear className="w-5 h-5 text-[#6366F1]" />
              <span>언어청각장애</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('cp')}
              className={`flex flex-col items-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-colors ${
                selectedModel === 'cp'
                  ? 'border-[#6366F1] bg-[#EEF2FF] text-[#4F46E5]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
              }`}
            >
              <Brain className="w-5 h-5 text-[#6366F1]" />
              <span>뇌성마비</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleCustomCardClick}
            className={`w-full mt-2 flex flex-col items-center gap-2 py-4 rounded-2xl border text-sm font-semibold transition-colors ${
              selectedModel === 'custom' && isCustomReady
                ? 'border-[#6366F1] bg-[#EEF2FF] text-[#4F46E5]'
                : 'border-dashed border-gray-300 bg-white text-gray-700 hover:border-indigo-200'
              }`}
            disabled={isCustomTraining || isResettingCustomVoice}
          >
            <GraduationCap className="w-5 h-5 text-[#6366F1]" />
            <span>
              {isCustomReady
                ? selectedModel === 'custom'
                  ? '나만의 목소리 (사용중)'
                  : '나만의 목소리 (사용 가능)'
                : isCustomTraining
                  ? '나만의 목소리 (학습 중)'
                  : '나만의 목소리 (학습하기)'}
            </span>
            {!isCustomReady && isCustomTraining && (
              <span className="text-xs font-normal text-amber-600">학습 중에는 선택할 수 없습니다</span>
            )}
          </button>
          {isCustomReady && (
            <div className="w-full">
              <button
                type="button"
                onClick={handleOpenResetConfirm}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-800 font-semibold hover:border-red-200 hover:text-red-600 transition-colors"
                disabled={isCustomTraining || isResettingCustomVoice}
              >
                <RotateCcw className="w-4 h-4 text-red-500" />
                <span>초기화</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleApply}
        disabled={selectedModel === 'custom' && !isCustomReady}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white font-semibold shadow-md transition-colors active:scale-[0.99] ${
          selectedModel === 'custom' && !isCustomReady
            ? 'bg-[#A5B4FC] cursor-not-allowed'
            : 'bg-[#6366F1] hover:bg-[#4F46E5]'
        }`}
      >
        적용하기
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelConfirm} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6 text-[#6366F1]" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900">학습을 시작하시겠습니까?</h3>
            <p className="text-sm text-center text-gray-600">
              약 20개의 문장을 소리 내어 읽어야 합니다.<br />
              (예상 5-10분)
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleStartConfirm}
                className="flex-1 py-3 rounded-xl bg-[#6366F1] text-white font-semibold hover:bg-[#4F46E5]"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelResetConfirm} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900">학습된 모델을 초기화할까요?</h3>
            <p className="text-sm text-center text-gray-600">
              초기화하면 나만의 모델을 다시 학습해야 합니다.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelResetConfirm}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-70"
                disabled={isResettingCustomVoice}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;

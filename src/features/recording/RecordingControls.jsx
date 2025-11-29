import { Ear, Mic, MessageCircle, Volume2 } from 'lucide-react';

const RecordingControls = ({
  isRecording,
  isPreparing,
  recordingTime,
  onStart,
  onStop,
  displayText,
  isProcessing,
  onPlayClarified,
  isSpeaking,
  errorMessage,
  activeMode = 'voice',
  onListenPress,
}) => {
    const isListenMode = activeMode === 'listen';
    const isVoiceRecording = isRecording && activeMode === 'voice';
    const isListenRecording = isRecording && activeMode === 'listen';
    const voiceDisabled = (isPreparing || isSpeaking || isProcessing) || (isRecording && !isVoiceRecording);
    const listenDisabled = (isPreparing || isSpeaking || isProcessing) || (isRecording && !isListenRecording);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderText = () => {
      if (isPreparing) {
        return '마이크를 준비하는 중입니다...';
      }
      if (isProcessing) {
        return 'AI가 음성을 명확한 문장으로 정리하고 있어요...';
      }
      if (displayText) {
        return displayText;
      }
      if (isRecording) {
        return '음성을 듣고 있습니다...';
      }
      if (isListenMode) {
        return '듣기 모드가 켜져 있어요. 주변의 말을 들려주세요.';
      }
      return '변환된 텍스트가 여기에 표시됩니다.';
    };
    
    return (
      <div className="flex flex-col items-center w-full">
        <div
          className={`w-full max-w-sm rounded-3xl p-12 mb-8 bg-white flex flex-col items-center min-h-[280px] mx-auto border-4 ${
            isListenMode ? 'border-emerald-400' : 'border-blue-400'
          }`}
        >
          <div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
            {!displayText && (
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle
                  className={`w-10 h-10 ${
                    isListenMode ? 'text-emerald-400' : 'text-gray-400'
                  }`}
                />
              </div>
            )}
            <div className="w-full min-h-[96px] px-4 flex items-center justify-center">
              <p
                className={`w-full text-center font-medium break-words ${
                  displayText ? 'text-2xl text-gray-900 leading-relaxed' : 'text-base text-gray-700'
                }`}
              >
                {renderText()}
              </p>
            </div>
            {displayText && !isProcessing && (
              <button
                type="button"
                onClick={onPlayClarified}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                {isSpeaking ? '명확한 음성을 재생 중' : '명확한 음성 듣기'}
              </button>
            )}
            {errorMessage && (
              <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            )}
          </div>
          <div className="w-full h-6 flex items-center justify-center">
            <span
              className={`text-blue-600 font-semibold text-xl transition-opacity duration-150 ${
                isRecording ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {formatTime(recordingTime)}
            </span>
          </div>
        </div>
  
        <div className="flex items-end justify-center gap-8 mb-2">
          <div className="flex flex-col items-center gap-2">
            {!isVoiceRecording ? (
              <button
                type="button"
                onClick={onStart}
                disabled={voiceDisabled}
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                  voiceDisabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Mic className="w-10 h-10 text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStop}
                className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-white rounded" />
              </button>
            )}
            <p className="text-sm font-semibold text-gray-800">내 목소리</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onListenPress}
              disabled={listenDisabled}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all active:scale-95 ${
                listenDisabled
                  ? 'border-emerald-200 bg-white text-emerald-300 cursor-not-allowed shadow-none'
                  : isListenRecording
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.28)]'
                    : 'border-emerald-500 bg-white text-emerald-600 shadow-[0_8px_18px_rgba(16,185,129,0.18)] hover:bg-emerald-50'
              }`}
            >
              {isListenRecording ? (
                <div className="w-6 h-6 bg-white rounded" />
              ) : (
                <Ear className="w-10 h-10" />
              )}
            </button>
            <p className="text-sm font-semibold text-gray-800">듣기</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="font-semibold mb-1">
            {isRecording ? '녹음 중입니다...' : '마이크를 눌러 말씀해주세요'}
          </p>
          <p className="text-sm text-gray-500">
            {isRecording ? '음성을 듣고 있습니다...' : '명확하고 또렷한 음성으로 변환해드립니다'}
          </p>
        </div>
      </div>
    );
  };

export default RecordingControls;

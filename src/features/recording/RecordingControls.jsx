import { Mic, MessageCircle } from 'lucide-react';

const RecordingControls = ({ isRecording, recordingTime, onStart, onStop }) => {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
  
    return (
      <div className="flex flex-col items-center">
        <div className="w-full max-w-sm border-4 border-blue-400 rounded-3xl p-12 mb-8 bg-white flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-400 text-center">
            {isRecording ? '음성을 듣고 있습니다...' : '변환된 텍스트가 여기에 표시됩니다.'}
          </p>
          {isRecording && (
            <p className="text-blue-600 font-semibold mt-2 text-xl">{formatTime(recordingTime)}</p>
          )}
        </div>
  
        <div className="flex justify-center mb-4">
          {!isRecording ? (
            <button
              onClick={onStart}
              className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all active:scale-95"
            >
              <Mic className="w-10 h-10 text-white" />
            </button>
          ) : (
            <button
              onClick={onStop}
              className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all active:scale-95"
            >
              <div className="w-8 h-8 bg-white rounded" />
            </button>
          )}
        </div>
  
        <div className="text-center">
          <p className="font-semibold mb-1">
            {isRecording ? '녹음 중입니다...' : '마이크를 눌러 말씀해주세요'}
          </p>
          <p className="text-sm text-gray-500">
            {isRecording ? '음성을 듣고 있습니다...' : '명확하고 또렷한 음성로 변환해드립니다'}
          </p>
        </div>
      </div>
    );
  };

export default RecordingControls;
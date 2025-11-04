import React from 'react';
import { Volume2, Trash2 } from 'lucide-react';
import Waveform from '../../components/Waveform';

const HistoryListItem = ({ recording, onDelete, onPlayOriginal, onPlayClarified, isPlaying }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      {/* 날짜 및 삭제 버튼 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">{recording.date}</span>
        <button
          onClick={() => onDelete(recording.id)}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* 왼쪽: 웅얼거린 원본 음성 (내용) */}
        <div className="h-16 flex items-center justify-center">
          <Waveform />
        </div>

        {/* 구분선 */}
        <div className="w-px h-12 bg-gray-200" />

        {/* 오른쪽: AI로 변환된 명확한 음성 (내용) */}
        <div className="h-16 flex items-center justify-center">
          <p className="text-sm text-gray-700">
            {recording.clarifiedText}
          </p>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {/* 왼쪽 버튼 */}
        <button
          onClick={() => onPlayOriginal(recording.id)}
          disabled={isPlaying === `original-${recording.id}`}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>다시 듣기</span>
        </button>

        {/* 오른쪽 버튼 */}
        <button
          onClick={() => onPlayClarified(recording.id)}
          disabled={isPlaying === `clarified-${recording.id}`}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>다시 듣기</span>
        </button>
      </div>
    </div>
  );
};

export default HistoryListItem;

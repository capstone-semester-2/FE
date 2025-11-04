import React from 'react';
import { Volume2 } from 'lucide-react';

const FrequentWordItem = ({ rank, word, count, onPlay }) => {
  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-gray-400';
      case 3: return 'bg-orange-600';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
      {/* 순위 뱃지 */}
      <div className={`w-[29px] h-[29px] ${getRankColor(rank)} rounded-[10px] flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-[15px] text-base">{rank}</span>
      </div>

      {/* 단어 */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{word}</p>
      </div>

      {/* 사용 횟수 */}
      <span className="text-sm text-gray-500 flex-shrink-0">{count}</span>

      {/* 음성 재생 버튼 */}
      <button
        onClick={() => onPlay(word)}
        className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
      >
        <Volume2 className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
};

export default FrequentWordItem;
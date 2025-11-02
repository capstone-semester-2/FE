import React, { useState, useEffect } from 'react';
import { Youtube, PlayCircle, Bookmark } from 'lucide-react';

const SavedSignLanguageItem = ({ word, thumbnailUrl, onPlayVideo, onUnsave }) => {
  const [isImageError, setIsImageError] = useState(false);

  useEffect(() => {
    setIsImageError(false);
  }, [thumbnailUrl]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-8">
        {/* 비디오 썸네일/아이콘 */}
        <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {thumbnailUrl && !isImageError ? (
            <img
              src={thumbnailUrl}
              alt={`${word} 썸네일`}
              className="w-full h-full object-cover"
              onError={() => setIsImageError(true)}
            />
          ) : (
            <Youtube className="w-8 h-8 text-violet-700" />
          )}
        </div>

        {/* 단어 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 mb-2">{word}</h3>
          <div className="flex gap-6">
            {/* 영상 보기 버튼 */}
            <button
              onClick={() => onPlayVideo(word)}
              className="px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium hover:bg-violet-200 transition-colors flex items-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>영상 보기</span>
            </button>
            
            {/* 저장 취소 버튼 - 아이콘만 또는 텍스트 변경 */}
            <button
              onClick={() => onUnsave(word)}
              className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-1.5"
              title="저장 취소"
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>저장됨</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSignLanguageItem;
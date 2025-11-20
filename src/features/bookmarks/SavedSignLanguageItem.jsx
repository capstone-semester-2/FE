import React, { useEffect, useState } from 'react';
import { Play, Bookmark } from 'lucide-react';

const SavedSignLanguageItem = ({
  id,
  word,
  thumbnailUrl,
  onPlayVideo,
  onToggleSave,
  isSaved = false,
}) => {
  const [isImageError, setIsImageError] = useState(false);

  useEffect(() => {
    setIsImageError(false);
  }, [thumbnailUrl]);

  return (
    <div className="bg-white rounded-[26px] px-5 py-4 ">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-[#EDE7FF] rounded-[18px] flex items-center justify-center overflow-hidden flex-shrink-0">
          {thumbnailUrl && !isImageError ? (
            <img
              src={thumbnailUrl}
              alt={`${word} 썸네일`}
              className="w-full h-full object-cover"
              onError={() => setIsImageError(true)}
            />
          ) : (
            <Play className="w-6 h-6 text-[#7B61FF]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{word}</h3>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={() => onPlayVideo?.(word)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-full bg-[#F3E9FF] text-[#9B55E0] text-sm font-medium hover:bg-[#EADDFC] transition-colors whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              영상 보기
            </button>
            <button
              type="button"
              onClick={() => onToggleSave?.({ id, word, thumbnailUrl })}
              className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isSaved
                  ? 'bg-[#E0F5E7] text-[#2F9B59] hover:bg-[#D2EEDC]'
                  : 'bg-[#EEF1F4] text-[#5C6470] hover:bg-[#E3E6EA]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'text-[#2F9B59] fill-current' : 'text-[#5C6470]'}`} />
              {isSaved ? '저장됨' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSignLanguageItem;

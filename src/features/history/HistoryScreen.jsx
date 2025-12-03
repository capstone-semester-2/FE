import React, { useEffect, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';
import HistoryListItem from './HistoryListItem';

const HistoryScreen = ({ recordings, onDelete, totalCount = 0, onLoadMore, isLoading, hasMore }) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const sentinelRef = useRef(null);

  const handleDeleteClick = (id) => {
    setSelectedRecording(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (selectedRecording) {
      onDelete(selectedRecording);
    }
    setShowDeletePopup(false);
    setSelectedRecording(null);
  };

  const handlePlayOriginal = (id) => {
    setPlayingAudio(`original-${id}`);
    // TODO: 실제 오디오 재생 로직 추가
    setTimeout(() => setPlayingAudio(null), 2000);
  };

  const handlePlayClarified = (id) => {
    setPlayingAudio(`clarified-${id}`);
    // TODO: 실제 오디오 재생 로직 추가
    setTimeout(() => setPlayingAudio(null), 2000);
  };

  useEffect(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore?.();
        }
      },
      { threshold: 0.4 },
    );

    const current = sentinelRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="flex-1 overflow-auto pb-24 bg-gray-50">
      <div className="p-4">
        {/* 헤더 */}
        <div className="mt-2 mb-4 text-left">
          <h2 className="text-xl font-bold mb-1">사용 기록</h2>
          <p className="text-xs text-gray-400">내가 사용했던 음성들을 다시 들어보세요</p>
        </div>

        {/* 필터 - 총 개수 */}
        <div className="mb-4 pb-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">총 {totalCount || recordings.length}개</span>
          <button className="p-1">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {recordings.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-16 h-16 text-gray-300" />
            </div>
            <p className="text-gray-400 text-center">아직 사용 기록이 없습니다.</p>
          </div>
        ) : (
          /* 녹음 목록 */
          <div className="space-y-8">
            {recordings.map(recording => (
              <HistoryListItem
                key={recording.id}
                recording={recording}
                onDelete={handleDeleteClick}
                onPlayOriginal={handlePlayOriginal}
                onPlayClarified={handlePlayClarified}
                isPlaying={playingAudio}
              />
            ))}
            <div ref={sentinelRef} />
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 삭제 확인 팝업 */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowDeletePopup(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">녹음을 삭제하시겠습니까?</h3>
            <p className="text-gray-600 text-sm mb-6 text-center">삭제된 녹음은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;

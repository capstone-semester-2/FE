import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import HistoryListItem from './HistoryListItem';

const HistoryScreen = ({ recordings, onDelete }) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

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

  return (
    <div className="flex-1 overflow-auto pb-24 bg-gray-50">
      <div className="p-4">
        {/* 헤더 */}
        <div className="mb-4 text-left">
          <h2 className="text-xl font-bold mb-1">사용 기록</h2>
          <p className="text-xs text-gray-400">내가 사용했던 음성들을 다시 들어보세요</p>
        </div>

        {/* 필터 - 총 개수 */}
        <div className="mb-4 pb-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">총 {recordings.length}개</span>
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
          </div>
        )}
      </div>

      {/* 삭제 확인 팝업 */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-2">녹음을 삭제하시겠습니까?</h3>
            <p className="text-gray-600 text-sm mb-6">삭제된 녹음은 복구할 수 없습니다.</p>
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

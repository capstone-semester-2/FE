import React from 'react';
import { X, PlayCircle, AlertCircle } from 'lucide-react';

const SignVideoModal = ({
  isOpen,
  word = '',
  videoUrl = '',
  isLoading = false,
  error = '',
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 animate-in fade-in duration-200">
      {/* 배경 블러 처리 강화 및 어둡기 조절 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 모달 컨테이너: 둥근 모서리 확대, 그림자 강화 */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden transform transition-all scale-100 ring-1 ring-black/5">
        
        {/* 헤더 영역: 여백을 넓히고 타이틀 강조 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div className="flex flex-col gap-1">
            {/* 카테고리 배지 스타일 */}
            <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600">
              수어 백과사전
            </span>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight ml-1">
              {word || '단어 정보 없음'}
            </h3>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="group p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
            aria-label="닫기"
          >
            <X size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>

        {/* 비디오 영역: 패딩을 주어 영상이 카드 안의 카드로 보이게 함 */}
        <div className="p-4">
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-inner ring-1 ring-black/10 flex items-center justify-center group">
            
            {/* 로딩 상태 */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm z-20">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-3" />
                <span className="text-sm font-medium text-gray-500 animate-pulse">영상을 불러오는 중...</span>
              </div>
            )}

            {/* 에러 상태 */}
            {!isLoading && error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20 px-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
                  <AlertCircle size={24} />
                </div>
                <p className="font-semibold text-gray-900 mb-1">재생할 수 없어요</p>
                <p className="text-xs text-gray-500 mb-4 break-keep">{error}</p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-transform active:scale-95"
                  >
                    다시 시도
                  </button>
                )}
              </div>
            )}

            {/* 비디오 플레이어 */}
            {!isLoading && !error && videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                controls
                playsInline
                autoPlay
                muted={false}
              />
            ) : (
              !isLoading && !error && (
                <div className="flex flex-col items-center text-gray-400 gap-2">
                  <PlayCircle size={40} strokeWidth={1.5} />
                  <span className="text-sm">재생할 영상이 없습니다</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignVideoModal;
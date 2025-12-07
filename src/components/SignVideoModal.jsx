import React from 'react';
import { X } from 'lucide-react';

const SignVideoModal = ({
  isOpen,
  word = '',
  videoUrl = '',
  isLoading = false,
  error = '',
  onClose,
  onRetry,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400">수어 영상</p>
            <h3 className="text-lg font-semibold text-gray-900 truncate">{word || '영상'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-gray-100 aspect-video flex items-center justify-center">
          {isLoading && (
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>영상 불러오는 중...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center gap-3 text-sm text-gray-700 px-4 text-center">
              <p className="font-medium text-red-600">영상 재생에 실패했어요.</p>
              <p className="text-gray-500">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  다시 시도
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && videoUrl && (
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              controls
              playsInline
            />
          )}

          {!isLoading && !error && !videoUrl && (
            <div className="text-sm text-gray-500">재생할 영상이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignVideoModal;

import React, { useEffect, useRef, useState } from 'react';
import { Star, X } from 'lucide-react';
import FrequentWordItem from './FrequentWordItem';
import SavedSignLanguageItem from './SavedSignLanguageItem';
import { useBookmarkContext } from '../../store/BookmarkContext';
import { fetchTranslatedTextTop3 } from '../../services/translatedText';
import { requestGetPresignedUrl } from '../../services/fileUpload';
import SignVideoModal from '../../components/SignVideoModal';

const DEFAULT_FREQUENT_WORDS = [
  { id: 1, rank: 1, word: '안녕하세요', count: '15회 사용' },
  { id: 2, rank: 2, word: '감사합니다', count: '12회 사용' },
  { id: 3, rank: 3, word: '좋습니다', count: '8회 사용' },
];

const BookmarkScreen = () => {
  const { savedItems, toggleSavedItem, loadMore, isLoading, hasMore } = useBookmarkContext();

  const [showUnsaveModal, setShowUnsaveModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [frequentWords, setFrequentWords] = useState([]);
  const [isTopLoading, setIsTopLoading] = useState(false);
  const sentinelRef = useRef(null);
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    isLoading: false,
    videoUrl: '',
    error: '',
    item: null,
  });

  const handlePlayWord = (word) => {
    console.log(`Playing audio for: ${word}`);
  };

  const closeVideoModal = () => {
    setVideoModal({
      isOpen: false,
      isLoading: false,
      videoUrl: '',
      error: '',
      item: null,
    });
  };

  const handlePlayVideo = async (item) => {
    if (!item) return;

    setVideoModal({
      isOpen: true,
      isLoading: true,
      videoUrl: '',
      error: '',
      item,
    });

    try {
      let resolvedUrl = item?.videoUrl ?? item?.thumbnailUrl ?? '';

      if (item?.objectKey) {
        const { preSignedUrl } = await requestGetPresignedUrl(item.objectKey);
        resolvedUrl = preSignedUrl;
      }

      if (!resolvedUrl) {
        throw new Error('재생할 영상 주소를 찾지 못했습니다.');
      }

      setVideoModal((prev) => ({
        ...prev,
        videoUrl: resolvedUrl,
        isLoading: false,
        error: '',
      }));
    } catch (err) {
      setVideoModal((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || '영상 재생 주소를 불러오지 못했습니다.',
      }));
    }
  };

  const handleUnsaveRequest = (item) => {
    setPendingItem(item);
    setShowUnsaveModal(true);
  };

  const confirmUnsave = async () => {
    if (!pendingItem) {
      return;
    }

    try {
      await toggleSavedItem(pendingItem);
      setPendingItem(null);
      setShowUnsaveModal(false);
    } catch (error) {
      console.error(error);
      alert(error.message || '북마크 취소에 실패했습니다.');
    }
  };

  const cancelUnsave = () => {
    setPendingItem(null);
    setShowUnsaveModal(false);
  };

  useEffect(() => {
    const loadTop3 = async () => {
      setIsTopLoading(true);
      try {
        const items = await fetchTranslatedTextTop3();
        const normalized = items
          .map((item, index) => ({
            id: item?.id ?? item?.voiceId ?? `top-${index}`,
            rank: index + 1,
            word: item?.content ?? item?.translatedText ?? item?.text ?? '',
            count: item?.count ? `${item.count}회 사용` : '',
          }))
          .filter((item) => item.word);
        setFrequentWords(normalized);
      } catch (error) {
        console.error(error);
        setFrequentWords([]);
      } finally {
        setIsTopLoading(false);
      }
    };

    loadTop3();
  }, []);

  useEffect(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.3 },
    );

    const current = sentinelRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="flex-1 overflow-auto pb-24 bg-gray-50">
      <div className="px-5 pt-6 pb-10 space-y-8">
        <section className="bg-white rounded-[28px] px-6 py-7 border border-white/60">
          <header className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#FFE2D8] flex items-center justify-center">
              <Star className="w-7 h-7 text-[#F07752] fill-[#F07752]" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900">내가 자주 사용한 단어</h2>
              <p className="text-sm text-gray-400 mt-1">
                {isTopLoading ? '불러오는 중...' : '클릭하면 수어 영상을 볼 수 있어요'}
              </p>
            </div>
          </header>

          {frequentWords.length === 0 ? (
            <div className="border border-dashed border-gray-200 bg-gray-50 rounded-2xl px-4 py-8 text-center">
              <p className="text-gray-800 font-semibold mb-2">아직 기록된 단어가 없어요</p>
              <p className="text-gray-400 text-sm">대화를 많이 할수록 나만의 단어장이 만들어져요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {frequentWords.map((item) => (
                <FrequentWordItem
                  key={item.id}
                  rank={item.rank}
                  word={item.word}
                  count={item.count}
                  onPlay={handlePlayWord}
                />
              ))}
            </div>
          )}
        </section>

        {savedItems.length > 0 ? (
          <section className="space-y-4">
            {savedItems.map((item) => (
              <SavedSignLanguageItem
                key={item.id}
                id={item.id}
                word={item.word}
                thumbnailUrl={item.thumbnailUrl}
                objectKey={item.objectKey}
                videoUrl={item.videoUrl}
                onPlayVideo={handlePlayVideo}
                onToggleSave={handleUnsaveRequest}
                isSaved
              />
            ))}
            <div ref={sentinelRef} />
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="w-7 h-7 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </section>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-[#E6E9FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-[#B4BBEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-2">저장된 수어 영상이 없습니다</p>
            <p className="text-gray-400 text-sm">백과사전에서 수어 영상을 저장해보세요</p>
          </div>
        )}
      </div>

      <SignVideoModal
        isOpen={videoModal.isOpen}
        isLoading={videoModal.isLoading}
        videoUrl={videoModal.videoUrl}
        word={videoModal.item?.word}
        error={videoModal.error}
        onClose={closeVideoModal}
        onRetry={videoModal.item ? () => handlePlayVideo(videoModal.item) : undefined}
      />

      {showUnsaveModal && pendingItem && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={cancelUnsave}
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

            <h3 className="text-xl font-bold text-center mb-2">저장을 취소하시겠습니까?</h3>
            <p className="text-center text-gray-600 text-sm mb-6">
              <span className="font-semibold text-gray-900">"{pendingItem.word}"</span> 수어 영상이<br />
              저장 목록에서 삭제됩니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelUnsave}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmUnsave}
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

export default BookmarkScreen;

import React, { useState, useEffect, useRef } from 'react';
import { Star, X } from 'lucide-react';
import FrequentWordItem from './FrequentWordItem';
import SavedSignLanguageItem from './SavedSignLanguageItem';

const BookmarkScreen = () => {
  const [frequentWords, setFrequentWords] = useState([
    { id: 1, rank: 1, word: '안녕하세요', count: '15회 사용' },
    { id: 2, rank: 2, word: '감사합니다', count: '12회 사용' },
    { id: 3, rank: 3, word: '좋습니다', count: '8회 사용' },
  ]);

  // 초기 데이터 - 빈 배열로 시작하거나 실제 서버 데이터 사용
  const [savedSignLanguages, setSavedSignLanguages] = useState([
    { id: 1, word: '안녕하세요' },
    { id: 2, word: '감사합니다' },
    { id: 3, word: '반갑습니다' },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 초기 로드 확인
  const observerRef = useRef(null);
  const lastItemRef = useRef(null);

  // 삭제 확인 모달 상태
  const [showUnsaveModal, setShowUnsaveModal] = useState(false);
  const [wordToUnsave, setWordToUnsave] = useState(null);

  // 음성 재생 핸들러
  const handlePlayWord = (word) => {
    console.log(`Playing audio for: ${word}`);
    // TODO: 실제 음성 재생 로직
  };

  // 수어 영상 재생 핸들러
  const handlePlayVideo = (word) => {
    console.log(`Playing sign language video for: ${word}`);
    // TODO: 모달로 수어 영상 표시
  };

  // 저장 취소 요청 핸들러
  const handleUnsaveRequest = (word) => {
    setWordToUnsave(word);
    setShowUnsaveModal(true);
  };

  // 저장 취소 확인 핸들러
  const confirmUnsave = () => {
    if (wordToUnsave) {
      console.log(`Unsaving: ${wordToUnsave}`);
      
      // 목록에서 제거
      setSavedSignLanguages(prev => 
        prev.filter(item => item.word !== wordToUnsave)
      );
      
      // TODO: 서버에 삭제 요청
      // await api.unsaveSignLanguage(wordToUnsave);
    }
    
    setShowUnsaveModal(false);
    setWordToUnsave(null);
  };

  // 저장 취소 취소 핸들러
  const cancelUnsave = () => {
    setShowUnsaveModal(false);
    setWordToUnsave(null);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      try {
        // TODO: 실제 서버에서 초기 데이터 가져오기
        // const response = await api.getSignLanguages(1);
        // setSavedSignLanguages(response.data);
        // setHasMore(response.hasMore); // 서버에서 더 있는지 알려줌
        
        // 임시: 초기 데이터가 이미 있으면 그대로 사용
        // 3개만 있다고 가정
        if (savedSignLanguages.length < 10) {
          // 서버 응답 시뮬레이션: "더 이상 데이터 없음"
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) {
      fetchInitialData();
    }
  }, [isInitialLoad]);

  // 무한 스크롤 - 더 많은 데이터 로드
  const loadMoreSignLanguages = async () => {
    if (isLoading || !hasMore || isInitialLoad) return;

    setIsLoading(true);
    
    try {
      // TODO: 실제 서버에서 다음 페이지 데이터 가져오기
      /*
      const response = await api.getSignLanguages(currentPage + 1);
      
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setSavedSignLanguages(prev => [...prev, ...response.data]);
        setCurrentPage(prev => prev + 1);
        setHasMore(response.hasMore);
      }
      */
      
      // 임시 데이터 - 시뮬레이션
      setTimeout(() => {
        const totalItems = savedSignLanguages.length;
        const serverTotalItems = 5; // 서버에 실제로 5개만 있다고 가정
        
        // 이미 모든 데이터를 받았으면
        if (totalItems >= serverTotalItems) {
          setHasMore(false);
          setIsLoading(false);
          return;
        }
        
        // 새로운 아이템 생성 (최대 2개씩 추가)
        const remainingItems = serverTotalItems - totalItems;
        const itemsToAdd = Math.min(2, remainingItems);
        const newItems = Array.from({ length: itemsToAdd }, (_, i) => ({
          id: Date.now() + i,
          word: `단어 ${totalItems + i + 1}`
        }));
        
        if (newItems.length > 0) {
          setSavedSignLanguages(prev => [...prev, ...newItems]);
          setCurrentPage(prev => prev + 1);
        }
        
        // 더 이상 추가할 아이템이 없으면
        if (totalItems + newItems.length >= serverTotalItems) {
          setHasMore(false);
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load more data:', error);
      setHasMore(false);
      setIsLoading(false);
    }
  };

  // Intersection Observer 설정 (무한 스크롤)
  useEffect(() => {
    if (!hasMore || isLoading || isInitialLoad) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSignLanguages();
        }
      },
      { threshold: 0.1 }
    );

    const currentLastItem = lastItemRef.current;
    if (currentLastItem) {
      observerRef.current.observe(currentLastItem);
    }

    return () => {
      if (observerRef.current && currentLastItem) {
        observerRef.current.unobserve(currentLastItem);
      }
    };
  }, [hasMore, isLoading, isInitialLoad]);

  return (
    <div className="flex-1 overflow-auto pb-24 bg-gray-50">
      <div className="p-4">
        {/* 자주 사용한 단어 섹션 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br bg-[#FF8C8C] rounded-2xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">내가 자주 사용한 단어</h2>
            </div>
          </div>

          <div className="space-y-3">
            {frequentWords.map(item => (
              <FrequentWordItem
                key={item.id}
                rank={item.rank}
                word={item.word}
                count={item.count}
                onPlay={handlePlayWord}
              />
            ))}
          </div>
        </div>

        {/* 저장된 수어 영상 섹션 제목 */}
        {savedSignLanguages.length > 0 && (
          <>
            <h3 className="text-base font-bold text-gray-900 mb-1 text-left pl-2">저장된 수어 영상</h3>
            <p className="text-sm text-gray-500 mb-3 text-left pl-2">즐겨찾는 수어 영상을 볼 수 있어요</p>
          </>
        )}

        {/* 저장된 수어 영상 목록 */}
        {savedSignLanguages.length > 0 && (
          <div className="space-y-3">
            {savedSignLanguages.map((item, index) => (
              <div
                key={item.id}
                ref={index === savedSignLanguages.length - 1 ? lastItemRef : null}
              >
                <SavedSignLanguageItem
                  word={item.word}
                  onPlayVideo={handlePlayVideo}
                  onUnsave={handleUnsaveRequest}
                />
              </div>
            ))}
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        )}

        {/* 더 이상 데이터 없음 (데이터가 있을 때만) */}
        {!hasMore && !isLoading && savedSignLanguages.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">모든 저장된 영상을 확인했습니다</p>
          </div>
        )}

        {/* 빈 상태 (데이터가 하나도 없을 때) */}
        {savedSignLanguages.length === 0 && !isLoading && !isInitialLoad && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium mb-2">저장된 수어 영상이 없습니다</p>
            <p className="text-gray-400 text-sm">백과사전에서 수어 영상을 저장해보세요</p>
          </div>
        )}
      </div>

      {/* 저장 취소 확인 모달 */}
      {showUnsaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={cancelUnsave}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* 아이콘 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* 제목 */}
            <h3 className="text-xl font-bold text-center mb-2">저장을 취소하시겠습니까?</h3>
            
            {/* 설명 */}
            <p className="text-center text-gray-600 text-sm mb-6">
              <span className="font-semibold text-gray-900">"{wordToUnsave}"</span> 수어 영상이<br />
              저장 목록에서 삭제됩니다.
            </p>

            {/* 버튼 */}
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import SavedSignLanguageItem from '../bookmarks/SavedSignLanguageItem';
import { useBookmarkContext } from '../../store/BookmarkContext';
import { fetchDictionaryList, searchDictionary } from '../../services/dictionary';
import { requestGetPresignedUrl } from '../../services/fileUpload';
import SignVideoModal from '../../components/SignVideoModal';

const EncyclopediaScreen = () => {
  const { toggleSavedItem, isSaved } = useBookmarkContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [displayedItems, setDisplayedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState('');
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    isLoading: false,
    videoUrl: '',
    error: '',
    item: null,
  });

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    setError('');

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 검색어가 비어 있으면 검색 API 호출을 건너뛰고 목록 모드 유지
    if (!trimmed) {
      setHasMore(true);
      setIsLoading(false);
      return;
    }

    // 검색 시 API 호출 (디바운스)
    setIsLoading(true);
    setHasMore(false);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await searchDictionary(trimmed);
        const normalized = items
          .map((item) => ({
            id: item?.id ?? item?.dictionaryId,
            word: item?.gestureName ?? item?.name ?? '',
            thumbnailUrl: item?.gestureUrl ?? item?.thumbnailUrl,
            objectKey:
              item?.objectKey ??
              item?.videoObjectKey ??
              item?.gestureObjectKey ??
              item?.gestureUrlObjectKey,
            videoUrl: item?.videoUrl ?? item?.gestureVideoUrl ?? item?.gestureUrl,
          }))
          .filter((item) => item.id && item.word);
        setDisplayedItems(normalized);
      } catch (err) {
        console.error(err);
        setError(err.message || '수화 사전 검색에 실패했습니다.');
        setDisplayedItems([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const loadDictionaryList = useCallback(async () => {
    if (isLoading || !hasMore || searchTerm.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const items = await fetchDictionaryList({
        lastId: cursor ?? undefined,
        size: 20,
      });

      const normalized = items
        .map((item) => ({
          id: item?.id ?? item?.dictionaryId,
          word: item?.gestureName ?? item?.name ?? item?.dictionaryName ?? '',
          thumbnailUrl: item?.gestureUrl ?? item?.thumbnailUrl,
          objectKey:
            item?.objectKey ??
            item?.videoObjectKey ??
            item?.gestureObjectKey ??
            item?.gestureUrlObjectKey,
          videoUrl: item?.videoUrl ?? item?.gestureVideoUrl ?? item?.gestureUrl,
        }))
        .filter((item) => item.id && item.word);

      setDisplayedItems((prev) => {
        const existingIds = new Set(prev.map((it) => it.id));
        const deduped = normalized.filter((it) => !existingIds.has(it.id));
        return [...prev, ...deduped];
      });

      if (items.length === 0) {
        setHasMore(false);
        return;
      }

      const last = normalized[normalized.length - 1] ?? items[items.length - 1];
      const nextCursor =
        last?.id ??
        last?.dictionaryId ??
        last?.bookmarkId ??
        last?.bookMarkId ??
        null;

      if (nextCursor === null || nextCursor === cursor) {
        setHasMore(false);
        return;
      }
      setCursor(nextCursor);
    } catch (err) {
      console.error(err);
      setError(err.message || '수화 사전 목록을 불러오지 못했습니다.');
      setHasMore(false); // 오류 시 반복 호출 방지
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      // 검색 모드에서 목록 상태를 초기화
      setCursor(null);
      setHasMore(false);
      return;
    }

    loadDictionaryList();
  }, [loadDictionaryList, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim() || !hasMore || isLoading) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadDictionaryList();
        }
      },
      { threshold: 0.4 },
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadDictionaryList, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCursor(null);
    setHasMore(true);
    setDisplayedItems([]);
  };

  const handleToggleSave = async (item) => {
    try {
      await toggleSavedItem(item);
    } catch (error) {
      console.error(error);
      alert(error.message || '북마크 저장에 실패했습니다.');
    }
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

  const emptyStateVisible = Boolean(searchTerm.trim()) && !isLoading && displayedItems.length === 0;

  return (
    <div className="flex-1 overflow-auto pb-24 bg-gray-50">
      <div className="px-5 pt-6 pb-10 space-y-6">
        <header className="space-y-1 text-left">
          <h2 className="text-xl font-bold text-gray-900">백과사전</h2>
          <p className="text-xs text-gray-400">궁금한 수어를 검색해보세요</p>
        </header>

        <div className="w-full h-px bg-gray-200" />

        <div className="bg-white rounded-3xl px-5 py-4 ">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="궁금한 수어를 검색해보세요"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F6F7FF] border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {emptyStateVisible ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[28px] border border-white/70 ">
            <div className="w-20 h-20 rounded-full bg-[#EFF0FF] flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-[#7B7E98]" />
            </div>
            <p className="text-gray-600 font-semibold mb-2">검색 결과가 없습니다.</p>
            <p className="text-sm text-gray-400">다른 키워드로 검색해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedItems.map((item) => (
              <SavedSignLanguageItem
                key={item.id}
                id={item.id}
                word={item.word}
                thumbnailUrl={item.thumbnailUrl}
                objectKey={item.objectKey}
                videoUrl={item.videoUrl}
                onPlayVideo={handlePlayVideo}
                onToggleSave={handleToggleSave}
                isSaved={isSaved(item.id)}
              />
            ))}

            <div ref={sentinelRef} aria-hidden />

            {isLoading && (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {error && (
              <div className="text-center text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                {error}
              </div>
            )}
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
    </div>
  );
};

export default EncyclopediaScreen;

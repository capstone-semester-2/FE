import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import SavedSignLanguageItem from '../bookmarks/SavedSignLanguageItem';
import { useBookmarkContext } from '../../store/BookmarkContext';
import { searchDictionary } from '../../services/dictionary';

const MOCK_ENTRIES = [
  { id: 101, word: '안녕하세요' },
  { id: 102, word: '감사합니다' },
  { id: 103, word: '반갑습니다' },
  { id: 104, word: '도와주세요' },
  { id: 105, word: '죄송합니다' },
  { id: 106, word: '괜찮아요' },
];

const ITEMS_PER_PAGE = 5;

const EncyclopediaScreen = () => {
  const { toggleSavedItem, isSaved } = useBookmarkContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

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

    // 검색어 없으면 기본 목록 + 무한스크롤 유지
    if (!trimmed) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const nextItems = MOCK_ENTRIES.slice(0, page * ITEMS_PER_PAGE);
        setDisplayedItems(nextItems);
        setHasMore(nextItems.length < MOCK_ENTRIES.length);
        setIsLoading(false);
      }, 120);
      return () => clearTimeout(timer);
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
  }, [page, searchTerm]);

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
          setPage((prev) => prev + 1);
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
  }, [hasMore, isLoading, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleToggleSave = async (item) => {
    try {
      await toggleSavedItem(item);
    } catch (error) {
      console.error(error);
      alert(error.message || '북마크 저장에 실패했습니다.');
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
                onPlayVideo={() => console.log(`영상 보기: ${item.word}`)}
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
    </div>
  );
};

export default EncyclopediaScreen;

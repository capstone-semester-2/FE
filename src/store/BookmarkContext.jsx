/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createBookmark, fetchBookmarkList } from '../services/bookmarks';

const BookmarkContext = createContext(null);

const initialSavedItems = [];

const normalizeBookmark = (item) => ({
  id: item?.id ?? item?.bookmarkId ?? item?.bookMarkId,
  word: item?.gestureName ?? item?.name ?? '',
  thumbnailUrl: item?.gestureUrl ?? item?.thumbnailUrl,
});

export const BookmarkProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState(initialSavedItems);
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const hasLoadedInitial = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    try {
      const items = await fetchBookmarkList({
        lastId: cursor ?? undefined,
        size: 20,
      });

      const normalized = items.map(normalizeBookmark).filter((item) => item.id && item.word);

      setSavedItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const deduped = normalized.filter((item) => !existingIds.has(item.id));
        return [...prev, ...deduped];
      });

      if (items.length === 0) {
        setHasMore(false);
        return;
      }

      const nextCursor = items[items.length - 1]?.id ?? null;
      if (nextCursor === null || nextCursor === cursor) {
        setHasMore(false);
        return;
      }
      setCursor(nextCursor);
    } catch (error) {
      console.error('Failed to load bookmarks', error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading]);

  useEffect(() => {
    if (hasLoadedInitial.current) {
      return;
    }
    hasLoadedInitial.current = true;
    loadMore();
  }, [loadMore]);

  const toggleSavedItem = useCallback(
    async (item) => {
      if (!item?.id) {
        throw new Error('dictionaryId가 필요합니다.');
      }

      const exists = savedItems.some((saved) => saved.id === item.id);

      if (exists) {
        setSavedItems((prev) => prev.filter((saved) => saved.id !== item.id));
        return { isSaved: false };
      }

      const result = await createBookmark(item.id);

      setSavedItems((prev) => {
        if (prev.some((saved) => saved.id === item.id)) {
          return prev;
        }
        return [...prev, { ...item, bookmarkId: result?.bookMarkId }];
      });

      return { isSaved: true, bookmarkId: result?.bookMarkId };
    },
    [savedItems],
  );

  const removeSavedItem = useCallback((id) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isSaved = useCallback(
    (id) => savedItems.some((item) => item.id === id),
    [savedItems],
  );

  const contextValue = useMemo(
    () => ({
      savedItems,
      isLoading,
      hasMore,
      loadMore,
      toggleSavedItem,
      removeSavedItem,
      isSaved,
    }),
    [hasMore, isLoading, isSaved, loadMore, removeSavedItem, savedItems, toggleSavedItem],
  );

  return <BookmarkContext.Provider value={contextValue}>{children}</BookmarkContext.Provider>;
};

export const useBookmarkContext = () => {
  const value = useContext(BookmarkContext);
  if (!value) {
    throw new Error('useBookmarkContext must be used within a BookmarkProvider');
  }
  return value;
};

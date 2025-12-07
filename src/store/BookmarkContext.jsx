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
import { fetchBookmarkList, toggleDictionaryBookmark } from '../services/bookmarks';

const BookmarkContext = createContext(null);

const initialSavedItems = [];

const normalizeBookmark = (item) => ({
  id:
    item?.id ??
    item?.dictionaryId ??
    item?.bookmarkId ??
    item?.bookMarkId,
  word: item?.gestureName ?? item?.name ?? item?.dictionaryName ?? '',
  thumbnailUrl: item?.gestureUrl ?? item?.thumbnailUrl,
  objectKey:
    item?.objectKey ??
    item?.videoObjectKey ??
    item?.gestureObjectKey ??
    item?.gestureUrlObjectKey,
  videoUrl: item?.videoUrl ?? item?.gestureVideoUrl ?? item?.gestureUrl ?? item?.thumbnailUrl,
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

      const lastNormalized = normalized[normalized.length - 1];
      const lastRaw = items[items.length - 1];
      const nextCursor =
        lastNormalized?.id ??
        lastRaw?.id ??
        lastRaw?.dictionaryId ??
        lastRaw?.bookmarkId ??
        lastRaw?.bookMarkId ??
        null;
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
      const dictionaryId = item?.id ?? item?.dictionaryId;
      if (!dictionaryId) {
        throw new Error('dictionaryId가 필요합니다.');
      }

      const result = await toggleDictionaryBookmark(dictionaryId);
      const bookmarked = Boolean(result?.bookmarked);

      setSavedItems((prev) => {
        const withoutCurrent = prev.filter((saved) => saved.id !== dictionaryId);
        if (!bookmarked) {
          return withoutCurrent;
        }

        const existing = prev.find((saved) => saved.id === dictionaryId);
        const baseItem = existing || item || { id: dictionaryId };
        const normalized = {
          ...baseItem,
          id: baseItem?.id ?? dictionaryId,
          word:
            baseItem?.word ??
            baseItem?.gestureName ??
            baseItem?.name ??
            baseItem?.dictionaryName ??
            '',
          thumbnailUrl: baseItem?.thumbnailUrl ?? baseItem?.gestureUrl,
          objectKey:
            baseItem?.objectKey ??
            baseItem?.videoObjectKey ??
            baseItem?.gestureObjectKey ??
            baseItem?.gestureUrlObjectKey,
          videoUrl:
            baseItem?.videoUrl ??
            baseItem?.gestureVideoUrl ??
            baseItem?.gestureUrl ??
            baseItem?.thumbnailUrl,
        };

        if (!normalized.word) {
          return withoutCurrent;
        }

        return [...withoutCurrent, normalized];
      });

      return {
        isSaved: bookmarked,
        dictionaryId: result?.dictionaryId ?? dictionaryId,
        bookmarked,
      };
    },
    [],
  );

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
      isSaved,
    }),
    [hasMore, isLoading, isSaved, loadMore, savedItems, toggleSavedItem],
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

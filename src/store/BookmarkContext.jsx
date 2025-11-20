/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createBookmark, fetchBookmarkList } from '../services/bookmarks';

const BookmarkContext = createContext(null);

const initialSavedItems = [];

export const BookmarkProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState(initialSavedItems);

  useEffect(() => {
    let isMounted = true;

    fetchBookmarkList()
      .then((items) => {
        if (!isMounted) {
          return;
        }
        const normalized = items
          .map((item) => ({
            id: item?.id ?? item?.bookmarkId ?? item?.bookMarkId,
            word: item?.gestureName ?? item?.name ?? '',
            thumbnailUrl: item?.gestureUrl ?? item?.thumbnailUrl,
          }))
          .filter((item) => item.id && item.word);
        setSavedItems(normalized);
      })
      .catch((error) => {
        console.error('Failed to load bookmarks', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      toggleSavedItem,
      removeSavedItem,
      isSaved,
    }),
    [savedItems, toggleSavedItem, removeSavedItem, isSaved],
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

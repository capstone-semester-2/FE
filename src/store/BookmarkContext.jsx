/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createBookmark } from '../services/bookmarks';

const BookmarkContext = createContext(null);

const initialSavedItems = [
  { id: 1, word: '안녕하세요' },
  { id: 2, word: '감사합니다' },
  { id: 3, word: '반갑습니다' },
];

export const BookmarkProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState(initialSavedItems);

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

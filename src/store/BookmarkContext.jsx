/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BookmarkContext = createContext(null);

const initialSavedItems = [
  { id: 1, word: '안녕하세요' },
  { id: 2, word: '감사합니다' },
  { id: 3, word: '반갑습니다' },
];

export const BookmarkProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState(initialSavedItems);

  const toggleSavedItem = useCallback((item) => {
    setSavedItems((prev) => {
      const exists = prev.some((saved) => saved.id === item.id);
      if (exists) {
        return prev.filter((saved) => saved.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

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

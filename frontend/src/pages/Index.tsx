import { useState } from 'react';
import { MainPage } from '@/components/MainPage';
import { ReadingApp } from '@/components/ReadingApp';
import { useDictionary } from '@/hooks/useDictionary';
import { BookData } from '@/types/reading';

const Index = () => {
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);
  const [books, setBooks] = useState<BookData[]>([]);
  const [timerDuration, setTimerDuration] = useState(5);
  
  const dictionary = useDictionary();

  const handleAddBook = (book: BookData) => {
    setBooks((prev) => {
      // Replace if book with same name exists
      const existing = prev.findIndex((b) => b.name === book.name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = book;
        return updated;
      }
      return [...prev, book];
    });
  };

  const handleDeleteBook = (name: string) => {
    setBooks((prev) => prev.filter((b) => b.name !== name));
  };

  const handleOpenBook = (book: BookData) => {
    setCurrentBook(book);
  };

  const handleCloseBook = () => {
    // Save current page before closing
    if (currentBook) {
      setBooks((prev) =>
        prev.map((b) =>
          b.name === currentBook.name ? { ...b, currentPage: currentBook.currentPage } : b
        )
      );
    }
    setCurrentBook(null);
  };

  const handleAddWord = (word: string, definition: string, context?: string) => {
    return dictionary.addWord(word, definition, context);
  };

  if (currentBook) {
    return (
      <ReadingApp
        book={currentBook}
        onClose={handleCloseBook}
        timerDuration={timerDuration}
        hasWord={dictionary.hasWord}
        onAddWord={handleAddWord}
      />
    );
  }

  return (
    <MainPage
      onOpenBook={handleOpenBook}
      books={books}
      onAddBook={handleAddBook}
      onDeleteBook={handleDeleteBook}
      dictionary={dictionary.words}
      onRemoveWord={dictionary.removeWord}
      timerDuration={timerDuration}
      onTimerDurationChange={setTimerDuration}
    />
  );
};

export default Index;

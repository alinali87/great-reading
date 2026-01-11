import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainPage } from "@/components/MainPage";
import { ReadingApp } from "@/components/ReadingApp";
import { BookData } from "@/types/reading";
import { toast } from "sonner";
import {
  listBooks,
  uploadBook,
  deleteBook,
  updateBookProgress,
  Book,
  getDictionary,
  addWordToDictionary,
  removeWordFromDictionary,
  checkWordInDictionary,
  DictionaryWord,
  getSettings,
  updateSettings,
} from "@/services";

const Index = () => {
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);
  const queryClient = useQueryClient();

  // Fetch books from backend
  const { data: backendBooks = [] } = useQuery({
    queryKey: ["books"],
    queryFn: listBooks,
  });

  // Fetch dictionary from backend
  const { data: dictionaryData } = useQuery({
    queryKey: ["dictionary"],
    queryFn: () => getDictionary({ sort: "addedAt_desc", limit: 1000 }),
  });

  // Fetch settings from backend
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const timerDuration = settings?.timerDuration || 5;

  // Upload book mutation
  const uploadBookMutation = useMutation({
    mutationFn: uploadBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload book: ${error.message}`);
    },
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete book: ${error.message}`);
    },
  });

  // Update book progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({
      bookId,
      currentPage,
    }: {
      bookId: string;
      currentPage: number;
    }) => updateBookProgress(bookId, currentPage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  // Add word to dictionary mutation
  const addWordMutation = useMutation({
    mutationFn: addWordToDictionary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dictionary"] });
      toast.success("Word added to dictionary!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add word: ${error.message}`);
    },
  });

  // Remove word from dictionary mutation
  const removeWordMutation = useMutation({
    mutationFn: removeWordFromDictionary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dictionary"] });
      toast.success("Word removed from dictionary!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove word: ${error.message}`);
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Convert backend books to frontend format
  const books: BookData[] = backendBooks.map((book: Book) => ({
    name: book.name,
    content: book.content,
    currentPage: book.currentPage,
    id: book.id,
  }));

  const handleAddBook = async (book: BookData) => {
    // This is called when a file is uploaded
    // We need to create a File object from the book data
    // But this should be handled differently - we'll update MainPage to handle the upload directly
  };

  const handleUploadFile = async (file: File) => {
    await uploadBookMutation.mutateAsync(file);
  };

  const handleDeleteBook = async (bookId: string) => {
    await deleteBookMutation.mutateAsync(bookId);
  };

  const handleOpenBook = (book: BookData) => {
    setCurrentBook(book);
  };

  const handleCloseBook = () => {
    // Save current page before closing
    if (currentBook && currentBook.id) {
      updateProgressMutation.mutate({
        bookId: currentBook.id,
        currentPage: currentBook.currentPage,
      });
    }
    setCurrentBook(null);
  };

  const handleAddWord = async (
    word: string,
    definition: string,
    context?: string,
  ): Promise<boolean> => {
    try {
      // Check if word already exists
      const exists = await checkWordInDictionary(word);
      if (exists) {
        toast.info("Word already in dictionary");
        return false;
      }

      await addWordMutation.mutateAsync({ word, definition, context });
      return true;
    } catch (error) {
      return false;
    }
  };

  const hasWord = async (word: string): Promise<boolean> => {
    return checkWordInDictionary(word);
  };

  const handleTimerDurationChange = (minutes: number) => {
    updateSettingsMutation.mutate({ timerDuration: minutes });
  };

  if (currentBook) {
    return (
      <ReadingApp
        book={currentBook}
        onClose={handleCloseBook}
        timerDuration={timerDuration}
        hasWord={(word) => {
          // For synchronous check, use dictionary data
          return (
            dictionaryData?.words.some(
              (w) => w.word.toLowerCase() === word.toLowerCase(),
            ) || false
          );
        }}
        onAddWord={handleAddWord}
      />
    );
  }

  return (
    <MainPage
      onOpenBook={handleOpenBook}
      books={books}
      onAddBook={handleAddBook}
      onUploadFile={handleUploadFile}
      onDeleteBook={handleDeleteBook}
      dictionary={dictionaryData?.words || []}
      onRemoveWord={(id) => removeWordMutation.mutate(id)}
      timerDuration={timerDuration}
      onTimerDurationChange={handleTimerDurationChange}
    />
  );
};

export default Index;

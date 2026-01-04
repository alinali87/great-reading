import { useState, useCallback } from 'react';
import { DictionaryWord } from '@/types/reading';

export function useDictionary() {
  const [words, setWords] = useState<DictionaryWord[]>([]);

  const addWord = useCallback((word: string, definition: string, context?: string) => {
    const cleanWord = word.toLowerCase().trim();
    
    // Check if word already exists
    if (words.some((w) => w.word.toLowerCase() === cleanWord)) {
      return false;
    }

    const newWord: DictionaryWord = {
      id: crypto.randomUUID(),
      word: cleanWord,
      definition,
      addedAt: new Date(),
      context,
    };

    setWords((prev) => [newWord, ...prev]);
    return true;
  }, [words]);

  const removeWord = useCallback((id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const hasWord = useCallback((word: string) => {
    return words.some((w) => w.word.toLowerCase() === word.toLowerCase().trim());
  }, [words]);

  const clearDictionary = useCallback(() => {
    setWords([]);
  }, []);

  return {
    words,
    addWord,
    removeWord,
    hasWord,
    clearDictionary,
    wordCount: words.length,
  };
}

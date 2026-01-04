export type ReadingMode = 'page' | 'sentence';

export interface DictionaryWord {
  id: string;
  word: string;
  definition: string;
  addedAt: Date;
  context?: string;
}

export interface WordContextMenuData {
  word: string;
  definition: string;
  position: { x: number; y: number };
}

export interface BookData {
  name: string;
  content: string[];
  currentPage: number;
}

import { fetchAPI } from './api';

export interface WordDefinitionItem {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

export interface WordDefinition {
  word: string;
  definitions: WordDefinitionItem[];
  phonetic?: string;
  audioUrl?: string;
}

export interface PronunciationResponse {
  word: string;
  audioUrl: string;
  phonetic?: string;
}

// Get word definition
export async function getWordDefinition(word: string): Promise<WordDefinition> {
  return fetchAPI<WordDefinition>(`/definitions/${encodeURIComponent(word)}`);
}

// Get word pronunciation
export async function getWordPronunciation(
  word: string,
  voice: 'us' | 'uk' | 'au' = 'us'
): Promise<PronunciationResponse> {
  return fetchAPI<PronunciationResponse>(
    `/definitions/${encodeURIComponent(word)}/pronounce?voice=${voice}`
  );
}

import { fetchAPI } from './api';

export interface DictionaryWord {
  id: string;
  word: string;
  definition: string;
  context?: string;
  addedAt: Date;
}

export interface DictionaryResponse {
  words: DictionaryWord[];
  total: number;
  limit: number;
  offset: number;
}

export interface AddWordRequest {
  word: string;
  definition: string;
  context?: string;
}

export interface CheckWordResponse {
  exists: boolean;
  word: string;
}

// Get user's dictionary
export async function getDictionary(params?: {
  sort?: 'addedAt_desc' | 'addedAt_asc' | 'word_asc' | 'word_desc';
  limit?: number;
  offset?: number;
}): Promise<DictionaryResponse> {
  const queryParams = new URLSearchParams();
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const query = queryParams.toString();
  const endpoint = query ? `/dictionary?${query}` : '/dictionary';
  
  const response = await fetchAPI<DictionaryResponse>(endpoint);
  
  // Convert addedAt strings to Date objects
  return {
    ...response,
    words: response.words.map(word => ({
      ...word,
      addedAt: new Date(word.addedAt),
    })),
  };
}

// Add word to dictionary
export async function addWordToDictionary(
  wordData: AddWordRequest
): Promise<DictionaryWord> {
  const response = await fetchAPI<DictionaryWord>('/dictionary', {
    method: 'POST',
    body: JSON.stringify(wordData),
  });
  
  return {
    ...response,
    addedAt: new Date(response.addedAt),
  };
}

// Remove word from dictionary
export async function removeWordFromDictionary(wordId: string): Promise<void> {
  return fetchAPI<void>(`/dictionary/${wordId}`, {
    method: 'DELETE',
  });
}

// Check if word exists in dictionary
export async function checkWordInDictionary(word: string): Promise<boolean> {
  const response = await fetchAPI<CheckWordResponse>(`/dictionary/check/${encodeURIComponent(word)}`);
  return response.exists;
}

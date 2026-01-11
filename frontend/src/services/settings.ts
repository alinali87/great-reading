import { fetchAPI } from './api';
import { ReadingMode } from '@/types/reading';

export interface UserSettings {
  userId: string;
  timerDuration: number;
  readingMode: ReadingMode;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  timerDuration?: number;
  readingMode?: ReadingMode;
}

// Get user settings
export async function getSettings(): Promise<UserSettings> {
  return fetchAPI<UserSettings>('/settings');
}

// Update user settings
export async function updateSettings(
  settings: UpdateSettingsRequest
): Promise<UserSettings> {
  return fetchAPI<UserSettings>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

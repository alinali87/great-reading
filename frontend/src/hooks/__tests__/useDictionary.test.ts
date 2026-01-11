import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDictionary } from '../useDictionary';

describe('useDictionary', () => {
  beforeEach(() => {
    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: () => `test-uuid-${Math.random()}`,
    });
  });

  it('should initialize with empty dictionary', () => {
    const { result } = renderHook(() => useDictionary());
    
    expect(result.current.words).toEqual([]);
    expect(result.current.wordCount).toBe(0);
  });

  it('should add a word to the dictionary', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      const added = result.current.addWord('ephemeral', 'lasting for a very short time');
      expect(added).toBe(true);
    });
    
    expect(result.current.words).toHaveLength(1);
    expect(result.current.words[0]).toMatchObject({
      word: 'ephemeral',
      definition: 'lasting for a very short time',
    });
    expect(result.current.words[0].id).toBeDefined();
    expect(result.current.words[0].addedAt).toBeInstanceOf(Date);
    expect(result.current.wordCount).toBe(1);
  });

  it('should add a word with context', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord(
        'ephemeral', 
        'lasting for a very short time',
        'The beauty of the sunset was ephemeral.'
      );
    });
    
    expect(result.current.words[0].context).toBe('The beauty of the sunset was ephemeral.');
  });

  it('should normalize word to lowercase', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('EPHEMERAL', 'lasting for a very short time');
    });
    
    expect(result.current.words[0].word).toBe('ephemeral');
  });

  it('should trim whitespace from words', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('  ephemeral  ', 'lasting for a very short time');
    });
    
    expect(result.current.words[0].word).toBe('ephemeral');
  });

  it('should not add duplicate words (case insensitive)', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      const first = result.current.addWord('ephemeral', 'lasting for a very short time');
      expect(first).toBe(true);
    });
    
    act(() => {
      const duplicate = result.current.addWord('EPHEMERAL', 'another definition');
      expect(duplicate).toBe(false);
    });
    
    expect(result.current.words).toHaveLength(1);
    expect(result.current.words[0].definition).toBe('lasting for a very short time');
  });

  it('should add multiple different words', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('ephemeral', 'lasting for a very short time');
      result.current.addWord('serendipity', 'the occurrence of events by chance');
      result.current.addWord('mellifluous', 'sweet or musical');
    });
    
    expect(result.current.words).toHaveLength(3);
    expect(result.current.wordCount).toBe(3);
    
    // Words should be added to the front (newest first)
    expect(result.current.words[0].word).toBe('mellifluous');
    expect(result.current.words[1].word).toBe('serendipity');
    expect(result.current.words[2].word).toBe('ephemeral');
  });

  it('should remove a word by id', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('ephemeral', 'lasting for a very short time');
      result.current.addWord('serendipity', 'the occurrence of events by chance');
    });
    
    const idToRemove = result.current.words[0].id;
    
    act(() => {
      result.current.removeWord(idToRemove);
    });
    
    expect(result.current.words).toHaveLength(1);
    expect(result.current.words[0].word).toBe('ephemeral');
  });

  it('should check if word exists (case insensitive)', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('ephemeral', 'lasting for a very short time');
    });
    
    expect(result.current.hasWord('ephemeral')).toBe(true);
    expect(result.current.hasWord('EPHEMERAL')).toBe(true);
    expect(result.current.hasWord('  ephemeral  ')).toBe(true);
    expect(result.current.hasWord('nonexistent')).toBe(false);
  });

  it('should clear the entire dictionary', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('ephemeral', 'lasting for a very short time');
      result.current.addWord('serendipity', 'the occurrence of events by chance');
      result.current.addWord('mellifluous', 'sweet or musical');
    });
    
    expect(result.current.words).toHaveLength(3);
    
    act(() => {
      result.current.clearDictionary();
    });
    
    expect(result.current.words).toHaveLength(0);
    expect(result.current.wordCount).toBe(0);
  });

  it('should handle removing non-existent word gracefully', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('ephemeral', 'lasting for a very short time');
    });
    
    act(() => {
      result.current.removeWord('non-existent-id');
    });
    
    expect(result.current.words).toHaveLength(1);
  });

  it('should generate unique IDs for each word', () => {
    const { result } = renderHook(() => useDictionary());
    
    act(() => {
      result.current.addWord('ephemeral', 'lasting for a very short time');
      result.current.addWord('serendipity', 'the occurrence of events by chance');
      result.current.addWord('mellifluous', 'sweet or musical');
    });
    
    const ids = result.current.words.map(w => w.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(3);
  });

  it('should maintain addedAt timestamp for each word', () => {
    const { result } = renderHook(() => useDictionary());
    const beforeAdd = new Date();
    
    act(() => {
      result.current.addWord('ephemeral', 'lasting for a very short time');
    });
    
    const afterAdd = new Date();
    const addedAt = result.current.words[0].addedAt;
    
    expect(addedAt.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime());
    expect(addedAt.getTime()).toBeLessThanOrEqual(afterAdd.getTime());
  });
});

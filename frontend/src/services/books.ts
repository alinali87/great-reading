import { fetchAPI } from './api';

export interface Book {
  id: string;
  name: string;
  content: string[];
  currentPage: number;
  totalPages: number;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface BooksResponse {
  books: Book[];
}

// List all books
export async function listBooks(): Promise<Book[]> {
  const response = await fetchAPI<BooksResponse>('/books');
  return response.books;
}

// Upload a new book
export async function uploadBook(file: File): Promise<Book> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/books`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Unknown Error',
      message: `HTTP error ${response.status}`,
    }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

// Get a specific book
export async function getBook(bookId: string): Promise<Book> {
  return fetchAPI<Book>(`/books/${bookId}`);
}

// Update book progress
export async function updateBookProgress(
  bookId: string,
  currentPage: number
): Promise<Book> {
  return fetchAPI<Book>(`/books/${bookId}`, {
    method: 'PATCH',
    body: JSON.stringify({ currentPage }),
  });
}

// Delete a book
export async function deleteBook(bookId: string): Promise<void> {
  return fetchAPI<void>(`/books/${bookId}`, {
    method: 'DELETE',
  });
}

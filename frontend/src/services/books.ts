import { fetchAPI, API_BASE_URL } from "./api";
import { getToken, removeToken } from "./auth";

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
  const response = await fetchAPI<BooksResponse>("/books");
  return response.books;
}

// Upload a new book
export async function uploadBook(file: File): Promise<Book> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Unknown Error",
      detail: `HTTP error ${response.status}`,
    }));
    throw new Error(
      error.detail || error.message || `HTTP error ${response.status}`,
    );
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
  currentPage: number,
): Promise<Book> {
  return fetchAPI<Book>(`/books/${bookId}`, {
    method: "PATCH",
    body: JSON.stringify({ currentPage }),
  });
}

// Delete a book
export async function deleteBook(bookId: string): Promise<void> {
  return fetchAPI<void>(`/books/${bookId}`, {
    method: "DELETE",
  });
}

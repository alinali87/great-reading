# Frontend-Backend Integration Guide

This document describes how the GreatReading frontend integrates with the backend API.

## Architecture

The frontend uses **React Query** for data fetching and state management, communicating with the FastAPI backend via REST API calls.

## API Services

All API services are located in `frontend/src/services/`:

### Books Service (`books.ts`)
- `listBooks()` - Get all books
- `uploadBook(file)` - Upload a PDF file
- `getBook(bookId)` - Get a specific book
- `updateBookProgress(bookId, currentPage)` - Update reading progress
- `deleteBook(bookId)` - Delete a book

### Dictionary Service (`dictionary.ts`)
- `getDictionary(params?)` - Get personal dictionary with optional sorting/pagination
- `addWordToDictionary(wordData)` - Add a word to dictionary
- `removeWordFromDictionary(wordId)` - Remove a word
- `checkWordInDictionary(word)` - Check if word exists

### Definitions Service (`definitions.ts`)
- `getWordDefinition(word)` - Get word definition from external API
- `getWordPronunciation(word, voice?)` - Get pronunciation audio URL

### Settings Service (`settings.ts`)
- `getSettings()` - Get user settings
- `updateSettings(settings)` - Update user settings (timer duration, reading mode)

## Configuration

The frontend connects to the backend using the `VITE_API_URL` environment variable:

1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Set `VITE_API_URL=http://localhost:3000/api/v1` (default)

## Data Flow

### Book Upload Flow
1. User drags/selects PDF file
2. `MainPage` calls `handleUploadFile(file)`
3. `uploadBook` mutation sends file to backend via FormData
4. Backend processes PDF and stores it in database
5. React Query invalidates and refetches books list
6. Toast notification shows success/error

### Dictionary Flow
1. User adds word from ReadingApp
2. `checkWordInDictionary` checks if word already exists
3. `addWordToDictionary` mutation sends word to backend
4. Backend stores word in database
5. React Query invalidates and refetches dictionary
6. Toast notification confirms addition

### Settings Flow
1. User changes timer duration
2. `updateSettings` mutation sends update to backend
3. Backend updates settings in database
4. React Query refetches settings
5. UI reflects new timer duration

## React Query Keys

Query keys used for caching and invalidation:

- `['books']` - Books list
- `['dictionary']` - User's dictionary
- `['settings']` - User settings

## Error Handling

All API calls include error handling:
- Failed requests show toast notifications with error messages
- Network errors are caught and displayed to user
- Loading states are managed via React Query's `isLoading` states

## Testing

To test the integration:

1. Start the backend: `cd backend && uv run uvicorn app.main:app --reload --port 3000`
2. Start the frontend: `cd frontend && npm run dev`
3. Open http://localhost:8080
4. Upload a PDF file
5. Verify data persists in backend database

Or simply use the Makefile:
```bash
make start  # Start both backend and frontend
make stop   # Stop all servers
```

## API Specification

The integration follows the OpenAPI specification in `openapi.yaml`. All endpoints, request/response formats, and error codes are documented there.

## Future Enhancements

- Add authentication/authorization
- Implement offline support with service workers
- Add optimistic updates for better UX
- Implement request retry logic
- Add request caching strategies

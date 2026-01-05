# GreatReading Backend API

Backend API for GreatReading - An English language learning reading application.

## Features

- **Book Management**: Upload, store, list, and delete PDF books
- **Personal Dictionary**: Save words with definitions and context
- **Word Definitions**: Look up word definitions using external dictionary API
- **Word Pronunciation**: Get pronunciation audio URLs
- **Reading Progress**: Track current page for each book
- **User Settings**: Store timer duration and reading mode preferences

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Database (can be easily switched to PostgreSQL/MySQL)
- **pypdf**: PDF text extraction
- **Pydantic**: Data validation using Python type hints
- **uvicorn**: ASGI server

## Installation

1. Install dependencies using uv:

```bash
uv sync
```

2. Create a `.env` file (optional):

```bash
cp .env.example .env
```

Edit `.env` to customize settings if needed.

## Running the Application

Development mode with auto-reload:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
```

Or simply:

```bash
uv run python -m uvicorn app.main:app --reload --port 3000
```

The API will be available at:
- API: http://localhost:3000
- Interactive docs (Swagger UI): http://localhost:3000/api/v1/docs
- Alternative docs (ReDoc): http://localhost:3000/api/v1/redoc
- OpenAPI schema: http://localhost:3000/api/v1/openapi.json

## API Endpoints

### Books
- `GET /api/v1/books` - List all books
- `POST /api/v1/books` - Upload a new book (PDF)
- `GET /api/v1/books/{book_id}` - Get a specific book
- `PATCH /api/v1/books/{book_id}` - Update reading progress
- `DELETE /api/v1/books/{book_id}` - Delete a book

### Dictionary
- `GET /api/v1/dictionary` - Get personal dictionary
- `POST /api/v1/dictionary` - Add word to dictionary
- `DELETE /api/v1/dictionary/{word_id}` - Remove word from dictionary
- `GET /api/v1/dictionary/check/{word}` - Check if word exists

### Definitions
- `GET /api/v1/definitions/{word}` - Get word definition
- `GET /api/v1/definitions/{word}/pronounce` - Get pronunciation audio

### Settings
- `GET /api/v1/settings` - Get user settings
- `PATCH /api/v1/settings` - Update user settings

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── books.py          # Book management endpoints
│   │       ├── dictionary.py     # Dictionary endpoints
│   │       ├── definitions.py    # Word definition endpoints
│   │       └── settings.py       # Settings endpoints
│   ├── core/
│   │   ├── config.py            # Configuration settings
│   │   └── security.py          # Security utilities (JWT, password hashing)
│   ├── db/
│   │   └── database.py          # Database connection and session
│   ├── models/
│   │   ├── book.py              # Book database model
│   │   ├── dictionary.py        # Dictionary database model
│   │   └── settings.py          # Settings database model
│   ├── schemas/
│   │   ├── book.py              # Book Pydantic schemas
│   │   ├── dictionary.py        # Dictionary Pydantic schemas
│   │   ├── settings.py          # Settings Pydantic schemas
│   │   └── common.py            # Common schemas (errors, etc.)
│   ├── services/
│   │   ├── pdf_service.py       # PDF processing service
│   │   └── dictionary_service.py # External dictionary API service
│   └── main.py                   # FastAPI application entry point
├── pyproject.toml               # Project dependencies and metadata
└── README.md                    # This file
```

## Development

### Adding Dependencies

```bash
uv add <package-name>
```

### Database Migrations

The application automatically creates database tables on startup. For production, consider using Alembic for migrations:

```bash
uv add alembic
alembic init migrations
```

## Configuration

Environment variables can be set in `.env` file:

- `DATABASE_URL`: Database connection URL (default: SQLite)
- `SECRET_KEY`: Secret key for JWT tokens
- `BACKEND_CORS_ORIGINS`: Allowed CORS origins (comma-separated)
- `MAX_UPLOAD_SIZE`: Maximum PDF upload size in bytes
- `DICTIONARY_API_URL`: External dictionary API URL

## Future Features

- User authentication and multi-user support
- Book chunking (readable in configurable time intervals)
- Anki integration for dictionary syncing
- PostgreSQL/MySQL support
- File storage in S3/cloud storage
- Rate limiting
- Caching

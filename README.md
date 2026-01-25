# GreatReading

An English language learning reading application that helps you focus on reading with built-in timers, personal dictionary, and progress tracking.

## Features

- **PDF Book Upload** - Upload and read PDF books
- **Focused Reading** - 5/10/15 minute reading timers
- **Personal Dictionary** - Save words with definitions and context
- **Reading Modes** - Page view or sentence-by-sentence reading
- **Progress Tracking** - Automatically save your reading position
- **Word Definitions** - Look up words with external dictionary API
- **Pronunciation** - Audio pronunciation for words

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn-ui
- React Query for data fetching
- React Router for navigation

**Backend:**
- FastAPI (Python)
- SQLAlchemy + SQLite (dev) / PostgreSQL (production)
- uvicorn ASGI server
- pypdf for PDF processing
- Pydantic for validation
- psycopg2 for PostgreSQL

## Deployment

### Cloud Deployment (Render)

Deploy to production with one click using Render:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or follow the detailed guide: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

**What gets deployed:**
- PostgreSQL database (free tier)
- FastAPI backend (starter plan - $7/month)
- React frontend (free tier)

**Total cost**: ~$7-14/month for production-ready setup

### Docker Deployment

See [Docker Deployment](#docker-deployment) section below for running locally with Docker Compose.

## Quick Start

### Prerequisites

**For local development:**
- Node.js 18+ and npm
- Python 3.11+
- uv (Python package manager)

**For Docker deployment:**
- Docker Desktop or Docker Engine
- docker-compose

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install separately
cd backend && uv sync
cd frontend && npm install
```

### Development

**Start in dev mode (recommended for testing):**
```bash
make dev
# or
npm run dev
```

⚡ **Dev Mode Features:**
- Timer is **5 seconds** (not minutes!) for faster testing
- Auto-reload on file changes
- Perfect for development and testing

This starts:
- Backend on http://localhost:3000
- Frontend on http://localhost:8080
- API Docs on http://localhost:3000/api/v1/docs

**Start servers separately:**
```bash
# Backend only
npm run dev:backend
# or
make start-backend

# Frontend only
npm run dev:frontend
# or
make start-frontend
```

**Stop servers:**
Press `Ctrl+C` in the terminal, or use `make stop`

### Testing

```bash
# Run all tests
npm run test
# or
make test

# Backend tests only
npm run test:backend
# or
make test-backend

# Frontend tests only
npm run test:frontend
# or
make test-frontend
```

**Test Results:**
- ✅ Backend: 47 tests
- ✅ Frontend: 38 tests

## Docker Deployment

### Quick Start with Docker

```bash
# Build and start all services (PostgreSQL, backend, frontend)
make docker-up

# View logs
make docker-logs

# Stop all services
make docker-down

# Clean up containers, volumes, and images
make docker-clean
```

### Docker Services

The application runs three services:
- **PostgreSQL** - Database (port 5432)
- **Backend API** - FastAPI server (port 3000)
- **Frontend** - nginx serving React app (port 8080)

Once started, access:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api/v1
- API Docs: http://localhost:3000/api/v1/docs

### Docker Environment Configuration

1. Copy the example environment file:
```bash
cp .env.docker.example .env.docker
```

2. Edit `.env.docker` with your settings:
```env
# PostgreSQL
POSTGRES_PASSWORD=your-secure-password

# Backend
SECRET_KEY=your-secret-key-min-32-chars-change-in-production
DEV_MODE=false  # Set to true for 5-second timer
```

### Docker Commands

```bash
# Build images
make docker-build

# Start services in background
make docker-up

# View logs (follow mode)
make docker-logs

# Stop services
make docker-down

# Remove everything (containers, volumes, images)
make docker-clean
```

### Production Deployment

For production deployments, see [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on:
- PostgreSQL configuration
- Environment variables
- Security best practices
- Scaling considerations

## Project Structure

```
great-reading/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── tests/        # Backend tests
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client services
│   │   └── types/       # TypeScript types
│   └── __tests__/      # Frontend tests
├── openapi.yaml      # API specification
└── Makefile         # Development commands
```

## Available Commands

See all commands:
```bash
make help
```

**Development:**
- `make dev` - Start in dev mode (5-second timer)
- `make start` - Start both servers (alias for dev)
- `make stop` - Stop all servers
- `make test` - Run all tests
- `make install` - Install all dependencies
- `make clean` - Clean up and stop servers

**Docker:**
- `make docker-up` - Start all services with Docker Compose
- `make docker-down` - Stop all Docker containers
- `make docker-build` - Build Docker images
- `make docker-logs` - View Docker logs
- `make docker-clean` - Remove containers, volumes, and images

## Environment Configuration

**Frontend** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:3000/api/v1
```

**Backend** (`backend/.env`):
```
# Development (SQLite)
DATABASE_URL=sqlite:///./greatreading.db

# Production (PostgreSQL)
# DATABASE_URL=postgresql://user:password@localhost:5432/greatreading

SECRET_KEY=your-secret-key
BACKEND_CORS_ORIGINS=http://localhost:8080
```

For production deployment options:
- **Cloud (Recommended)**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for deploying to Render
- **Self-hosted**: See [DEPLOYMENT.md](DEPLOYMENT.md) for VPS deployment with PostgreSQL

## API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:3000/api/v1/docs
- ReDoc: http://localhost:3000/api/v1/redoc
- OpenAPI JSON: http://localhost:3000/api/v1/openapi.json

Full specification: `openapi.yaml`

## Development Workflow

1. Start the development servers: `npm run dev`
2. Make changes to frontend or backend code
3. Both servers auto-reload on file changes
4. Write tests for new features
5. Run tests: `npm run test`
6. Commit changes following conventional commits

## AI-Assisted Development

This project was developed using AI tools. See [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md) for details on:
- AI tools and workflow used
- MCP (Model Context Protocol) integration
- Specific AI contributions to the codebase

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:
- **Backend Tests**: Python 3.11 with pytest
- **Frontend Tests**: Node.js 18 with Vitest
- **Deployment**: Automatic deployment to Render on successful tests

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for the pipeline configuration.

## Contributing

Follow the guidelines in `AGENTS.md` for development best practices.

## License

MIT

.PHONY: help start stop test test-backend test-frontend install install-backend install-frontend clean

# Default target
help:
	@echo "GreatReading - Available Make Commands"
	@echo "========================================"
	@echo ""
	@echo "App Management:"
	@echo "  make start              - Start both backend and frontend servers"
	@echo "  make stop               - Stop all running servers"
	@echo "  make start-backend      - Start only the backend server"
	@echo "  make start-frontend     - Start only the frontend server"
	@echo ""
	@echo "Testing:"
	@echo "  make test               - Run all tests (backend + frontend)"
	@echo "  make test-backend       - Run backend tests only"
	@echo "  make test-frontend      - Run frontend tests only"
	@echo ""
	@echo "Installation:"
	@echo "  make install            - Install all dependencies (backend + frontend)"
	@echo "  make install-backend    - Install backend dependencies"
	@echo "  make install-frontend   - Install frontend dependencies"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean              - Stop servers and clean build artifacts"
	@echo ""

# Start both servers in the background
start:
	@echo "Starting GreatReading application..."
	@echo "Starting backend on http://localhost:3000"
	@cd backend && uv run uvicorn app.main:app --reload --port 3000 > ../backend.log 2>&1 & echo $$! > ../backend.pid
	@sleep 2
	@echo "Starting frontend on http://localhost:8080"
	@cd frontend && npm run dev > ../frontend.log 2>&1 & echo $$! > ../frontend.pid
	@sleep 2
	@echo ""
	@echo "✅ Application started successfully!"
	@echo "   Backend:  http://localhost:3000"
	@echo "   Frontend: http://localhost:8080"
	@echo "   API Docs: http://localhost:3000/api/v1/docs"
	@echo ""
	@echo "Logs:"
	@echo "   Backend:  tail -f backend.log"
	@echo "   Frontend: tail -f frontend.log"
	@echo ""
	@echo "To stop: make stop"

# Start only backend
start-backend:
	@echo "Starting backend on http://localhost:3000"
	@cd backend && uv run uvicorn app.main:app --reload --port 3000 > ../backend.log 2>&1 & echo $$! > ../backend.pid
	@sleep 2
	@echo "✅ Backend started at http://localhost:3000"
	@echo "   API Docs: http://localhost:3000/api/v1/docs"

# Start only frontend
start-frontend:
	@echo "Starting frontend on http://localhost:8080"
	@cd frontend && npm run dev > ../frontend.log 2>&1 & echo $$! > ../frontend.pid
	@sleep 2
	@echo "✅ Frontend started at http://localhost:8080"

# Stop all servers
stop:
	@echo "Stopping GreatReading application..."
	@if [ -f backend.pid ]; then \
		echo "Stopping backend (PID: $$(cat backend.pid))..."; \
		kill $$(cat backend.pid) 2>/dev/null || true; \
		rm backend.pid; \
	fi
	@if [ -f frontend.pid ]; then \
		echo "Stopping frontend (PID: $$(cat frontend.pid))..."; \
		kill $$(cat frontend.pid) 2>/dev/null || true; \
		rm frontend.pid; \
	fi
	@pkill -f "uvicorn app.main:app" 2>/dev/null || true
	@pkill -f "vite" 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	@echo "✅ All servers stopped"

# Run all tests
test:
	@echo "Running all tests..."
	@echo ""
	@echo "=== Backend Tests ==="
	@cd backend && uv run pytest
	@echo ""
	@echo "=== Frontend Tests ==="
	@cd frontend && npm test -- --run
	@echo ""
	@echo "✅ All tests completed!"

# Run backend tests only
test-backend:
	@echo "Running backend tests..."
	@cd backend && uv run pytest

# Run frontend tests only
test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test -- --run

# Install all dependencies
install:
	@echo "Installing all dependencies..."
	@echo ""
	@echo "=== Backend Dependencies ==="
	@cd backend && uv sync
	@echo ""
	@echo "=== Frontend Dependencies ==="
	@cd frontend && npm install
	@echo ""
	@echo "✅ All dependencies installed!"

# Install backend dependencies
install-backend:
	@echo "Installing backend dependencies..."
	@cd backend && uv sync
	@echo "✅ Backend dependencies installed!"

# Install frontend dependencies
install-frontend:
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ Frontend dependencies installed!"

# Clean up
clean: stop
	@echo "Cleaning up..."
	@rm -f backend.log frontend.log
	@echo "✅ Cleanup complete!"

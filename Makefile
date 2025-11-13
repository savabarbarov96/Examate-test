.PHONY: help setup check-ports build up down restart logs clean dev prod

# Default target
help:
	@echo "Examate - Available Commands"
	@echo "==============================="
	@echo ""
	@echo "  make setup        - Initial setup (create .env files)"
	@echo "  make check-ports  - Check if required ports are available"
	@echo "  make build        - Build all Docker images"
	@echo "  make up           - Start all services (production)"
	@echo "  make dev          - Start all services (development with hot reload)"
	@echo "  make down         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs from all services"
	@echo "  make logs-auth    - View logs from auth service"
	@echo "  make logs-user    - View logs from user service"
	@echo "  make logs-frontend - View logs from frontend"
	@echo "  make clean        - Stop services and remove volumes"
	@echo "  make ps           - Show running containers"
	@echo ""

# Initial setup
setup:
	@./scripts/setup.sh

# Check if ports are available
check-ports:
	@./scripts/check-ports.sh

# Build all images
build:
	docker-compose build

# Start services in production mode
up:
	docker-compose up -d

# Start services in production mode (foreground)
prod:
	docker-compose up

# Start services in development mode with hot reload
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

logs-auth:
	docker-compose logs -f auth-service

logs-user:
	docker-compose logs -f user-service

logs-frontend:
	docker-compose logs -f frontend

# Show running containers
ps:
	docker-compose ps

# Clean everything (stop services, remove volumes)
clean:
	docker-compose down -v
	@echo "All services stopped and volumes removed"

# Rebuild specific service
rebuild-auth:
	docker-compose build auth-service
	docker-compose up -d auth-service

rebuild-user:
	docker-compose build user-service
	docker-compose up -d user-service

rebuild-frontend:
	docker-compose build frontend
	docker-compose up -d frontend

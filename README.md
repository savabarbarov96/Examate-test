# Examate

A microservices-based exam management platform built with TypeScript, Node.js, React, and MongoDB.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│          http://localhost:8080 (prod) / 3000 (dev)           │
└──────────────┬─────────────────────────┬────────────────────┘
               │                         │
               ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│    Auth Service          │  │    User Service          │
│  http://localhost:5000   │  │  http://localhost:5001   │
│                          │  │                          │
│  - Authentication        │  │  - User CRUD             │
│  - JWT tokens            │  │  - Role Management       │
│  - 2FA                   │  │  - RBAC                  │
│  - Session Management    │  │                          │
└────────┬────────┬────────┘  └────────┬─────────────────┘
         │        │                    │
         ▼        ▼                    ▼
    ┌────────┐ ┌──────┐         ┌────────┐
    │MongoDB │ │Redis │         │MongoDB │
    │ :27017 │ │:6379 │         │ :27017 │
    └────────┘ └──────┘         └────────┘
```

## Services

- **Auth Service** (Port 5000): Authentication, authorization, session management, 2FA
- **User Service** (Port 5001): User CRUD, role management, RBAC
- **Dashboard Service** (Port 5002): Dashboard widgets, layout management, proxy to statistics service
- **Statistics Service** (Port 5003): Aggregated widgets, analytics catalog, chart data APIs
- **Frontend** (Ports 8080 prod / 3000 dev): React SPA with Vite, TypeScript, Tailwind CSS

## Tech Stack

- **Backend**: Node.js, Express v5, TypeScript
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: MongoDB
- **Cache**: Redis
- **Container**: Docker & Docker Compose

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development without Docker)

## Quick Start (Docker - Recommended)

### 1. Clone & Setup

```bash
git clone <repository-url>
cd examate

# Run setup script
./scripts/setup.sh

# Or manually:
cp .env.example .env
# Edit .env with your secrets
```

### 2. Configure Environment

Edit the root `.env` file and add your secrets:

```bash
# Generate secure JWT secrets
openssl rand -base64 64

# Add to .env
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-secret>
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-email-password
```

### 3. Start All Services

**Production Mode:**
```bash
docker-compose up -d
```

**Development Mode (with hot reload):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```
If port `3000` is in use locally, export `FRONTEND_DEV_PORT=<free-port>` before running the command to remap the Vite dev server (defaults to `3000`).

**Using Makefile (recommended):**
```bash
make dev      # Start in development mode
make up       # Start in production mode (background)
make logs     # View logs
make down     # Stop all services
```

### 4. Access the Application

- **Frontend (dev)**: http://localhost:3000
- **Frontend (prod)**: http://localhost:8080
- **Auth API**: http://localhost:5000
- **User API**: http://localhost:5001
- **Dashboard API**: http://localhost:5002
- **Statistics API**: http://localhost:5003
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Makefile Commands

```bash
make help           # Show all available commands
make setup          # Run initial setup
make check-ports    # Check if required ports are free
make dev            # Start in development mode (hot reload)
make up             # Start in production mode (detached)
make down           # Stop all services
make logs           # View logs from all services
make logs-auth      # View auth service logs
make logs-user      # View user service logs
make logs-frontend  # View frontend logs
make restart        # Restart all services
make clean          # Stop services and remove volumes
make ps             # Show running containers
```

## Manual Docker Compose Commands

```bash
# Build images
docker-compose build

# Start services (detached)
docker-compose up -d

# Start services (foreground with logs)
docker-compose up

# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f auth-service

# Restart specific service
docker-compose restart auth-service

# Rebuild and restart specific service
docker-compose build auth-service
docker-compose up -d auth-service

# Stop and remove volumes
docker-compose down -v
```

## Local Development (Without Docker)

If you prefer running services natively:

### Prerequisites
- MongoDB running on localhost:27017
- Redis running on localhost:6379

### Setup

```bash
# Auth Service
cd services/auth-service
cp .env.example .env
npm install
npm run dev

# User Service
cd services/user-service
cp .env.example .env
npm install
npm run dev

# Frontend
cd services/frontend
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

### Root `.env`
- `JWT_SECRET` - Secret for access tokens (required)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (required)
- `EMAIL_USERNAME` - SMTP email username
- `EMAIL_PASSWORD` - SMTP email password

### Service-Specific
Each service has its own `.env` file. See individual service READMEs:
- [Auth Service](./services/auth-service/README.md)
- [User Service](./services/user-service/README.md)
- [Frontend](./services/frontend/README.md)

## Project Structure

```
examate/
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development overrides
├── Makefile                    # Convenient commands
├── .env                        # Root environment variables
├── scripts/
│   ├── setup.sh                # Initial setup script
│   └── check-ports.sh          # Port availability checker
└── services/
    ├── auth-service/           # Authentication microservice
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── utils/
    │   ├── Dockerfile          # Production
    │   ├── Dockerfile.dev      # Development
    │   └── README.md
    ├── user-service/           # User management microservice
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── utils/
    │   ├── Dockerfile
    │   ├── Dockerfile.dev
    │   └── README.md
    └── frontend/               # React frontend
        ├── src/
        ├── Dockerfile
        ├── Dockerfile.dev
        └── README.md
```

## Features

### Authentication
- JWT-based authentication with dual-token system
- Access tokens (15 min) + Refresh tokens (8 hours)
- Automatic token refresh
- HTTP-only cookies for security
- 2FA support (email-based)
- Password reset flow

### Session Management
- Redis-backed sessions
- Real-time session tracking via Socket.IO
- Device fingerprinting
- GeoIP location tracking
- Session termination

### User Management
- User CRUD operations
- Role-based access control (RBAC)
- Granular permissions system
- Three default roles: Sys Admin, Client Admin, Proctor
- Role seeding on startup

### Security
- Login attempt tracking
- Account locking after failed attempts
- Rate limiting (configurable)
- Password lifecycle tracking
- CORS configuration
- Environment-based secrets

## Troubleshooting

### Port Conflicts

Check if required ports are available:
```bash
./scripts/check-ports.sh
# Or
make check-ports
```

### Redis Connection Issues

If you see `ETIMEDOUT` errors:
1. Ensure Redis container is running: `docker ps | grep redis`
2. Check logs: `docker logs examate-redis`
3. Verify network: `docker network inspect examate_examate-network`

### MongoDB Connection Issues

Check MongoDB logs:
```bash
docker logs examate-mongodb
```

### Service Won't Start

View service logs:
```bash
# All services
make logs

# Specific service
docker-compose logs -f auth-service
```

### Hot Reload Not Working (Development Mode)

This is a known issue with Docker + WSL2 + Windows. Solutions:
1. Use native Node.js development (see "Local Development" section)
2. Enable WSL2 file watching: Add `CHOKIDAR_USEPOLLING=true` to service environment

### Clean Slate

Remove all containers, volumes, and start fresh:
```bash
make clean
docker-compose build --no-cache
make dev
```

## API Documentation

### Auth Service (Port 5000)

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-2fa` - Verify 2FA code

**Password Management:**
- `POST /api/auth/forgotPassword` - Request password reset
- `POST /api/auth/verify-code` - Verify reset code
- `PATCH /api/auth/change-password` - Change password

**Sessions:**
- `GET /api/session/count` - Get active session count
- `GET /api/session/:userId` - Get user sessions

### User Service (Port 5001)

**Users:**
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Roles:**
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create role
- `PATCH /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

## Testing

### Frontend E2E Tests

```bash
cd services/frontend

# Run tests (headless)
npm run test

# Run tests (UI mode)
npm run test:ui
```

## Production Deployment

### Environment Configuration

1. Generate secure secrets:
```bash
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 64  # For JWT_REFRESH_SECRET
```

2. Update `.env` with production values

3. Set `NODE_ENV=production` in docker-compose.yml

4. Configure proper MongoDB credentials

### Build & Deploy

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Check [Troubleshooting](#troubleshooting) section
- View logs: `make logs`
- Check service-specific READMEs in `services/` directories

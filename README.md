# Examate

A microservices-based examination management platform built with TypeScript, Node.js, React, and MongoDB.

## Features

- **Authentication**: JWT-based auth with 2FA, session management, password reset
- **User Management**: RBAC with granular permissions
- **Dashboard**: Customizable widgets and layouts
- **Statistics**: Real-time analytics and chart data
- **Microservices**: Scalable service-oriented architecture
- **Cross-Platform**: Works on Windows, Linux, and macOS

## Architecture

See [SERVICE_ARCHITECTURE.md](./SERVICE_ARCHITECTURE.md) for detailed architecture documentation.

**Quick Overview**:

```
Frontend (React) :3000/:8080
    ↓       ↓       ↓       ↓
  Auth    User  Dashboard Stats
  :5000   :5001  :5002    :5003
    ↓       ↓       ↓       ↓
  MongoDB :27017 + Redis :6379
```

## Tech Stack

- **Backend**: Node.js 20, Express 5, TypeScript 5
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS 4
- **Database**: MongoDB 7, Redis 7
- **DevOps**: Docker, Docker Compose, Node.js CLI
- **Shared**: npm workspaces, @examate/shared package

## Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Node.js** 20+ (for local development)
- **openssl** (for generating secrets)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd examate

# Run cross-platform setup
npm run setup
```

The setup command will:
- Check Docker and Docker Compose installation
- Create .env files from templates
- Guide you through configuration

### 2. Configure Secrets

Generate strong secrets:

```bash
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 64  # For JWT_REFRESH_SECRET
```

Edit `.env` and add your secrets:

```env
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-secret>
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-email-password
```

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete configuration guide.

### 3. Start Development Environment

**Recommended (cross-platform)**:

```bash
npm run dev:docker
```

**Alternative methods**:

```bash
# Using make (Linux/Mac)
make dev

# Using Docker Compose directly
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --profile dev
```

This starts all services with:
- **Hot reload** for code changes
- **Source maps** for debugging
- **Development logging**
- **Volume mounts** (no rebuilds needed)

### 4. Access the Application

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend (dev)** | http://localhost:3000 | React app with HMR |
| **Frontend (prod)** | http://localhost:8080 | Production build |
| **Auth API** | http://localhost:5000 | Authentication |
| **User API** | http://localhost:5001 | User management |
| **Dashboard API** | http://localhost:5002 | Dashboards |
| **Statistics API** | http://localhost:5003 | Analytics |
| **MongoDB** | localhost:27017 | Database |
| **Redis** | localhost:6379 | Cache/sessions |

## Available Commands

### NPM Commands (Cross-Platform)

These work on **Windows, Linux, and macOS**:

```bash
npm run setup         # Initial setup (checks Docker, creates .env)
npm run check-ports   # Verify ports 5000-5003, 3000, 6379, 27017 are free
npm run dev:docker    # Start development environment (hot reload)
npm run build         # Build all Docker images
npm run up            # Start production environment (detached)
npm run down          # Stop all services
npm run restart       # Restart all services
npm run logs          # View logs from all services
npm run ps            # Show running containers
npm run clean         # Stop and remove volumes (WARNING: deletes data)
npm run help          # Show all available commands
```

### Make Commands (Linux/Mac)

```bash
make help           # Show all commands
make setup          # Initial setup
make check-ports    # Check port availability
make dev            # Start development
make up             # Start production (detached)
make down           # Stop services
make logs           # View logs
make logs-auth      # View auth service logs
make logs-user      # View user service logs
make restart        # Restart services
make clean          # Remove volumes
make ps             # Show containers
```

### Docker Compose Profiles

The stack uses profiles to control which services run:

```bash
# Development (all services + dev config)
docker compose --profile dev up

# Production (all services, prod builds)
docker compose --profile prod up

# Database only
docker compose --profile db up
```

## Project Structure

```
examate/
├── package.json                  # Root workspace & CLI scripts
├── docker-compose.yml            # Base compose config (profiles, anchors)
├── docker-compose.dev.yml        # Development overrides (hot reload)
├── Makefile                      # Make shortcuts (Linux/Mac)
├── .env                          # Root environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── ENVIRONMENT_VARIABLES.md      # Complete env var guide
├── SERVICE_ARCHITECTURE.md       # Architecture documentation
│
├── tools/
│   └── dev-cli.js                # Cross-platform Node.js CLI
│
├── scripts/
│   ├── setup.sh                  # Legacy setup (Linux/Mac)
│   └── check-ports.sh            # Legacy port checker (Linux/Mac)
│
├── packages/
│   └── shared/                   # Shared types & utilities
│       ├── src/
│       │   ├── types/            # TypeScript interfaces & DTOs
│       │   ├── utils/            # Helper functions
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
└── services/
    ├── auth-service/             # Port 5000
    │   ├── src/
    │   ├── models/
    │   ├── routes/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── utils/
    │   ├── Dockerfile            # Multi-stage, npm ci, non-root
    │   ├── Dockerfile.dev        # Development (volume mounts)
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── .env
    ├── user-service/             # Port 5001
    ├── dashboard-service/        # Port 5002
    ├── statistics-service/       # Port 5003
    └── frontend/                 # Port 3000 (dev) / 8080 (prod)
        ├── src/
        ├── public/
        ├── Dockerfile            # Vite build + Nginx
        ├── Dockerfile.dev        # Vite dev server with HMR
        ├── nginx.conf
        ├── package.json
        └── .env
```

## Shared Types (@examate/shared)

The project uses an npm workspace with a shared types package to avoid code duplication:

```typescript
// In any service
import {
  User,
  CreateUserDTO,
  ApiResponse,
  createSuccessResponse,
  HttpStatus,
} from '@examate/shared';

// Create standardized responses
return createSuccessResponse<User>(user, 'User created successfully');
```

See [packages/shared/README.md](./packages/shared/README.md) for details.

## Development Workflow

### Hot Reload (Recommended)

```bash
npm run dev:docker
```

Changes to source code automatically reload services. No rebuilds needed.

### Rebuild After Dependency Changes

```bash
# If you change package.json
npm run down
npm run build
npm run dev:docker
```

### View Logs

```bash
# All services
npm run logs

# Specific service
docker compose logs -f auth-service
docker compose logs -f frontend
```

### Run Commands in Container

```bash
# Example: Run migrations
docker compose exec auth-service npm run migrate

# Example: Seed database
docker compose exec user-service npm run seed
```

## Testing

### Frontend E2E Tests

```bash
cd services/frontend

# Run Playwright tests
npm run test

# UI mode
npm run test:ui
```

### Backend Tests

Each service has its own test suite:

```bash
cd services/auth-service
npm test
```

## Troubleshooting

### Port Conflicts

Check if required ports are available:

```bash
npm run check-ports
```

Ports needed:
- 5000-5003 (backend services)
- 3000 (frontend dev)
- 8080 (frontend prod)
- 27017 (MongoDB)
- 6379 (Redis)

### Services Won't Start

```bash
# Check logs
npm run logs

# Or specific service
docker compose logs -f auth-service

# Check Docker status
docker compose ps
```

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker compose logs mongodb

# Verify MongoDB is healthy
docker compose ps | grep mongodb

# Test connection
docker compose exec mongodb mongosh -u root -p examate_mongo_pass
```

### Redis Connection Issues

```bash
# Check Redis logs
docker compose logs redis

# Test connection
docker compose exec redis redis-cli ping
```

### Hot Reload Not Working

**Windows + Docker Desktop + WSL2**:

1. Enable WSL2 file watching:
   ```bash
   # Add to docker-compose.dev.yml for each service
   environment:
     - CHOKIDAR_USEPOLLING=true
   ```

2. Or run services natively (see "Local Development" below)

### Clean Slate

Remove everything and start fresh:

```bash
npm run clean              # Stop and remove volumes
npm run build              # Rebuild images
npm run dev:docker         # Start dev environment
```

### Windows-Specific Issues

If you encounter path or permission issues on Windows:

1. **Use WSL2**: Run Docker Desktop with WSL2 backend
2. **Clone in WSL**: Clone the repo inside WSL filesystem, not Windows
3. **Use WSL terminal**: Run commands from WSL bash, not PowerShell

## Local Development (Without Docker)

If you prefer running services natively:

### Prerequisites

```bash
# Install MongoDB
# Install Redis

# Verify running
mongod --version
redis-server --version
```

### Run Services

```bash
# Terminal 1: Auth Service
cd services/auth-service
npm install
npm run dev

# Terminal 2: User Service
cd services/user-service
npm install
npm run dev

# Terminal 3: Dashboard Service
cd services/dashboard-service
npm install
npm run dev

# Terminal 4: Statistics Service
cd services/statistics-service
npm install
npm run dev

# Terminal 5: Frontend
cd services/frontend
npm install
npm run dev
```

## Production Deployment

### 1. Generate Production Secrets

```bash
openssl rand -base64 64  # JWT_SECRET
openssl rand -base64 64  # JWT_REFRESH_SECRET
```

### 2. Update Environment

Edit `.env` with production values:

```env
JWT_SECRET=<production-secret>
JWT_REFRESH_SECRET=<production-secret>
EMAIL_USERNAME=<production-email>
EMAIL_PASSWORD=<production-password>
CLIENT_ORIGIN=https://your-domain.com
```

### 3. Build and Deploy

```bash
# Build production images
npm run build

# Start production stack
docker compose --profile prod up -d

# Check status
npm run ps
```

### 4. Security Checklist

- [ ] Strong JWT secrets (64+ characters)
- [ ] Production MongoDB password (not default)
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Environment variables in secure vault
- [ ] Firewall configured
- [ ] Regular backups enabled
- [ ] Monitoring and alerting set up

## API Documentation

### Auth Service (Port 5000)

**Authentication**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code

**Password Management**:
- `POST /api/auth/password/forgot` - Request password reset
- `POST /api/auth/password/verify-code` - Verify reset code
- `POST /api/auth/password/reset` - Reset password
- `PUT /api/auth/password/change` - Change password

**Sessions**:
- `GET /api/sessions` - Get active sessions
- `DELETE /api/sessions/:id` - Terminate session

**Health**:
- `GET /health` - Health check

### User Service (Port 5001)

**Users**:
- `GET /api/users` - List users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Roles**:
- `GET /api/roles` - List roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

**Health**:
- `GET /health` - Health check

### Dashboard Service (Port 5002)

**Dashboards**:
- `GET /api/dashboard` - Get user dashboard
- `POST /api/dashboard/widgets` - Add widget
- `PUT /api/dashboard/widgets/:id` - Update widget
- `DELETE /api/dashboard/widgets/:id` - Remove widget

**Statistics Proxy**:
- `GET /api/dashboard/statistics/*` - Proxy to Statistics Service

**Health**:
- `GET /health` - Health check

### Statistics Service (Port 5003)

**Statistics**:
- `GET /api/statistics/catalog` - Available statistics
- `GET /api/statistics/:type` - Get statistics by type
- `GET /api/statistics/charts/:chartType` - Get chart data

**Health**:
- `GET /health` - Health check

## Documentation

- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Complete environment configuration guide
- [SERVICE_ARCHITECTURE.md](./SERVICE_ARCHITECTURE.md) - Architecture and design patterns
- [packages/shared/README.md](./packages/shared/README.md) - Shared types and utilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

[Add your license here]

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. View logs: `npm run logs`
3. Check [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
4. Review [SERVICE_ARCHITECTURE.md](./SERVICE_ARCHITECTURE.md)
5. Open an issue on GitHub

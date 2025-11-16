# Examate - Service Architecture

## Overview

Examate is a microservices-based examination management platform built with Node.js, TypeScript, React, and MongoDB. This document describes the architecture, service interactions, and design patterns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│                      Port 3000 (dev) / 8080 (prod)              │
└──────┬──────────────┬────────────────┬─────────────┬───────────┘
       │              │                │             │
       ▼              ▼                ▼             ▼
┌──────────┐   ┌─────────────┐   ┌──────────┐   ┌─────────────┐
│   Auth   │   │    User     │   │Dashboard │   │ Statistics  │
│ Service  │   │  Service    │   │ Service  │   │  Service    │
│  :5000   │   │   :5001     │   │  :5002   │   │   :5003     │
└──┬───┬───┘   └──────┬──────┘   └──┬───┬───┘   └──────┬──────┘
   │   │              │              │   │              │
   │   │              │              │   └──────────────┘
   │   │              │              │   (Statistics API)
   │   │              ▼              ▼
   │   │        ┌─────────────────────┐
   │   │        │      MongoDB        │
   │   │        │      :27017         │
   │   │        └─────────────────────┘
   │   │
   │   └───────────────┐
   ▼                   ▼
┌─────────────────────────┐
│        Redis            │
│        :6379            │
└─────────────────────────┘
```

## Services

### 1. Auth Service (Port 5000)

**Purpose**: Authentication, authorization, and session management

**Responsibilities**:
- User authentication (login/logout)
- JWT token generation and validation
- Refresh token management
- Two-factor authentication (2FA)
- Password reset flow
- Session tracking with Socket.IO
- Login attempt tracking and account locking
- Device fingerprinting and geolocation

**Dependencies**:
- MongoDB (user credentials, sessions)
- Redis (session storage, rate limiting)

**Key Technologies**:
- Express 5
- Socket.IO (real-time sessions)
- bcrypt (password hashing)
- jsonwebtoken (JWT)
- ioredis (Redis client)
- winston (logging)
- opossum (circuit breaker)

**API Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `POST /api/auth/password/reset` - Request password reset
- `GET /health` - Health check

### 2. User Service (Port 5001)

**Purpose**: User and role management

**Responsibilities**:
- User CRUD operations
- Role management (Sys Admin, Client Admin, Proctor)
- Permission-based access control (RBAC)
- Role seeding on startup
- User profile management

**Dependencies**:
- MongoDB (users, roles)

**Key Technologies**:
- Express 5
- Mongoose (ODM)
- multer (file uploads for profile pics)

**API Endpoints**:
- `GET /api/users` - List users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role
- `GET /health` - Health check

### 3. Dashboard Service (Port 5002)

**Purpose**: Dashboard layout and widget management

**Responsibilities**:
- Dashboard layout management
- Widget CRUD operations
- Proxy to Statistics Service
- User-specific dashboard configuration

**Dependencies**:
- MongoDB (dashboard layouts, widgets)
- Statistics Service (aggregated data)

**Key Technologies**:
- Express 5
- Axios (HTTP client for service-to-service calls)

**API Endpoints**:
- `GET /api/dashboard` - Get user dashboard
- `POST /api/dashboard/widgets` - Add widget
- `PUT /api/dashboard/widgets/:id` - Update widget
- `DELETE /api/dashboard/widgets/:id` - Remove widget
- `GET /api/dashboard/statistics/:type` - Proxy to Statistics Service
- `GET /health` - Health check

### 4. Statistics Service (Port 5003)

**Purpose**: Analytics, aggregations, and statistical data

**Responsibilities**:
- Statistical aggregations
- Chart data generation
- Analytics catalog
- Login attempt tracking
- Payment/exam statistics

**Dependencies**:
- MongoDB (statistics data)

**Key Technologies**:
- Express 5
- Mongoose (aggregation pipelines)

**API Endpoints**:
- `GET /api/statistics/catalog` - Available statistics types
- `GET /api/statistics/:type` - Get statistics by type
- `GET /api/statistics/charts/:chartType` - Get chart data
- `GET /health` - Health check

### 5. Frontend (Port 3000 dev / 8080 prod)

**Purpose**: User interface

**Responsibilities**:
- React SPA with client-side routing
- State management with Zustand
- Real-time updates via Socket.IO
- Responsive design with Tailwind CSS
- Chart visualizations with Recharts

**Dependencies**:
- All backend services

**Key Technologies**:
- React 19
- Vite 6 (build tool)
- TypeScript 5.7
- React Router 7
- Tailwind CSS 4
- Radix UI (components)
- Recharts (charts)
- Socket.IO Client
- Axios

## Shared Code

### @examate/shared Package

Located in `packages/shared/`, this package provides:

**Types**:
- `User`, `Role`, `Session` interfaces
- `CreateUserDTO`, `UpdateUserDTO` data transfer objects
- `ApiResponse`, `PaginatedResponse`, `ErrorResponse`
- `DashboardWidget`, `StatisticData`, `LoginAttempt`

**Constants**:
- HTTP status codes
- User/role status enums
- Service names
- Pagination defaults
- JWT configuration
- Rate limiting settings

**Utilities**:
- `createSuccessResponse()` - Standard API response
- `createPaginatedResponse()` - Paginated response wrapper
- `createErrorResponse()` - Error response wrapper
- `sanitizeUser()` - Remove sensitive fields
- `parsePaginationQuery()` - Parse query params
- `isValidEmail()` - Email validation

**Design Philosophy**:
- Share contracts (types/interfaces), not implementation
- Each service owns its data layer (Mongoose models)
- No runtime dependencies, only TypeScript types
- Prevents code duplication across services

## Service Communication Patterns

### 1. Client → Service (Direct HTTP/REST)

Frontend communicates directly with backend services via REST APIs.

```typescript
// Frontend example
const response = await axios.get(`${VITE_AUTH_API_URL}/api/auth/me`);
```

### 2. Service → Service (HTTP/REST)

Dashboard Service calls Statistics Service for aggregated data.

```typescript
// Dashboard Service example
const statsResponse = await axios.get(
  `${STATISTICS_SERVICE_URL}/api/statistics/catalog`
);
```

**Why not a service mesh or API gateway?**
- **Simplicity**: Direct HTTP calls are easy to debug and understand
- **Performance**: No additional hop/proxy overhead
- **Early stage**: Project doesn't yet need complex orchestration
- **Docker DNS**: Services resolve each other by name (e.g., `http://statistics-service:5003`)

### 3. Real-time Communication (WebSocket)

Auth Service uses Socket.IO for real-time session tracking.

```typescript
// Client connects to auth service
const socket = io(VITE_AUTH_API_URL);
socket.on('session:update', (data) => {
  // Handle session updates
});
```

## Data Flow Examples

### Example 1: User Login

```
1. Frontend → Auth Service: POST /api/auth/login
2. Auth Service → MongoDB: Verify credentials
3. Auth Service → Redis: Create session
4. Auth Service → Frontend: Return JWT + refresh token
5. Auth Service → Socket.IO: Broadcast session update
```

### Example 2: Dashboard Loading

```
1. Frontend → Dashboard Service: GET /api/dashboard
2. Dashboard Service → MongoDB: Fetch user dashboard layout
3. Dashboard Service → Statistics Service: GET /api/statistics/catalog
4. Statistics Service → MongoDB: Aggregate statistics
5. Statistics Service → Dashboard Service: Return aggregated data
6. Dashboard Service → Frontend: Return complete dashboard
```

## Design Principles

### 1. Keep It Simple (KISS)

- No over-engineering
- Use battle-tested patterns
- Direct HTTP calls over complex message brokers
- Simple file-based configuration (.env)

### 2. Service Independence

- Each service has its own database collections
- Services can be deployed independently
- No tight coupling between services
- Clear API contracts via `@examate/shared`

### 3. Shared Nothing (Data)

- No shared database tables
- Each service owns its domain data
- Data duplication is acceptable for service autonomy
- Use eventual consistency where needed

### 4. Fail Fast

- Circuit breakers on auth service (Opossum)
- Health checks on all services
- Proper error handling and logging
- Graceful degradation

### 5. Security First

- JWT-based authentication
- HTTP-only cookies
- Rate limiting (auth service)
- Input sanitization (Mongo injection prevention)
- Non-root Docker containers
- Password complexity requirements

## Scaling Considerations

### Current State (Early Development)

- Single instance per service
- Direct service-to-service calls
- No load balancing
- No caching layer (except Redis for sessions)

### Future Scaling Options

When adding more microservices:

1. **API Gateway** (if needed):
   - Single entry point for frontend
   - Rate limiting, authentication at edge
   - Request routing

2. **Service Discovery** (if needed):
   - Consul or Eureka
   - Dynamic service registration
   - Health checking

3. **Load Balancing**:
   - Nginx or HAProxy
   - Multiple service instances
   - Round-robin or least-connections

4. **Caching**:
   - Redis for frequently accessed data
   - API response caching
   - Database query caching

5. **Monitoring**:
   - Prometheus + Grafana
   - Centralized logging (ELK stack)
   - Distributed tracing (Jaeger)

**Current recommendation**: Don't add these until actually needed. YAGNI (You Aren't Gonna Need It).

## Health Checks

All backend services expose `/health` endpoints:

```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "1.0.0",
  "uptime": 12345,
  "timestamp": "2025-01-15T10:00:00.000Z",
  "dependencies": {
    "database": "connected",
    "redis": "connected"
  }
}
```

Docker Compose health checks automatically monitor these endpoints.

## Error Handling

All services use standardized error responses from `@examate/shared`:

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid email format",
  "statusCode": 400,
  "timestamp": "2025-01-15T10:00:00.000Z",
  "path": "/api/users"
}
```

## Testing Strategy

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Focus on edge cases

### Integration Tests
- Test service endpoints
- Test database interactions
- Test service-to-service calls

### E2E Tests
- Frontend Playwright tests
- Full user flows
- Critical paths (login, dashboard load)

## Deployment

### Development

```bash
npm run dev:docker
```

Uses `docker-compose.yml` + `docker-compose.dev.yml` with:
- Hot reload via volume mounts
- Development Dockerfiles
- Debug logging
- Source maps

### Production

```bash
npm run up
```

Uses `docker-compose.yml` with:
- Multi-stage optimized images
- Production Dockerfiles
- Minimal logging
- Non-root users
- Health checks

## Further Reading

- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Environment configuration
- [README.md](./README.md) - Getting started guide
- [packages/shared/README.md](./packages/shared/README.md) - Shared types documentation

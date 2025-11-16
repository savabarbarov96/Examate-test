# Dashboard Service

Microservice for managing dashboard widgets, statistics aggregation, and analytics data.

## Overview

The Dashboard Service handles all dashboard-related operations for the Examate platform:
- Dashboard widget CRUD operations
- Real-time data aggregation from MongoDB collections
- Statistics generation for six widget types
- JWT-based authentication

## Port

**5002** (Production and Development)

## Features

### Widget Types
1. **activeAll**: Active sessions over time (weekly aggregation)
2. **historyAll**: Login success/failure by month (6-month history)
3. **paidUnpaid**: Payment status distribution (pie chart)
4. **location**: Login attempts by country (top 5 with GeoIP)
5. **passFail**: Exam results distribution
6. **proctoredOffline**: Exam type distribution

### API Endpoints

```
GET    /api/dashboard/widgets           - List user's widgets
POST   /api/dashboard/widgets           - Create new widget
PATCH  /api/dashboard/widgets/:id       - Update widget
DELETE /api/dashboard/widgets/:id       - Delete widget
POST   /api/dashboard/widgets/reorder   - Reorder widgets
GET    /api/dashboard/widgets/:id/data  - Get widget data
```

## Development

### Prerequisites
- Node.js 20+
- MongoDB running on default port or configured via MONGO_URI
- JWT_SECRET must match auth-service and user-service

### Environment Variables

Create `.env` file:
```bash
MONGO_URI=mongodb://localhost:27017/examate_testing
JWT_SECRET=your-jwt-secret-shared-with-other-services
PORT=5002
CLIENT_ORIGIN=http://localhost:8080
NODE_ENV=development
```

### Commands

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Build TypeScript
npm run build

# Production
npm start
```

## Docker

### Build
```bash
docker build -t examate-dashboard-service .
```

### Run
```bash
docker run -p 5002:5002 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/examate_testing \
  -e JWT_SECRET=your-secret \
  examate-dashboard-service
```

## Database Models

- **DashboardWidget**: Widget configuration and metadata
- **Exam**: Exam records (proctored/offline, pass/fail)
- **Payment**: Payment records (paid/unpaid)
- **Session**: Active user sessions
- **LoginAttempt**: Login history with GeoIP data

## Dependencies

### Production
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- cookie-parser: Cookie handling
- cors: CORS middleware
- dotenv: Environment configuration

### Development
- typescript: TypeScript compiler
- nodemon: Hot reload
- concurrently: Run multiple commands

## Architecture

- **No Redis**: Dashboard service is stateless (sessions managed by auth-service)
- **No Socket.IO**: Real-time updates handled by auth-service
- **JWT Only**: Verifies tokens but doesn't create them
- **MongoDB Aggregations**: Real-time statistics from actual data

## Security

- All routes protected with JWT authentication
- Validates widget ownership (userId + client)
- No user CRUD operations (deferred to user-service)
- Environment-based configuration

# User Service

User and role management microservice for Examate platform.

## Features

- User CRUD operations
- Role-based access control (RBAC)
- Permission management
- User profile management
- Role seeding on startup

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express v5
- **Database**: MongoDB (Mongoose)

## Prerequisites

- Node.js 20+
- MongoDB instance

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update `.env` with your values (see Environment Variables below)

4. Run in development mode:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/examate` |
| `PORT` | Server port | `5001` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:3000` (dev) / `http://localhost:8080` (prod) |
| `JWT_SECRET` | Secret for JWT verification (must match auth-service) | (same as auth-service) |
| `JWT_REFRESH_SECRET` | Refresh token secret (must match auth-service) | (same as auth-service) |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiry in days | `90` |
| `EMAIL_USERNAME` | SMTP email username | `noreply@example.com` |
| `EMAIL_PASSWORD` | SMTP email password | (your email password) |

**Important**: JWT secrets must match the auth-service for token verification to work.

## API Endpoints

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create new role
- `PATCH /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

## Role System

The system uses a granular permission model with three default roles:

1. **Sys Admin** (System-wide)
   - Full access to all system resources
   - Can manage all users, roles, and entities

2. **Client Admin** (Client-scoped)
   - Manage users within their client
   - Configure client-specific settings

3. **Proctor** (Client-scoped)
   - View and monitor exams
   - Limited administrative access

Roles are automatically seeded on first startup via `utils/roleSeeder.ts`.

## Development

Watch mode compiles TypeScript and restarts on changes:
```bash
npm run dev
```

The service runs on port **5001** by default.

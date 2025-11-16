# Auth Service

Authentication and authorization microservice for Examate platform.

## Features

- JWT-based authentication (access + refresh tokens)
- Session management with Redis
- 2FA support (email-based)
- Login attempt tracking with GeoIP
- Account locking after failed attempts
- Password reset flow
- Real-time session updates via Socket.IO

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express v5
- **Database**: MongoDB (Mongoose)
- **Cache/Sessions**: Redis
- **Real-time**: Socket.IO

## Prerequisites

- Node.js 20+
- MongoDB instance
- Redis instance
- GeoLite2-City.mmdb file (for IP geolocation)

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
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `PORT` | Server port | `5000` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:3000` (dev) / `http://localhost:8080` (prod) |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `ACCESS_TOKEN_EXPIRES_IN_MINUTES` | Access token lifetime | `60` |
| `JWT_SECRET` | Secret for access tokens | (generate long random string) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | (generate long random string) |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiry in days | `90` |
| `EMAIL_USERNAME` | SMTP email username | `noreply@example.com` |
| `EMAIL_PASSWORD` | SMTP email password | (your email password) |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-2fa` - Verify 2FA code
- `POST /api/auth/forgotPassword` - Request password reset
- `POST /api/auth/verify-code` - Verify reset code
- `PATCH /api/auth/change-password` - Change password

### Sessions
- `GET /api/session/count` - Get active session count
- `GET /api/session/:userId` - Get user sessions

### Dashboard
- `GET /api/dashboard/widgets` - Get dashboard widgets

## Socket.IO Events

- Connection on `/` namespace
- Emits `sessionUpdate` with active session count

## Development

Watch mode compiles TypeScript and restarts on changes:
```bash
npm run dev
```

The service runs on port **5000** by default.

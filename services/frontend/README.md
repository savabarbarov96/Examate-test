# Examate Frontend

React-based frontend application for the Examate exam management platform.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Testing**: Playwright

## Prerequisites

- Node.js 20+
- Running auth-service (port 5000)
- Running user-service (port 5001)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update `.env` with backend service URLs

4. Run development server:
```bash
npm run dev
```

5. Open browser at `http://localhost:3000`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | User Service API URL | `http://localhost:5001` |
| `VITE_AUTH_API_URL` | Auth Service API URL | `http://localhost:5000` |

## Available Scripts

```bash
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run Playwright E2E tests
npm run test:ui      # Playwright with UI mode
```

## Project Structure

```
src/
├── components/
│   ├── auth/           # Auth-related components (AuthGate)
│   ├── pages/          # Page components
│   └── ui/             # shadcn/ui components
├── contexts/
│   └── AuthProvider.tsx # Global auth state
├── utils/
│   ├── api.ts          # Axios client (User Service)
│   ├── auth/           # Auth helpers (Auth Service)
│   ├── roles/          # Role management utilities
│   └── users/          # User management utilities
└── App.tsx             # Route definitions
```

## Features

### Authentication
- JWT-based authentication with automatic token refresh
- 2FA support
- Password reset flow
- Session management

### Dashboard
- Real-time session tracking
- User management
- Role management
- Widget system

### UI Components
- Built with shadcn/ui (Radix UI primitives)
- Fully typed TypeScript components
- Responsive design with Tailwind CSS

## Authentication Flow

The app uses a dual-token JWT system:

1. **Access Token** (15 min) - Stored in HTTP-only cookie
2. **Refresh Token** (8 hours) - Stored in HTTP-only cookie

The Axios interceptor (`utils/api.ts`) automatically:
- Catches 401 errors
- Calls `/auth/refresh` to get new access token
- Retries the original request
- Redirects to login if refresh fails

## Path Aliases

The project uses `@/` as an alias for `src/`:

```typescript
import { Button } from '@/components/ui/button'
import api from '@/utils/api'
```

## Development Notes

- Dev server runs on port **3000**
- Hot module replacement (HMR) enabled
- TypeScript strict mode enabled
- All API requests include `withCredentials: true` for cookie handling

## Testing

E2E tests are located in `tests/` and use Playwright:

```bash
npm run test              # Headless mode
npm run test:ui           # Interactive UI mode
```

Test coverage includes:
- Login flow
- 2FA verification
- Password reset
- Session management

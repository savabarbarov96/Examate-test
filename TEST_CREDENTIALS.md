# Examate Dev Server - Test Credentials

## Frontend Access
- **URL**: http://localhost:3000
- **API URL**: http://localhost:5000

## Test Users

### User 1: System Admin
- **Username**: `ipopov`
- **Password**: `12345678`
- **Email**: ipopov@example.com
- **Role**: Sys Admin (Full access to all system features)

### User 2: Admin User
- **Username**: `admin`
- **Password**: `admin123456`
- **Email**: admin@example.com
- **Role**: Sys Admin (Full access to all system features)

## Service URLs
| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Auth API | http://localhost:5000 | 5000 |
| User API | http://localhost:5001 | 5001 |
| MongoDB | localhost:27017 | 27017 |
| Redis | localhost:6379 | 6379 |

## Authentication Details
- **Access Token**: 15 minutes (stored in HTTP-only cookie `jwt`)
- **Refresh Token**: 8 hours (stored in HTTP-only cookie `refreshToken`)
- **CORS Origin**: http://localhost:3000

## Adding More Test Users

To add more test users, edit `/services/auth-service/utils/seedUsers.ts` and add entries to the `testUsers` array:

```typescript
const testUsers = [
  {
    firstName: "First",
    lastName: "Last",
    email: "user@example.com",
    username: "username",
    password: "password123456", // Min 8 characters
    client: "test-client",
    phone: "+1234567890",
  },
  // ... add more users
];
```

Then run the seed script:
```bash
cd services/auth-service
npm run seed
```

## Troubleshooting

### Login Fails with "Invalid Credentials"
1. Verify user exists: Check MongoDB directly or check seed output
2. Ensure password is at least 8 characters
3. Try the exact username/password from above

### CORS Errors
- Frontend should be accessible at `http://localhost:3000`
- If changed, update `CLIENT_ORIGIN` in `docker-compose.dev.yml` and restart services

### Services Not Communicating
- Ensure all containers are running: `docker ps`
- Check logs: `docker logs examate-auth-service`
- Verify environment variables are set correctly in `docker-compose.dev.yml`

## Docker Commands

```bash
# Start services
FRONTEND_DEV_PORT=3000 docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# View logs
docker logs -f examate-auth-service
docker logs -f examate-frontend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build
```

# Environment Variables Configuration

This document lists all environment variables required to run the Examate platform.

## Quick Setup

```bash
# 1. Copy the root .env.example to .env
cp .env.example .env

# 2. Generate strong secrets
openssl rand -base64 64  # Use for JWT_SECRET
openssl rand -base64 64  # Use for JWT_REFRESH_SECRET

# 3. Edit .env and add your secrets
nano .env
```

## Root Environment Variables

Located in `.env` at the project root:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT access tokens | `<64-char random string>` | ✓ Yes |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens | `<64-char random string>` | ✓ Yes |
| `EMAIL_USERNAME` | SMTP username for sending emails | `noreply@example.com` | ✓ Yes |
| `EMAIL_PASSWORD` | SMTP password | `your-password` | ✓ Yes |
| `VITE_API_URL` | User Service API URL (for frontend build) | `http://localhost:5001` | ✓ Yes |
| `VITE_AUTH_API_URL` | Auth Service API URL (for frontend build) | `http://localhost:5000` | ✓ Yes |
| `VITE_DASHBOARD_API_URL` | Dashboard Service API URL (for frontend build) | `http://localhost:5002` | ✓ Yes |
| `VITE_STATISTICS_API_URL` | Statistics Service API URL (for frontend build) | `http://localhost:5003` | ✓ Yes |
| `STATISTICS_SERVICE_URL` | Internal statistics service URL | `http://statistics-service:5003` | ✓ Yes |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:8080` | No (default set) |
| `FRONTEND_PORT` | Frontend production port | `8080` | No (default set) |
| `FRONTEND_DEV_PORT` | Frontend development port | `3000` | No (default set) |

## Service-Specific Environment Variables

### Auth Service (Port 5000)

Located in `services/auth-service/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Service port | ✓ Yes |
| `MONGO_URI` | MongoDB connection string | ✓ Yes |
| `REDIS_URL` | Redis connection string | ✓ Yes |
| `NODE_ENV` | Environment (development/production) | ✓ Yes |
| `CLIENT_ORIGIN` | Frontend URL for CORS | ✓ Yes |
| `JWT_SECRET` | JWT access token secret | ✓ Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | ✓ Yes |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiration in days | ✓ Yes |
| `EMAIL_USERNAME` | SMTP username | ✓ Yes |
| `EMAIL_PASSWORD` | SMTP password | ✓ Yes |

#### GeoIP Configuration (Auth Service)

The auth service supports multiple geo lookup providers for tracking user login locations:

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `GEO_PROVIDER` | Geo lookup provider | `maxmind` | `maxmind`, `ipapi`, `disabled` |
| `GEO_CACHE_TTL` | Redis cache TTL in seconds | `604800` (7 days) | Any positive integer |
| `IPAPI_TIMEOUT` | API timeout in milliseconds | `3000` | Any positive integer |

**Provider Options**:

- **`maxmind`** (default): Uses local GeoLite2-City database (requires 61MB `.mmdb` file in `services/auth-service/databases/`)
  - ✓ Fast (no external API calls)
  - ✓ Works offline
  - ✗ Requires large database file
  - ✗ Database becomes stale over time

- **`ipapi`**: Uses ipapi.co external API
  - ✓ Always up-to-date
  - ✓ No database file needed
  - ✓ Free tier: 1000 requests/day
  - ✗ Requires internet connection
  - ✗ Slower than local database

- **`disabled`**: Returns "Unknown" for all lookups
  - ✓ No dependencies
  - ✓ Fastest
  - ✗ No geo data collected

**Caching**: All providers use Redis caching to reduce lookups. The `GEO_CACHE_TTL` controls how long geo data is cached (default: 7 days).

**Graceful Degradation**: If the MaxMind database is missing or a provider fails, the service returns "Unknown" instead of crashing.

### User Service (Port 5001)

Located in `services/user-service/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Service port (5001) | ✓ Yes |
| `MONGO_URI` | MongoDB connection string | ✓ Yes |
| `NODE_ENV` | Environment (development/production) | ✓ Yes |
| `CLIENT_ORIGIN` | Frontend URL for CORS | ✓ Yes |
| `JWT_SECRET` | JWT access token secret | ✓ Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | ✓ Yes |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiration in days | ✓ Yes |
| `EMAIL_USERNAME` | SMTP username | ✓ Yes |
| `EMAIL_PASSWORD` | SMTP password | ✓ Yes |

### Dashboard Service (Port 5002)

Located in `services/dashboard-service/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Service port (5002) | ✓ Yes |
| `MONGO_URI` | MongoDB connection string | ✓ Yes |
| `NODE_ENV` | Environment (development/production) | ✓ Yes |
| `CLIENT_ORIGIN` | Frontend URL for CORS | ✓ Yes |
| `JWT_SECRET` | JWT access token secret | ✓ Yes |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiration in days | ✓ Yes |
| `EMAIL_USERNAME` | SMTP username | ✓ Yes |
| `EMAIL_PASSWORD` | SMTP password | ✓ Yes |

### Statistics Service (Port 5003)

Located in `services/statistics-service/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Service port (5003) | ✓ Yes |
| `MONGO_URI` | MongoDB connection string | ✓ Yes |
| `NODE_ENV` | Environment (development/production) | ✓ Yes |
| `CLIENT_ORIGIN` | Frontend URL for CORS | ✓ Yes |
| `JWT_SECRET` | JWT access token secret | ✓ Yes |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiration in days | ✓ Yes |
| `EMAIL_USERNAME` | SMTP username | ✓ Yes |
| `EMAIL_PASSWORD` | SMTP password | ✓ Yes |

### Frontend

Located in `services/frontend/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | User Service API URL | ✓ Yes |
| `VITE_AUTH_API_URL` | Auth Service API URL | ✓ Yes |
| `VITE_DASHBOARD_API_URL` | Dashboard Service API URL | ✓ Yes |
| `VITE_STATISTICS_API_URL` | Statistics Service API URL | ✓ Yes |

**Note**: Frontend environment variables are baked into the production build at build time.

## Docker Compose Defaults

The following are set in `docker-compose.yml` and generally don't need to be changed:

- **MongoDB Connection**: `mongodb://root:examate_mongo_pass@mongodb:27017/examate?authSource=admin`
- **Redis Connection**: `redis://redis:6379`
- **MongoDB Root Password**: `examate_mongo_pass` (change in production!)
- **Statistics Service URL**: `http://statistics-service:5003` (internal Docker network)

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Generate strong secrets** - Use `openssl rand -base64 64`
3. **Rotate credentials regularly** - Especially in production
4. **Use different secrets per environment** - Dev, staging, and prod should have different values
5. **Limit access** - Only share credentials with authorized team members

## Production Recommendations

For production deployments:

1. Use environment-specific secrets (not the defaults)
2. Store secrets in a secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
3. Enable HTTPS and update `CLIENT_ORIGIN` accordingly
4. Use a production-grade SMTP service
5. Configure MongoDB with strong passwords and access controls
6. Consider using managed services (MongoDB Atlas, Redis Cloud)

## Troubleshooting

### Services can't connect to MongoDB

- Check `MONGO_URI` is correctly formatted
- Ensure MongoDB is running (`docker compose ps`)
- Verify network connectivity

### JWT errors

- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Verify they're the same across all services that need them

### CORS errors

- Check `CLIENT_ORIGIN` matches your frontend URL
- In development, it should be `http://localhost:3000`
- In production, it should be your actual frontend domain

### Email not sending

- Verify `EMAIL_USERNAME` and `EMAIL_PASSWORD` are correct
- Check your SMTP provider settings
- Some providers require "less secure app access" to be enabled

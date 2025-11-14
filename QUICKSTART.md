# Examate Quick Start Guide

## First Time Setup (5 minutes)

```bash
# 1. Clone and navigate to project
cd examate

# 2. Run setup script
./scripts/setup.sh

# 3. Edit root .env file with your secrets
nano .env
# Add JWT_SECRET and JWT_REFRESH_SECRET (use: openssl rand -base64 64)

# 4. Start everything
make dev
```

That's it! Open http://localhost:3000 (dev hot reload)

---

## Daily Development

```bash
# Start services
make dev

# View logs
make logs

# Stop services
make down
```

---

## Common Commands

| Command | What it does |
|---------|-------------|
| `make dev` | Start all services (development mode with hot reload) |
| `make up` | Start all services (production mode, background) |
| `make down` | Stop all services |
| `make logs` | View all logs |
| `make logs-auth` | View auth service logs only |
| `make restart` | Restart all services |
| `make clean` | Nuclear option - stop everything and delete volumes |
| `make ps` | Show running containers |
| `make check-ports` | Check if ports 5000, 5001, 6379, 3000, 27017 are free |

---

## Service URLs

- **Frontend (dev)**: http://localhost:3000
- **Auth API**: http://localhost:5000
- **User API**: http://localhost:5001

---

## Troubleshooting

### Problem: Port already in use
```bash
make check-ports
# Stop conflicting services or change ports in docker-compose.yml
```

### Problem: Service won't start
```bash
make logs-auth  # or logs-user, logs-frontend
# Check the error message
```

### Problem: Need fresh start
```bash
make clean
make build
make dev
```

### Problem: Changes not reflecting (development mode)
- Make sure you're using `make dev` (not `make up`)
- Ctrl+C and restart `make dev`
- Check if files are being watched in logs

---

## Project Structure

```
examate/
├── services/
│   ├── auth-service/      # Port 5000
│   ├── user-service/      # Port 5001
│   └── frontend/          # Port 8080 (prod) / 3000 (dev)
├── docker-compose.yml     # Production setup
├── docker-compose.dev.yml # Development overrides
├── Makefile              # Your best friend
└── scripts/              # Helper scripts
```

---

## Development Workflow

### Making changes to backend services:
1. Edit files in `services/auth-service/` or `services/user-service/`
2. Changes auto-reload (if using `make dev`)
3. View logs: `make logs-auth` or `make logs-user`

### Making changes to frontend:
1. Edit files in `services/frontend/src/`
2. Vite HMR should auto-reload the page
3. View logs: `make logs-frontend`

### Adding a new npm package:
```bash
# Stop services
make down

# Add package to service
cd services/auth-service
npm install <package-name>

# Rebuild and restart
cd ../..
make build
make dev
```

---

## Environment Variables

### Root `.env` (required)
```env
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-password
```

Generate secrets: `openssl rand -base64 64`

### Service `.env` files
Auto-created by `./scripts/setup.sh` - usually don't need to edit these when using Docker.

---

## When Something Goes Wrong

1. Check logs: `make logs`
2. Check running containers: `make ps`
3. Check ports: `make check-ports`
4. Try restarting: `make restart`
5. Nuclear option: `make clean && make build && make dev`

---

## Tips

- **First time?** Read [README.md](./README.md) for full documentation
- **Ports in use?** Stop your existing Redis/MongoDB: `docker stop redis-server`
- **Need production mode?** Use `make up` instead of `make dev`
- **Want to run natively?** See individual service READMEs in `services/*/README.md`

---

## Help

```bash
make help  # Show all available commands
```

For detailed info, see [README.md](./README.md)

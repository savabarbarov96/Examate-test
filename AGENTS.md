# Repository Guidelines

## Project Structure & Module Organization
Source lives under `services/` with separate Node.js TypeScript apps: `auth-service` (authentication/2FA/session watchers), `user-service` (RBAC/user CRUD), and `frontend` (React + Vite SPA). Shared TypeScript models belong in `shared/models`. Docker and orchestration assets sit at repo root (`docker-compose*.yml`, `Makefile`), while helper utilities are in `scripts/`. Keep new modules colocated with their service, mirroring the existing `controllers/`, `routes/`, `models/`, and `utils/` layout to preserve discoverability.

## Build, Test, and Development Commands
Use `make dev` for a hot-reload Docker stack or `make up` for production-like detached containers; `make down` tears everything down and `make logs-<service>` tails specific containers. Export `FRONTEND_DEV_PORT=<free-port>` before `make dev` if `8080` is busy. Local-only work: `npm install && npm run dev` inside each service, `npm run build` to emit production bundles, and `npm run start` (backend) or `npm run preview` (frontend) for runtime validation.

## Coding Style & Naming Conventions
Follow the existing TypeScript setup (`tsconfig.json` in each service) with ES modules, 2-space indentation, and double-quoted strings. Express route files expose default routers named after the resource (`sessionRoutes`, `dashboardRoutes`). React components live under feature folders and use PascalCase filenames; hooks and stores are camelCase. Run `npm run lint` in `services/frontend` before pushing UI changes. Prefer functional utilities in `shared/` when logic spans services.

## Testing Guidelines
Frontend end-to-end coverage is handled by Playwright (`npm run test` or `npm run test:ui` in `services/frontend`). Snapshot failures should be reproduced with `npm run test -- --debug`. Backend packages currently lack automated tests—add Jest suites under a `tests/` folder when introducing critical flows and wire them to the existing `npm run test` script placeholder.

## Commit & Pull Request Guidelines
Recent history mixes Conventional Commit prefixes (`feat:`, `fix:`) with sentence-style summaries; stick with `<type>: <scope> - <summary>` for clarity (e.g., `feat: auth - tighten session watcher`). For PRs, include: purpose, high-level changes, affected services, run commands or screenshots (UI), and linked issues. Flag secrets, migrations, or manual steps explicitly, and avoid bundling unrelated service changes in one PR.

## Security & Configuration Tips
Never commit `.env` files; use `./scripts/setup.sh` and `.env.example` as templates. Secrets flow through Docker Compose, so rotate JWT keys when testing shared environments. Before exposing a new port, update both `docker-compose.yml` files and set matching CORS origins to prevent accidental open hosts.

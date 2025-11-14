# Statistics Service

Microservice responsible for statistics aggregations, chart metadata, and analytics utilities used by the dashboard.

## Features
- Aggregated data for all dashboard widget types
- Widget catalog endpoint for building UI selectors
- JWT-protected API consistent with other services
- MongoDB aggregations for sessions, login attempts, exams, and payments

## Endpoints
- `GET /api/statistics/widgets` – List available widgets/metadata
- `GET /api/statistics/widgets/:type` – Fetch aggregated data for the given widget type
- `GET /api/statistics/widgets/:type/definition` – Retrieve metadata for a single widget

## Environment
```
PORT=5003
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/examate_testing
JWT_SECRET=your-shared-secret
CLIENT_ORIGIN=http://localhost:3000
```

## Development
```
npm install
npm run dev
```

## Production
```
npm run build
npm start
```

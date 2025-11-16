# @examate/shared

Shared TypeScript types, DTOs, and utilities for Examate microservices.

## Philosophy

This package provides **shared contracts** for inter-service communication without coupling services to a specific data layer. Each service maintains its own Mongoose models and business logic.

## What's Included

- **Types**: TypeScript interfaces for User, Role, Session, etc.
- **DTOs**: Data Transfer Objects for API communication
- **Constants**: Shared enums, status codes, configuration
- **Utilities**: Helper functions for common operations

## Usage

```typescript
import {
  User,
  CreateUserDTO,
  ApiResponse,
  createSuccessResponse,
  HttpStatus,
} from '@examate/shared';

// In your service
function getUser(id: string): ApiResponse<User> {
  const user = await findUserById(id);
  return createSuccessResponse(user);
}
```

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run watch

# Clean build artifacts
npm run clean
```

## Design Principles

1. **Lightweight**: No runtime dependencies, only dev dependencies
2. **Type-safe**: Full TypeScript support with declaration maps
3. **Pragmatic**: Share contracts, not implementation
4. **Microservice-friendly**: Each service owns its data layer

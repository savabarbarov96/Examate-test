/**
 * Shared constants across Examate microservices
 */

/**
 * HTTP Status Codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * User status constants
 */
export const UserStatus = {
  UNVERIFIED: 'unverified',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const;

/**
 * Role scope constants
 */
export const RoleScope = {
  SYSTEM: 'system',
  CLIENT: 'client',
} as const;

/**
 * Service names for inter-service communication
 */
export const Services = {
  AUTH: 'auth-service',
  USER: 'user-service',
  DASHBOARD: 'dashboard-service',
  STATISTICS: 'statistics-service',
  FRONTEND: 'frontend',
} as const;

/**
 * Default pagination limits
 */
export const Pagination = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * JWT Configuration
 */
export const JWT = {
  ACCESS_TOKEN_EXPIRES: '15m',
  REFRESH_TOKEN_EXPIRES: '7d',
  COOKIE_EXPIRES_DAYS: 90,
} as const;

/**
 * Rate limiting
 */
export const RateLimit = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX_REQUESTS: 5,
} as const;

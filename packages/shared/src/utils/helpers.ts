/**
 * Shared utility functions for Examate microservices
 */

import { ApiResponse, PaginatedResponse, ErrorResponse } from '../types/api.types.js';

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a standardized paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number,
  path?: string,
  stack?: string
): ErrorResponse {
  return {
    success: false,
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path,
    ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
  };
}

/**
 * Sanitize user object (remove sensitive fields)
 */
export function sanitizeUser(user: any): any {
  const {
    password,
    passwordConfirm,
    passwordHistory,
    twoFactorCode,
    twoFactorCodeExpires,
    verificationCode,
    verificationCodeExpires,
    verificationToken,
    passwordResetToken,
    passwordResetExpires,
    ...safeUser
  } = user;

  return safeUser;
}

/**
 * Generate a random verification code
 */
export function generateVerificationCode(length: number = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
}

/**
 * Parse pagination query parameters
 */
export function parsePaginationQuery(query: any) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Check if string is valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep utility for retries/delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

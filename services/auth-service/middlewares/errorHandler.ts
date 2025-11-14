import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

// A simple custom error class
export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Centralized error handling middleware
export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const correlationId = req['correlationId'];
  if (err instanceof ApiError) {
    logger.error(`[${correlationId}] ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Log the error for debugging purposes
  logger.error(`[${correlationId}] Unhandled Error:`, err);

  // For other types of errors, send a generic 500 response
  return res.status(500).json({ message: 'Internal Server Error' });
};

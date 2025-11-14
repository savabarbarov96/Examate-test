import logger from '../utils/logger.js';
// A simple custom error class
export class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
// Centralized error handling middleware
export const handleError = (err, req, res, next) => {
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

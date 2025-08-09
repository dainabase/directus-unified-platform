import { logger } from './logger.js';

/**
 * Custom error classes for Revolut integration
 */
export class RevolutError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = 'RevolutError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
  }
}

export class AuthenticationError extends RevolutError {
  constructor(message) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends RevolutError {
  constructor(message, retryAfter) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends RevolutError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    company: req.params.company
  });

  // Handle specific error types
  if (err instanceof RevolutError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      timestamp: err.timestamp
    });
  }

  // Handle Axios errors
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;

    if (status === 429) {
      return res.status(429).json({
        error: 'RATE_LIMIT',
        message: 'Rate limit exceeded',
        retryAfter: err.response.headers['retry-after']
      });
    }

    if (status === 401) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication failed'
      });
    }

    return res.status(status).json({
      error: data.error || 'API_ERROR',
      message: data.message || err.message
    });
  }

  // Default error response
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message
  });
};

/**
 * Async error wrapper for routes
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Retry with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      logger.warn(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
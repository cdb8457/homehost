import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ValidationError } from 'joi';
import { logger, logApiError } from '@/utils/logger';
import { AppError } from '@/utils/errors';

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
  stack?: string;
}

// Global error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate request ID for tracking
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // Default error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  // Log the error with context
  logApiError(error, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    // Custom application errors
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ValidationError) {
    // Joi validation errors
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid request data';
    details = {
      validationErrors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))
    };
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    const dbError = handlePrismaError(error);
    statusCode = dbError.statusCode;
    errorCode = dbError.code;
    message = dbError.message;
    details = dbError.details;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Prisma validation errors
    statusCode = 400;
    errorCode = 'DATABASE_VALIDATION_ERROR';
    message = 'Invalid data provided';
    details = {
      prismaError: error.message
    };
  } else if (error.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    // JWT expiration errors
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (error.name === 'MulterError') {
    // File upload errors
    const multerError = handleMulterError(error);
    statusCode = multerError.statusCode;
    errorCode = multerError.code;
    message = multerError.message;
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // JSON parsing errors
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
    // Network/connection errors
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = 'External service temporarily unavailable';
  } else {
    // Unknown errors - log full details
    logger.error('Unhandled error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      requestId
    });
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
      requestId: requestId
    }
  };

  // Add details if present
  if (details) {
    errorResponse.error.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Set security headers for error responses
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Request-ID': requestId
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Handle Prisma errors
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = Array.isArray(error.meta?.target) 
        ? error.meta.target.join(', ')
        : error.meta?.target || 'field';
      return {
        statusCode: 409,
        code: 'DUPLICATE_ENTRY',
        message: `A record with this ${field} already exists`,
        details: {
          field: error.meta?.target,
          constraint: 'unique'
        }
      };

    case 'P2014':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        code: 'INVALID_RELATION',
        message: 'Invalid relation data provided',
        details: {
          relation: error.meta?.relation_name
        }
      };

    case 'P2003':
      // Foreign key constraint failed
      return {
        statusCode: 400,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Referenced record does not exist',
        details: {
          field: error.meta?.field_name
        }
      };

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        code: 'RECORD_NOT_FOUND',
        message: 'The requested record was not found',
        details: {
          cause: error.meta?.cause
        }
      };

    case 'P2016':
      // Query interpretation error
      return {
        statusCode: 400,
        code: 'INVALID_QUERY',
        message: 'Invalid query parameters',
        details: {
          details: error.meta?.details
        }
      };

    case 'P2021':
      // Table does not exist
      return {
        statusCode: 500,
        code: 'DATABASE_SCHEMA_ERROR',
        message: 'Database schema error',
        details: {
          table: error.meta?.table
        }
      };

    case 'P2024':
      // Connection timeout
      return {
        statusCode: 503,
        code: 'DATABASE_TIMEOUT',
        message: 'Database connection timeout',
        details: {
          timeout: error.meta?.connection_limit
        }
      };

    default:
      return {
        statusCode: 500,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: {
          prismaCode: error.code,
          meta: error.meta
        }
      };
  }
}

// Handle Multer (file upload) errors
function handleMulterError(error: any) {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return {
        statusCode: 413,
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds limit of ${error.limit} bytes`
      };

    case 'LIMIT_FILE_COUNT':
      return {
        statusCode: 400,
        code: 'TOO_MANY_FILES',
        message: `Too many files. Maximum allowed: ${error.limit}`
      };

    case 'LIMIT_FIELD_KEY':
      return {
        statusCode: 400,
        code: 'FIELD_NAME_TOO_LONG',
        message: 'Field name too long'
      };

    case 'LIMIT_FIELD_VALUE':
      return {
        statusCode: 400,
        code: 'FIELD_VALUE_TOO_LONG',
        message: 'Field value too long'
      };

    case 'LIMIT_FIELD_COUNT':
      return {
        statusCode: 400,
        code: 'TOO_MANY_FIELDS',
        message: 'Too many fields in form'
      };

    case 'LIMIT_UNEXPECTED_FILE':
      return {
        statusCode: 400,
        code: 'UNEXPECTED_FILE',
        message: 'Unexpected file field'
      };

    default:
      return {
        statusCode: 400,
        code: 'FILE_UPLOAD_ERROR',
        message: 'File upload failed'
      };
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const validationErrorHandler = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const validationError = new Error(error.message);
      validationError.name = 'ValidationError';
      (validationError as any).details = error.details;
      return next(validationError);
    }
    
    next();
  };
};

// Database connection error handler
export const databaseErrorHandler = (error: Error, operation: string) => {
  logger.error(`Database ${operation} failed:`, {
    error: error.message,
    stack: error.stack,
    operation
  });

  if (error.message.includes('connection')) {
    throw new AppError(
      'Database connection failed',
      503,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  if (error.message.includes('timeout')) {
    throw new AppError(
      'Database operation timed out',
      504,
      'DATABASE_TIMEOUT'
    );
  }

  throw new AppError(
    'Database operation failed',
    500,
    'DATABASE_ERROR',
    { operation, originalError: error.message }
  );
};

export default errorHandler;
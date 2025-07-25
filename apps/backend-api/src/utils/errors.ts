// Custom application error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace.
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: any) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string = 'Service', details?: any) {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', { service, ...details });
  }
}

// Error factory functions for common patterns
export const createValidationError = (field: string, value: any, expected: string) => {
  return new ValidationError(`Invalid ${field}`, {
    field,
    value,
    expected,
    code: 'INVALID_FIELD'
  });
};

export const createDuplicateError = (resource: string, field: string, value: any) => {
  return new ConflictError(`${resource} with ${field} '${value}' already exists`, {
    resource,
    field,
    value,
    code: 'DUPLICATE_RESOURCE'
  });
};

export const createNotFoundError = (resource: string, identifier: string, value: any) => {
  return new NotFoundError(`${resource}`, {
    resource,
    identifier,
    value,
    code: 'RESOURCE_NOT_FOUND'
  });
};

export const createUnauthorizedError = (action: string, resource?: string) => {
  const message = resource 
    ? `Unauthorized to ${action} ${resource}`
    : `Unauthorized to ${action}`;
  
  return new AuthorizationError(message, {
    action,
    resource,
    code: 'UNAUTHORIZED_ACTION'
  });
};

export const createServerError = (operation: string, error?: Error) => {
  return new AppError(`Failed to ${operation}`, 500, 'OPERATION_FAILED', {
    operation,
    originalError: error?.message,
    code: 'SERVER_ERROR'
  });
};

// Error code constants
export const ERROR_CODES = {
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  UNAUTHORIZED_ACTION: 'UNAUTHORIZED_ACTION',

  // Validation & Input
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_JSON: 'INVALID_JSON',
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
  FIELD_TOO_SHORT: 'FIELD_TOO_SHORT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_TIMEOUT: 'DATABASE_TIMEOUT',
  DATABASE_CONSTRAINT_ERROR: 'DATABASE_CONSTRAINT_ERROR',
  FOREIGN_KEY_CONSTRAINT: 'FOREIGN_KEY_CONSTRAINT',
  UNIQUE_CONSTRAINT: 'UNIQUE_CONSTRAINT',

  // File Operations
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Server & Configuration
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',

  // Business Logic
  INVALID_OPERATION: 'INVALID_OPERATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',

  // Gaming Specific
  SERVER_OFFLINE: 'SERVER_OFFLINE',
  SERVER_FULL: 'SERVER_FULL',
  INVALID_SERVER_STATE: 'INVALID_SERVER_STATE',
  PLUGIN_ERROR: 'PLUGIN_ERROR',
  CONFIGURATION_INVALID: 'CONFIGURATION_INVALID',
  BACKUP_FAILED: 'BACKUP_FAILED',
  DEPLOYMENT_FAILED: 'DEPLOYMENT_FAILED'
} as const;

// Type for error codes
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error category types
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  FILE_SYSTEM = 'file_system',
  EXTERNAL_SERVICE = 'external_service',
  BUSINESS_LOGIC = 'business_logic',
  CONFIGURATION = 'configuration',
  SECURITY = 'security'
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: Date;
  additionalData?: Record<string, any>;
}

// Enhanced error class with more metadata
export class EnhancedError extends AppError {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context?: ErrorContext;
  public readonly retryable: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory,
    retryable: boolean = false,
    details?: any,
    context?: ErrorContext
  ) {
    super(message, statusCode, code, details);
    
    this.severity = severity;
    this.category = category;
    this.context = context;
    this.retryable = retryable;
  }
}

// Helper function to determine if an error is operational
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Helper function to extract error information
export const extractErrorInfo = (error: Error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
      isOperational: error.isOperational
    };
  }

  return {
    message: error.message,
    statusCode: 500,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    details: undefined,
    isOperational: false
  };
};

// Common error messages
export const ERROR_MESSAGES = {
  AUTHENTICATION: {
    REQUIRED: 'Authentication is required to access this resource',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again',
    ACCOUNT_LOCKED: 'Your account has been temporarily locked',
    EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing'
  },
  AUTHORIZATION: {
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
    ACCESS_DENIED: 'Access denied to this resource',
    INVALID_ROLE: 'Invalid role for this operation'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters long',
    INVALID_FORMAT: 'Invalid format provided'
  },
  RESOURCES: {
    NOT_FOUND: 'The requested resource was not found',
    ALREADY_EXISTS: 'A resource with this identifier already exists',
    CANNOT_DELETE: 'This resource cannot be deleted due to existing dependencies'
  },
  SERVER: {
    INTERNAL_ERROR: 'An internal server error occurred',
    SERVICE_UNAVAILABLE: 'The service is temporarily unavailable',
    MAINTENANCE: 'The system is currently under maintenance'
  }
} as const;

export default AppError;
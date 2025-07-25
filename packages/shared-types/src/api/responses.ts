// Common API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  correlationId: string;
  timestamp: string;
  path: string;
}

export interface ResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: Required<ResponseMetadata>;
}

// Authentication Responses
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
  expiresAt: string;
}

// Health Check Response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    storage: ServiceHealth;
    steam: ServiceHealth;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}
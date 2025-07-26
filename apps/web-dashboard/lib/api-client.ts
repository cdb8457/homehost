import { io, Socket } from 'socket.io-client';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items?: T[];
    [key: string]: any;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
    discord?: string;
    twitter?: string;
    twitch?: string;
    youtube?: string;
    steam?: string;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    emailNotifications: boolean;
    pushNotifications: boolean;
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    showGameActivity: boolean;
    language: string;
    timezone: string;
  };
}

// Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'homehost_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'homehost_refresh_token';
  private static readonly USER_KEY = 'homehost_user';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setTokens(tokens: AuthTokens, user: AuthUser) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

// API Client
export class ApiClient {
  private baseUrl: string;
  private socket: Socket | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002') {
    this.baseUrl = baseUrl;
  }

  // HTTP Request helper
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = TokenManager.getAccessToken();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Check if the response is ok
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        // Handle token refresh on 401
        if (response.status === 401 && token) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            const newToken = TokenManager.getAccessToken();
            if (newToken) {
              const retryConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              };
              const retryResponse = await fetch(url, retryConfig);
              if (!retryResponse.ok) {
                const retryErrorData = await retryResponse.json().catch(() => ({ message: 'Request failed' }));
                return {
                  success: false,
                  error: {
                    code: `HTTP_${retryResponse.status}`,
                    message: retryErrorData.message || `Request failed with status ${retryResponse.status}`,
                  },
                };
              }
              return await retryResponse.json();
            }
          }
        }

        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || `Request failed with status ${response.status}`,
          },
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  // GET request
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let fullEndpoint = endpoint;
    
    if (params) {
      const url = new URL(`${this.baseUrl}/api${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      fullEndpoint = endpoint + url.search;
    }

    return this.request<T>(fullEndpoint, { method: 'GET' });
  }

  // POST request
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>> {
    const response = await this.post<{ user: AuthUser; tokens: AuthTokens }>('/auth/login', credentials);
    
    if (response.success && response.data) {
      TokenManager.setTokens(response.data.tokens, response.data.user);
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>> {
    const response = await this.post<{ user: AuthUser; tokens: AuthTokens }>('/auth/register', userData);
    
    if (response.success && response.data) {
      TokenManager.setTokens(response.data.tokens, response.data.user);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.post('/auth/logout');
    TokenManager.clearTokens();
    
    // Disconnect WebSocket if connected
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    return response;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      this.handleSessionExpired();
      return false;
    }

    try {
      const response = await this.post<{ tokens: AuthTokens }>('/auth/refresh', { refreshToken });
      
      if (response.success && response.data) {
        const currentUser = TokenManager.getUser();
        if (currentUser) {
          TokenManager.setTokens(response.data.tokens, currentUser);
          return true;
        }
      }
    } catch (error) {
      // Token refresh failed, session expired
      this.handleSessionExpired();
      return false;
    }

    // If refresh fails, clear tokens and redirect
    this.handleSessionExpired();
    return false;
  }

  private handleSessionExpired(): void {
    TokenManager.clearTokens();
    
    // Disconnect WebSocket if connected
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Redirect to login only if not already on login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?message=session_expired';
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: AuthUser }>> {
    return this.get<{ user: AuthUser }>('/auth/me');
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    return this.post('/auth/change-password', passwordData);
  }

  // WebSocket connection
  connectWebSocket(): Socket {
    if (this.socket) {
      return this.socket;
    }

    const token = TokenManager.getAccessToken();
    this.socket = io(this.baseUrl, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getWebSocket(): Socket | null {
    return this.socket;
  }

  // User methods
  async getUserProfile(userId?: string): Promise<ApiResponse<{ user: AuthUser }>> {
    const endpoint = userId ? `/users/profile/${userId}` : '/users/profile';
    return this.get<{ user: AuthUser }>(endpoint);
  }

  async updateUserProfile(updates: Partial<AuthUser>): Promise<ApiResponse<{ user: AuthUser }>> {
    return this.put<{ user: AuthUser }>('/users/profile', updates);
  }

  async getUserPreferences(): Promise<ApiResponse<{ preferences: AuthUser['preferences'] }>> {
    return this.get<{ preferences: AuthUser['preferences'] }>('/users/preferences');
  }

  async updateUserPreferences(preferences: Partial<AuthUser['preferences']>): Promise<ApiResponse<{ preferences: AuthUser['preferences'] }>> {
    return this.put<{ preferences: AuthUser['preferences'] }>('/users/preferences', preferences);
  }

  async getUserNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<PaginatedResponse<any>> {
    return this.get('/users/notifications', params);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.patch(`/users/notifications/${notificationId}/read`);
  }

  async searchUsers(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AuthUser>> {
    return this.get('/users/search', { q: query, ...params });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!TokenManager.getAccessToken();
  }

  // Get current user from localStorage
  getCurrentUserFromStorage(): AuthUser | null {
    return TokenManager.getUser();
  }
}

// Create global API client instance
export const apiClient = new ApiClient();

// Export token manager for external use
export { TokenManager };
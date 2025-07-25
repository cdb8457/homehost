import { apiClient, ApiResponse, AuthUser, AuthTokens, LoginRequest, RegisterRequest, TokenManager } from '../api-client';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  discord?: string;
  twitter?: string;
  twitch?: string;
  youtube?: string;
  steam?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  pushNotifications: boolean;
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  showGameActivity: boolean;
  language: string;
  timezone: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export class AuthApi {
  // Register new user
  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>> {
    return apiClient.register(userData);
  }

  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>> {
    return apiClient.login(credentials);
  }

  // Logout user
  async logout(): Promise<ApiResponse> {
    return apiClient.logout();
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<{ user: AuthUser }>> {
    return apiClient.getCurrentUser();
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse> {
    return apiClient.changePassword(passwordData);
  }

  // Logout from all devices
  async logoutAllDevices(): Promise<ApiResponse> {
    return apiClient.post('/auth/logout-all');
  }

  // Refresh access token
  async refreshToken(): Promise<boolean> {
    return apiClient.refreshToken();
  }

  // Get user profile
  async getUserProfile(userId?: string): Promise<ApiResponse<{ user: AuthUser }>> {
    return apiClient.getUserProfile(userId);
  }

  // Update user profile
  async updateUserProfile(updates: UpdateProfileRequest): Promise<ApiResponse<{ user: AuthUser }>> {
    return apiClient.updateUserProfile(updates);
  }

  // Get user preferences
  async getUserPreferences(): Promise<ApiResponse<{ preferences: UserPreferences }>> {
    return apiClient.getUserPreferences();
  }

  // Update user preferences
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<{ preferences: UserPreferences }>> {
    return apiClient.updateUserPreferences(preferences);
  }

  // Get user notifications
  async getUserNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    return apiClient.getUserNotifications(params);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return apiClient.markNotificationAsRead(notificationId);
  }

  // Search users
  async searchUsers(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    users: AuthUser[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    return apiClient.searchUsers(query, params);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  // Get current user from storage
  getCurrentUserFromStorage(): AuthUser | null {
    return apiClient.getCurrentUserFromStorage();
  }

  // Get access token
  getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return TokenManager.getRefreshToken();
  }

  // Clear authentication data
  clearAuthData(): void {
    TokenManager.clearTokens();
  }
}

export const authApi = new AuthApi();
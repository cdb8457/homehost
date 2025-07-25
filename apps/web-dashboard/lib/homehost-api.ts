import { Community, CommunityFilter } from '@/types/community';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    personaType: number;
  };
}

interface CreateCommunityRequest {
  name: string;
  description: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  joinType: 'open' | 'application' | 'invite_only';
  region: string;
  timezone?: string;
  language?: string;
  tags: string[];
  games: string[];
  website?: string;
  discord?: string;
  socialLinks?: {
    twitter?: string;
    youtube?: string;
    twitch?: string;
  };
  rules?: string[];
  welcomeMessage?: string;
}

class HomeHostAPI {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_HOMEHOST_API_URL || 'http://localhost:5000/api';
    
    // Load tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('homehost_access_token');
      this.refreshToken = localStorage.getItem('homehost_refresh_token');
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the original request
        throw new Error('TOKEN_REFRESHED'); // Signal to retry
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error.message === 'TOKEN_REFRESHED') {
        // Retry with new token
        const newHeaders = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers: {
            ...newHeaders,
            ...options.headers,
          },
        });
        return await this.handleResponse<T>(response);
      }
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens
    this.accessToken = response.accessToken;
    this.refreshToken = response.refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('homehost_access_token', response.accessToken);
      localStorage.setItem('homehost_refresh_token', response.refreshToken);
    }

    return response;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('homehost_access_token', data.accessToken);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('homehost_access_token');
        localStorage.removeItem('homehost_refresh_token');
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Community API methods
  async getCommunities(filter?: CommunityFilter): Promise<Community[]> {
    const params = new URLSearchParams();
    
    if (filter?.search) params.append('search', filter.search);
    if (filter?.games) params.append('games', filter.games.join(','));
    if (filter?.memberCount) params.append('memberCount', filter.memberCount);
    if (filter?.region) params.append('region', filter.region);
    if (filter?.joinType) params.append('joinType', filter.joinType);
    if (filter?.activity) params.append('activity', filter.activity);
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.showFriendsOnly) params.append('showFriendsOnly', 'true');

    const queryString = params.toString();
    const endpoint = queryString ? `/community?${queryString}` : '/community';
    
    return this.makeRequest<Community[]>(endpoint);
  }

  async getCommunity(id: string): Promise<Community> {
    return this.makeRequest<Community>(`/community/${id}`);
  }

  async createCommunity(data: CreateCommunityRequest): Promise<Community> {
    return this.makeRequest<Community>('/community', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCommunity(id: string, data: Partial<CreateCommunityRequest>): Promise<Community> {
    return this.makeRequest<Community>(`/community/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCommunity(id: string): Promise<void> {
    return this.makeRequest<void>(`/community/${id}`, {
      method: 'DELETE',
    });
  }

  async getTrendingCommunities(): Promise<Community[]> {
    return this.makeRequest<Community[]>('/community/trending');
  }

  async getRecommendedCommunities(): Promise<Community[]> {
    return this.makeRequest<Community[]>('/community/recommended');
  }

  async searchCommunities(query: string): Promise<Community[]> {
    const params = new URLSearchParams({ query });
    return this.makeRequest<Community[]>(`/community/search?${params.toString()}`);
  }

  async joinCommunity(id: string): Promise<void> {
    return this.makeRequest<void>(`/community/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveCommunity(id: string): Promise<void> {
    return this.makeRequest<void>(`/community/${id}/leave`, {
      method: 'POST',
    });
  }

  async getCommunityMembers(id: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/community/${id}/members`);
  }

  async getCommunityAnalytics(id: string): Promise<any> {
    return this.makeRequest<any>(`/community/${id}/analytics`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return fetch(`${this.baseURL.replace('/api', '')}/health`)
      .then(res => res.json());
  }

  // Test connection without auth
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const homeHostAPI = new HomeHostAPI();

// Export types for use in components
export type { AuthResponse, CreateCommunityRequest };
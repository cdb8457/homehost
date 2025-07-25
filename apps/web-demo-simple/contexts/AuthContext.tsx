'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AuthUser, ApiResponse, AuthTokens, LoginRequest, RegisterRequest } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ user: any; error: string | null }>;
  signUp: (userData: RegisterRequest) => Promise<{ user: any; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: string | null }>;
  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ error: string | null }>;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuthenticated = authApi.isAuthenticated();
        
        // Only try to get user if we're in the browser and authenticated
        if (typeof window !== 'undefined' && isAuthenticated) {
          const response = await authApi.getCurrentUser();
          
          if (response.success && response.data) {
            setState({ user: response.data.user, loading: false, error: null });
          } else {
            // Clear invalid tokens
            authApi.clearAuthData();
            setState({ user: null, loading: false, error: null });
          }
        } else {
          setState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens on error
        authApi.clearAuthData();
        setState({ 
          user: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize auth' 
        });
      }
    };

    initAuth();

    // Set up token refresh interval
    const refreshInterval = setInterval(async () => {
      if (authApi.isAuthenticated()) {
        try {
          await authApi.refreshToken();
        } catch (error) {
          console.error('Token refresh error:', error);
          // If refresh fails, clear auth data
          authApi.clearAuthData();
          setState({ user: null, loading: false, error: 'Session expired' });
        }
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    console.log('🔐 AuthContext signIn called');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    console.log('🔐 Calling authApi.login...');
    const result = await authApi.login({ email, password, rememberMe });
    console.log('🔐 authApi.login result:', result);
    
    if (result.error) {
      console.log('🔐 Login failed:', result.error);
      setState(prev => ({ ...prev, loading: false, error: result.error.message }));
      return { user: null, error: result.error.message };
    } else if (result.data) {
      console.log('🔐 Login success:', result.data);
      setState(prev => ({ ...prev, user: result.data!.user, loading: false, error: null }));
      return { user: result.data.user, error: null };
    }
    
    console.log('🔐 Unknown error in signIn');
    return { user: null, error: 'Unknown error occurred' };
  };

  const signUp = async (userData: RegisterRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authApi.register(userData);
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error.message }));
      return { user: null, error: result.error.message };
    } else if (result.data) {
      setState(prev => ({ ...prev, user: result.data!.user, loading: false, error: null }));
      return { user: result.data.user, error: null };
    }
    
    return { user: null, error: 'Unknown error occurred' };
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authApi.logout();
    
    // Always clear local state regardless of API response
    setState({ user: null, loading: false, error: null });
    
    if (result.error) {
      return { error: result.error.message };
    }
    
    return { error: null };
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authApi.updateUserProfile(updates);
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error.message }));
      return { error: result.error.message };
    } else if (result.data) {
      setState(prev => ({ ...prev, user: result.data!.user, loading: false, error: null }));
      return { error: null };
    }
    
    return { error: 'Unknown error occurred' };
  };

  const changePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authApi.changePassword(passwordData);
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error.message }));
      return { error: result.error.message };
    } else {
      setState(prev => ({ ...prev, loading: false, error: null }));
      return { error: null };
    }
  };

  const refreshUser = async () => {
    if (authApi.isAuthenticated()) {
      const result = await authApi.getCurrentUser();
      if (result.success && result.data) {
        setState(prev => ({ ...prev, user: result.data!.user }));
      }
    }
  };

  const isAuthenticated = () => {
    return authApi.isAuthenticated();
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    refreshUser,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hooks for common auth patterns
export function useRequireAuth() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login or show auth modal
      window.location.href = '/login';
    }
  }, [user, loading]);
  
  return { user, loading };
}

export function useIsRole(role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN') {
  const { user } = useAuth();
  return user?.role === role;
}

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

export function useIsModerator() {
  const { user } = useAuth();
  return user?.role === 'MODERATOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}
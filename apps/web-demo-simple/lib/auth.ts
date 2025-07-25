'use client';

import { createSupabaseClient } from './supabase-client';
import { createSupabaseServerClient } from './supabase-server';
import { User } from '@/types/app';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'alex' | 'sam';
  gaming_preferences: {
    favorite_games: string[];
    playtime_preference: 'casual' | 'hardcore' | 'mixed';
    community_size_preference: 'small' | 'medium' | 'large';
    hosting_experience: 'none' | 'basic' | 'intermediate' | 'advanced';
  };
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export class AuthManager {
  private supabase = createSupabaseClient();
  
  private isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key');
  }

  // Sign up new user
  async signUp(email: string, password: string, userData: Partial<AuthUser>) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'alex',
            gaming_preferences: userData.gaming_preferences || {
              favorite_games: [],
              playtime_preference: 'casual',
              community_size_preference: 'medium',
              hosting_experience: 'none'
            }
          }
        }
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Signup failed' };
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Google login failed' };
    }
  }

  // Sign in with Discord
  async signInWithDiscord() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Discord login failed' };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Logout failed' };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!this.isConfigured()) {
        console.warn('Supabase not configured - using demo mode');
        return null;
      }

      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      // Get additional profile data
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || profile?.name || user.email!,
        avatar: user.user_metadata?.avatar_url || profile?.avatar,
        role: user.user_metadata?.role || profile?.role || 'alex',
        gaming_preferences: profile?.gaming_preferences || {
          favorite_games: [],
          playtime_preference: 'casual',
          community_size_preference: 'medium',
          hosting_experience: 'none'
        },
        profile_completed: profile?.profile_completed || false,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Update auth metadata
      if (updates.name || updates.avatar) {
        await this.supabase.auth.updateUser({
          data: {
            name: updates.name,
            avatar_url: updates.avatar
          }
        });
      }

      // Update profile table
      const { error } = await this.supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Profile update failed' };
    }
  }

  // Complete profile setup
  async completeProfile(profileData: {
    name: string;
    role: 'alex' | 'sam';
    gaming_preferences: AuthUser['gaming_preferences'];
  }) {
    try {
      const result = await this.updateProfile({
        ...profileData,
        profile_completed: true
      });

      return result;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Profile completion failed' };
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured - auth state changes disabled');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Get user's communities
  async getUserCommunities(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('community_members')
        .select(`
          *,
          community:communities(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return { communities: data, error: null };
    } catch (error) {
      return { communities: [], error: error instanceof Error ? error.message : 'Failed to fetch communities' };
    }
  }

  // Get user's servers
  async getUserServers(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('servers')
        .select('*')
        .eq('owner_id', userId);

      if (error) throw error;
      return { servers: data, error: null };
    } catch (error) {
      return { servers: [], error: error instanceof Error ? error.message : 'Failed to fetch servers' };
    }
  }

  // Get user's friends
  async getUserFriends(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('friendships')
        .select(`
          *,
          friend:user_profiles!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;
      return { friends: data, error: null };
    } catch (error) {
      return { friends: [], error: error instanceof Error ? error.message : 'Failed to fetch friends' };
    }
  }
}

// Create global auth manager instance
export const authManager = new AuthManager();
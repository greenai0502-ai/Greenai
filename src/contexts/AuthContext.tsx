import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext initializing...');
    
    // Safety timeout - ensure we stop loading after 5 seconds max
    const timeout = setTimeout(() => {
      console.warn('Auth check timeout - forcing loading to complete');
      setIsLoading(false);
    }, 5000);
    
    // Check active session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        console.log('Session check:', session ? 'User logged in' : 'No session');
        if (session?.user) {
          loadUserProfile(session.user).finally(() => clearTimeout(timeout));
        } else {
          setIsLoading(false);
          clearTimeout(timeout);
        }
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setIsLoading(false);
        clearTimeout(timeout);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'User logged in' : 'No session');
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out - clearing user state');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('Loading user profile for:', supabaseUser.id);
    
    // First, set basic user info from auth session immediately
    const basicUser = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
      email: supabaseUser.email!
    };
    
    setUser(basicUser);
    setIsLoading(false);
    console.log('User set from auth session:', basicUser);
    
    // Then try to load full profile in background (optional enhancement)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (!error && profile) {
        console.log('Profile loaded from database:', profile);
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url
        });
      } else if (error) {
        console.log('Profile query error (using auth data instead):', error.message);
      }
    } catch (error) {
      console.log('Could not load profile from database, using auth session data');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user);
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Try to create profile (ignore if already exists)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email!,
            name,
          }]);

        // Ignore duplicate key error (profile already exists)
        if (profileError && profileError.code !== '23505') {
          console.error('Profile creation error:', profileError);
          // Don't throw - continue with auth session data
        }

        await loadUserProfile(data.user);
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      setUser(null);
      setIsLoading(false);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      console.log('Logged out successfully');
    } catch (error: any) {
      console.error('Logout failed:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset password email');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      signup, 
      logout,
      resetPassword,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

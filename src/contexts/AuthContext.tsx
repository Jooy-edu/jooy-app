import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// User profile interface matching database schema
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, username?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  checkRateLimit: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and set up auth listener
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchUserProfile(initialSession.user.id);
          await updateLastLogin(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            await updateLastLogin(session.user.id);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Check rate limiting for login attempts
  const checkRateLimit = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        user_email: email,
        client_ip: '127.0.0.1' // In production, get real IP from request
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  };

  // Log login attempt
  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase
        .from('login_attempts')
        .insert({
          email,
          ip_address: '127.0.0.1', // In production, get real IP
          success,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  };

  // Sign up function with comprehensive validation
  const signUp = async (
    email: string, 
    password: string, 
    fullName?: string, 
    username?: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      setLoading(true);

      // Check if username is already taken (if provided)
      if (username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          return { error: { message: 'Username already taken' } as AuthError };
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
            username: username || '',
          }
        }
      });

      if (error) {
        await logLoginAttempt(email, false);
        return { error };
      }

      // Log successful registration
      await logLoginAttempt(email, true);

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function with rate limiting
  const signIn = async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ): Promise<{ error: AuthError | null }> => {
    try {
      setLoading(true);

      // Check rate limiting
      const canAttempt = await checkRateLimit(email);
      if (!canAttempt) {
        const error = { message: 'Too many failed login attempts. Please try again in 15 minutes.' } as AuthError;
        return { error };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Log the attempt
      await logLoginAttempt(email, !error);

      if (error) {
        return { error };
      }

      // Handle "Remember Me" functionality by extending session
      if (rememberMe && data.session) {
        // Store session preference in localStorage
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      await logLoginAttempt(email, false);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      setLoading(true);

      // Invalidate current session in database
      if (session) {
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('user_id', session.user.id);
      }

      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setProfile(null);
        setSession(null);
        localStorage.removeItem('rememberMe');
      }

      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  // Update password function
  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as AuthError };
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    try {
      if (!user) {
        return { error: new Error('No authenticated user') };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh profile data
      await fetchUserProfile(user.id);
      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    checkRateLimit,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
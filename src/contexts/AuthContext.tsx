
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAnonymous: boolean;
  enableAnonymousMode: () => void;
  disableAnonymousMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: { username?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Check if anonymous mode is enabled in localStorage
    const storedAnonymousMode = localStorage.getItem('anonymousMode') === 'true';
    setIsAnonymous(storedAnonymousMode);

    return () => subscription.unsubscribe();
  }, []);

  const enableAnonymousMode = () => {
    setIsAnonymous(true);
    localStorage.setItem('anonymousMode', 'true');
    toast.info("Anonymous mode enabled");
  };

  const disableAnonymousMode = () => {
    setIsAnonymous(false);
    localStorage.setItem('anonymousMode', 'false');
    toast.info("Anonymous mode disabled");
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    
    return data;
  };

  const signUp = async (email: string, password: string, options?: { username?: string }) => {
    try {
      // Try to sign up the user
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.username ? { username: options.username } : undefined
        }
      });
      
      if (error) {
        // If there's an error during signup, throw it
        throw error;
      }
      
      // If signup is successful and we have a username, we update the profile separately
      if (options?.username && data?.user) {
        try {
          // Update the profile with username
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id, 
              username: options.username 
            });
            
          if (profileError) {
            console.error('Error updating profile:', profileError);
            // We don't throw here because the signup was successful
          }
        } catch (profileUpdateError) {
          console.error('Error in profile update:', profileUpdateError);
        }
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth?reset=true',
      });
      
      if (error) {
        throw error;
      }
      
      // We don't reveal if the email exists or not for security reasons
      toast.success('If your email is registered, you will receive password reset instructions');
    } catch (error: any) {
      console.error('Reset password error:', error);
      // Still show a success message even if there's an error, to prevent user enumeration
      toast.success('If your email is registered, you will receive password reset instructions');
      // However, log the error for debugging purposes
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isLoading: loading, // Alias for loading to match the expected interface
    isAnonymous,
    enableAnonymousMode,
    disableAnonymousMode,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

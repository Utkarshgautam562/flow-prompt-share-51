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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, options?: { username?: string }) => {
    // Keep the username short to avoid database error
    let userData = {};
    
    if (options?.username) {
      // Ensure username is not too long (Supabase profiles column limitation)
      const safeUsername = options.username.substring(0, 20);
      userData = {
        username: safeUsername
      };
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) {
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

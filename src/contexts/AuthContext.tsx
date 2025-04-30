
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableAnonymousMode: () => void;
  disableAnonymousMode: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Anonymous user ID storage key
const ANONYMOUS_ID_KEY = 'promptflow-anonymous-id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Load anonymous state from localStorage on initial load
  useEffect(() => {
    const storedAnonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (storedAnonymousId && !user) {
      setIsAnonymous(true);
    }
  }, [user]);

  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(async () => {
            await fetchProfile(currentSession.user.id);
          }, 0);
          
          // If we have a real user, we're not in anonymous mode
          setIsAnonymous(false);
          localStorage.removeItem(ANONYMOUS_ID_KEY);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
        setIsAnonymous(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification.",
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (isAnonymous) {
        disableAnonymousMode();
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An error occurred during sign out.",
      });
    }
  };

  // Enable anonymous mode
  const enableAnonymousMode = () => {
    // Generate a random ID for anonymous user
    const anonymousId = `anon_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    setIsAnonymous(true);
    
    toast({
      title: "Anonymous Mode Enabled",
      description: "You're now browsing in anonymous mode. Your data won't be linked to your identity.",
    });
  };

  // Disable anonymous mode
  const disableAnonymousMode = () => {
    localStorage.removeItem(ANONYMOUS_ID_KEY);
    setIsAnonymous(false);
    
    toast({
      title: "Anonymous Mode Disabled",
      description: "You've exited anonymous mode.",
    });
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    isAnonymous,
    signUp,
    signIn,
    signOut,
    enableAnonymousMode,
    disableAnonymousMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

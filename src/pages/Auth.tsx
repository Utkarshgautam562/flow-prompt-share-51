
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("signin");
  
  // Get the redirect path from location state or default to home
  const from = location.state?.from || '/';
  
  // Check if we're in password reset mode from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isReset = params.get('reset') === 'true';
    
    if (isReset) {
      setActiveTab("signin"); // Ensure we're on the signin tab for password reset
      
      // Handle password recovery flow
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          toast.info('Please enter a new password to reset your account');
        }
      });
    }
    
    // Check if there's a recovery token in the URL (usually after clicking reset link)
    const url = new URL(window.location.href);
    const hasType = url.hash.includes('type=recovery');
    
    if (hasType) {
      setActiveTab("signin");
      toast.info('Please enter your new password');
    }
  }, [location]);
  
  useEffect(() => {
    // If user is already logged in, redirect to the page they were trying to access
    if (user) {
      navigate(from);
    }
  }, [user, navigate, from]);
  
  return (
    <AuthLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    />
  );
};

export default Auth;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("signin");
  
  // Get the redirect path from location state or default to home
  const from = location.state?.from || '/';
  
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


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SignInFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, redirectTo }) => {
  const { signIn, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const location = useLocation();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Check for password reset in URL params and auth state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isReset = params.get('reset') === 'true';
    
    if (isReset) {
      // Set up listener for auth state changes related to password recovery
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          toast.info('Please enter a new password to reset your account');
          
          // Reset the URL parameter to avoid showing the message again on refresh
          const url = new URL(window.location.href);
          url.searchParams.delete('reset');
          window.history.replaceState({}, document.title, url.toString());
        }
      });
    }
  }, [location]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    if (!isResetMode && !password) {
      toast.error('Please enter your password');
      return;
    }
    
    try {
      setIsLoading(true);

      if (isResetMode) {
        // Handle password reset request
        await resetPassword(email);
        toast.success('If your email is registered, you will receive password reset instructions');
        setIsResetMode(false);
      } else {
        // Handle normal sign in
        const { data, error } = await signIn(email, password);
        
        if (error) {
          throw error;
        }
        
        toast.success('Signed in successfully');
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Provide more user-friendly error messages
      if (error.message.includes('Email not confirmed')) {
        toast.error('Please check your email and verify your account before signing in');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully');
      setIsPasswordRecovery(false);
      
      // Clear the form fields
      setNewPassword('');
      setConfirmNewPassword('');
      
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isPasswordRecovery) {
    return (
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input 
            id="new-password" 
            type="password" 
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">Confirm New Password</Label>
          <Input 
            id="confirm-new-password" 
            type="password" 
            placeholder="••••••••"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Updating password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    );
  }
  
  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input 
          id="signin-email" 
          type="email" 
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      {!isResetMode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password">Password</Label>
            <button 
              type="button" 
              onClick={() => setIsResetMode(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <Input 
            id="signin-password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            {isResetMode ? 'Sending reset link...' : 'Signing in...'}
          </>
        ) : (
          isResetMode ? 'Send Reset Link' : 'Sign In'
        )}
      </Button>
      
      {isResetMode && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsResetMode(false)}
            className="text-sm text-gray-600 hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      )}
    </form>
  );
};

export default SignInForm;

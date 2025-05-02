
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SignUpFormProps {
  onSuccess?: () => void;
  setActiveTab?: (tab: string) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, setActiveTab }) => {
  const { signUp, checkEmailExists } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const validateUsername = (value: string) => {
    if (value.length > 50) {
      setUsernameError('Username must be less than 50 characters');
      return false;
    }
    if (/[^a-zA-Z0-9_]/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (username && !validateUsername(username)) {
      return; // Error is already set by validateUsername
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast.error('Email is already registered. Please sign in instead.');
        setIsLoading(false);
        if (setActiveTab) {
          setActiveTab("signin");
        }
        return;
      }

      // Create the user account
      const { error } = await signUp(email, password, username ? { username } : undefined);
      
      if (error) {
        throw error;
      }
      
      toast.success('Account created successfully! Check your email for confirmation');
      
      if (setActiveTab) {
        setActiveTab("signin");
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-username">Username (optional)</Label>
        <Input 
          id="signup-username" 
          type="text" 
          placeholder="johndoe"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            validateUsername(e.target.value);
          }}
          disabled={isLoading}
          maxLength={50}
        />
        {usernameError && (
          <p className="text-xs text-red-500">{usernameError}</p>
        )}
        <p className="text-xs text-gray-500">
          Username must be less than 50 characters and can only contain letters, numbers, and underscores.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email *</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password *</Label>
        <Input 
          id="signup-password" 
          type="password" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
        <Input 
          id="signup-confirm-password" 
          type="password" 
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
      <p className="text-xs text-center text-gray-500 mt-4">
        You'll receive a confirmation email to verify your account.
      </p>
    </form>
  );
};

export default SignUpForm;

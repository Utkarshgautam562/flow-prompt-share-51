
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const UsernameDialog = ({ isOpen, onClose, userId }: UsernameDialogProps) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the profile with the chosen username
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success("Username set successfully!");
      onClose();
    } catch (error: any) {
      console.error('Error setting username:', error);
      toast.error(error.message || "Failed to set username");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Welcome to PromptFlow!</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Please choose a username for your account
            </p>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-promptflow-purple to-promptflow-blue"
              disabled={isLoading}
            >
              {isLoading ? 'Setting Username...' : 'Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameDialog;

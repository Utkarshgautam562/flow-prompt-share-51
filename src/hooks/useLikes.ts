
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useLikes = (promptId: string) => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!promptId) return;

      try {
        setIsLoading(true);
        
        // Get total likes count
        const { count, error: countError } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('prompt_id', promptId);
        
        if (countError) throw countError;
        
        setLikesCount(count || 0);
        
        // Check if the current user has liked this prompt
        if (user) {
          const { data, error } = await supabase
            .from('likes')
            .select('id')
            .eq('prompt_id', promptId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) throw error;
          
          setIsLiked(!!data);
        }
      } catch (error: any) {
        console.error('Error fetching likes:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();
  }, [promptId, user]);

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like prompts",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('prompt_id', promptId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setLikesCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
        
        toast({
          title: "Like removed",
          description: "You've removed your like from this prompt",
        });
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            prompt_id: promptId,
            user_id: user.id
          });
          
        if (error) throw error;
        
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
        
        toast({
          title: "Prompt liked",
          description: "You've liked this prompt",
        });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    likesCount,
    isLiked,
    isLoading,
    toggleLike
  };
};

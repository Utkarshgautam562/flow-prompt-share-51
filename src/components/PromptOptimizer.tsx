
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PromptOptimizerProps {
  onOptimize: (optimizedContent: string) => void;
  initialContent?: string;
}

const PromptOptimizer: React.FC<PromptOptimizerProps> = ({ onOptimize, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to optimize",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    try {
      const { data, error } = await supabase.functions.invoke('optimize-prompt', {
        body: { prompt: content }
      });

      if (error) throw error;

      if (data.optimized) {
        setContent(data.optimized);
        onOptimize(data.optimized);
        
        toast({
          title: "Prompt optimized",
          description: "Your prompt has been improved by AI",
        });
      }
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      toast({
        title: "Optimization failed",
        description: error.message || "Failed to optimize prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your prompt here to optimize..."
          className="h-40 resize-none"
        />
      </div>
      
      <Button 
        onClick={handleOptimize} 
        disabled={isOptimizing || !content.trim()}
        className="w-full"
      >
        {isOptimizing && <Loader2 size={16} className="mr-2 animate-spin" />}
        {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
      </Button>
    </div>
  );
};

export default PromptOptimizer;

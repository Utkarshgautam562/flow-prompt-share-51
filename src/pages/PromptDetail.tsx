
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useLikes } from '@/hooks/useLikes';
import { Copy, ArrowLeft, ThumbsUp, Share2, Loader2 } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  llm_settings: {
    model: string;
    temperature: number;
  };
  profiles: {
    username: string;
  };
}

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { likesCount, isLiked, toggleLike } = useLikes(id || '');

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('prompts')
          .select('*, profiles(username)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Transform data to handle nested profile info
        setPrompt({
          ...data,
          profiles: data.profiles as { username: string },
          llm_settings: data.llm_settings as { model: string; temperature: number }
        });
      } catch (error: any) {
        console.error('Error fetching prompt:', error);
        toast({
          variant: "destructive",
          title: "Failed to load prompt",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrompt();
  }, [id]);
  
  const copyToClipboard = () => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const goBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Prompt Not Found</h1>
        <p className="text-gray-500 mb-6">
          The prompt you're looking for doesn't exist or is not public.
        </p>
        <Button onClick={goBack} variant="outline">
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const isOwner = user && user.id === prompt.user_id;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={goBack} 
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{prompt.title}</CardTitle>
              <CardDescription>
                by {prompt.profiles?.username || 'Anonymous'} • {new Date(prompt.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/my-prompts`)}
                >
                  Edit
                </Button>
              )}
              <Button 
                variant={copied ? "default" : "outline"} 
                size="sm" 
                onClick={copyToClipboard}
              >
                <Copy size={14} className="mr-1" /> {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50">
              {prompt.llm_settings.model || 'GPT-4'}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              Temperature: {prompt.llm_settings.temperature || 0.7}
            </Badge>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-3">Prompt</h3>
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
              {prompt.content}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-3">How to Use This Prompt</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Copy the prompt using the copy button above</li>
              <li>Paste it into your preferred AI assistant</li>
              <li>Modify any placeholders with your specific information</li>
              <li>Run the prompt and get high-quality results</li>
            </ol>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center border-t pt-6">
          <div className="text-sm text-gray-500">
            Length: {prompt.content.length} characters
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isLiked ? "default" : "ghost"} 
              size="sm"
              className={isLiked ? "bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700" : ""}
              onClick={toggleLike}
            >
              <ThumbsUp size={16} className={`mr-1 ${isLiked ? "fill-current" : ""}`} /> 
              {isLiked ? 'Liked' : 'Like'} ({likesCount})
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 size={16} className="mr-1" /> Share
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PromptDetail;

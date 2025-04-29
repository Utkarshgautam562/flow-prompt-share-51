
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  content: string;
  created_at: string;
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
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]">Loading prompt...</div>;
  }
  
  if (!prompt) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Prompt Not Found</h1>
        <p className="text-gray-500">
          The prompt you're looking for doesn't exist or is not public.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{prompt.title}</CardTitle>
              <CardDescription>
                by {prompt.profiles?.username || 'Anonymous'} • {new Date(prompt.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy size={14} className="mr-1" /> Copy
            </Button>
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
        </CardContent>
        
        <CardFooter className="flex justify-between text-sm text-gray-500 pt-6">
          <div>Length: {prompt.content.length} characters</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PromptDetail;

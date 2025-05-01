
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLikes } from '@/hooks/useLikes';
import { Copy, Heart, Share2, Loader2, Edit, LinkIcon, Tag } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Helmet } from 'react-helmet';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Prompt } from '@/types/prompt';

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { likesCount, isLiked, toggleLike } = useLikes(id || '');
  const [collections, setCollections] = useState<{ id: string, name: string }[]>([]);

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
        const promptData: Prompt = {
          ...data,
          profiles: data.profiles as { username: string },
          llm_settings: data.llm_settings as { model: string; temperature: number },
          is_shared: data.is_shared || false, // Provide default value
          is_public: data.is_public || false  // Provide default value
        };
        
        setPrompt(promptData);

        // Fetch collections this prompt belongs to
        const { data: promptCollections, error: collectionsError } = await supabase
          .from('prompt_collections')
          .select('collection_id')
          .eq('prompt_id', id);

        if (collectionsError) throw collectionsError;

        if (promptCollections && promptCollections.length > 0) {
          const collectionIds = promptCollections.map(pc => pc.collection_id);
          
          const { data: collectionsData, error: collectionsDataError } = await supabase
            .from('collections')
            .select('id, name')
            .in('id', collectionIds);

          if (collectionsDataError) throw collectionsDataError;
          
          if (collectionsData) {
            setCollections(collectionsData);
          }
        }
      } catch (error: any) {
        console.error('Error fetching prompt:', error);
        toast.error("Failed to load prompt: " + error.message);
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
    toast.success("Copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const sharePrompt = () => {
    if (!prompt) return;
    
    const shareUrl = `${window.location.origin}/prompt/${id}`;
    
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
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
        <BackButton />
      </div>
    );
  }

  const isOwner = user && user.id === prompt.user_id;
  const metaDescription = `${prompt.title} - A prompt optimized for ${prompt.llm_settings.model}`;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Helmet>
        <title>{prompt.title} | PromptFlow</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${prompt.title} | PromptFlow`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <BackButton className="mb-4" />
      
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{prompt.title}</CardTitle>
              <CardDescription className="mt-2">
                by {prompt.profiles?.username || 'Anonymous'} • {new Date(prompt.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/edit-prompt/${id}`)}
                  className="flex items-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </Button>
              )}
              <Button 
                variant={copied ? "default" : "outline"} 
                size="sm" 
                onClick={copyToClipboard}
                className="flex items-center gap-1"
              >
                <Copy size={16} /> {copied ? 'Copied' : 'Copy'}
              </Button>
              {prompt.is_shared && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={sharePrompt}
                  className="flex items-center gap-1"
                >
                  <LinkIcon size={16} /> Share
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 flex items-center gap-1 px-3 py-1">
              <Tag size={12} />
              {prompt.llm_settings.model || 'GPT-4'}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 px-3 py-1">
              Temperature: {prompt.llm_settings.temperature || 0.7}
            </Badge>
            
            {collections.length > 0 && collections.map(collection => (
              <HoverCard key={collection.id}>
                <HoverCardTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="bg-green-50 flex items-center gap-1 px-3 py-1 cursor-pointer"
                    onClick={() => navigate(`/collection/${collection.id}`)}
                  >
                    <Tag size={12} />
                    {collection.name}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-2">
                  <p className="text-sm">Click to view this collection</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Prompt</h3>
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-mono text-sm border border-gray-200">
              {prompt.content}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold text-lg mb-3">How to Use This Prompt</h3>
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
              variant={isLiked ? "default" : "outline"} 
              size="sm"
              className={isLiked ? "bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700 flex items-center gap-1" : "flex items-center gap-1"}
              onClick={toggleLike}
            >
              <Heart size={16} className={`${isLiked ? "fill-pink-600" : ""}`} /> 
              {isLiked ? 'Liked' : 'Like'} ({likesCount})
            </Button>
            <Button variant="outline" size="sm" onClick={sharePrompt} className="flex items-center gap-1">
              <Share2 size={16} /> Copy Link
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PromptDetail;

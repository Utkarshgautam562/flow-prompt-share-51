
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, ThumbsUp, Edit, Trash2, Share } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { useLikes } from '@/hooks/useLikes';

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLiked, likesCount, toggleLike } = useLikes(id || '');
  
  useEffect(() => {
    if (!id) return;
    
    fetchPromptDetails();
  }, [id]);
  
  const fetchPromptDetails = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*, profiles:user_id(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        navigate('/not-found');
        return;
      }
      
      setPrompt(data);
      setAuthor(data.profiles);
    } catch (error: any) {
      console.error('Error fetching prompt:', error);
      toast.error('Failed to load prompt details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyPromptToClipboard = () => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt.content);
    toast.success('Prompt copied to clipboard');
  };
  
  const sharePrompt = () => {
    if (!prompt) return;
    
    const shareUrl = `${window.location.origin}/prompt/${prompt.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };
  
  const handleEditPrompt = () => {
    if (!prompt) return;
    navigate(`/edit-prompt/${prompt.id}`);
  };
  
  const handleDeletePrompt = async () => {
    if (!prompt || !window.confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      // First delete all associations with collections
      const { error: deleteAssociationsError } = await supabase
        .from('prompt_collections')
        .delete()
        .eq('prompt_id', prompt.id);
      
      if (deleteAssociationsError) throw deleteAssociationsError;
      
      // Then delete all likes
      const { error: deleteLikesError } = await supabase
        .from('likes')
        .delete()
        .eq('prompt_id', prompt.id);
      
      if (deleteLikesError) throw deleteLikesError;
      
      // Finally delete the prompt
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', prompt.id);
      
      if (error) throw error;
      
      toast.success('Prompt deleted successfully');
      navigate('/my-prompts');
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast.error(`Failed to delete prompt: ${error.message}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-10"></div>
            <div className="h-60 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Prompt Not Found</h1>
            <p className="mt-4 text-gray-500">The prompt you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')} className="mt-6">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract model name from llm_settings
  let modelName = "Unknown";
  try {
    if (prompt.llm_settings && typeof prompt.llm_settings === 'object') {
      modelName = prompt.llm_settings.model || "Unknown";
    }
  } catch (e) {
    console.error("Error parsing llm_settings:", e);
  }
  
  const isAuthor = user && prompt.user_id === user.id;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <Card className="mb-8 overflow-hidden border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 pb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                {modelName}
              </Badge>
              {prompt.is_public && (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                  Public
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold">{prompt.title}</CardTitle>
            {prompt.description && (
              <CardDescription className="text-base mt-2">
                {prompt.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-3">Prompt Content</h3>
              <div className="bg-gray-50 border rounded-lg p-4 md:p-6 relative">
                <pre className="whitespace-pre-wrap text-sm md:text-base font-mono text-gray-800">{prompt.content}</pre>
                <Button 
                  onClick={copyPromptToClipboard}
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2"
                >
                  <Copy size={16} />
                  <span className="ml-1">Copy</span>
                </Button>
              </div>
            </div>
            
            {/* Instructions and additional fields would go here */}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t gap-4">
            <div className="flex items-center gap-2">
              {author && (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${author.username || author.id}`} />
                    <AvatarFallback>{author.username ? author.username.substring(0, 2).toUpperCase() : 'UN'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">
                      {author.username || 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button 
                onClick={toggleLike}
                variant={isLiked ? "secondary" : "outline"} 
                size="sm" 
                className={isLiked ? "gap-2 bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700" : "gap-2"}
              >
                <ThumbsUp size={16} className={`${isLiked ? "fill-pink-600" : ""}`} />
                <span>{likesCount}</span>
              </Button>
              
              <Button 
                onClick={sharePrompt}
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <Share size={16} />
                <span>Share</span>
              </Button>
              
              {isAuthor && (
                <>
                  <Button 
                    onClick={handleEditPrompt}
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </Button>
                  
                  <Button 
                    onClick={handleDeletePrompt}
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
        
        {/* Related prompts section would go here */}
      </div>
    </div>
  );
};

export default PromptDetail;

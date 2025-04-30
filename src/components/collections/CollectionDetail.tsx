
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Pencil, ArrowLeft, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PromptCard from '../PromptCard';
import BackButton from '../BackButton';

interface Prompt {
  id: string;
  title: string;
  content: string;
  llm_settings: {
    model: string;
  };
  user_id: string;
  username?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_shared: boolean;
  share_id: string;
  created_at: string;
  user_id: string;
}

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // First, fetch the collection details
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .single();
        
        if (collectionError) throw collectionError;
        if (!collectionData) {
          toast.error('Collection not found');
          navigate('/my-prompts');
          return;
        }
        
        setCollection(collectionData);
        setIsOwner(user?.id === collectionData.user_id);
        
        // Then, fetch all prompts in this collection
        const { data: promptCollections, error: promptsError } = await supabase
          .from('prompt_collections')
          .select('prompt_id')
          .eq('collection_id', id);
        
        if (promptsError) throw promptsError;
        
        if (promptCollections && promptCollections.length > 0) {
          const promptIds = promptCollections.map(pc => pc.prompt_id);
          
          const { data: promptsData, error: promptDetailsError } = await supabase
            .from('prompts')
            .select('*, profiles:user_id(username)')
            .in('id', promptIds);
          
          if (promptDetailsError) throw promptDetailsError;
          
          // Format the data to match what PromptCard expects
          const formattedPrompts = promptsData?.map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            llm_settings: p.llm_settings,
            user_id: p.user_id,
            username: p.profiles?.username
          }));
          
          setPrompts(formattedPrompts || []);
        } else {
          setPrompts([]);
        }
      } catch (error: any) {
        console.error('Error fetching collection details:', error);
        toast.error(`Failed to load collection: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [id, navigate, user]);

  const handleShare = () => {
    if (!collection) return;
    
    const shareUrl = `${window.location.origin}/collection/${collection.share_id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Collection link copied to clipboard!');
  };

  const handleEdit = () => {
    if (!collection || !isOwner) return;
    
    // TODO: Implement edit functionality or navigate to edit page
    toast.info('Edit collection feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Collection Not Found</h1>
          <p className="mt-4 text-gray-500">The collection you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/my-prompts')} className="mt-4">
            Back to My Prompts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <BackButton to="/my-prompts" />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <FolderOpen size={24} className="text-promptflow-blue" />
            <h1 className="text-2xl font-bold">{collection.name}</h1>
          </div>
          
          {isOwner && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit} 
                className="flex items-center gap-1"
              >
                <Pencil size={16} />
                <span>Edit</span>
              </Button>
              {collection.is_shared && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare} 
                  className="flex items-center gap-1"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </Button>
              )}
            </div>
          )}
        </div>
        
        {collection.description && (
          <p className="mt-2 text-gray-600">{collection.description}</p>
        )}
      </div>
      
      {prompts.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-10 text-center">
          <h2 className="text-xl text-gray-600">No prompts in this collection</h2>
          {isOwner && (
            <p className="mt-2 text-gray-500">
              Add prompts to this collection from the My Prompts page.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.content}
              llm={prompt.llm_settings?.model || 'Unknown'}
              useCase="General"
              upvotes={0}
              author={prompt.username || "User"}
              showViewButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;

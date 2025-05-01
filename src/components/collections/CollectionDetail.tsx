
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FolderOpen, Share2, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import PromptCard from '../PromptCard';
import { Button } from '@/components/ui/button';

interface Prompt {
  id: string;
  title: string;
  content: string;
  llm_settings: { model: string };
  user_id: string;
  username?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_shared: boolean;
  share_id: string;
}

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch collection
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .single();
        
        if (collectionError) throw collectionError;
        
        setCollection(collectionData);
        
        // Fetch prompts in this collection
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
          
          // Format the data
          const formattedPrompts = promptsData?.map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            llm_settings: typeof p.llm_settings === 'object' ? 
              { model: p.llm_settings?.model || 'Unknown' } : 
              { model: 'Unknown' },
            user_id: p.user_id,
            username: p.profiles?.username
          }));
          
          setPrompts(formattedPrompts || []);
        } else {
          setPrompts([]);
        }
      } catch (error: any) {
        console.error('Error fetching collection:', error);
        toast.error('Failed to load collection');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  const handleShare = async () => {
    if (!collection) return;
    
    try {
      // Toggle sharing status
      const newIsShared = !collection.is_shared;
      
      const { error } = await supabase
        .from('collections')
        .update({ is_shared: newIsShared })
        .eq('id', collection.id);
      
      if (error) throw error;
      
      // Update local state
      setCollection({
        ...collection,
        is_shared: newIsShared
      });
      
      if (newIsShared) {
        // Copy shareable link
        const shareUrl = `${window.location.origin}/collection/shared/${collection.share_id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Collection is now public and link copied to clipboard!');
      } else {
        toast.success('Collection is now private');
      }
    } catch (error: any) {
      console.error('Error updating collection sharing:', error);
      toast.error(`Failed to update sharing: ${error.message}`);
    }
  };

  const handleEdit = () => {
    // Implement edit functionality
    toast.info('Edit functionality coming soon');
  };

  const handleDelete = async () => {
    if (!collection || !window.confirm('Are you sure you want to delete this collection?')) return;
    
    try {
      // First delete all prompt_collection entries
      const { error: deletePromptCollectionsError } = await supabase
        .from('prompt_collections')
        .delete()
        .eq('collection_id', collection.id);
      
      if (deletePromptCollectionsError) throw deletePromptCollectionsError;
      
      // Then delete the collection
      const { error: deleteCollectionError } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id);
      
      if (deleteCollectionError) throw deleteCollectionError;
      
      toast.success('Collection deleted successfully');
      navigate('/my-prompts');
    } catch (error: any) {
      console.error('Error deleting collection:', error);
      toast.error(`Failed to delete collection: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading collection...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Collection Not Found</h1>
        <p className="mt-4 text-gray-500">The collection you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          {collection.is_shared && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Public</span>
          )}
        </div>
        
        {collection.description && (
          <p className="text-gray-600 mb-4">{collection.description}</p>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleShare} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Share2 size={16} />
            {collection.is_shared ? 'Copy Share Link' : 'Share Collection'}
          </Button>
          
          <Button 
            onClick={handleEdit}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Edit size={16} />
            Edit
          </Button>
          
          <Button 
            onClick={handleDelete}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash size={16} />
            Delete
          </Button>
        </div>
      </div>
      
      {prompts.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-10 text-center">
          <h2 className="text-xl text-gray-600">No prompts in this collection</h2>
          <p className="mt-2 text-gray-500">
            Add prompts to this collection when creating or editing prompts.
          </p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;

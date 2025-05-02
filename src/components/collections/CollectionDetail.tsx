
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PromptCard from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompt';
import { Json } from '@/integrations/supabase/types';

interface CollectionDetailProps {
  collectionId?: string;
  shareId?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_shared: boolean;
  user_id: string;
}

const CollectionDetail = ({ collectionId, shareId }: CollectionDetailProps) => {
  const params = useParams();
  const { user } = useAuth();
  const id = collectionId || params.id;
  const sharedId = shareId || params.shareId;
  const queryClient = useQueryClient();
  
  // Fetch collection details
  const { 
    data: collection,
    isLoading: collectionLoading,
    error: collectionError,
  } = useQuery({
    queryKey: ['collection', id, sharedId],
    queryFn: async () => {
      let query;
      
      if (sharedId) {
        query = supabase
          .from('collections')
          .select('*')
          .eq('share_id', sharedId)
          .eq('is_shared', true)
          .single();
      } else if (id) {
        query = supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .maybeSingle();
      } else {
        throw new Error('No collection ID or share ID provided');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      if (!data) throw new Error('Collection not found');
      
      return data as Collection;
    },
    enabled: !!(id || sharedId),
    meta: {
      onError: (error: Error) => {
        console.error('Collection loading error:', error);
        toast.error('Error loading collection data');
      }
    }
  });
  
  // Subscribe to prompt_collections changes to automatically update the UI
  useEffect(() => {
    if (!collection?.id) return;
    
    // Set up a realtime subscription for changes to the prompt_collections table
    const channel = supabase
      .channel('collection-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prompt_collections',
          filter: `collection_id=eq.${collection.id}`,
        },
        (payload) => {
          console.log('Prompt collection change detected:', payload);
          // Invalidate and refetch the collection prompts query
          queryClient.invalidateQueries({ queryKey: ['collection-prompts', collection.id] });
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts or collection changes
    return () => {
      supabase.removeChannel(channel);
    };
  }, [collection?.id, queryClient]);
  
  // Fetch prompts in this collection
  const { 
    data: promptsData = [],
    isLoading: promptsLoading,
    error: promptsError,
  } = useQuery({
    queryKey: ['collection-prompts', collection?.id],
    queryFn: async () => {
      if (!collection?.id) return [];
      
      // First get the prompt IDs from the junction table
      const { data: promptConnections, error: connectionError } = await supabase
        .from('prompt_collections')
        .select('prompt_id')
        .eq('collection_id', collection.id);
      
      if (connectionError) throw connectionError;
      if (!promptConnections?.length) return [];
      
      const promptIds = promptConnections.map(conn => conn.prompt_id);
      
      // Then fetch the actual prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*, profiles:user_id(username)')
        .in('id', promptIds);
      
      if (promptsError) throw promptsError;
      
      return promptsData || [];
    },
    enabled: !!collection?.id,
    meta: {
      onError: (error: Error) => {
        console.error('Error loading collection prompts:', error);
        toast.error('Error loading prompts in this collection');
      }
    }
  });

  // Transform the raw Supabase prompts data to match our Prompt interface
  const prompts = promptsData.map((item: any) => {
    // Parse llm_settings if needed and ensure it has the expected structure
    let llmSettings: { model: string; temperature?: number } = { model: 'Unknown' };
    
    if (item.llm_settings) {
      // Handle different possible types of llm_settings
      if (typeof item.llm_settings === 'string') {
        try {
          // If it's a string, try to parse it as JSON
          const parsed = JSON.parse(item.llm_settings);
          llmSettings = { 
            model: parsed.model || 'Unknown',
            temperature: parsed.temperature
          };
        } catch (e) {
          console.error('Error parsing llm_settings string:', e);
        }
      } else if (typeof item.llm_settings === 'object') {
        // If it's already an object, ensure it has the model property
        const settings = item.llm_settings as Json;
        if (typeof settings === 'object' && settings !== null && !Array.isArray(settings) && 'model' in settings) {
          llmSettings = { 
            model: String(settings.model),
            temperature: typeof settings.temperature === 'number' ? settings.temperature : undefined
          };
        }
      }
    }

    // Return a properly typed Prompt object
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      description: item.content || '', // Use content as description
      llm_settings: llmSettings,
      user_id: item.user_id || '',
      created_at: item.created_at || new Date().toISOString(),
      is_public: item.is_public || false,
      is_shared: false,
      profiles: item.profiles as { username: string } | undefined
    } as Prompt;
  });
  
  const isLoading = collectionLoading || promptsLoading;
  const error = collectionError || promptsError;
  
  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow animate-fade-in">
        <h2 className="text-xl font-semibold text-red-500 mb-4">Error Loading Collection</h2>
        <p className="text-gray-600 mb-4">We encountered a problem loading this collection.</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="hover:bg-gray-100 transition-colors"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (!collection) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow animate-fade-in">
        <h2 className="text-xl font-semibold mb-4">Collection Not Found</h2>
        <p className="text-gray-600">This collection doesn't exist or you don't have permission to view it.</p>
      </div>
    );
  }
  
  const isOwner = user && user.id === collection.user_id;
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-gray-600">{collection.description}</p>
        )}
      </div>
      
      {prompts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">No Prompts in This Collection</h2>
          <p className="text-gray-500">
            {isOwner 
              ? "Add prompts to this collection when creating or editing a prompt." 
              : "This collection is currently empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.content}
              llm={prompt.llm_settings.model}
              useCase="General"
              upvotes={0}
              author={prompt.profiles?.username || "Anonymous"}
              showViewButton={true}
              createdAt={prompt.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;

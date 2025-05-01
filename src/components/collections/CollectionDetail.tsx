
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import PromptCard from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompt';

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
  });
  
  // Fetch prompts in this collection
  const { 
    data: prompts = [],
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
  });
  
  const isLoading = collectionLoading || promptsLoading;
  const error = collectionError || promptsError;
  
  if (error) {
    toast.error('Error loading collection data');
    console.error('Collection loading error:', error);
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold text-red-500 mb-4">Error Loading Collection</h2>
        <p className="text-gray-600 mb-4">We encountered a problem loading this collection.</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (!collection) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Collection Not Found</h2>
        <p className="text-gray-600">This collection doesn't exist or you don't have permission to view it.</p>
      </div>
    );
  }
  
  const isOwner = user && user.id === collection.user_id;
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-gray-600">{collection.description}</p>
        )}
      </div>
      
      {prompts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">No Prompts in This Collection</h2>
          <p className="text-gray-500">
            {isOwner 
              ? "Add prompts to this collection when creating or editing a prompt." 
              : "This collection is currently empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt: any) => {
            let modelName = "Unknown";
            try {
              if (prompt.llm_settings && typeof prompt.llm_settings === 'object') {
                const settings = prompt.llm_settings as { model?: string };
                modelName = settings.model || "Unknown";
              }
            } catch (e) {
              console.error("Error parsing llm_settings:", e);
            }
            
            return (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                description={prompt.content}
                llm={modelName}
                useCase="General"
                upvotes={0}
                author={prompt.profiles?.username || "Anonymous"}
                showViewButton={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;

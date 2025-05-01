import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FolderOpen, LinkIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';
import PromptCard from '../PromptCard';
import { Button } from '@/components/ui/button';
import BackButton from '../BackButton';
import Navbar from '../Navbar';
import { Json } from '@/integrations/supabase/types';
import { Helmet } from 'react-helmet';

interface Prompt {
  id: string;
  title: string;
  content: string;
  llm_settings: Json;
  user_id: string;
  username?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
}

const SharedCollectionView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSharedCollection = async () => {
      if (!shareId) return;
      
      try {
        setIsLoading(true);
        
        // First, fetch the collection details
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('share_id', shareId)
          .eq('is_shared', true)
          .single();
        
        if (collectionError) throw collectionError;
        if (!collectionData) {
          toast.error('Collection not found or is private');
          navigate('/');
          return;
        }
        
        setCollection(collectionData);
        
        // Then, fetch all prompts in this collection that are public
        const { data: promptCollections, error: promptsError } = await supabase
          .from('prompt_collections')
          .select('prompt_id')
          .eq('collection_id', collectionData.id);
        
        if (promptsError) throw promptsError;
        
        if (promptCollections && promptCollections.length > 0) {
          const promptIds = promptCollections.map(pc => pc.prompt_id);
          
          const { data: promptsData, error: promptDetailsError } = await supabase
            .from('prompts')
            .select('*, profiles:user_id(username)')
            .in('id', promptIds)
            .eq('is_public', true);
          
          if (promptDetailsError) throw promptDetailsError;
          
          // Format the data with proper type handling
          const formattedPrompts = promptsData?.map(p => {
            // Extract model from llm_settings safely
            let modelName = "Unknown";
            
            if (p.llm_settings) {
              // Handle llm_settings based on its structure
              const settings = p.llm_settings;
              
              if (typeof settings === 'object' && settings !== null && !Array.isArray(settings)) {
                if ('model' in settings) {
                  modelName = String(settings.model);
                }
              }
            }
            
            return {
              id: p.id,
              title: p.title,
              content: p.content,
              llm_settings: p.llm_settings,
              user_id: p.user_id,
              username: p.profiles?.username,
              modelName
            };
          });
          
          setPrompts(formattedPrompts || []);
        } else {
          setPrompts([]);
        }
      } catch (error: any) {
        console.error('Error fetching shared collection:', error);
        toast.error(`Failed to load collection: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedCollection();
  }, [shareId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Collection Not Found</h1>
            <p className="mt-4 text-gray-500">The collection you're looking for doesn't exist, is private, or has been removed.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare Open Graph meta description
  const metaDescription = collection.description || `A collection of prompts: ${collection.name}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{collection.name} | PromptFlow</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${collection.name} | PromptFlow`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <BackButton />
          
          <div className="flex items-center gap-3 mt-4 mb-2">
            <FolderOpen size={24} className="text-promptflow-blue" />
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
              <LinkIcon size={12} />
              Shared Collection
            </span>
          </div>
          
          {collection.description && (
            <p className="mt-2 text-gray-600 mb-6">{collection.description}</p>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Collection link copied to clipboard!");
            }}
          >
            <Copy size={16} />
            Copy Collection Link
          </Button>
        </div>
        
        {prompts.length === 0 ? (
          <div className="bg-gray-50 border rounded-lg p-10 text-center">
            <h2 className="text-xl text-gray-600">No public prompts in this collection</h2>
            <p className="mt-2 text-gray-500">
              The collection owner hasn't shared any public prompts yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => {
              // Extract model from llm_settings for rendering
              let modelName = "Unknown";
              
              if (prompt.llm_settings) {
                // Handle llm_settings based on its structure
                const settings = prompt.llm_settings;
                
                if (typeof settings === 'object' && settings !== null && !Array.isArray(settings)) {
                  if ('model' in settings) {
                    modelName = String(settings.model);
                  }
                }
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
                  author={prompt.username || "User"}
                  showViewButton={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedCollectionView;

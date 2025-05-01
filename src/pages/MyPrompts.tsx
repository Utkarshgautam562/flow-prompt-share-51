
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import PromptCard from '@/components/PromptCard';
import CollectionsList from '@/components/collections/CollectionsList';
import BackButton from '@/components/BackButton';
import CollectionDetail from '@/components/collections/CollectionDetail';
import AnonymousUserView from '@/components/profile/AnonymousUserView';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { Prompt } from '@/types/prompt';

const MyPrompts = () => {
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  const [activeTab, setActiveTab] = useState("prompts");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Use React Query for fetching prompts with caching and error handling
  const { 
    data: prompts = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['prompts', user?.id],
    queryFn: async () => {
      if (isAnonymous || !user) return [];
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    },
    // Only run this query if user is logged in
    enabled: !!user && !isAnonymous,
    // Cache for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Retry 3 times before considering an error
    retry: 3,
    // Show error toast automatically
    onError: (err: any) => {
      console.error('Error fetching prompts:', err);
      toast.error('Failed to load your prompts');
    }
  });

  const handleCreatePrompt = () => {
    navigate('/create-prompt');
  };

  const handleCollectionClick = (id: string) => {
    setSelectedCollection(id);
    setActiveTab("collections");
  };

  const handleBackToCollections = () => {
    setSelectedCollection(null);
  };

  // Show login view for anonymous users
  if (isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <BackButton to="/" />
          </div>
          <AnonymousUserView />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="mb-2">
              <BackButton to="/" />
            </div>
            <h1 className="text-2xl font-bold">My Workspace</h1>
            <p className="text-gray-500">Manage your prompts and collections</p>
          </div>
          <Button
            onClick={handleCreatePrompt}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create Prompt</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="prompts" className="flex-1 md:flex-none">My Prompts</TabsTrigger>
            <TabsTrigger value="collections" className="flex-1 md:flex-none">Collections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompts">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-60 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-2 text-red-500">Error loading prompts</h2>
                <p className="text-gray-500 mb-6">
                  We encountered a problem loading your prompts
                </p>
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">You haven't created any prompts yet</h2>
                <p className="text-gray-500 mb-6">
                  Create your first prompt to start building your collection
                </p>
                <Button 
                  onClick={handleCreatePrompt}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
                >
                  Create Your First Prompt
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt: Prompt) => {
                  // Extract model from llm_settings safely
                  let modelName = "Unknown";
                  try {
                    if (prompt.llm_settings && typeof prompt.llm_settings === 'object') {
                      // Type assertion for safety
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
                      author="You"
                      showViewButton={true}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="collections">
            {selectedCollection ? (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={handleBackToCollections}
                  className="mb-4 flex items-center gap-1"
                >
                  ← Back to Collections
                </Button>
                <CollectionDetail collectionId={selectedCollection} />
              </div>
            ) : (
              <CollectionsList onCollectionClick={handleCollectionClick} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyPrompts;

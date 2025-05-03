import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, FolderOpen } from 'lucide-react';
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
import { Json } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';

const MyPrompts = () => {
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  const [activeTab, setActiveTab] = useState("prompts");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const isMobile = useIsMobile();

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
      
      // Process the data to ensure it matches the Prompt interface
      return (data || []).map(item => {
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
          description: item.content || '', // Use content as description if needed
          llm_settings: llmSettings,
          user_id: item.user_id || '',
          created_at: item.created_at || new Date().toISOString(),
          is_public: item.is_public || false,
          is_shared: false
        } as Prompt;
      });
    },
    // Only run this query if user is logged in
    enabled: !!user && !isAnonymous,
    // Cache for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Retry 3 times before considering an error
    retry: 3,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load your prompts');
      }
    }
  });

  // Properly handle errors from React Query
  useEffect(() => {
    if (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to load your prompts');
    }
  }, [error]);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="mb-2">
              <BackButton to="/" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">My Workspace</h1>
            <p className="text-gray-500 mt-1">Manage your prompts and collections</p>
          </div>
          <Button
            onClick={handleCreatePrompt}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 mt-4 md:mt-0"
          >
            <Plus size={16} />
            <span>Create Prompt</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full md:w-auto grid grid-cols-2 rounded-xl p-1 shadow-md">
            <TabsTrigger 
              value="prompts" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <BookOpen size={16} />
              <span className={isMobile ? "hidden" : "inline"}>My Prompts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="collections" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <FolderOpen size={16} />
              <span className={isMobile ? "hidden" : "inline"}>Collections</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompts" className="focus:outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-60 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center p-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-2 text-red-500">Error loading prompts</h2>
                <p className="text-gray-500 mb-6">
                  We encountered a problem loading your prompts
                </p>
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="hover:bg-gray-100 transition-colors"
                >
                  Try Again
                </Button>
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">You haven't created any prompts yet</h2>
                <p className="text-gray-500 mb-6">
                  Create your first prompt to start building your collection
                </p>
                <Button 
                  onClick={handleCreatePrompt}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Create Your First Prompt
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt: Prompt) => (
                  <PromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.content}
                    llm={prompt.llm_settings.model}
                    useCase="General"
                    upvotes={0}
                    author="You"
                    showViewButton={true}
                    isPublic={prompt.is_public}
                    createdAt={prompt.created_at}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="collections" className="focus:outline-none">
            {selectedCollection ? (
              <div className="animate-fade-in">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToCollections}
                  className="mb-4 flex items-center gap-1 hover:bg-gray-100 transition-colors"
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

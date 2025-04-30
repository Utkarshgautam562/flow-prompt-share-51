
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import PromptCard from '@/components/PromptCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  is_public?: boolean;
  user_id?: string;
  search_vector?: unknown;
  likes_count?: number;
}

const USE_CASES = {
  'coding': 'Coding',
  'writing': 'Writing',
  'marketing': 'Marketing',
  'research': 'Research',
  'analysis': 'Analysis'
};

const Explore = () => {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = async (query: string = '', filters: SearchFilters = {}, category: string = 'all') => {
    try {
      setIsSearching(true);
      setError(null);
      
      // Start building query
      let queryBuilder = supabase
        .from('prompts')
        .select(`
          *,
          profiles(username),
          likes:likes(count)
        `)
        .eq('is_public', true);
      
      // Apply search query
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }
      
      // Apply model filter
      if (filters.llmModel && filters.llmModel !== "All Models") {
        queryBuilder = queryBuilder.filter('llm_settings->model', 'eq', filters.llmModel);
      }
      
      // Apply category filter from tabs
      if (category !== 'all') {
        // This assumes you have a tag or category field in your prompts table
        // If not, you'll need to modify this based on your actual schema
        queryBuilder = queryBuilder.ilike('title', `%${category}%`);
      }
      
      // Apply sorting
      if (filters.sortBy === 'recent') {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      } else if (filters.sortBy === 'popular') {
        // We'll sort by likeCounts after we get the data
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      } else {
        // Default sort by recency
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      
      // Transform data to handle nested profile info
      if (data) {
        const formattedData: Prompt[] = data.map(item => ({
          ...item,
          profiles: item.profiles as { username: string },
          llm_settings: item.llm_settings as { model: string; temperature: number },
          likes_count: (item.likes as any[])[0]?.count || 0
        }));
        
        // Sort by popularity if needed
        if (filters.sortBy === 'popular') {
          formattedData.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        }
        
        setPrompts(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      setError('Failed to load prompts. Please try again.');
      toast({
        variant: "destructive",
        title: "Failed to load prompts",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  useEffect(() => {
    fetchPrompts('', {}, activeTab);
  }, [activeTab]);
  
  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    fetchPrompts(query, filters, activeTab);
  };

  const handlePromptClick = (id: string) => {
    navigate(`/prompt/${id}`);
  };

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Prompt content has been copied to your clipboard.",
    });
  };

  const getUseCase = (prompt: Prompt): string => {
    // Mock function to determine use case based on content
    // In a real app, this would be a field in the database
    const content = prompt.content.toLowerCase();
    
    if (content.includes('code') || content.includes('function') || content.includes('programming')) {
      return 'Coding';
    } else if (content.includes('market') || content.includes('customer') || content.includes('brand')) {
      return 'Marketing';
    } else if (content.includes('research') || content.includes('analyze') || content.includes('study')) {
      return 'Research';
    } else if (content.includes('write') || content.includes('story') || content.includes('blog')) {
      return 'Writing';
    }
    
    return 'General';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore Prompts</h1>
        <p className="text-gray-600 mb-6">
          Discover and use public prompts created by the PromptFlow community
        </p>
        
        <SearchBar onSearch={handleSearch} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Prompts</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
          <TabsTrigger value="writing">Writing</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
      
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-gray-500" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No prompts found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No results match "${searchQuery}"`
                  : "There are no public prompts available yet."}
              </p>
              
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSearchFilters({});
                  fetchPrompts('', {}, 'all');
                }}
              >
                Clear search and filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.content}
                  llm={prompt.llm_settings?.model || "GPT-4"}
                  useCase={getUseCase(prompt)}
                  upvotes={prompt.likes_count || 0}
                  author={prompt.profiles?.username || 'Anonymous'}
                  onCopy={handleCopyPrompt}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;

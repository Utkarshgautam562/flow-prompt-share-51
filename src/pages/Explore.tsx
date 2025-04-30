
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import PromptCard from '@/components/PromptCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import BackButton from '@/components/BackButton';

interface Prompt {
  id: string;
  title: string;
  content: string;
  llm_settings: {
    model: string;
  };
  user_id: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse search parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialModel = queryParams.get('model') || 'All Models';
  const initialUseCase = queryParams.get('useCase') || 'All Use Cases';
  const initialSortBy = queryParams.get('sort') || 'relevance';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    llmModel: initialModel,
    useCase: initialUseCase,
    sortBy: initialSortBy
  });

  // Function to fetch prompts from Supabase
  const fetchPrompts = async ({ query, filters }: { query: string, filters: SearchFilters }) => {
    try {
      // Start building the query
      let promptQuery = supabase
        .from('prompts')
        .select('*, profiles:user_id(username)')
        .eq('is_public', true);

      // Apply search query if provided
      if (query) {
        promptQuery = promptQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }

      // Apply model filter if specified
      if (filters.llmModel && filters.llmModel !== 'All Models') {
        promptQuery = promptQuery.contains('llm_settings', { model: filters.llmModel.toLowerCase() });
      }

      // Apply use case filter if specified
      if (filters.useCase && filters.useCase !== 'All Use Cases') {
        // Assuming use cases are stored in a tag-like format or in a specific field
        // This will need to be adjusted based on your actual schema
        promptQuery = promptQuery.ilike('content', `%${filters.useCase}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'recent':
          promptQuery = promptQuery.order('created_at', { ascending: false });
          break;
        case 'popular':
          // If you have a way to track popularity (e.g., likes count)
          // You would add that sorting here
          promptQuery = promptQuery.order('created_at', { ascending: false }); // Fallback to recent
          break;
        default: // relevance or other
          // For relevance, if you have a way to calculate it, add it here
          promptQuery = promptQuery.order('created_at', { ascending: false }); // Fallback to recent
      }

      const { data, error } = await promptQuery;

      if (error) throw error;

      // Process the data to ensure it matches the Prompt interface
      return (data || []).map(item => {
        // Parse llm_settings if needed and ensure it has the expected structure
        let llmSettings: { model: string } = { model: 'Unknown' };
        
        if (item.llm_settings) {
          // Handle different possible types of llm_settings
          if (typeof item.llm_settings === 'string') {
            try {
              // If it's a string, try to parse it as JSON
              const parsed = JSON.parse(item.llm_settings);
              llmSettings = { model: parsed.model || 'Unknown' };
            } catch (e) {
              console.error('Error parsing llm_settings string:', e);
            }
          } else if (typeof item.llm_settings === 'object') {
            // If it's already an object, ensure it has the model property
            const settings = item.llm_settings as Json;
            if (typeof settings === 'object' && settings !== null && !Array.isArray(settings) && 'model' in settings) {
              llmSettings = { model: String(settings.model) };
            }
          }
        }

        // Return a properly typed Prompt object
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          llm_settings: llmSettings,
          user_id: item.user_id || '',
          created_at: item.created_at || new Date().toISOString(),
          profiles: item.profiles as { username: string } | undefined
        } satisfies Prompt;
      });
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  };

  // Use React Query to handle the data fetching
  const { data: prompts, isLoading, isError, refetch } = useQuery({
    queryKey: ['prompts', searchQuery, filters],
    queryFn: () => fetchPrompts({ query: searchQuery, filters }),
    staleTime: 60000, // 1 minute
  });

  // Handle search
  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    setSearchQuery(query);
    setFilters(searchFilters);
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (searchFilters.llmModel !== 'All Models') params.set('model', searchFilters.llmModel);
    if (searchFilters.useCase !== 'All Use Cases') params.set('useCase', searchFilters.useCase);
    if (searchFilters.sortBy !== 'relevance') params.set('sort', searchFilters.sortBy);
    
    navigate(`/explore?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    // Refetch when search or filters change
    refetch();
  }, [searchQuery, filters, refetch]);

  if (isError) {
    toast.error('Failed to load prompts. Please try again.');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Explore Prompts</h1>
              <BackButton to="/" />
            </div>
            <p className="text-gray-500">
              Discover and use public prompts from the community
            </p>
          </div>
          
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search for prompts..."
            initialQuery={searchQuery}
            initialFilters={filters}
          />
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : prompts && prompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.content}
                  llm={prompt.llm_settings?.model || 'Unknown'}
                  useCase="General" // This would come from tags in a real implementation
                  upvotes={0} // This would come from likes count in a real implementation
                  author={prompt.profiles?.username || 'Anonymous'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No prompts found matching your criteria.</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;

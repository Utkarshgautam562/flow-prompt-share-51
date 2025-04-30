
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import PromptCard from '@/components/PromptCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    llmModel: 'All Models',
    useCase: 'All Use Cases',
    sortBy: 'relevance'
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
        // Parse llm_settings if it's a string
        let llmSettings = item.llm_settings;
        if (typeof llmSettings === 'string') {
          try {
            llmSettings = JSON.parse(llmSettings);
          } catch (e) {
            console.error('Error parsing llm_settings', e);
            llmSettings = { model: 'Unknown' };
          }
        } else if (!llmSettings || typeof llmSettings !== 'object') {
          llmSettings = { model: 'Unknown' };
        }

        return {
          ...item,
          llm_settings: llmSettings
        } as Prompt;
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
            <h1 className="text-3xl font-bold tracking-tight">Explore Prompts</h1>
            <p className="text-gray-500">
              Discover and use public prompts from the community
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} placeholder="Search for prompts..." />
          
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

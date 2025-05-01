
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/types/prompt';
import { SearchFilters } from '@/components/SearchBar';
import { Json } from '@/integrations/supabase/types';

export const usePromptSearch = (initialQuery: string = '', initialFilters: SearchFilters = {
  llmModel: 'All Models',
  useCase: 'All Use Cases',
  sortBy: 'relevance'
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

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
          is_public: item.is_public || false,
          is_shared: false, // Provide default value for is_shared since it doesn't exist in the database yet
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

  return {
    prompts,
    isLoading,
    isError,
    refetch,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters
  };
};

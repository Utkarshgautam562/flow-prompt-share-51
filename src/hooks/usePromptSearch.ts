
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/types/prompt';
import { SearchFilters } from '@/components/SearchBar';
import { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

// Define a Collection type for consistency
export interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  is_shared: boolean | null;
  share_id: string | null;
  profiles?: {
    username: string | null;
  } | null;
  type: 'collection'; // To differentiate from prompts
}

export const usePromptSearch = (initialQuery: string = '', initialFilters: SearchFilters = {
  llmModel: 'All Models',
  useCase: 'All Use Cases',
  sortBy: 'relevance',
  visibility: 'All',
  contentType: 'All'
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const { user } = useAuth();

  // Function to fetch prompts and collections from Supabase
  const fetchPromptsAndCollections = async ({ query, filters }: { query: string, filters: SearchFilters }) => {
    try {
      // Only fetch collections if contentType is 'All' or 'Collections'
      let collections: Collection[] = [];
      if (filters.contentType === 'All' || filters.contentType === 'Collections') {
        // Start building the query for collections
        let collectionsQuery = supabase
          .from('collections')
          .select('*, profiles:user_id(username)');

        // Apply visibility filter for collections
        if (filters.visibility === 'Public') {
          collectionsQuery = collectionsQuery.eq('is_shared', true);
        } else if (filters.visibility === 'Private') {
          // For private collections, ensure user is authenticated and only show their private collections
          if (!user) collections = []; // Return empty array if user is not authenticated
          collectionsQuery = collectionsQuery.eq('is_shared', false).eq('user_id', user?.id);
        } else {
          // For 'All', show public collections and user's private collections if authenticated
          if (user) {
            collectionsQuery = collectionsQuery.or(`is_shared.eq.true,user_id.eq.${user.id}`);
          } else {
            collectionsQuery = collectionsQuery.eq('is_shared', true);
          }
        }

        // Apply search query if provided
        if (query) {
          if (query.length > 3) {
            collectionsQuery = collectionsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
          } else {
            collectionsQuery = collectionsQuery.or(`name.ilike.${query}%,description.ilike.${query}%`);
          }
        }

        // Apply sorting for collections
        switch (filters.sortBy) {
          case 'recent':
            collectionsQuery = collectionsQuery.order('created_at', { ascending: false });
            break;
          default: // relevance or other
            collectionsQuery = collectionsQuery.order('created_at', { ascending: false });
        }

        const { data: collectionsData, error: collectionsError } = await collectionsQuery;

        if (collectionsError) throw collectionsError;

        // Process collections data with proper type assertion
        collections = collectionsData ? collectionsData.map(item => {
          // Handle the profiles data correctly
          let profileData = null;
          // Ensure item.profiles exists before checking properties on it
          if (item.profiles && typeof item.profiles === 'object' && item.profiles !== null && !('error' in item.profiles)) {
            profileData = item.profiles;
          }
          
          return {
            ...item,
            profiles: profileData,
            type: 'collection' as const
          };
        }) : [];
      }

      // Only fetch prompts if contentType is 'All' or 'Prompts'
      let prompts: (Prompt & { type: 'prompt' })[] = [];
      if (filters.contentType === 'All' || filters.contentType === 'Prompts') {
        // Start building the query for prompts
        let promptQuery = supabase
          .from('prompts')
          .select('*, profiles:user_id(username)');

        // Apply visibility filter for prompts
        if (filters.visibility === 'Public') {
          promptQuery = promptQuery.eq('is_public', true);
        } else if (filters.visibility === 'Private') {
          // For private prompts, ensure user is authenticated and only show their private prompts
          if (!user) prompts = []; // Return empty array if user is not authenticated
          promptQuery = promptQuery.eq('is_public', false).eq('user_id', user?.id);
        } else {
          // For 'All', show public prompts and user's private prompts if authenticated
          if (user) {
            promptQuery = promptQuery.or(`is_public.eq.true,user_id.eq.${user.id}`);
          } else {
            promptQuery = promptQuery.eq('is_public', true);
          }
        }

        // Apply search query if provided
        if (query) {
          if (query.length > 3) {
            promptQuery = promptQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,description.ilike.%${query}%`);
          } else {
            promptQuery = promptQuery.or(`title.ilike.${query}%,content.ilike.${query}%,description.ilike.${query}%`);
          }
        }

        // Apply model filter if specified
        if (filters.llmModel && filters.llmModel !== 'All Models') {
          promptQuery = promptQuery.contains('llm_settings', { model: filters.llmModel.toLowerCase() });
        }

        // Apply use case filter if specified
        if (filters.useCase && filters.useCase !== 'All Use Cases') {
          promptQuery = promptQuery.ilike('content', `%${filters.useCase}%`);
        }

        // Apply sorting
        switch (filters.sortBy) {
          case 'recent':
            promptQuery = promptQuery.order('created_at', { ascending: false });
            break;
          case 'popular':
            promptQuery = promptQuery.order('created_at', { ascending: false }); // Fallback to recent
            break;
          default: // relevance or other
            promptQuery = promptQuery.order('created_at', { ascending: false });
        }

        const { data, error } = await promptQuery;

        if (error) throw error;

        // Process prompts data
        prompts = (data || []).map(item => {
          // Parse llm_settings if needed
          let llmSettings: { model: string; temperature?: number } = { model: 'Unknown' };
          
          if (item.llm_settings) {
            if (typeof item.llm_settings === 'string') {
              try {
                const parsed = JSON.parse(item.llm_settings);
                llmSettings = { model: parsed.model || 'Unknown', temperature: parsed.temperature };
              } catch (e) {
                console.error('Error parsing llm_settings string:', e);
              }
            } else if (typeof item.llm_settings === 'object') {
              const settings = item.llm_settings as Json;
              if (typeof settings === 'object' && settings !== null && !Array.isArray(settings) && 'model' in settings) {
                llmSettings = { 
                  model: String(settings.model), 
                  temperature: typeof settings.temperature === 'number' ? settings.temperature : undefined 
                };
              }
            }
          }

          // Handle the profiles data correctly
          let profileData = null;
          // Ensure item.profiles exists before checking properties on it
          if (item.profiles && typeof item.profiles === 'object' && item.profiles !== null && !('error' in item.profiles)) {
            profileData = item.profiles;
          }

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            description: item.description || '',
            llm_settings: llmSettings,
            user_id: item.user_id || '',
            created_at: item.created_at || new Date().toISOString(),
            is_public: item.is_public || false,
            is_shared: false, // Default value since it's not in the database
            profiles: profileData,
            type: 'prompt' as const
          };
        });
      }

      // Combine and return both prompts and collections
      return [...prompts, ...collections] as (Prompt & { type: 'prompt' } | Collection)[];
    } catch (error) {
      console.error('Error fetching prompts and collections:', error);
      throw error;
    }
  };

  // Use React Query to handle the data fetching with improved caching strategy
  const { data: results, isLoading, isError, refetch } = useQuery({
    queryKey: ['prompts-collections', searchQuery, filters, user?.id],
    queryFn: () => fetchPromptsAndCollections({ query: searchQuery, filters }),
    staleTime: 300000, // Increase to 5 minutes for better caching
    gcTime: 600000, // This replaces cacheTime in newer React Query versions
  });

  return {
    results,
    prompts: results?.filter(item => item.type === 'prompt') as (Prompt & { type: 'prompt' })[],
    collections: results?.filter(item => item.type === 'collection') as Collection[],
    isLoading,
    isError,
    refetch,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters
  };
};

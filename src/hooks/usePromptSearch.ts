
import { useQuery } from '@tanstack/react-query';
import { Prompt } from '@/types/prompt';
import { Collection } from '@/types/collection';
import { SearchFilters } from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchFilters } from './useSearchFilters';
import { fetchPromptsAndCollections } from '@/utils/searchUtils';

// Use 'export type' for re-exporting types when isolatedModules is enabled
export type { Collection } from '@/types/collection';

export const usePromptSearch = (initialQuery: string = '', initialFilters: SearchFilters = {
  llmModel: 'All Models',
  useCase: 'All Use Cases',
  sortBy: 'relevance',
  visibility: 'All',
  contentType: 'All'
}) => {
  const { searchQuery, filters, setSearchQuery, setFilters } = useSearchFilters(initialQuery, initialFilters);
  const { user } = useAuth();

  // Use React Query to handle the data fetching with improved caching strategy
  const { data: results, isLoading, isError, refetch } = useQuery({
    queryKey: ['prompts-collections', searchQuery, filters, user?.id],
    queryFn: () => fetchPromptsAndCollections({ 
      query: searchQuery, 
      filters,
      userId: user?.id 
    }),
    staleTime: 300000, // 5 minutes for better caching
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


import { useState } from 'react';
import { SearchFilters } from '@/components/SearchBar';

export const useSearchFilters = (initialQuery: string = '', initialFilters: SearchFilters = {
  llmModel: 'All Models',
  useCase: 'All Use Cases',
  sortBy: 'relevance',
  visibility: 'All',
  contentType: 'All'
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  return {
    searchQuery,
    filters,
    setSearchQuery,
    setFilters
  };
};

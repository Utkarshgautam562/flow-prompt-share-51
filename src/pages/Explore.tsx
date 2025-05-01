
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import PromptGrid from '@/components/explore/PromptGrid';
import ExploreHeader from '@/components/explore/ExploreHeader';
import { usePromptSearch } from '@/hooks/usePromptSearch';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse search parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialModel = queryParams.get('model') || 'All Models';
  const initialUseCase = queryParams.get('useCase') || 'All Use Cases';
  const initialSortBy = queryParams.get('sort') || 'relevance';
  
  const initialFilters: SearchFilters = {
    llmModel: initialModel,
    useCase: initialUseCase,
    sortBy: initialSortBy
  };

  const { 
    prompts, 
    isLoading, 
    isError, 
    refetch, 
    searchQuery, 
    filters, 
    setSearchQuery, 
    setFilters 
  } = usePromptSearch(initialQuery, initialFilters);

  // Create a page title based on search parameters
  const generatePageTitle = () => {
    const parts = [];
    
    if (searchQuery) {
      parts.push(`"${searchQuery}"`);
    }
    
    if (filters.llmModel && filters.llmModel !== 'All Models') {
      parts.push(filters.llmModel);
    }
    
    if (filters.useCase && filters.useCase !== 'All Use Cases') {
      parts.push(filters.useCase);
    }
    
    if (parts.length > 0) {
      return `${parts.join(' | ')} Prompts - PromptNexis`;
    }
    
    return 'Explore AI Prompts - Find the Best Prompts for Any Task | PromptNexis';
  };

  // Generate meta description based on filters
  const generateMetaDescription = () => {
    if (searchQuery || filters.llmModel !== 'All Models' || filters.useCase !== 'All Use Cases') {
      const parts = [];
      
      if (searchQuery) {
        parts.push(`"${searchQuery}"`);
      }
      
      if (filters.llmModel !== 'All Models') {
        parts.push(`optimized for ${filters.llmModel}`);
      }
      
      if (filters.useCase !== 'All Use Cases') {
        parts.push(`for ${filters.useCase}`);
      }
      
      return `Discover high-quality AI prompts ${parts.join(' ')}. Browse, filter, and use prompts from the PromptNexis community.`;
    }
    
    return 'Explore thousands of AI prompts for ChatGPT, Claude, Gemini and more. Filter by model, use case, or popularity to find the perfect prompt for your needs.';
  };

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
      <Helmet>
        <title>{generatePageTitle()}</title>
        <meta name="description" content={generateMetaDescription()} />
        <link rel="canonical" href={`https://promptnexis.com${location.pathname}${location.search}`} />
        <meta property="og:title" content={generatePageTitle()} />
        <meta property="og:description" content={generateMetaDescription()} />
        <meta property="og:url" content={`https://promptnexis.com${location.pathname}${location.search}`} />
        <meta name="twitter:title" content={generatePageTitle()} />
        <meta name="twitter:description" content={generateMetaDescription()} />
      </Helmet>
      
      <Navbar />
      
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col space-y-8">
          <ExploreHeader 
            title="Explore Prompts"
            description="Discover and use public prompts from the community"
          />
          
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search for prompts..."
            initialQuery={searchQuery}
            initialFilters={filters}
          />
          
          <PromptGrid prompts={prompts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Explore;

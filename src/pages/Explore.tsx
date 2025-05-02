
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import PromptGrid from '@/components/explore/PromptGrid';
import CollectionCard from '@/components/CollectionCard';
import ExploreHeader from '@/components/explore/ExploreHeader';
import { usePromptSearch, Collection } from '@/hooks/usePromptSearch';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Prompt } from '@/types/prompt';
import { supabase } from '@/integrations/supabase/client';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Parse search parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialModel = queryParams.get('model') || 'All Models';
  const initialUseCase = queryParams.get('useCase') || 'All Use Cases';
  const initialSortBy = queryParams.get('sort') || 'relevance';
  const initialVisibility = queryParams.get('visibility') || 'All';
  const initialContentType = queryParams.get('contentType') || 'All';
  
  const initialFilters: SearchFilters = {
    llmModel: initialModel,
    useCase: initialUseCase,
    sortBy: initialSortBy,
    visibility: initialVisibility,
    contentType: initialContentType
  };

  const { 
    results,
    prompts,
    collections,
    isLoading, 
    isError, 
    refetch, 
    searchQuery, 
    filters, 
    setSearchQuery, 
    setFilters 
  } = usePromptSearch(initialQuery, initialFilters);

  // State to track prompt counts for collections
  const [collectionPromptCounts, setCollectionPromptCounts] = useState<Record<string, number>>({});
  
  // Fetch prompt counts for collections
  useEffect(() => {
    const fetchCollectionPromptCounts = async () => {
      if (!collections || collections.length === 0) return;
      
      const collectionsIds = collections.map(collection => collection.id);
      try {
        // First, fetch all prompt_collections records for these collection IDs
        const { data, error } = await supabase
          .from('prompt_collections')
          .select('collection_id, prompt_id')
          .in('collection_id', collectionsIds);
          
        if (error) {
          console.error('Error fetching collection prompt counts:', error);
          return;
        }
        
        if (data) {
          // Count the occurrences of each collection_id
          const counts: Record<string, number> = {};
          data.forEach(item => {
            counts[item.collection_id] = (counts[item.collection_id] || 0) + 1;
          });
          setCollectionPromptCounts(counts);
        }
      } catch (err) {
        console.error('Failed to fetch prompt counts:', err);
      }
    };
    
    fetchCollectionPromptCounts();
  }, [collections]);

  // Create a page title based on search parameters
  const generatePageTitle = () => {
    const parts = [];
    
    if (searchQuery) {
      parts.push(`"${searchQuery}"`);
    }
    
    if (filters.contentType && filters.contentType !== 'All') {
      parts.push(filters.contentType);
    }
    
    if (filters.llmModel && filters.llmModel !== 'All Models') {
      parts.push(filters.llmModel);
    }
    
    if (filters.useCase && filters.useCase !== 'All Use Cases') {
      parts.push(filters.useCase);
    }

    if (filters.visibility && filters.visibility !== 'All') {
      parts.push(filters.visibility === 'Public' ? 'Public' : 'Private');
    }
    
    if (parts.length > 0) {
      return `${parts.join(' | ')} - PromptNexis`;
    }
    
    return 'Explore AI Prompts - Find the Best Prompts for Any Task | PromptNexis';
  };

  // Generate meta description based on filters
  const generateMetaDescription = () => {
    if (searchQuery || filters.llmModel !== 'All Models' || filters.useCase !== 'All Use Cases' || filters.visibility !== 'All' || filters.contentType !== 'All') {
      const parts = [];
      
      if (searchQuery) {
        parts.push(`"${searchQuery}"`);
      }

      if (filters.contentType !== 'All') {
        parts.push(`${filters.contentType.toLowerCase()}`);
      }
      
      if (filters.llmModel !== 'All Models') {
        parts.push(`optimized for ${filters.llmModel}`);
      }
      
      if (filters.useCase !== 'All Use Cases') {
        parts.push(`for ${filters.useCase}`);
      }

      if (filters.visibility !== 'All') {
        parts.push(filters.visibility === 'Public' ? 'publicly available' : 'private to you');
      }
      
      return `Discover high-quality AI ${filters.contentType !== 'Collections' ? 'prompts' : 'collections'} ${parts.join(' ')}. Browse, filter, and use resources from the PromptNexis community.`;
    }
    
    return 'Explore thousands of AI prompts and collections for ChatGPT, Claude, Gemini and more. Filter by model, use case, visibility, or popularity to find the perfect resources for your needs.';
  };

  // Handle search
  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    setSearchQuery(query);
    setFilters(searchFilters);
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (searchFilters.contentType !== 'All') params.set('contentType', searchFilters.contentType);
    if (searchFilters.llmModel !== 'All Models') params.set('model', searchFilters.llmModel);
    if (searchFilters.useCase !== 'All Use Cases') params.set('useCase', searchFilters.useCase);
    if (searchFilters.sortBy !== 'relevance') params.set('sort', searchFilters.sortBy);
    if (searchFilters.visibility !== 'All') params.set('visibility', searchFilters.visibility);
    
    navigate(`/explore?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    // Refetch when search or filters change
    refetch();
  }, [searchQuery, filters, refetch]);

  if (isError) {
    toast.error('Failed to load prompts. Please try again.');
  }

  const renderPrompts = () => {
    if (!prompts) return [];
    
    // Add isPublic property to each prompt
    return prompts.map(prompt => ({
      ...prompt,
      isPublic: prompt.is_public
    }));
  };

  // Determine which tab to show initially based on filters
  const getInitialTab = () => {
    if (filters.contentType === 'Collections') return 'collections';
    if (filters.contentType === 'Prompts') return 'prompts';
    return 'all';
  };

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
            title="Explore Resources"
            description="Discover and use public prompts and collections from the community"
          />
          
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search for prompts and collections..."
            initialQuery={searchQuery}
            initialFilters={filters}
            showVisibilityFilter={!!user} // Only show visibility filter for logged in users
          />
          
          <Tabs defaultValue={getInitialTab()} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : results && results.length > 0 ? (
                <div>
                  {collections && collections.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Collections</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection: Collection) => (
                          <CollectionCard
                            key={collection.id}
                            id={collection.id}
                            name={collection.name}
                            description={collection.description}
                            author={collection.profiles?.username || 'Anonymous'}
                            createdAt={collection.created_at}
                            isShared={collection.is_shared || false}
                            promptCount={collectionPromptCounts[collection.id] || 0}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {prompts && prompts.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Prompts</h2>
                      <PromptGrid prompts={renderPrompts()} isLoading={false} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">No results found matching your criteria.</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="prompts">
              <PromptGrid prompts={renderPrompts()} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="collections">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : collections && collections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {collections.map((collection: Collection) => (
                    <CollectionCard
                      key={collection.id}
                      id={collection.id}
                      name={collection.name}
                      description={collection.description}
                      author={collection.profiles?.username || 'Anonymous'}
                      createdAt={collection.created_at}
                      isShared={collection.is_shared || false}
                      promptCount={collectionPromptCounts[collection.id] || 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">No collections found matching your criteria.</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Explore;

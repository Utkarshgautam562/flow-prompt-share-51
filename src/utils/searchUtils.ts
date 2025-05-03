import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/types/prompt';
import { Collection } from '@/types/collection';
import { SearchFilters } from '@/components/SearchBar';
import { Json } from '@/integrations/supabase/types';

// Helper function to safely process profiles data
export const processProfileData = (profiles: any): { username: string | null } | null => {
  if (!profiles) return null;
  
  return profiles && 
         typeof profiles === 'object' && 
         profiles !== null && 
         !('error' in profiles) 
         ? { username: profiles.username || null }
         : null;
};

// Fetch collections based on search parameters
export const fetchCollections = async (
  query: string, 
  filters: SearchFilters, 
  userId: string | undefined
): Promise<Collection[]> => {
  try {
    // Only fetch collections if contentType is 'All' or 'Collections'
    if (filters.contentType !== 'All' && filters.contentType !== 'Collections') {
      return [];
    }

    // Start building the query for collections
    let collectionsQuery = supabase
      .from('collections')
      .select('*, profiles:user_id(username)');

    // For Explore page, we only want to show public collections, regardless of visibility filter
    if (window.location.pathname === '/explore') {
      collectionsQuery = collectionsQuery.eq('is_shared', true);
    } else {
      // Apply visibility filter for collections
      if (filters.visibility === 'Public') {
        collectionsQuery = collectionsQuery.eq('is_shared', true);
      } else if (filters.visibility === 'Private') {
        // For private collections, ensure user is authenticated and only show their private collections
        if (!userId) return []; // Return empty array if user is not authenticated
        collectionsQuery = collectionsQuery.eq('is_shared', false).eq('user_id', userId);
      } else {
        // For 'All', show public collections and user's private collections if authenticated
        if (userId) {
          collectionsQuery = collectionsQuery.or(`is_shared.eq.true,user_id.eq.${userId}`);
        } else {
          collectionsQuery = collectionsQuery.eq('is_shared', true);
        }
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
    return collectionsData ? collectionsData.map(item => {
      // Handle the profiles data correctly with safe null checks
      const profileData = processProfileData(item.profiles);
      
      return {
        ...item,
        profiles: profileData,
        type: 'collection' as const
      };
    }) : [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
};

// Fetch prompts based on search parameters
export const fetchPrompts = async (
  query: string, 
  filters: SearchFilters, 
  userId: string | undefined
): Promise<(Prompt & { type: 'prompt' })[]> => {
  try {
    // Only fetch prompts if contentType is 'All' or 'Prompts'
    if (filters.contentType !== 'All' && filters.contentType !== 'Prompts') {
      return [];
    }

    // Start building the query for prompts
    let promptQuery = supabase
      .from('prompts')
      .select('*, profiles:user_id(username)');

    // For Explore page, we only want to show public prompts
    if (window.location.pathname === '/explore') {
      promptQuery = promptQuery.eq('is_public', true);
    } else {
      // Apply visibility filter for prompts
      if (filters.visibility === 'Public') {
        promptQuery = promptQuery.eq('is_public', true);
      } else if (filters.visibility === 'Private') {
        // For private prompts, ensure user is authenticated and only show their private prompts
        if (!userId) return []; // Return empty array if user is not authenticated
        promptQuery = promptQuery.eq('is_public', false).eq('user_id', userId);
      } else {
        // For 'All', show public prompts and user's private prompts if authenticated
        if (userId) {
          promptQuery = promptQuery.or(`is_public.eq.true,user_id.eq.${userId}`);
        } else {
          promptQuery = promptQuery.eq('is_public', true);
        }
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

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Process prompts data
    return data.map(item => {
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

      // Handle the profiles data correctly with safe null checks
      const profileData = processProfileData(item.profiles);

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
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
};

// Main function to fetch both prompts and collections
export const fetchPromptsAndCollections = async ({ 
  query, 
  filters,
  userId
}: { 
  query: string, 
  filters: SearchFilters,
  userId?: string
}): Promise<(Prompt & { type: 'prompt' } | Collection)[]> => {
  try {
    const [collections, prompts] = await Promise.all([
      fetchCollections(query, filters, userId),
      fetchPrompts(query, filters, userId)
    ]);
    
    // Combine and return both prompts and collections
    return [...prompts, ...collections];
  } catch (error) {
    console.error('Error fetching prompts and collections:', error);
    // Return empty array instead of throwing error to prevent UI from breaking
    return [];
  }
};

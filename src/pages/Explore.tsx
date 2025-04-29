
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

const Explore = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = async (query: string = '') => {
    try {
      setIsLoading(true);
      let queryBuilder = supabase
        .from('prompts')
        .select('*, profiles(username)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      
      // Transform data to handle nested profile info
      const formattedData = data?.map(item => ({
        ...item,
        profiles: item.profiles as { username: string }
      })) || [];
      
      setPrompts(formattedData);
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        variant: "destructive",
        title: "Failed to load prompts",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrompts();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrompts(searchQuery);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore Prompts</h1>
        <p className="text-gray-600 mb-6">
          Discover and use public prompts created by the PromptFlow community
        </p>
        
        <form onSubmit={handleSearch} className="relative max-w-lg">
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Search size={18} className="text-gray-500" />
          </button>
        </form>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading prompts...</div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No prompts found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `No results match "${searchQuery}"`
              : "There are no public prompts available yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{prompt.title}</CardTitle>
                <CardDescription>
                  by {prompt.profiles?.username || 'Anonymous'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-4 text-sm">
                  {prompt.content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between mt-auto pt-4">
                <div className="text-xs text-gray-500">
                  {new Date(prompt.created_at).toLocaleDateString()}
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  {prompt.content.length > 500 ? 'Long' : 'Short'} Prompt
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;

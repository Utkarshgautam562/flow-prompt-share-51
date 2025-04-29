
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isSearching, setIsSearching] = useState(false);

  const fetchPrompts = async (query: string = '', sort: string = 'recent') => {
    try {
      setIsSearching(true);
      let queryBuilder = supabase
        .from('prompts')
        .select('*, profiles(username)')
        .eq('is_public', true);
      
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }
      
      // Apply sorting
      switch (sort) {
        case 'recent':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        case 'oldest':
          queryBuilder = queryBuilder.order('created_at', { ascending: true });
          break;
        case 'title':
          queryBuilder = queryBuilder.order('title', { ascending: true });
          break;
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
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
      setIsSearching(false);
    }
  };
  
  useEffect(() => {
    fetchPrompts('', sortBy);
  }, [sortBy]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrompts(searchQuery, sortBy);
  };

  const handlePromptClick = (id: string) => {
    navigate(`/prompt/${id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore Prompts</h1>
        <p className="text-gray-600 mb-6">
          Discover and use public prompts created by the PromptFlow community
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button 
              type="submit"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              disabled={isSearching}
            >
              {isSearching ? 
                <Loader2 size={18} className="animate-spin" /> :
                <Search size={18} className="text-gray-500" />
              }
            </Button>
          </form>
          
          <div className="w-full md:w-48">
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-gray-500" />
        </div>
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
            <Card 
              key={prompt.id} 
              className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePromptClick(prompt.id)}
            >
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

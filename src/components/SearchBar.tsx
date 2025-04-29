
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch = () => {}, 
  placeholder = "Search prompts by keyword, use case, or LLM..." 
}) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-28 h-12 bg-white rounded-lg border-gray-200 focus-visible:ring-promptflow-purple"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <Button 
            type="submit" 
            size="sm"
            className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
          >
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;

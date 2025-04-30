
import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  llmModel?: string;
  useCase?: string;
  sortBy?: string;
}

const LLM_MODELS = ["All Models", "GPT-4", "GPT-3.5", "Claude", "Gemini", "Mixtral", "Llama"];
const USE_CASES = ["All Use Cases", "Marketing", "Coding", "Data Analysis", "Creative Writing", "Research"];

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch = () => {}, 
  placeholder = "Search prompts by keyword, use case, or LLM...",
  initialQuery = '',
  initialFilters
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    llmModel: "All Models",
    useCase: "All Use Cases",
    sortBy: "relevance"
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  useEffect(() => {
    // Initialize query from props
    if (initialQuery) {
      setQuery(initialQuery);
    }
    
    // Initialize filters from props
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialQuery, initialFilters]);
  
  useEffect(() => {
    const newActiveFilters: string[] = [];
    
    if (filters.llmModel && filters.llmModel !== "All Models") {
      newActiveFilters.push(filters.llmModel);
    }
    
    if (filters.useCase && filters.useCase !== "All Use Cases") {
      newActiveFilters.push(filters.useCase);
    }
    
    setActiveFilters(newActiveFilters);
  }, [filters]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };
  
  const removeFilter = (filter: string) => {
    if (LLM_MODELS.includes(filter)) {
      setFilters(prev => ({ ...prev, llmModel: "All Models" }));
    } else if (USE_CASES.includes(filter)) {
      setFilters(prev => ({ ...prev, useCase: "All Use Cases" }));
    }
    
    onSearch(query, {
      ...filters,
      llmModel: LLM_MODELS.includes(filter) ? "All Models" : filters.llmModel,
      useCase: USE_CASES.includes(filter) ? "All Use Cases" : filters.useCase,
    });
  };
  
  return (
    <div className="w-full space-y-2">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-28 h-12 bg-white rounded-lg border-gray-200 focus-visible:ring-promptflow-purple"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter size={14} />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>LLM Model</DropdownMenuLabel>
              {LLM_MODELS.map((model) => (
                <DropdownMenuItem 
                  key={model}
                  onClick={() => setFilters({ ...filters, llmModel: model })}
                  className={filters.llmModel === model ? "bg-muted" : ""}
                >
                  {model}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Use Case</DropdownMenuLabel>
              {USE_CASES.map((useCase) => (
                <DropdownMenuItem 
                  key={useCase}
                  onClick={() => setFilters({ ...filters, useCase })}
                  className={filters.useCase === useCase ? "bg-muted" : ""}
                >
                  {useCase}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
              >
                <SelectTrigger className="w-full border-0 p-2">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            type="submit" 
            size="sm"
            className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90 h-8"
          >
            Search
          </Button>
        </div>
      </form>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1"
            >
              {filter}
              <X 
                size={12} 
                className="cursor-pointer ml-1" 
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

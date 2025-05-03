import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Globe, Lock, Eye, Bookmark, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  initialQuery?: string;
  initialFilters?: SearchFilters;
  showVisibilityFilter?: boolean;
}
export interface SearchFilters {
  llmModel?: string;
  useCase?: string;
  sortBy?: string;
  visibility?: string;
  contentType?: string;
}

// Enhanced list of models
const LLM_MODELS = ["All Models", "GPT-4o", "GPT-4", "GPT-3.5", "Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku", "Gemini Pro", "Gemini Ultra", "Mixtral 8x7B", "Llama 2", "Llama 3", "Mistral Large", "Mistral Medium", "PaLM 2"];

// Expanded use cases
const USE_CASES = ["All Use Cases", "Marketing", "Coding", "Data Analysis", "Creative Writing", "Research", "Education", "Customer Support", "Content Creation", "Legal", "Healthcare", "Finance", "Human Resources"];

// Visibility options
const VISIBILITY_OPTIONS = ["All", "Public", "Private"];

// Content type options
const CONTENT_TYPES = ["All", "Prompts", "Collections"];
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch = () => {},
  placeholder = "Search prompts by keyword, use case, or LLM...",
  initialQuery = '',
  initialFilters,
  showVisibilityFilter = false
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    llmModel: "All Models",
    useCase: "All Use Cases",
    sortBy: "relevance",
    visibility: "All",
    contentType: "All"
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    if (filters.visibility && filters.visibility !== "All") {
      newActiveFilters.push(filters.visibility);
    }
    if (filters.contentType && filters.contentType !== "All") {
      newActiveFilters.push(filters.contentType);
    }
    setActiveFilters(newActiveFilters);
  }, [filters]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };
  const removeFilter = (filter: string) => {
    if (LLM_MODELS.includes(filter)) {
      setFilters(prev => ({
        ...prev,
        llmModel: "All Models"
      }));
    } else if (USE_CASES.includes(filter)) {
      setFilters(prev => ({
        ...prev,
        useCase: "All Use Cases"
      }));
    } else if (VISIBILITY_OPTIONS.includes(filter)) {
      setFilters(prev => ({
        ...prev,
        visibility: "All"
      }));
    } else if (CONTENT_TYPES.includes(filter)) {
      setFilters(prev => ({
        ...prev,
        contentType: "All"
      }));
    }
    onSearch(query, {
      ...filters,
      llmModel: LLM_MODELS.includes(filter) ? "All Models" : filters.llmModel,
      useCase: USE_CASES.includes(filter) ? "All Use Cases" : filters.useCase,
      visibility: VISIBILITY_OPTIONS.includes(filter) ? "All" : filters.visibility,
      contentType: CONTENT_TYPES.includes(filter) ? "All" : filters.contentType
    });
  };
  const renderVisibilityIcon = (visibility: string) => {
    if (visibility === "Public") return <Globe size={14} className="mr-2" />;
    if (visibility === "Private") return <Lock size={14} className="mr-2" />;
    return <Eye size={14} className="mr-2" />;
  };
  const renderContentTypeIcon = (contentType: string) => {
    if (contentType === "Prompts") return <FileText size={14} className="mr-2" />;
    if (contentType === "Collections") return <Bookmark size={14} className="mr-2" />;
    return null;
  };
  return <div className="w-full space-y-2" role="search" aria-label="Search prompts">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder} className="pl-10 pr-28 h-12 bg-white rounded-lg border-gray-200 focus-visible:ring-promptflow-purple" aria-label="Search input" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-2">
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1" aria-label="Filter options">
                <Filter size={14} aria-hidden="true" />
                Filter
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute right-0 top-10 z-50 mt-2 min-w-[240px] rounded-md border bg-white p-4 shadow-md">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Content Type</h4>
                  <Select value={filters.contentType} onValueChange={value => setFilters({
                  ...filters,
                  contentType: value
                })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(contentType => <SelectItem key={contentType} value={contentType}>
                          <div className="flex items-center">
                            {renderContentTypeIcon(contentType)}
                            {contentType}
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="mb-2 text-sm font-medium">LLM Model</h4>
                  <Select value={filters.llmModel} onValueChange={value => setFilters({
                  ...filters,
                  llmModel: value
                })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_MODELS.map(model => <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="mb-2 text-sm font-medium">Use Case</h4>
                  <Select value={filters.useCase} onValueChange={value => setFilters({
                  ...filters,
                  useCase: value
                })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select use case" />
                    </SelectTrigger>
                    <SelectContent>
                      {USE_CASES.map(useCase => <SelectItem key={useCase} value={useCase}>
                          {useCase}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {showVisibilityFilter && <div>
                    <h4 className="mb-2 text-sm font-medium">Visibility</h4>
                    <Select value={filters.visibility} onValueChange={value => setFilters({
                  ...filters,
                  visibility: value
                })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIBILITY_OPTIONS.map(visibility => <SelectItem key={visibility} value={visibility}>
                            <div className="flex items-center">
                              {renderVisibilityIcon(visibility)}
                              {visibility}
                            </div>
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>}
                
                <div>
                  <h4 className="mb-2 text-sm font-medium">Sort By</h4>
                  <Select value={filters.sortBy} onValueChange={value => setFilters({
                  ...filters,
                  sortBy: value
                })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Button type="submit" size="sm" className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90 h-8" aria-label="Submit search">
            Search
          </Button>
        </div>
      </form>
      
      {activeFilters.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Active filters">
          {activeFilters.map(filter => {})}
        </div>}
    </div>;
};
export default SearchBar;

import React from 'react';
import PromptCard from '@/components/PromptCard';
import { Prompt } from '@/types/prompt';

interface PromptGridProps {
  prompts: Prompt[] | undefined;
  isLoading: boolean;
}

const PromptGrid: React.FC<PromptGridProps> = ({ prompts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No prompts found matching your criteria.</p>
        <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          id={prompt.id}
          title={prompt.title}
          description={prompt.content}
          llm={prompt.llm_settings?.model || 'Unknown'}
          useCase="General" // This would come from tags in a real implementation
          upvotes={0} // This would come from likes count in a real implementation
          author={prompt.profiles?.username || 'Anonymous'}
        />
      ))}
    </div>
  );
};

export default PromptGrid;

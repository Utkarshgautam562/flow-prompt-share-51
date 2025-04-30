
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PromptCard from '@/components/PromptCard';
import { Plus } from 'lucide-react';

interface UserPrompt {
  id: string;
  title: string;
  content: string;
  llm_settings: {
    model: string;
  };
  created_at: string;
}

interface PromptsTabProps {
  isLoading: boolean;
  prompts: UserPrompt[];
  username: string;
}

const PromptsTab = ({ isLoading, prompts, username }: PromptsTabProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  if (prompts.length === 0) {
    return (
      <Card className="text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50 border-dashed border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">No Prompts Yet</CardTitle>
          <CardDescription className="text-gray-600">
            This is where your creative prompts will appear once you create them.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <img 
            src="https://api.dicebear.com/7.x/shapes/svg?seed=empty-prompts" 
            alt="Empty state" 
            className="w-32 h-32 mb-6 opacity-70"
          />
          <Button 
            onClick={() => navigate('/create-prompt')}
            className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90 flex items-center gap-2"
          >
            <Plus size={16} /> Create Your First Prompt
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          id={prompt.id}
          title={prompt.title}
          description={prompt.content}
          llm={prompt.llm_settings?.model || 'Unknown'}
          useCase="General"
          upvotes={0}
          author={username || "You"}
          showViewButton={true}
        />
      ))}
    </div>
  );
};

export default PromptsTab;

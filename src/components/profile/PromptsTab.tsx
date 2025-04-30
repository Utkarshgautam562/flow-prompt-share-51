
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PromptCard from '@/components/PromptCard';

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
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>No Prompts Yet</CardTitle>
          <CardDescription>
            You haven't created any prompts yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/create-prompt')}
            className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
          >
            Create Your First Prompt
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
        />
      ))}
    </div>
  );
};

export default PromptsTab;

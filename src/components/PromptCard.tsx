
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PromptCardProps {
  title: string;
  description: string;
  llm: string;
  useCase: string;
  upvotes: number;
  author: string;
}

const PromptCard: React.FC<PromptCardProps> = ({
  title,
  description,
  llm,
  useCase,
  upvotes,
  author,
}) => {
  return (
    <Card className="prompt-card">
      <div className="absolute top-0 right-0 bg-gradient-to-l from-promptflow-blue to-promptflow-purple text-white text-xs px-2 py-1 rounded-bl-md">
        {llm}
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">By {author}</p>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 line-clamp-2">{description}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="flex gap-2">
          <span className="tag tag-purple">{useCase}</span>
          <span className="tag tag-blue">{upvotes} upvotes</span>
        </div>
        
        <Button variant="ghost" size="sm" className="text-promptflow-blue hover:text-promptflow-purple">
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromptCard;

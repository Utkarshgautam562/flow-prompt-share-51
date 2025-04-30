
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/contexts/AuthContext";

interface PromptCardProps {
  title: string;
  description: string;
  llm: string;
  useCase: string;
  upvotes: number;
  author: string;
  id: string;
  onCopy?: (content: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  title,
  description,
  llm,
  useCase,
  author,
  id,
  onCopy
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { likesCount, isLiked, toggleLike } = useLikes(id);
  
  // Only use the first two characters of the author name for the avatar fallback
  // This ensures we don't expose any part of an email address
  const authorInitials = author.substring(0, 2).toUpperCase();
  
  // If the author string is an email, only show the username part (before @)
  // This ensures we don't expose full email addresses in the UI
  const displayName = author.includes('@') 
    ? author.split('@')[0] 
    : author;
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(description);
    } else {
      navigator.clipboard.writeText(description);
      toast({
        title: "Copied to clipboard",
        description: "Prompt content has been copied to your clipboard",
      });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };

  const handleClick = () => {
    navigate(`/prompt/${id}`);
  };
  
  return (
    <Card 
      className="prompt-card h-full transition-all hover:shadow-md cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      <div className="absolute top-0 right-0 bg-gradient-to-l from-promptflow-blue to-promptflow-purple text-white text-xs px-2 py-1 rounded-bl-md">
        {llm}
      </div>
      
      <CardHeader className="pb-2 flex flex-row items-center">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} alt={displayName} />
          <AvatarFallback>{authorInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold leading-none tracking-tight line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground">By {displayName}</p>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-800">{useCase}</Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex items-center gap-1 p-1 h-7 ${isLiked ? 'bg-pink-50 text-pink-600 hover:text-pink-700' : 'hover:bg-gray-100'}`}
                  onClick={handleLike}
                >
                  <ThumbsUp size={12} className={isLiked ? "fill-current" : ""} /> {likesCount}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-promptflow-purple p-1 h-7"
            onClick={handleCopy}
          >
            <Copy size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-promptflow-blue hover:text-promptflow-purple p-1 h-7"
          >
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PromptCard;

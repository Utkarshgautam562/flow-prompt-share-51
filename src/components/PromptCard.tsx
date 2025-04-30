
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ThumbsUp, Share2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
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
  showViewButton?: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({
  title,
  description,
  llm,
  useCase,
  author,
  id,
  onCopy,
  showViewButton = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { likesCount, isLiked, toggleLike } = useLikes(id);
  
  // Extract display name - prefer username from metadata if available
  const getDisplayName = () => {
    // If author looks like an email, prefer username from metadata
    if (author.includes('@')) {
      return author.split('@')[0]; // Fallback to first part of email
    }
    return author;
  };
  
  const displayName = getDisplayName();
  // Get initials for avatar fallback (max 2 characters)
  const authorInitials = displayName.substring(0, 2).toUpperCase();
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(description);
    } else {
      navigator.clipboard.writeText(description);
      toast("Prompt content has been copied to your clipboard");
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a shareable URL for the prompt
    const shareUrl = `${window.location.origin}/prompt/${id}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this prompt: ${title}`,
          url: shareUrl,
        });
        toast.success("Prompt shared successfully!");
      } catch (error) {
        console.error("Error sharing prompt:", error);
        // Fall back to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      // Fall back to clipboard
      copyToClipboard(shareUrl);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Share link copied to clipboard!");
  };

  const handleClick = () => {
    navigate(`/prompt/${id}`);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/prompt/${id}`);
  };
  
  return (
    <Card 
      className="prompt-card h-full transition-all hover:shadow-md cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-bl-md">
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
          {showViewButton && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-600 hover:text-blue-800 p-1 h-7"
              onClick={handleView}
            >
              <Eye size={14} className="mr-1" /> View
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-purple-600 p-1 h-7"
            onClick={handleCopy}
          >
            <Copy size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-purple-600 p-1 h-7"
            onClick={handleShare}
          >
            <Share2 size={14} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PromptCard;

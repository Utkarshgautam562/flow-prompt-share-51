
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Copy, Eye, Calendar, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useLikes } from '@/hooks/useLikes';
import { format } from 'date-fns';

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  llm: string;
  useCase: string;
  upvotes: number;
  author: string;
  showViewButton?: boolean;
  createdAt?: string;
  isPublic?: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  id, 
  title, 
  description, 
  llm, 
  useCase, 
  upvotes, 
  author,
  showViewButton = false,
  createdAt,
  isPublic = false
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { isLiked, likesCount, toggleLike } = useLikes(id);

  const handleViewClick = () => {
    navigate(`/prompt/${id}`);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/prompt/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };

  const renderInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return '';
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${isHovered ? 'shadow-lg' : 'shadow-sm'} hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewClick}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              <Badge 
                variant={isPublic ? "default" : "secondary"} 
                className={`flex items-center gap-1 ${isPublic ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                <span className="text-xs">{isPublic ? 'Public' : 'Private'}</span>
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                {llm}
              </Badge>
              {createdAt && (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(createdAt)}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pb-0">
        <p className="text-sm text-gray-600 line-clamp-3">{truncateText(description, 120)}</p>
      </CardContent>

      <CardFooter className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className={`h-6 w-6 ${getRandomColor(author)}`}>
            <AvatarFallback className="text-xs text-white">
              {renderInitials(author)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-600">{truncateText(author, 15)}</span>
        </div>

        <div className="flex items-center gap-2">
          {showViewButton ? (
            <>
              <Button 
                onClick={handleShareClick}
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <Copy size={16} />
                <span className="sr-only">Copy Link</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewClick();
                }}
              >
                <Eye size={16} />
                <span className="sr-only">View</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleLikeClick}
                variant={isLiked ? "secondary" : "ghost"} 
                size="sm" 
                className={isLiked ? "h-8 gap-1 text-xs bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700" : "h-8 gap-1 text-xs"}
              >
                <Heart size={14} className={`${isLiked ? "fill-pink-600" : ""}`} />
                <span>{likesCount}</span>
              </Button>
              <Button 
                onClick={handleShareClick}
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <Copy size={16} />
                <span className="sr-only">Copy Link</span>
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default React.memo(PromptCard);

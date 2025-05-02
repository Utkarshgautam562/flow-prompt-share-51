
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bookmark, Globe, Lock, CalendarIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CollectionCardProps {
  id: string;
  name: string;
  description?: string | null;
  author: string;
  createdAt: string;
  isShared?: boolean;
  promptCount?: number;
}

const CollectionCard = ({ 
  id, 
  name, 
  description, 
  author, 
  createdAt,
  isShared = false,
  promptCount = 0
}: CollectionCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
      <CardHeader className="p-4 pb-2 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1 bg-white">
            <Bookmark size={12} className="text-blue-500" />
            Collection
          </Badge>
          {isShared !== undefined && (
            <Badge 
              variant={isShared ? "outline" : "secondary"} 
              className={`flex items-center gap-1 ${isShared ? 'bg-white border-green-300 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {isShared ? <Globe size={12} /> : <Lock size={12} />}
              {isShared ? 'Public' : 'Private'}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-bold mt-2 line-clamp-1">{name}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {description && (
          <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
        )}
        {!description && (
          <p className="text-gray-400 text-sm italic">No description available</p>
        )}
        
        <div className="mt-4">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center">
          <span className="font-medium">{author}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <CalendarIcon size={12} className="text-gray-400" />
          <span>{timeAgo}</span>
        </div>
      </CardFooter>
      
      <Link 
        to={`/collection/${id}`} 
        className="absolute inset-0 z-10" 
        aria-label={`View collection: ${name}`}
      >
        <span className="sr-only">View collection</span>
      </Link>
    </Card>
  );
};

export default CollectionCard;

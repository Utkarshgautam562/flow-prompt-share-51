
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  username: string;
  email: string | undefined;
  promptsCount: number;
}

const ProfileHeader = ({ username, email, promptsCount }: ProfileHeaderProps) => {
  // Generate initials for avatar fallback
  const getInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return email ? email.substring(0, 2).toUpperCase() : "UN";
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${username || 'User'}`} 
              alt="Profile" 
            />
            <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{username || "User"}</h2>
            <p className="text-gray-500">{email}</p>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">
                {promptsCount} {promptsCount === 1 ? 'Prompt' : 'Prompts'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;

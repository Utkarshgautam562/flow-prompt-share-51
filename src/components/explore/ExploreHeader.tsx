
import React from 'react';
import BackButton from '@/components/BackButton';

interface ExploreHeaderProps {
  title: string;
  description: string;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <BackButton to="/" />
      </div>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default ExploreHeader;

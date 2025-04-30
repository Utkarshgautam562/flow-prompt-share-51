
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`flex items-center gap-1 hover:bg-transparent ${className}`}
      onClick={handleGoBack}
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;

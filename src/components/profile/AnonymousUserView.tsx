
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AnonymousUserView = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="text-center p-8">
      <CardHeader>
        <CardTitle>Anonymous Mode Active</CardTitle>
        <CardDescription>
          You're currently using the app in anonymous mode. Sign in to create a profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
        >
          Sign In or Sign Up
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnonymousUserView;

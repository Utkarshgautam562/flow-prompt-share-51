
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';

interface AuthLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl">Welcome to PromptNexis</CardTitle>
              <CardDescription>
                Sign in to continue to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <SignInForm />
                </TabsContent>
                
                <TabsContent value="signup">
                  <SignUpForm setActiveTab={setActiveTab} />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col text-center text-sm text-gray-600">
              <p>
                By continuing, you agree to our 
                <a href="/terms" className="text-blue-600 hover:underline"> Terms of Service </a> 
                and 
                <a href="/privacy" className="text-blue-600 hover:underline"> Privacy Policy</a>.
              </p>
              <p className="mt-2">
                For support, contact us at <a href="mailto:promptnexis@gmail.com" className="text-blue-600 hover:underline">promptnexis@gmail.com</a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

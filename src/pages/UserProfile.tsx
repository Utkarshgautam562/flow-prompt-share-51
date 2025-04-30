
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, User, Settings } from 'lucide-react';

// Import the new components
import AnonymousUserView from '@/components/profile/AnonymousUserView';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PromptsTab from '@/components/profile/PromptsTab';
import ProfileTab from '@/components/profile/ProfileTab';
import SettingsTab from '@/components/profile/SettingsTab';

// Define the form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email",
  }).optional(),
});

interface UserPrompt {
  id: string;
  title: string;
  content: string;
  llm_settings: {
    model: string;
  };
  created_at: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (isAnonymous || !user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error("Failed to load profile information");
    }
  };

  // Fetch user's prompts
  const fetchUserPrompts = async () => {
    if (isAnonymous || !user) return;

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ensure we cast the data properly to match UserPrompt interface
      setUserPrompts(data?.map(prompt => ({
        ...prompt,
        llm_settings: typeof prompt.llm_settings === 'string' 
          ? JSON.parse(prompt.llm_settings) 
          : prompt.llm_settings
      })) || []);
    } catch (error) {
      console.error('Error fetching user prompts:', error);
      toast.error("Failed to load your prompts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !isAnonymous) {
      navigate('/auth');
      return;
    }

    if (user && !isAnonymous) {
      fetchUserProfile();
      fetchUserPrompts();
    } else {
      setIsLoading(false);
    }
  }, [user, isAnonymous, navigate]);

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (isAnonymous || !user) {
      toast.error("You need to sign in to update your profile");
      navigate("/auth");
      return;
    }

    setIsSaving(true);

    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ username: values.username })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      fetchUserProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAnonymous) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="container max-w-4xl px-4 md:px-6 py-8">
          <AnonymousUserView />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container max-w-4xl px-4 md:px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Profile header */}
          <ProfileHeader 
            username={userProfile?.username || "User"} 
            email={user?.email} 
            promptsCount={userPrompts.length}
          />
          
          {/* Tabs for prompts and settings */}
          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prompts" className="flex gap-2 items-center">
                <Clock className="h-4 w-4" />
                <span>My Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex gap-2 items-center">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex gap-2 items-center">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompts" className="mt-4">
              <PromptsTab 
                isLoading={isLoading} 
                prompts={userPrompts} 
                username={userProfile?.username} 
              />
            </TabsContent>
            
            <TabsContent value="profile" className="mt-4">
              <ProfileTab 
                userProfile={userProfile} 
                email={user?.email} 
                isSaving={isSaving} 
                onSubmit={onSubmit} 
              />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <SettingsTab isAnonymous={isAnonymous} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

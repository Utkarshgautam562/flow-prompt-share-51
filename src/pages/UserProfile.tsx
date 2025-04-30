
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PromptCard from '@/components/PromptCard';
import { User, Clock, Settings } from 'lucide-react';

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

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: user?.email || "",
    },
  });

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
      
      if (data) {
        form.reset({
          username: data.username || "",
          email: user.email || "",
        });
      }
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

      setUserPrompts(data || []);
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

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (userProfile?.username) {
      return userProfile.username.substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : "UN";
  };

  if (isAnonymous) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <div className="container max-w-4xl px-4 md:px-6 py-8">
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
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.username || 'User'}`} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold">{userProfile?.username || "User"}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-500">
                      {userPrompts.length} {userPrompts.length === 1 ? 'Prompt' : 'Prompts'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : userPrompts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      id={prompt.id}
                      title={prompt.title}
                      description={prompt.content}
                      llm={prompt.llm_settings?.model || 'Unknown'}
                      useCase="General"
                      upvotes={0}
                      author={userProfile?.username || "You"}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <CardHeader>
                    <CardTitle>No Prompts Yet</CardTitle>
                    <CardDescription>
                      You haven't created any prompts yet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/create-prompt')}
                      className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
                    >
                      Create Your First Prompt
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Your username" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your email" 
                                {...field} 
                                disabled 
                              />
                            </FormControl>
                            <FormDescription>
                              Email cannot be changed here
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Privacy Settings */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Privacy</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymousMode"
                        className="form-checkbox h-5 w-5 text-indigo-600"
                        checked={isAnonymous}
                        readOnly
                      />
                      <label htmlFor="anonymousMode" className="text-sm">
                        Anonymous Mode
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Toggle anonymous mode in the navbar. When active, your actions won't be associated with your account.
                    </p>
                  </div>
                  
                  {/* Account Management */}
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        // In a real app, this would show a confirmation dialog
                        toast.error("This feature is not implemented yet");
                      }}
                    >
                      Delete Account
                    </Button>
                    <p className="text-sm text-gray-500">
                      This will permanently delete your account and all your data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

// Define the form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email",
  }).optional(),
});

interface ProfileTabProps {
  userProfile: any;
  email: string | undefined;
  isSaving: boolean;
  onSubmit: (values: z.infer<typeof profileFormSchema>) => Promise<void>;
}

const ProfileTab = ({ userProfile, email, isSaving, onSubmit }: ProfileTabProps) => {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: userProfile?.username || "",
      email: email || "",
    },
  });
  
  return (
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
  );
};

export default ProfileTab;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Define the form schema
const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  content: z.string().min(1, {
    message: "Prompt content is required",
  }),
  model: z.string({
    required_error: "Please select a model",
  }),
  isPublic: z.boolean().default(false),
});

// Available models
const LLM_MODELS = ["GPT-4", "GPT-3.5", "Claude", "Gemini", "Mixtral", "Llama"];

// Available tags (in a real app, these might be fetched from the database)
const AVAILABLE_TAGS = ["Marketing", "Coding", "Data Analysis", "Creative Writing", "Research", "Customer Support", "Legal", "Education"];

interface CreatePromptProps {
  isEditing?: boolean;
}

const CreatePrompt: React.FC<CreatePromptProps> = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAnonymous } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      model: "GPT-4",
      isPublic: false,
    },
  });

  // Fetch prompt data if editing
  useEffect(() => {
    const fetchPromptData = async () => {
      if (isEditing && id) {
        setIsLoading(true);
        try {
          if (isAnonymous) {
            // Fetch from localStorage for anonymous users
            const storedPromptsJson = localStorage.getItem('promptflow-anonymous-prompts');
            if (storedPromptsJson) {
              const storedPrompts = JSON.parse(storedPromptsJson);
              const promptData = storedPrompts.find((p: any) => p.id === id);
              
              if (promptData) {
                // Extract model from llm_settings safely
                let modelValue = "GPT-4"; // Default value
                if (promptData.llm_settings) {
                  const llmSettings = typeof promptData.llm_settings === 'string' 
                    ? JSON.parse(promptData.llm_settings) 
                    : promptData.llm_settings;
                  
                  if (llmSettings && typeof llmSettings === 'object' && 'model' in llmSettings) {
                    modelValue = llmSettings.model || "GPT-4";
                  }
                }
                
                form.reset({
                  title: promptData.title || "",
                  content: promptData.content || "",
                  model: modelValue,
                  isPublic: promptData.is_public || false,
                });
                setSelectedTags(promptData.tags || []);
              } else {
                toast.error("Prompt not found");
                navigate('/my-prompts');
              }
            }
          } else {
            // Fetch from Supabase
            const { data, error } = await supabase
              .from('prompts')
              .select('*')
              .eq('id', id)
              .single();
            
            if (error) throw error;
            
            if (data) {
              // Extract model from llm_settings safely
              let modelValue = "GPT-4"; // Default value
              if (data.llm_settings) {
                const llmSettings = typeof data.llm_settings === 'string'
                  ? JSON.parse(data.llm_settings)
                  : data.llm_settings;
                
                if (llmSettings && typeof llmSettings === 'object' && 'model' in llmSettings) {
                  modelValue = String(llmSettings.model) || "GPT-4";
                }
              }
              
              form.reset({
                title: data.title || "",
                content: data.content || "",
                model: modelValue,
                isPublic: data.is_public || false,
              });
              // If you have tags stored, set them here
              // setSelectedTags(data.tags || []);
            } else {
              toast.error("Prompt not found");
              navigate('/my-prompts');
            }
          }
        } catch (error: any) {
          console.error('Error fetching prompt:', error);
          toast.error("Failed to load prompt: " + (error.message || "Unknown error"));
          navigate('/my-prompts');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPromptData();
  }, [isEditing, id, form, navigate, isAnonymous]);

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isAnonymous) {
      toast.error("You need to sign in to create prompts");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for Supabase
      const promptData = {
        title: values.title,
        content: values.content,
        llm_settings: { 
          model: values.model.toLowerCase(),
          temperature: 0.7
        },
        is_public: values.isPublic,
        user_id: user?.id,
        // In a real implementation, tags would be stored in a separate table
        // with a many-to-many relationship to prompts
      };

      if (isEditing && id) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', id);

        if (error) throw error;

        toast.success("Prompt updated successfully!");
        navigate(`/prompt/${id}`);
      } else {
        // Insert a new prompt
        const { data, error } = await supabase
          .from('prompts')
          .insert([promptData])
          .select();

        if (error) throw error;

        toast.success("Prompt created successfully!");
        navigate(`/prompt/${data[0].id}`);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error("Failed to save prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="container flex items-center justify-center flex-1">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container max-w-3xl px-4 md:px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Prompt' : 'Create a New Prompt'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update your prompt details below.' 
                : 'Share your prompt with the community or keep it private for your own use.'}
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Creative Story Generator" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive title for your prompt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your prompt here..." 
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The instructions that will be sent to the AI model
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LLM Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LLM_MODELS.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The AI model this prompt is optimized for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          size={12} 
                          className="cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  <Select onValueChange={handleTagSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categories that describe your prompt (optional)
                  </FormDescription>
                </div>
                
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Make this prompt public</FormLabel>
                        <FormDescription>
                          Public prompts will appear in Explore and can be used by others
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (isEditing ? "Updating..." : "Creating...") 
                    : (isEditing ? "Update Prompt" : "Create Prompt")
                  }
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePrompt;

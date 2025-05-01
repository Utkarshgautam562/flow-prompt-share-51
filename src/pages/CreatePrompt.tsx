
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
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
import { Copy, Sparkles, X } from 'lucide-react';
import CollectionSelector from '@/components/collections/CollectionSelector';
import { Helmet } from 'react-helmet';

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
  customModel: z.string().optional(),
  isPublic: z.boolean().default(false),
  isShared: z.boolean().default(false),
});

// Available models
const LLM_MODELS = ["GPT-4", "GPT-3.5", "Claude", "Gemini", "Mixtral", "Llama", "Other"];

// Available tags (in a real app, these might be fetched from the database)
const AVAILABLE_TAGS = [
  "Marketing", "Coding", "Data Analysis", "Creative Writing", 
  "Research", "Customer Support", "Legal", "Education", 
  "Summarization", "Translation", "Brainstorming", "Academic"
];

interface CreatePromptProps {
  isEditing?: boolean;
}

const CreatePrompt: React.FC<CreatePromptProps> = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAnonymous } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [showCustomModel, setShowCustomModel] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      model: "GPT-4",
      customModel: "",
      isPublic: false,
      isShared: false,
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
                let customModelValue = "";
                
                if (promptData.llm_settings) {
                  const llmSettings = typeof promptData.llm_settings === 'string' 
                    ? JSON.parse(promptData.llm_settings) 
                    : promptData.llm_settings;
                  
                  if (llmSettings && typeof llmSettings === 'object' && 'model' in llmSettings) {
                    const model = llmSettings.model || "GPT-4";
                    
                    if (LLM_MODELS.includes(model)) {
                      modelValue = model;
                    } else {
                      modelValue = "Other";
                      customModelValue = model;
                      setShowCustomModel(true);
                    }
                  }
                }
                
                form.reset({
                  title: promptData.title || "",
                  content: promptData.content || "",
                  model: modelValue,
                  customModel: customModelValue,
                  isPublic: promptData.is_public || false,
                  isShared: promptData.is_shared || false,
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
              let customModelValue = "";
              
              if (data.llm_settings) {
                const llmSettings = typeof data.llm_settings === 'string'
                  ? JSON.parse(data.llm_settings)
                  : data.llm_settings;
                
                if (llmSettings && typeof llmSettings === 'object' && 'model' in llmSettings) {
                  const model = String(llmSettings.model) || "GPT-4";
                  
                  if (LLM_MODELS.includes(model)) {
                    modelValue = model;
                  } else {
                    modelValue = "Other";
                    customModelValue = model;
                    setShowCustomModel(true);
                  }
                }
              }
              
              form.reset({
                title: data.title || "",
                content: data.content || "",
                model: modelValue,
                customModel: customModelValue,
                isPublic: data.is_public || false,
                isShared: data.is_shared || false,
              });

              // Fetch collections for this prompt
              const { data: promptCollections } = await supabase
                .from('prompt_collections')
                .select('collection_id')
                .eq('prompt_id', id);

              if (promptCollections && promptCollections.length > 0) {
                setSelectedCollections(promptCollections.map(pc => pc.collection_id));
              }
              
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

  const handleModelChange = (value: string) => {
    form.setValue('model', value);
    setShowCustomModel(value === "Other");
    if (value !== "Other") {
      form.setValue('customModel', "");
    }
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const savePromptCollections = async (promptId: string, collectionIds: string[]) => {
    if (isAnonymous || !user || collectionIds.length === 0) return;
    
    try {
      // If editing, first delete existing associations
      if (isEditing) {
        const { error: deleteError } = await supabase
          .from('prompt_collections')
          .delete()
          .eq('prompt_id', promptId);
        
        if (deleteError) throw deleteError;
      }
      
      // Create new associations
      const promptCollections = collectionIds.map(collectionId => ({
        prompt_id: promptId,
        collection_id: collectionId
      }));
      
      const { error } = await supabase
        .from('prompt_collections')
        .insert(promptCollections);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving prompt collections:', error);
      // We don't want to block the whole save just because collections failed
      toast.error(`Note: Failed to save collections. ${error.message}`);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isAnonymous) {
      toast.error("You need to sign in to create prompts");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine the model to use
      const modelToUse = values.model === "Other" ? values.customModel : values.model;
      
      // Format the data for Supabase
      const promptData = {
        title: values.title,
        content: values.content,
        llm_settings: { 
          model: modelToUse.toLowerCase(),
          temperature: 0.7
        },
        is_public: values.isPublic,
        is_shared: values.isShared,
        user_id: user?.id,
        // In a real implementation, tags would be stored in a separate table
        // with a many-to-many relationship to prompts
      };

      if (isEditing && id) {
        // Update existing prompt
        const { data, error } = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', id)
          .select();

        if (error) throw error;
        
        // Save collections for this prompt
        if (data && data.length > 0) {
          await savePromptCollections(id, selectedCollections);
        }

        toast.success("Prompt updated successfully!");
        navigate(`/prompt/${id}`);
      } else {
        // Insert a new prompt
        const { data, error } = await supabase
          .from('prompts')
          .insert([promptData])
          .select();

        if (error) throw error;
        
        // Save collections for this prompt
        if (data && data.length > 0) {
          await savePromptCollections(data[0].id, selectedCollections);
        }

        toast.success("Prompt created successfully!");
        navigate(`/prompt/${data[0].id}`);
      }
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast.error("Failed to save prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyContent = () => {
    const content = form.getValues("content");
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success("Prompt content copied to clipboard!");
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
      <Helmet>
        <title>{isEditing ? 'Edit Prompt' : 'Create Prompt'} | PromptFlow</title>
        <meta name="description" content={isEditing ? 'Edit your existing prompt' : 'Create a new AI prompt'} />
      </Helmet>
      
      <Navbar />
      
      <div className="container max-w-3xl px-4 md:px-6 py-8">
        <div className="mb-4">
          <BackButton to="/my-prompts" />
        </div>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{isEditing ? 'Edit Prompt' : 'Create a New Prompt'}</CardTitle>
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
                      <FormLabel className="text-base">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g., Creative Story Generator" 
                          className="text-base py-6" 
                          {...field} 
                        />
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-base">Prompt Content</FormLabel>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={handleCopyContent}
                        >
                          <Copy size={14} /> Copy
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your prompt here..." 
                          className="h-64 font-mono text-sm"
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
                      <FormLabel className="text-base">LLM Model</FormLabel>
                      <Select onValueChange={handleModelChange} defaultValue={field.value}>
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
                
                {showCustomModel && (
                  <FormField
                    control={form.control}
                    name="customModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Custom Model Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., Anthropic Claude-3" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the name of the custom model
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="space-y-2">
                  <FormLabel className="text-base">Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                        {tag}
                        <X 
                          size={12} 
                          className="cursor-pointer ml-1" 
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
                
                <div className="space-y-2">
                  <FormLabel className="text-base">Collections</FormLabel>
                  <CollectionSelector 
                    selectedCollections={selectedCollections}
                    onSelectCollections={setSelectedCollections}
                    promptId={isEditing ? id : undefined}
                  />
                  <FormDescription>
                    Add this prompt to collections for better organization (optional)
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

                <FormField
                  control={form.control}
                  name="isShared"
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
                        <FormLabel>Enable sharing</FormLabel>
                        <FormDescription>
                          Allow this prompt to be shared via direct link
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-6">
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

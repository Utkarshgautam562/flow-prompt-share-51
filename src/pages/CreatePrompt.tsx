import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Prompt } from '@/types/prompt';
import { useQueryClient } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import PromptOptimizer from '@/components/PromptOptimizer';
import CollectionSelector from '@/components/collections/CollectionSelector';

// Form schema for validation
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters.",
  }),
  description: z.string().optional(),
  content: z.string().min(10, {
    message: "Prompt content must be at least 10 characters.",
  }),
  model: z.string().min(1, {
    message: "Please select a model.",
  }),
  customModel: z.string().optional(),
  temperature: z.coerce.number().min(0).max(2),
  isPublic: z.boolean().default(false),
});

interface CreatePromptProps {
  isEditing?: boolean;
}

// Enhanced list of models
const LLM_MODELS = [
  "gpt-4",
  "gpt-4o",
  "gpt-3.5-turbo",
  "claude-3-opus",
  "claude-3-sonnet",
  "claude-3-haiku",
  "gemini-pro",
  "gemini-ultra",
  "llama-2",
  "llama-3",
  "mistral-medium",
  "mistral-large",
  "mixtral-8x7b",
  "other"
];

const CreatePrompt: React.FC<CreatePromptProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [promptData, setPromptData] = useState<Prompt | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const queryClient = useQueryClient();
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      model: "gpt-4",
      customModel: "",
      temperature: 0.7,
      isPublic: false,
    },
  });
  
  // Handle model selection change
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    form.setValue('model', value);
    
    // Clear custom model field if not "other"
    if (value !== "other") {
      form.setValue('customModel', "");
    }
  };
  
  // Fetch prompt data if in edit mode
  useEffect(() => {
    if (isEditing && id) {
      fetchPromptData(id);
    }
  }, [isEditing, id]);
  
  const fetchPromptData = async (promptId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        navigate('/not-found');
        return;
      }
      
      // Verify user is the owner of this prompt
      if (data.user_id !== user?.id) {
        toast.error("You don't have permission to edit this prompt");
        navigate('/my-prompts');
        return;
      }
      
      // Cast the data to our Prompt type
      const promptData = data as unknown as Prompt;
      setPromptData(promptData);
      
      // Extract llm_settings safely
      let model = "gpt-4";
      let temperature = 0.7;
      let customModel = "";
      
      if (promptData.llm_settings) {
        try {
          if (typeof promptData.llm_settings === 'object') {
            // Using type assertion here since we've verified it's an object
            const settings = promptData.llm_settings as { model?: string; temperature?: number; customModel?: string };
            
            // Check if model is in our list, if not set to "other" and store in customModel
            if (settings.model && !LLM_MODELS.includes(settings.model)) {
              model = "other";
              customModel = settings.model;
            } else {
              model = settings.model || "gpt-4";
            }
            
            temperature = settings.temperature || 0.7;
          }
        } catch (e) {
          console.error("Error parsing llm_settings:", e);
        }
      }
      
      setSelectedModel(model);
      
      // Update form values
      form.reset({
        title: promptData.title || "",
        description: promptData.description || "",
        content: promptData.content || "",
        model: model,
        customModel: customModel,
        temperature: temperature,
        isPublic: promptData.is_public || false,
      });
    } catch (error: any) {
      console.error('Error fetching prompt:', error);
      toast.error('Failed to load prompt data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isAnonymous) {
      toast.error("You need to be signed in to save prompts");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Determine the actual model to save
      const actualModel = values.model === "other" && values.customModel 
        ? values.customModel.trim() 
        : values.model;
      
      const llm_settings = {
        model: actualModel,
        temperature: values.temperature
      };
      
      if (isEditing && promptData) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            title: values.title,
            description: values.description,
            content: values.content,
            llm_settings,
            is_public: values.isPublic,
            updated_at: new Date().toISOString()
          })
          .eq('id', promptData.id);
        
        if (error) throw error;
        
        // Handle collections for edited prompt
        await updatePromptCollections(promptData.id, selectedCollections);
        
        // Invalidate and refetch the prompts query
        queryClient.invalidateQueries({ queryKey: ['prompts', user.id] });
        
        toast.success('Prompt updated successfully!');
      } else {
        // Create new prompt
        const { data, error } = await supabase
          .from('prompts')
          .insert([
            {
              user_id: user.id,
              title: values.title,
              description: values.description,
              content: values.content,
              llm_settings,
              is_public: values.isPublic
            }
          ])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add prompt to selected collections
          await updatePromptCollections(data[0].id, selectedCollections);
          
          // Invalidate and refetch the prompts query
          queryClient.invalidateQueries({ queryKey: ['prompts', user.id] });
          
          toast.success('Prompt created successfully!');
        }
      }
      
      // Navigate back to My Prompts
      navigate('/my-prompts');
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast.error(`Failed to save prompt: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updatePromptCollections = async (promptId: string, collectionIds: string[]) => {
    try {
      // First, remove all existing associations
      const { error: deleteError } = await supabase
        .from('prompt_collections')
        .delete()
        .eq('prompt_id', promptId);
      
      if (deleteError) throw deleteError;
      
      // If there are selected collections, add new associations
      if (collectionIds.length > 0) {
        const collectionsToInsert = collectionIds.map(collectionId => ({
          prompt_id: promptId,
          collection_id: collectionId
        }));
        
        const { error: insertError } = await supabase
          .from('prompt_collections')
          .insert(collectionsToInsert);
        
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating prompt collections:', error);
      throw error; // Rethrow for the caller to handle
    }
  };
  
  const handleOptimizedContent = (optimizedContent: string) => {
    form.setValue('content', optimizedContent);
  };
  
  // SEO-friendly title and description
  const pageTitle = isEditing ? 'Edit AI Prompt - PromptNexis' : 'Create New AI Prompt - PromptNexis';
  const pageDescription = isEditing 
    ? 'Enhance and modify your existing AI prompt with our advanced editor. Update, refine, and optimize your AI prompts for better results.'
    : 'Create a new AI prompt using our advanced editor. Craft effective prompts for GPT-4, Claude, and other AI models with our optimization tools.';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="create AI prompt, prompt engineering, GPT-4 prompts, AI writing, prompt templates" />
        <link rel="canonical" href={`https://promptnexis.com/${isEditing ? `edit-prompt/${id}` : 'create-prompt'}`} />
      </Helmet>
      
      <Navbar />
      <main className="container mx-auto py-8 px-4 md:px-6 animate-fade-in">
        <div className="mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold mt-4 text-gradient-primary bg-clip-text text-transparent bg-gradient-to-r from-promptflow-purple to-promptflow-blue">
            {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? 'Update your prompt details and content' 
              : 'Create a new AI prompt to add to your collection'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-md hover:shadow-lg transition-all border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <CardTitle>
                  {isEditing ? 'Edit Prompt' : 'Prompt Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Title
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="E.g. GPT-4 Email Writer" 
                              {...field} 
                              disabled={isLoading}
                              className="border-gray-300 focus:border-promptflow-purple focus:ring-promptflow-purple"
                              aria-label="Prompt title"
                            />
                          </FormControl>
                          <FormDescription>
                            A descriptive title for your prompt
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Prompt content field right after the title */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Prompt Content
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your prompt content here..." 
                              {...field} 
                              className="min-h-32 font-mono border-gray-300 focus:border-promptflow-purple focus:ring-promptflow-purple"
                              disabled={isLoading}
                              aria-label="Prompt content"
                            />
                          </FormControl>
                          <FormDescription>
                            The actual prompt text that will be sent to the AI model
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Description (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Briefly describe what this prompt does" 
                              {...field} 
                              disabled={isLoading}
                              className="border-gray-300 focus:border-promptflow-purple focus:ring-promptflow-purple"
                              aria-label="Prompt description"
                            />
                          </FormControl>
                          <FormDescription>
                            A short description to help others understand what this prompt does
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Model
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => handleModelChange(value)} 
                              value={selectedModel}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-promptflow-purple focus:ring-promptflow-purple" aria-label="Select AI model">
                                  <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LLM_MODELS.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model === "other" ? "Other (custom)" : model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The AI model this prompt is designed for
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {selectedModel === "other" && (
                        <FormField
                          control={form.control}
                          name="customModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Custom Model Name
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter custom model name" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="border-gray-300 focus:border-promptflow-purple focus:ring-promptflow-purple"
                                  aria-label="Custom model name"
                                />
                              </FormControl>
                              <FormDescription>
                                Specify the name of your custom model
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Temperature ({field.value})
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="range" 
                                min="0" 
                                max="2" 
                                step="0.1"
                                {...field}
                                disabled={isLoading}
                                className="w-full h-8 accent-promptflow-purple"
                                aria-label="Temperature setting"
                              />
                            </FormControl>
                            <FormDescription>
                              Lower values = more predictable, higher = more creative
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                              className="data-[state=checked]:bg-promptflow-purple data-[state=checked]:border-promptflow-purple"
                              aria-label="Make prompt public"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Make this prompt public
                            </FormLabel>
                            <FormDescription>
                              Public prompts can be discovered by other users in the Explore section
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="border p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                      <h3 className="text-sm font-medium mb-2">Collections</h3>
                      <CollectionSelector 
                        selectedCollections={selectedCollections}
                        onSelectCollections={setSelectedCollections}
                        promptId={isEditing ? id : undefined}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90 transition-all"
                      aria-label={isEditing ? "Update prompt" : "Create prompt"}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          {isEditing ? 'Updating Prompt...' : 'Creating Prompt...'}
                        </>
                      ) : (
                        isEditing ? 'Update Prompt' : 'Create Prompt'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:block">
            <Card className="shadow-md hover:shadow-lg transition-all border-0 overflow-hidden sticky top-4">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <CardTitle>
                  Prompt Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="optimize">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="optimize" className="flex-1">Optimize</TabsTrigger>
                    <TabsTrigger value="examples" className="flex-1">Examples</TabsTrigger>
                  </TabsList>
                  <TabsContent value="optimize" className="pt-2">
                    <PromptOptimizer 
                      onOptimize={handleOptimizedContent}
                      initialContent={form.getValues('content')}
                    />
                  </TabsContent>
                  <TabsContent value="examples" className="pt-2">
                    <div className="text-sm space-y-4">
                      <p className="font-medium text-gray-700">Good prompt examples:</p>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <h4 className="font-medium text-promptflow-purple mb-1">Structure</h4>
                        <ul className="list-disc pl-4 text-gray-600">
                          <li>Be specific about the desired format</li>
                          <li>Include examples or templates</li>
                          <li>Define the tone and style</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <h4 className="font-medium text-promptflow-blue mb-1">Clarity</h4>
                        <ul className="list-disc pl-4 text-gray-600">
                          <li>Set clear constraints</li>
                          <li>Specify any technical requirements</li>
                          <li>Indicate content length expectations</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePrompt;

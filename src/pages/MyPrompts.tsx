
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PromptOptimizer from '@/components/PromptOptimizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Prompt {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
}

const MyPrompts = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Partial<Prompt> | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('manual');

  const fetchPrompts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPrompts(data || []);
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        variant: "destructive",
        title: "Failed to load prompts",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);
  
  const openCreateDialog = () => {
    setCurrentPrompt(null);
    setTitle('');
    setContent('');
    setIsPublic(false);
    setActiveTab('manual');
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setTitle(prompt.title);
    setContent(prompt.content);
    setIsPublic(prompt.is_public);
    setActiveTab('manual');
    setIsDialogOpen(true);
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // Ensure title and content are not empty
      if (!title.trim()) {
        toast({
          variant: "destructive",
          title: "Missing title",
          description: "Please provide a title for your prompt.",
        });
        return;
      }

      if (!content.trim()) {
        toast({
          variant: "destructive",
          title: "Missing content",
          description: "Please provide content for your prompt.",
        });
        return;
      }

      if (currentPrompt?.id) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            title,
            content,
            is_public: isPublic
          })
          .eq('id', currentPrompt.id);
        
        if (error) throw error;
        
        toast({
          title: "Prompt updated",
          description: "Your prompt has been updated successfully.",
        });
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('prompts')
          .insert({
            user_id: user.id,
            title,
            content,
            is_public: isPublic
          });
        
        if (error) throw error;
        
        toast({
          title: "Prompt created",
          description: "Your prompt has been created successfully.",
        });
      }
      
      setIsDialogOpen(false);
      fetchPrompts();
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast({
        variant: "destructive",
        title: "Failed to save prompt",
        description: error.message,
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Prompt deleted",
        description: "Your prompt has been deleted successfully.",
      });
      
      fetchPrompts();
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete prompt",
        description: error.message,
      });
    }
  };

  const handleOptimize = (optimizedContent: string) => {
    setContent(optimizedContent);
    // Auto-switch to manual tab after optimization
    setActiveTab('manual');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Prompts</h1>
        <Button 
          onClick={openCreateDialog} 
          className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue"
        >
          <Plus size={16} className="mr-2" /> New Prompt
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading prompts...</div>
      ) : prompts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-10">
            <p className="text-gray-500 mb-4">You haven't created any prompts yet.</p>
            <Button 
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue"
            >
              Create your first prompt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">{prompt.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${prompt.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {prompt.is_public ? 'Public' : 'Private'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(prompt.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(prompt)}
                        className="h-8 w-8"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(prompt.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentPrompt ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
            <DialogDescription>
              {currentPrompt
                ? 'Update your prompt details below.'
                : 'Fill in the details to create a new prompt.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter prompt title" 
                required 
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Write Manually</TabsTrigger>
                <TabsTrigger value="optimize">
                  <Sparkles size={16} className="mr-2" />
                  AI Optimize
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-2">
                <Label htmlFor="content">Prompt Content</Label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Write your prompt here..." 
                  className="h-40 resize-none" 
                  required 
                />
              </TabsContent>
              
              <TabsContent value="optimize" className="pt-2">
                <PromptOptimizer onOptimize={handleOptimize} initialContent={content} />
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="public" 
                checked={isPublic} 
                onCheckedChange={setIsPublic} 
              />
              <Label htmlFor="public" className="cursor-pointer">Make this prompt public</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue">
                {currentPrompt ? 'Update Prompt' : 'Create Prompt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPrompts;

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Sparkles, Shield, Eye, ChevronRight, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PromptOptimizer from '@/components/PromptOptimizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import PromptCard from '@/components/PromptCard';
import CollectionsList from '@/components/collections/CollectionsList';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import Separator from '@/components/ui/separator';

interface Prompt {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
}

// Key for storing anonymous prompts in local storage
const ANONYMOUS_PROMPTS_KEY = 'promptflow-anonymous-prompts';

const MyPrompts = () => {
  const navigate = useNavigate();
  const { user, isAnonymous, enableAnonymousMode, disableAnonymousMode } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivacySheetOpen, setIsPrivacySheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeView, setActiveView] = useState<'all' | 'collection'>('all');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [collectionPrompts, setCollectionPrompts] = useState<Prompt[]>([]);

  const fetchPrompts = async () => {
    setIsLoading(true);
    
    if (isAnonymous) {
      // Load prompts from localStorage for anonymous users
      const storedPrompts = localStorage.getItem(ANONYMOUS_PROMPTS_KEY);
      if (storedPrompts) {
        try {
          setPrompts(JSON.parse(storedPrompts));
        } catch (error) {
          console.error('Error parsing stored prompts:', error);
          setPrompts([]);
        }
      } else {
        setPrompts([]);
      }
      setIsLoading(false);
      return;
    }
    
    if (!user) {
      setPrompts([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPrompts(data || []);
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast.error("Failed to load prompts: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrompts();
  }, [user, isAnonymous]);

  const fetchCollectionPrompts = async (collectionId: string) => {
    if (!collectionId || isAnonymous || !user) return;
    
    setIsLoading(true);
    
    try {
      // First get all prompt_ids in this collection
      const { data: promptCollections, error: collectionError } = await supabase
        .from('prompt_collections')
        .select('prompt_id')
        .eq('collection_id', collectionId);
      
      if (collectionError) throw collectionError;
      
      if (promptCollections && promptCollections.length > 0) {
        const promptIds = promptCollections.map(item => item.prompt_id);
        
        // Then get the prompt details
        const { data: promptData, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .in('id', promptIds)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (promptsError) throw promptsError;
        
        setCollectionPrompts(promptData || []);
      } else {
        setCollectionPrompts([]);
      }
    } catch (error: any) {
      console.error('Error fetching collection prompts:', error);
      toast.error("Failed to load collection prompts: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeCollectionId) {
      fetchCollectionPrompts(activeCollectionId);
    } else {
      setCollectionPrompts([]);
    }
  }, [activeCollectionId, user]);
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    
    if (isAnonymous) {
      try {
        const storedPromptsJson = localStorage.getItem(ANONYMOUS_PROMPTS_KEY);
        if (storedPromptsJson) {
          const storedPrompts: Prompt[] = JSON.parse(storedPromptsJson);
          const updatedPrompts = storedPrompts.filter(p => p.id !== id);
          localStorage.setItem(ANONYMOUS_PROMPTS_KEY, JSON.stringify(updatedPrompts));
          setPrompts(updatedPrompts);
          
          toast.success("Prompt deleted successfully");
        }
      } catch (error: any) {
        console.error('Error deleting prompt from localStorage:', error);
        toast.error("Failed to delete prompt: " + (error.message || "Unknown error"));
      }
      return;
    }
    
    try {
      // First delete all associations with collections
      await supabase
        .from('prompt_collections')
        .delete()
        .eq('prompt_id', id);
      
      // Then delete the prompt itself
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Prompt deleted successfully");
      
      if (activeCollectionId) {
        fetchCollectionPrompts(activeCollectionId);
      } else {
        fetchPrompts();
      }
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast.error("Failed to delete prompt: " + (error.message || "Unknown error"));
    }
  };

  const toggleAnonymousMode = () => {
    if (isAnonymous) {
      disableAnonymousMode();
    } else {
      enableAnonymousMode();
    }
    // Refresh prompts after toggling anonymous mode
    fetchPrompts();
  };

  const viewPrompt = (id: string) => {
    navigate(`/prompt/${id}`);
  };
  
  const editPrompt = (id: string) => {
    navigate(`/edit-prompt/${id}`);
  };
  
  const createNewPrompt = () => {
    navigate('/create-prompt');
  };
  
  const handleCollectionClick = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setActiveView('collection');
  };

  const displayPrompts = activeView === 'collection' ? collectionPrompts : prompts;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-promptflow-purple to-promptflow-blue bg-clip-text text-transparent">My Prompts</h1>
          {isAnonymous && (
            <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
              <Shield size={14} className="mr-1" /> Anonymous Mode
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              onClick={() => setViewMode('list')} 
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className="rounded-none"
              size="sm"
            >
              List
            </Button>
            <Button 
              onClick={() => setViewMode('grid')} 
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="rounded-none"
              size="sm"
            >
              Grid
            </Button>
          </div>
          <Button 
            onClick={() => setIsPrivacySheetOpen(true)} 
            variant="outline"
            className="flex items-center"
          >
            <Shield size={16} className="mr-2" /> Privacy
          </Button>
          <Button 
            onClick={createNewPrompt} 
            className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
          >
            <Plus size={16} className="mr-2" /> New Prompt
          </Button>
        </div>
      </div>
      
      <div className="flex gap-6">
        {/* Sidebar for Collections */}
        <div className="hidden md:block w-64 shrink-0">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Collections</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-1">
                <Button 
                  variant={activeView === 'all' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveView('all')}
                >
                  All Prompts
                </Button>
                <Separator className="my-2" />
                <CollectionsList onCollectionClick={handleCollectionClick} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Mobile Collections Toggle */}
          <div className="block md:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {activeView === 'all' ? 'All Prompts' : 'Collection View'}
                  <ChevronRight size={16} className="rotate-90" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[50vh]">
                <SheetHeader>
                  <SheetTitle>Collections</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  <Button 
                    variant={activeView === 'all' ? 'secondary' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveView('all');
                      document.querySelector('[data-radix-collection-item]')?.closest('div[data-state="open"]')?.dispatchEvent(new Event('close'));
                    }}
                  >
                    All Prompts
                  </Button>
                  <Separator className="my-2" />
                  <CollectionsList 
                    onCollectionClick={(id) => {
                      handleCollectionClick(id);
                      document.querySelector('[data-radix-collection-item]')?.closest('div[data-state="open"]')?.dispatchEvent(new Event('close'));
                    }} 
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {activeView === 'collection' && activeCollectionId && (
            <div className="mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveView('all')}
                className="flex items-center gap-1"
              >
                <ChevronRight size={16} className="rotate-180" />
                <span>Back to all prompts</span>
              </Button>
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : displayPrompts.length === 0 ? (
            <Card className="text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50 border-dashed border-2 border-blue-200">
              <CardContent className="pt-6 text-center py-10">
                <img 
                  src="https://api.dicebear.com/7.x/shapes/svg?seed=empty-prompts" 
                  alt="No prompts" 
                  className="w-32 h-32 mx-auto mb-6 opacity-70"
                />
                <p className="text-gray-500 mb-6 text-lg">
                  {isAnonymous ? 
                    "You haven't created any prompts in anonymous mode yet." : 
                    activeView === 'collection' ? 
                      "No prompts in this collection yet." :
                      "You haven't created any prompts yet."}
                </p>
                <p className="text-gray-500 mb-6">
                  {activeView === 'collection' ? 
                    "Add prompts to this collection when creating or editing a prompt." :
                    "Start creating prompts to enhance your AI interactions!"}
                </p>
                {activeView !== 'collection' && (
                  <Button 
                    onClick={createNewPrompt}
                    className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
                  >
                    <Plus size={16} className="mr-2" /> Create your first prompt
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {displayPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.content}
                  llm="AI" // This could be replaced with actual LLM data if available
                  useCase={prompt.is_public ? "Public" : "Private"}
                  upvotes={0}
                  author={user?.email || "You"}
                  showViewButton={true}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-sm border-blue-100">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayPrompts.map((prompt) => (
                      <TableRow key={prompt.id} className="hover:bg-blue-50/30">
                        <TableCell className="font-medium">
                          <div 
                            className="cursor-pointer hover:text-blue-600 hover:underline" 
                            onClick={() => viewPrompt(prompt.id)}
                          >
                            {prompt.title}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`px-2 py-1 text-xs rounded-full ${prompt.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {prompt.is_public ? 'Public' : 'Private'}
                          </span>
                          {isAnonymous && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Local
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{new Date(prompt.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => viewPrompt(prompt.id)}
                              className="h-8 w-8 text-blue-600"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => editPrompt(prompt.id)}
                              className="h-8 w-8"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(prompt.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Privacy Settings Sheet */}
      <Sheet open={isPrivacySheetOpen} onOpenChange={setIsPrivacySheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Privacy Settings</SheetTitle>
            <SheetDescription>
              Control how your data is stored and used.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Anonymous Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    When enabled, your prompts will be stored locally in your browser rather than in your account.
                    No personal identifiers like email or IP address will be associated with your activities.
                  </p>
                </div>
                <Switch id="anonymous-mode" checked={isAnonymous} onCheckedChange={toggleAnonymousMode} />
              </div>
              
              {isAnonymous && (
                <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mt-4">
                  <p className="font-medium">Important Note</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Your prompts are only stored in this browser</li>
                    <li>Clearing your browser data will erase all anonymous prompts</li>
                    <li>These prompts won't sync across devices</li>
                    <li>To permanently save your work, disable anonymous mode and sign in</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Data Privacy Information</h3>
              <div className="space-y-4 text-sm">
                <p>
                  We're committed to protecting your data privacy. Your prompts are only visible to you unless 
                  explicitly marked as public.
                </p>
                <p>
                  You can delete your account and all associated data at any time through the account settings.
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setIsPrivacySheetOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyPrompts;

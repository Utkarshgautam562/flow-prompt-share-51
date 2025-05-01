
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, FolderPlus, Share2, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import FolderStructure from '../FolderStructure';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_shared: boolean;
  share_id: string;
  created_at: string;
}

interface CollectionsListProps {
  onCollectionClick?: (collectionId: string) => void;
}

const CollectionsList: React.FC<CollectionsListProps> = ({ onCollectionClick }) => {
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const queryClient = useQueryClient();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isShared, setIsShared] = useState(false);

  // Use React Query to fetch collections with caching
  const { 
    data: collections = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['collections', user?.id],
    queryFn: async () => {
      if (isAnonymous || !user) return [];
      
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Collection[] || [];
    },
    enabled: !!user && !isAnonymous,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching collections:', error);
        toast.error(`Failed to load collections: ${error.message}`);
      }
    }
  });

  // Create/update collection mutation
  const saveCollectionMutation = useMutation({
    mutationFn: async (collection: {
      id?: string;
      name: string;
      description: string | null;
      is_shared: boolean;
      user_id: string;
    }) => {
      if (collection.id) {
        // Update existing collection
        const { error } = await supabase
          .from('collections')
          .update({
            name: collection.name,
            description: collection.description,
            is_shared: collection.is_shared
          })
          .eq('id', collection.id);
        
        if (error) throw error;
        return collection;
      } else {
        // Create new collection
        const { error } = await supabase
          .from('collections')
          .insert([{
            user_id: collection.user_id,
            name: collection.name,
            description: collection.description || null,
            is_shared: collection.is_shared
          }]);
        
        if (error) throw error;
        return collection;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', user?.id] });
      toast.success(editingCollection ? "Collection updated" : "Collection created");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Error saving collection:', error);
      toast.error(`Failed to save: ${error.message}`);
    }
  });
  
  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete all prompt associations
      const { error: deleteAssociationsError } = await supabase
        .from('prompt_collections')
        .delete()
        .eq('collection_id', id);
      
      if (deleteAssociationsError) throw deleteAssociationsError;
      
      // Then delete the collection itself
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', user?.id] });
      toast.success("Collection deleted successfully");
    },
    onError: (error: any) => {
      console.error('Error deleting collection:', error);
      toast.error(`Failed to delete: ${error.message}`);
    }
  });

  // Convert collections to format expected by FolderStructure
  const getFolderItems = () => {
    return collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      type: 'folder' as const,
      children: [] // We'll populate this later when viewing a collection
    }));
  };

  const handleNewCollection = () => {
    setEditingCollection(null);
    setName('');
    setDescription('');
    setIsShared(false);
    setIsDialogOpen(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setName(collection.name);
    setDescription(collection.description || '');
    setIsShared(collection.is_shared || false);
    setIsDialogOpen(true);
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection? Prompts in this collection will not be deleted.")) {
      return;
    }
    
    deleteCollectionMutation.mutate(id);
  };

  const handleShareCollection = (collection: Collection) => {
    const shareUrl = `${window.location.origin}/collection/shared/${collection.share_id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Collection link copied to clipboard!");
  };

  const handleSaveCollection = async () => {
    try {
      if (!name.trim()) {
        toast.error("Collection name is required");
        return;
      }

      if (isAnonymous) {
        toast.error("You need to sign in to create collections");
        return;
      }

      if (!user) {
        toast.error("You must be logged in");
        return;
      }
      
      saveCollectionMutation.mutate({
        id: editingCollection?.id,
        name,
        description: description || null,
        is_shared: isShared,
        user_id: user.id
      });
    } catch (error: any) {
      console.error('Error saving collection:', error);
      toast.error(`Failed to save collection: ${error.message}`);
    }
  };

  const handleCollectionClick = (id: string) => {
    if (onCollectionClick) {
      onCollectionClick(id);
    } else {
      navigate(`/collection/${id}`);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center bg-white rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-600 mb-2">Failed to load collections</h3>
        <p className="text-gray-500 mb-4">There was a problem loading your collections.</p>
        <Button 
          onClick={() => refetch()} 
          variant="outline"
          className="mx-auto"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Collections</h2>
        <Button 
          onClick={handleNewCollection}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <FolderPlus size={16} />
          <span>New Collection</span>
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card className="p-6 text-center bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <FolderPlus size={40} className="text-gray-400" />
            <p className="text-gray-500">No collections yet</p>
            <Button 
              onClick={handleNewCollection}
              size="sm"
              className="mt-2"
            >
              Create your first collection
            </Button>
          </div>
        </Card>
      ) : (
        <FolderStructure 
          items={getFolderItems()}
          onSelectItem={(item) => {
            if (item.type === 'folder') {
              handleCollectionClick(item.id);
            }
          }}
        />
      )}

      {collections.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium text-gray-600">All Collections</h3>
          <div className="space-y-2">
            {collections.map((collection) => (
              <div key={collection.id} className="flex items-center justify-between p-2 bg-white border rounded-md hover:bg-gray-50">
                <div 
                  className="flex-1 cursor-pointer flex items-center gap-2"
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <span>{collection.name}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
                <div className="flex items-center space-x-2">
                  {collection.is_shared && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleShareCollection(collection)} 
                      className="h-8 w-8 p-0"
                    >
                      <Share2 size={16} />
                      <span className="sr-only">Share</span>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditCollection(collection)} 
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={16} />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteCollection(collection.id)} 
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    disabled={deleteCollectionMutation.isPending}
                  >
                    <Trash2 size={16} />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCollection ? 'Edit Collection' : 'Create New Collection'}
            </DialogTitle>
            <DialogDescription>
              {editingCollection 
                ? 'Update your collection details below.' 
                : 'Organize your prompts by creating a new collection.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="My Collection" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea 
                id="description" 
                placeholder="What this collection is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-shared"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
              <Label htmlFor="is-shared">Make this collection public</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={saveCollectionMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCollection} 
              className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90"
              disabled={saveCollectionMutation.isPending}
            >
              {saveCollectionMutation.isPending 
                ? 'Saving...' 
                : (editingCollection ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsList;

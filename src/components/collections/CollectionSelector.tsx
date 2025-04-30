
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
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

interface Collection {
  id: string;
  name: string;
}

interface CollectionSelectorProps {
  selectedCollections: string[];
  onSelectCollections: (collections: string[]) => void;
  promptId?: string;
}

const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  selectedCollections,
  onSelectCollections,
  promptId
}) => {
  const { user, isAnonymous } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const fetchCollections = async () => {
    if (isAnonymous || !user) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      setCollections(data || []);
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      toast.error(`Failed to load collections: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromptCollections = async () => {
    if (!promptId || isAnonymous || !user) return;

    try {
      const { data, error } = await supabase
        .from('prompt_collections')
        .select('collection_id')
        .eq('prompt_id', promptId);
      
      if (error) throw error;
      
      if (data) {
        const collectionIds = data.map(item => item.collection_id);
        onSelectCollections(collectionIds);
      }
    } catch (error: any) {
      console.error('Error fetching prompt collections:', error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [user, isAnonymous]);

  useEffect(() => {
    if (promptId) {
      fetchPromptCollections();
    }
  }, [promptId, user]);

  const handleSelectCollection = (collectionId: string) => {
    if (!selectedCollections.includes(collectionId)) {
      onSelectCollections([...selectedCollections, collectionId]);
    }
  };

  const handleRemoveCollection = (collectionId: string) => {
    onSelectCollections(selectedCollections.filter(id => id !== collectionId));
  };

  const getCollectionById = (id: string) => {
    return collections.find(collection => collection.id === id);
  };

  const handleCreateNewCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      if (isAnonymous) {
        toast.error("You need to be logged in to create collections");
        return;
      }

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { data, error } = await supabase
        .from('collections')
        .insert([{
          user_id: user.id,
          name: newCollectionName.trim()
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("Collection created successfully");
        setDialogOpen(false);
        setNewCollectionName('');
        fetchCollections();
        handleSelectCollection(data[0].id);
      }
    } catch (error: any) {
      console.error('Error creating collection:', error);
      toast.error(`Failed to create collection: ${error.message}`);
    }
  };

  if (isAnonymous) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-sm mb-4">
        <p>You need to be logged in to organize prompts into collections.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {selectedCollections.map((collectionId) => {
          const collection = getCollectionById(collectionId);
          if (!collection) return null;
          return (
            <Badge key={collectionId} variant="secondary" className="flex items-center gap-1">
              {collection.name}
              <X 
                size={12} 
                className="cursor-pointer" 
                onClick={() => handleRemoveCollection(collectionId)}
              />
            </Badge>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Select 
          onValueChange={handleSelectCollection}
          disabled={isLoading || collections.length === 0}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Add to collection" />
          </SelectTrigger>
          <SelectContent>
            {collections
              .filter(collection => !selectedCollections.includes(collection.id))
              .map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button 
          type="button" 
          variant="outline"
          size="icon"
          onClick={() => setDialogOpen(true)}
        >
          <FolderPlus size={16} />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your prompts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input 
                id="name" 
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="My Collection"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewCollection} className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionSelector;

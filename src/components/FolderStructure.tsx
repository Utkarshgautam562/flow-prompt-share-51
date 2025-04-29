
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  children: (FolderItem | PromptItem)[];
}

interface PromptItem {
  id: string;
  name: string;
  type: 'prompt';
  llm: string;
}

type Item = FolderItem | PromptItem;

interface FolderStructureProps {
  items: Item[];
  onSelectItem?: (item: Item) => void;
}

const FolderItemComponent: React.FC<{
  item: FolderItem;
  level: number;
  onSelectItem?: (item: Item) => void;
}> = ({ item, level, onSelectItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <div 
        className="flex items-center py-1 px-2 hover:bg-accent rounded cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          if (onSelectItem) onSelectItem(item);
        }}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <span className="mr-1.5">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <span className="mr-1.5">
          {isOpen ? <FolderOpen className="h-4 w-4 text-promptflow-blue" /> : <Folder className="h-4 w-4 text-promptflow-blue" />}
        </span>
        <span className="text-sm">{item.name}</span>
      </div>
      
      {isOpen && (
        <div>
          {item.children.map((child) => (
            <div key={child.id}>
              {child.type === 'folder' ? (
                <FolderItemComponent 
                  item={child as FolderItem} 
                  level={level + 1} 
                  onSelectItem={onSelectItem} 
                />
              ) : (
                <PromptItemComponent 
                  item={child as PromptItem} 
                  level={level + 1} 
                  onSelectItem={onSelectItem} 
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PromptItemComponent: React.FC<{
  item: PromptItem;
  level: number;
  onSelectItem?: (item: Item) => void;
}> = ({ item, level, onSelectItem }) => {
  return (
    <div 
      className="flex items-center py-1 px-2 hover:bg-accent rounded cursor-pointer"
      onClick={() => {
        if (onSelectItem) onSelectItem(item);
      }}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
    >
      <span className="text-sm">{item.name}</span>
      <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500">{item.llm}</span>
    </div>
  );
};

const FolderStructure: React.FC<FolderStructureProps> = ({ items, onSelectItem }) => {
  return (
    <div className="border rounded-lg p-2 bg-white">
      {items.map((item) => (
        <div key={item.id}>
          {item.type === 'folder' ? (
            <FolderItemComponent 
              item={item as FolderItem} 
              level={0} 
              onSelectItem={onSelectItem} 
            />
          ) : (
            <PromptItemComponent 
              item={item as PromptItem} 
              level={0} 
              onSelectItem={onSelectItem} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FolderStructure;

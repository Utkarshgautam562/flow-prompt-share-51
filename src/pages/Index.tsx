
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import PromptCard from '@/components/PromptCard';
import FolderStructure from '@/components/FolderStructure';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for demonstration
const featuredPrompts = [
  { 
    id: '1',
    title: 'Data Analysis Expert', 
    description: 'Optimized prompt for data analysis and visualization. Works great with complex datasets and multiple variables.', 
    llm: 'GPT-4', 
    useCase: 'Data Analysis', 
    upvotes: 128, 
    author: 'data_wizard' 
  },
  { 
    id: '2',
    title: 'Creative Story Builder', 
    description: 'Generate engaging short stories with complex characters and intricate plots. Includes character development guidelines.', 
    llm: 'Claude 3', 
    useCase: 'Creative Writing', 
    upvotes: 95, 
    author: 'novelist99' 
  },
  { 
    id: '3',
    title: 'SEO Content Optimizer', 
    description: 'Create SEO-friendly content with keyword density analysis and readability improvements. Perfect for blog posts.', 
    llm: 'GPT-4', 
    useCase: 'Marketing', 
    upvotes: 83, 
    author: 'seo_pro' 
  },
  { 
    id: '4',
    title: 'Technical Documentation Generator', 
    description: 'Generate comprehensive API documentation with code examples in multiple languages. Follows industry standards.', 
    llm: 'Claude 3', 
    useCase: 'Development', 
    upvotes: 72, 
    author: 'tech_writer' 
  }
];

// Mock folder structure data
const folderStructure = [
  {
    id: 'f1',
    name: 'Marketing',
    type: 'folder' as const,
    children: [
      {
        id: 'f1-1',
        name: 'SEO',
        type: 'folder' as const,
        children: [
          {
            id: 'p1',
            name: 'Keyword Research',
            type: 'prompt' as const,
            llm: 'GPT-4'
          },
          {
            id: 'p2',
            name: 'Meta Description',
            type: 'prompt' as const,
            llm: 'Claude 3'
          }
        ]
      },
      {
        id: 'p3',
        name: 'Social Media Post',
        type: 'prompt' as const,
        llm: 'GPT-4'
      }
    ]
  },
  {
    id: 'f2',
    name: 'Development',
    type: 'folder' as const,
    children: [
      {
        id: 'p4',
        name: 'Code Refactoring',
        type: 'prompt' as const,
        llm: 'GPT-4'
      },
      {
        id: 'p5',
        name: 'Bug Fix Helper',
        type: 'prompt' as const,
        llm: 'Claude 3'
      }
    ]
  }
];

const Index = () => {
  const { user } = useAuth();
  
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // In a real app, this would trigger a search request
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-blue-50 pt-16 pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-promptflow-purple to-promptflow-blue bg-clip-text text-transparent">
                Organize, Optimize, and Deploy AI Prompts
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                The ultimate platform for managing your AI prompts with team collaboration. 
                Think 1Password meets GitHub for AI workflows.
              </p>
            </div>
            
            <div className="w-full max-w-3xl">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="flex gap-4">
              {user ? (
                <Link to="/my-prompts">
                  <Button className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
                    My Prompts
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
                    Get Started Free
                  </Button>
                </Link>
              )}
              <Link to="/explore">
                <Button variant="outline">
                  Explore Prompts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Prompts Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Featured Prompts</h2>
              <p className="text-gray-500">
                Discover high-quality prompts from the community
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.description}
                  llm={prompt.llm}
                  useCase={prompt.useCase}
                  upvotes={prompt.upvotes}
                  author={prompt.author}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Organization and Workflow Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Organize Your Prompts with Smart Folders
              </h2>
              <p className="text-gray-500">
                Create nested folder structures with drag-and-drop simplicity. 
                Manage permissions and collaborate with your team, all in one place.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-green-100 text-green-700 p-1 rounded-full mr-2">✓</span>
                  <span>AI-powered tagging and organization</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-green-100 text-green-700 p-1 rounded-full mr-2">✓</span>
                  <span>Version history with restore points</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-green-100 text-green-700 p-1 rounded-full mr-2">✓</span>
                  <span>Team collaboration with role-based permissions</span>
                </li>
              </ul>
              {user ? (
                <Link to="/my-prompts">
                  <Button className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
                    Start Organizing
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
                    Start Organizing
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="relative">
              <div className="border rounded-lg shadow-lg bg-white p-4">
                <h3 className="text-lg font-semibold mb-4">My Prompt Library</h3>
                <FolderStructure 
                  items={folderStructure} 
                  onSelectItem={(item) => console.log('Selected item:', item)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t py-12 mt-auto">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue rounded-md w-8 h-8"></div>
              <span className="text-xl font-bold">PromptFlow</span>
            </div>
            <div className="mt-6 md:mt-0">
              <p className="text-gray-500 text-sm">
                © 2025 PromptFlow. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

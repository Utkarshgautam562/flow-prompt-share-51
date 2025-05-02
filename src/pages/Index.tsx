
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import PromptCard from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Brain, Puzzle, Zap, Code, MessageSquare } from 'lucide-react';

// Mock data for demonstration
const featuredPrompts = [{
  id: '1',
  title: 'Data Analysis Expert',
  description: 'Optimized prompt for data analysis and visualization. Works great with complex datasets and multiple variables.',
  llm: 'GPT-4',
  useCase: 'Data Analysis',
  upvotes: 128,
  author: 'data_wizard'
}, {
  id: '2',
  title: 'Creative Story Builder',
  description: 'Generate engaging short stories with complex characters and intricate plots. Includes character development guidelines.',
  llm: 'Claude 3',
  useCase: 'Creative Writing',
  upvotes: 95,
  author: 'novelist99'
}, {
  id: '3',
  title: 'SEO Content Optimizer',
  description: 'Create SEO-friendly content with keyword density analysis and readability improvements. Perfect for blog posts.',
  llm: 'GPT-4',
  useCase: 'Marketing',
  upvotes: 83,
  author: 'seo_pro'
}, {
  id: '4',
  title: 'Technical Documentation Generator',
  description: 'Generate comprehensive API documentation with code examples in multiple languages. Follows industry standards.',
  llm: 'Claude 3',
  useCase: 'Development',
  upvotes: 72,
  author: 'tech_writer'
}];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    // Navigate to the explore page with search parameters
    const searchParams = new URLSearchParams();
    if (query) {
      searchParams.append('q', query);
    }
    if (searchFilters.llmModel && searchFilters.llmModel !== 'All Models') {
      searchParams.append('model', searchFilters.llmModel);
    }
    if (searchFilters.useCase && searchFilters.useCase !== 'All Use Cases') {
      searchParams.append('useCase', searchFilters.useCase);
    }
    if (searchFilters.sortBy && searchFilters.sortBy !== 'relevance') {
      searchParams.append('sort', searchFilters.sortBy);
    }
    navigate(`/explore?${searchParams.toString()}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>PromptNexis - Share and Discover AI Prompts for ChatGPT, Claude, and More</title>
        <meta name="description" content="Create, share, organize, and discover high-quality AI prompts with PromptNexis. The ultimate platform for managing your AI prompts with team collaboration." />
        <link rel="canonical" href="https://promptnexis.com/" />
        <meta name="keywords" content="AI prompts, ChatGPT, GPT-4, Claude, Gemini, prompt library, prompt engineering, AI tools" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://promptnexis.com/" />
        <meta property="og:title" content="PromptNexis - Share and Discover AI Prompts" />
        <meta property="og:description" content="Create, share, organize, and discover high-quality AI prompts with PromptNexis." />
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-blue-50 pt-16 pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Organize, Optimize, and Deploy AI Prompts
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">The ultimate platform for managing your AI prompts with team collaboration. </p>
            </div>
            
            <div className="w-full max-w-3xl">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="flex gap-4">
              {user ? (
                <>
                  <Link to="/my-prompts">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                      My Prompts
                    </Button>
                  </Link>
                  <Link to="/create-prompt">
                    <Button variant="outline">
                      Create Prompt
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
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
      <section className="py-16" aria-labelledby="featured-prompts-heading">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <h2 id="featured-prompts-heading" className="text-3xl font-bold tracking-tight">Featured Prompts</h2>
              <p className="text-gray-500">
                Discover high-quality prompts from the community
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPrompts.map(prompt => (
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
      
      {/* Features Section (Replaces Folder Structure) */}
      <section className="py-16 bg-gray-50" aria-labelledby="features-heading">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight mb-3">
              Supercharge Your AI Prompt Workflow
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our platform provides everything you need to create, manage, and optimize your AI prompts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <CardTitle>Optimize Your Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Use our AI-powered tools to analyze and improve your prompts for better results across different LLMs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Collaborative Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Share and collaborate on prompts with your team. Track changes, leave comments, and work together.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Puzzle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Prompt Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Start with our library of templates for different use cases and customize them to your needs.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Version Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Keep track of prompt iterations with built-in version history. Roll back changes anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">API Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Deploy prompts directly to applications via our API. Seamless integration with your existing tools.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Gain insights into prompt performance, usage patterns, and opportunities for improvement.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link to={user ? "/my-prompts" : "/auth"}>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 px-8">
                {user ? "Go to Dashboard" : "Get Started Today"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t py-12 mt-auto">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-md w-8 h-8" aria-hidden="true"></div>
                <span className="text-xl font-bold">PromptNexis</span>
              </div>
              <div className="mt-6 md:mt-0">
                <p className="text-gray-500 text-sm">
                  © 2025 PromptNexis. All rights reserved.
                </p>
              </div>
            </div>
            
            {/* Legal Links */}
            <nav aria-label="Legal links">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <Link to="/terms" className="hover:underline">Terms of Service</Link>
                <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                <Link to="/disclaimer" className="hover:underline">Disclaimer</Link>
                <Link to="/cookie-policy" className="hover:underline">Cookie Policy</Link>
              </div>
            </nav>
            
            {/* Contact Email */}
            <div className="text-center text-sm text-gray-500">
              <p>Contact us: <a href="mailto:promptnexis@gmail.com" className="text-blue-600 hover:underline">promptnexis@gmail.com</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

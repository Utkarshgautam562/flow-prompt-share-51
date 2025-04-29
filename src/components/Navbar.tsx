
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue rounded-md w-8 h-8"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-promptflow-purple to-promptflow-blue bg-clip-text text-transparent">
              PromptFlow
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center ml-8 space-x-4">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-promptflow-purple">
            Explore
          </Link>
          <Link to="/" className="text-sm font-medium transition-colors hover:text-promptflow-purple">
            My Prompts
          </Link>
          <Link to="/" className="text-sm font-medium transition-colors hover:text-promptflow-purple">
            Teams
          </Link>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Search className="h-4 w-4 mr-2" />
            Search Prompts
          </Button>
          
          <Button size="sm" variant="default" className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
            Sign Up Free
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

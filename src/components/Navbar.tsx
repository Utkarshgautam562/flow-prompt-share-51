
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Menu, X, User } from "lucide-react";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue rounded-md w-8 h-8"></div>
          <span className="text-xl font-bold">PromptFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/explore" className="text-gray-700 hover:text-gray-900">
            Explore
          </Link>
          {user ? (
            <>
              <Link to="/my-prompts" className="text-gray-700 hover:text-gray-900">
                My Prompts
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <User size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {profile?.username || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-prompts" className="cursor-pointer">My Prompts</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={toggleMenu} size="icon">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <Link 
              to="/explore" 
              className="block py-2 text-gray-700 hover:text-gray-900"
              onClick={toggleMenu}
            >
              Explore
            </Link>
            {user ? (
              <>
                <Link 
                  to="/my-prompts" 
                  className="block py-2 text-gray-700 hover:text-gray-900"
                  onClick={toggleMenu}
                >
                  My Prompts
                </Link>
                <div className="pt-2 border-t">
                  <div className="py-2 text-sm text-gray-500">
                    {profile?.username || user.email}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center mt-2"
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth" onClick={toggleMenu} className="block w-full">
                <Button className="w-full bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

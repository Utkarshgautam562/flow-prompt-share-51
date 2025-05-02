
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User, Lock, Unlock, Plus } from 'lucide-react';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, exact = true }) => {
  const location = useLocation();
  const isActive = exact ? location.pathname === href : location.pathname.startsWith(href);
  
  return (
    <Link
      to={href}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAnonymous, enableAnonymousMode, disableAnonymousMode, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleToggleAnonymousMode = () => {
    if (isAnonymous) {
      disableAnonymousMode();
    } else {
      enableAnonymousMode();
    }
  };
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-20">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center logo-container h-16">
              <img
                src="/lovable-uploads/bd924504-e9e9-402c-a6f7-2ee8e99f01f2.png"
                alt="PromptNexis"
                width="160"
                height="40"
                className="h-auto max-h-full w-32 md:w-40"
                loading="lazy"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 lg:ml-8 md:flex md:space-x-2 lg:space-x-4">
              <NavItem href="/">Home</NavItem>
              <NavItem href="/explore">Explore</NavItem>
              {user && <NavItem href="/my-prompts">My Prompts</NavItem>}
            </nav>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Create Prompt Button - Desktop */}
            {user && (
              <Button 
                onClick={() => navigate('/create-prompt')}
                className="hidden md:flex gap-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
              >
                <Plus size={16} />
                Create Prompt
              </Button>
            )}

            {/* Anonymous Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleAnonymousMode}
              title={isAnonymous ? "Exit Anonymous Mode" : "Enter Anonymous Mode"}
              className="hidden md:flex"
            >
              {isAnonymous ? <Unlock size={18} /> : <Lock size={18} />}
            </Button>
            
            {/* Auth Button or User Menu */}
            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-9 w-9 p-0 overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                        user.email || 'User'
                      }`}
                      alt="User Avatar" 
                      className="h-full w-full object-cover"
                      loading="lazy"
                      width="36"
                      height="36"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {isAnonymous ? 'Anonymous User' : (user.email || 'User')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-prompts')}>
                      <span className="mr-2 h-4 w-4">📝</span>
                      <span>My Prompts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/create-prompt')}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create Prompt</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleToggleAnonymousMode}>
                    {isAnonymous ? (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        <span>Exit Anonymous Mode</span>
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Enter Anonymous Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
              >
                Sign in
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu />
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {/* Mobile Logo */}
            <div className="px-3 py-2 logo-container h-10 flex items-center">
              <img
                src="/lovable-uploads/bd924504-e9e9-402c-a6f7-2ee8e99f01f2.png"
                alt="PromptNexis Logo"
                width="120"
                height="32"
                className="h-auto max-h-full"
                loading="lazy"
              />
            </Link>
            <Link to="/" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">
              Home
            </Link>
            <Link to="/explore" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">
              Explore
            </Link>
            {user && (
              <Link to="/my-prompts" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">
                My Prompts
              </Link>
            )}
            {user && (
              <Link to="/create-prompt" className="flex items-center gap-2 px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md text-purple-600">
                <Plus size={16} />
                Create Prompt
              </Link>
            )}
            <div className="pt-2 border-t">
              <button onClick={handleToggleAnonymousMode} className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">
                {isAnonymous ? <Unlock size={18} /> : <Lock size={18} />}
                {isAnonymous ? 'Exit Anonymous Mode' : 'Enter Anonymous Mode'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MyPrompts from "./pages/MyPrompts";
import Explore from "./pages/Explore";
import PromptDetail from "./pages/PromptDetail";
import CreatePrompt from "./pages/CreatePrompt";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

// Legal pages
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import CookiePolicy from "./pages/CookiePolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/prompt/:id" element={<PromptDetail />} />
            <Route 
              path="/my-prompts" 
              element={
                <ProtectedRoute allowAnonymous={true}>
                  <MyPrompts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-prompt" 
              element={
                <ProtectedRoute allowAnonymous={false}>
                  <CreatePrompt />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-prompt/:id" 
              element={
                <ProtectedRoute allowAnonymous={false}>
                  <CreatePrompt isEditing={true} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowAnonymous={false}>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Legal pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

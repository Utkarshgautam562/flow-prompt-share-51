
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Explore from './pages/Explore';
import NotFound from './pages/NotFound';
import MyPrompts from './pages/MyPrompts';
import CreatePrompt from './pages/CreatePrompt';
import PromptDetail from './pages/PromptDetail';
import UserProfile from './pages/UserProfile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import CookiePolicy from './pages/CookiePolicy';
import CollectionView from './pages/CollectionView';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/prompt/:id" element={<PromptDetail />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/collection/shared/:shareId" element={<CollectionView />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        
        {/* Protected routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-prompts" 
          element={
            <ProtectedRoute>
              <MyPrompts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-prompt" 
          element={
            <ProtectedRoute>
              <CreatePrompt />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-prompt/:id" 
          element={
            <ProtectedRoute>
              <CreatePrompt isEditing={true} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/collection/:id" 
          element={
            <ProtectedRoute>
              <CollectionView />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;


import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Lazy-loaded pages for better code splitting
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Explore = lazy(() => import('./pages/Explore'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MyPrompts = lazy(() => import('./pages/MyPrompts'));
const CreatePrompt = lazy(() => import('./pages/CreatePrompt'));
const PromptDetail = lazy(() => import('./pages/PromptDetail'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const CollectionView = lazy(() => import('./pages/CollectionView'));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;

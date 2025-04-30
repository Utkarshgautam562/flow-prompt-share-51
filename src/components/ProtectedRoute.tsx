
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowAnonymous?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowAnonymous = false 
}) => {
  const { user, isLoading, isAnonymous } = useAuth();
  const location = useLocation();

  // Wait for authentication to load
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Allow access if user is authenticated or anonymous mode is enabled and allowed
  if (user || (isAnonymous && allowAnonymous)) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated and not in anonymous mode
  return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
};

export default ProtectedRoute;

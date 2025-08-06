import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * 
 * Security considerations:
 * - Redirects unauthenticated users to login
 * - Preserves intended destination for post-login redirect
 * - Supports admin-only routes with role checking
 * - Shows loading state during auth verification
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  fallbackPath = '/auth/login'
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check admin requirement
  if (requireAdmin && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  // Check if user account is active
  if (!profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h1>
          <p className="text-gray-600 mb-4">Your account has been suspended. Please contact support.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading, canAccess, userRoles, primaryRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the current location
  if (!isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to login');
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authenticated but doesn't have required role, redirect to their appropriate dashboard
  if (!canAccess(allowedRoles)) {
    console.log('🚫 User lacks required roles, redirecting to appropriate dashboard:', {
      userRoles: userRoles,
      requiredRoles: allowedRoles,
      primaryRole: primaryRole
    });
    
    // Determine appropriate dashboard based on user's primary role or first available role
    const userRole = primaryRole || userRoles[0] || 'user';
    let dashboardRoute = '/dashboard'; // default for users
    
    switch (userRole) {
      case 'admin':
        dashboardRoute = '/admin';
        break;
      case 'issuer':
        dashboardRoute = '/issuer';
        break;
      case 'manager':
        dashboardRoute = '/manager';
        break;
      default:
        dashboardRoute = '/dashboard';
    }
    
    return (
      <Navigate 
        to={dashboardRoute} 
        replace 
      />
    );
  }

  // User is authenticated and has required role, render the protected component
  console.log('✅ Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;

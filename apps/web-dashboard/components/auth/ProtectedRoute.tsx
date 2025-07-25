'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'USER',
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check role-based access
      if (requiredRole && user.role) {
        const roleHierarchy = {
          'USER': 1,
          'MODERATOR': 2,
          'ADMIN': 3,
          'SUPER_ADMIN': 4
        };

        const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole];

        if (userRoleLevel < requiredRoleLevel) {
          // User doesn't have sufficient privileges
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, loading, requiredRole, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render children (redirect is handled in useEffect)
  if (!user) {
    return null;
  }

  // Check role-based access
  if (requiredRole && user.role) {
    const roleHierarchy = {
      'USER': 1,
      'MODERATOR': 2,
      'ADMIN': 3,
      'SUPER_ADMIN': 4
    };

    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      // User doesn't have sufficient privileges, don't render children
      return null;
    }
  }

  // User is authenticated and has sufficient privileges
  return <>{children}</>;
}
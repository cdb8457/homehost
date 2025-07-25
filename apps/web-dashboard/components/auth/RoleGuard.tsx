'use client';

import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  fallback?: React.ReactNode;
}

export default function RoleGuard({ 
  children, 
  requiredRole = 'USER',
  fallback = null 
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const roleHierarchy = {
    'USER': 1,
    'MODERATOR': 2,
    'ADMIN': 3,
    'SUPER_ADMIN': 4
  };

  const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel >= requiredRoleLevel) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
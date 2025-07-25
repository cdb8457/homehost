'use client';

import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN';
}

export default function AdminRoute({ 
  children, 
  requiredRole = 'ADMIN' 
}: AdminRouteProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  );
}
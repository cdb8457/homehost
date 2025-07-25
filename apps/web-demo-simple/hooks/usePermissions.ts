import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export const usePermissions = () => {
  const { user } = useAuth();

  const roleHierarchy = {
    'USER': 1,
    'MODERATOR': 2,
    'ADMIN': 3,
    'SUPER_ADMIN': 4
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!user || !user.role) return false;
    
    const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];
    
    return userRoleLevel >= requiredRoleLevel;
  };

  const canManageServers = (): boolean => {
    return hasRole('MODERATOR');
  };

  const canManageUsers = (): boolean => {
    return hasRole('ADMIN');
  };

  const canAccessAdminPanel = (): boolean => {
    return hasRole('ADMIN');
  };

  const canManageSystem = (): boolean => {
    return hasRole('SUPER_ADMIN');
  };

  const isSimpleUser = (): boolean => {
    return user?.role === 'USER';
  };

  return {
    user,
    hasRole,
    canManageServers,
    canManageUsers,
    canAccessAdminPanel,
    canManageSystem,
    isSimpleUser
  };
};
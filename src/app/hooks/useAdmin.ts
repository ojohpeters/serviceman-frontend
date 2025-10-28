// src/app/hooks/useAdmin.ts
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';

export function useAdmin() {
  const { user, loading: userLoading } = useUser();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const isLoading = userLoading || authLoading;
  const isAdmin = !isLoading && isAuthenticated && user?.user_type === 'ADMIN';
  
  const requireAdmin = (redirectTo: string = '/') => {
    if (isLoading) {
      return false;
    }
    
    if (!isAdmin) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return false;
    }
    
    return true;
  };

  const getAdminContent = (): { showContent: boolean; isLoading: boolean } => {
    return {
      showContent: isAdmin,
      isLoading
    };
  };

  return {
    isAdmin,
    isLoading,
    requireAdmin,
    getAdminContent
  };
}
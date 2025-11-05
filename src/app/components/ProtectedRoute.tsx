'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🚫 [ProtectedRoute] User not authenticated, redirecting to login');
      console.log('📍 [ProtectedRoute] Current path:', pathname);
      
      // Save the current path so we can redirect back after login
      if (typeof window !== 'undefined' && pathname && pathname !== '/auth/login') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
        console.log('💾 [ProtectedRoute] Saved redirect path:', pathname);
      }
      
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated
  // (otherwise, the useEffect will redirect)
  return isAuthenticated ? <>{children}</> : null;
}
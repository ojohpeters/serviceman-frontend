'use client';
import { useAdmin } from '../../hooks/useAdmin';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

export default function AdminGuard({ 
  children, 
  fallback, 
  showLoading = true 
}: AdminGuardProps) {
  const { isAdmin, isLoading, getAdminContent } = useAdmin();
  const { showContent, isLoading: contentLoading } = getAdminContent();

  if (contentLoading && showLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return fallback || (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Access Denied</h4>
          <p className="mb-0">
            You need administrator privileges to access this page. 
            Please contact your system administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
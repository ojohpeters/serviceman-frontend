'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';
import { API } from '../../services';

export default function AdminUsersPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Redirect if not admin
  if (!adminLoading && !isAdmin) {
    router.push('/admin/login');
    return null;
  }

  useEffect(() => {
    // Note: This would require a backend endpoint to list all users
    // For now, showing a placeholder
    setLoading(false);
  }, [isAdmin]);

  if (adminLoading || loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link href="/admin/dashboard" className="btn btn-outline-secondary btn-sm me-2">
              ← Back
            </Link>
            <h1 className="d-inline-block ms-2">User Management</h1>
          </div>
        </div>

        <div className="alert alert-info">
          <h5><i className="bi bi-info-circle me-2"></i>Coming Soon</h5>
          <p className="mb-0">
            User management features are under development. For now, you can:
          </p>
          <ul className="mt-2 mb-0">
            <li><Link href="/admin/servicemen">Manage Servicemen</Link> - Approve/reject applications</li>
            <li>View individual user profiles through service requests</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-people-fill fs-1 text-primary mb-3"></i>
                <h5>Servicemen</h5>
                <p className="text-muted">Manage serviceman applications and profiles</p>
                <Link href="/admin/servicemen" className="btn btn-primary">
                  Go to Servicemen
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-person-circle fs-1 text-success mb-3"></i>
                <h5>Clients</h5>
                <p className="text-muted">View client information through service requests</p>
                <Link href="/admin/service-requests" className="btn btn-success">
                  View Requests
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-shield-check fs-1 text-warning mb-3"></i>
                <h5>Admins</h5>
                <p className="text-muted">Admin user management</p>
                <button className="btn btn-secondary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}


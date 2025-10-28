'use client';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { serviceRequestsService } from '../../services/serviceRequests';
import type { ServiceRequest } from '../../types/api';
import TokenDebugger from '../../components/admin/TokenDebugger';

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingPayment: 0,
    assigned: 0,
    completed: 0
  });

  // Use useEffect for redirects instead of doing it during render
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  // Fetch service requests data for admin
  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (isAdmin && !isLoading) {
        try {
          setRequestsLoading(true);
          const requests = await serviceRequestsService.getServiceRequests();
          setServiceRequests(requests);
          
          // Calculate stats
          const totalRequests = requests.length;
          const pendingPayment = requests.filter((req: ServiceRequest) => req.status === 'AWAITING_PAYMENT').length;
          const assigned = requests.filter((req: ServiceRequest) => req.status === 'ASSIGNED_TO_SERVICEMAN').length;
          const completed = requests.filter((req: ServiceRequest) => req.status === 'COMPLETED').length;
          
          setStats({ totalRequests, pendingPayment, assigned, completed });
        } catch (error) {
          console.error('Failed to fetch service requests:', error);
        } finally {
          setRequestsLoading(false);
        }
      }
    };

    fetchServiceRequests();
  }, [isAdmin, isLoading]);

  // Don't render anything if redirecting or still loading
  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin (redirect will happen via useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminGuard>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Admin Dashboard</h1>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => router.push('/')}
              >
                Back to Site
              </button>
            </div>

            {/* Quick Stats Overview */}
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">{stats.totalRequests}</h4>
                        <p className="card-text mb-0">Total Requests</p>
                      </div>
                      <i className="bi bi-inbox display-6 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">{stats.pendingPayment}</h4>
                        <p className="card-text mb-0">Pending Payment</p>
                      </div>
                      <i className="bi bi-clock display-6 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">{stats.assigned}</h4>
                        <p className="card-text mb-0">Assigned Jobs</p>
                      </div>
                      <i className="bi bi-person-check display-6 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">{stats.completed}</h4>
                        <p className="card-text mb-0">Completed</p>
                      </div>
                      <i className="bi bi-check-circle display-6 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Service Requests Management Card */}
              <div className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Service Requests</h5>
                    <p className="card-text">
                      Manage all service requests - assign servicemen, track status, and monitor payments.
                    </p>
                    <Link href="/admin/service-requests" className="btn btn-primary">
                      Manage Requests
                    </Link>
                  </div>
                </div>
              </div>

              {/* Categories Management Card */}
              <div className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Categories</h5>
                    <p className="card-text">
                      Manage service categories - create, edit, and delete categories.
                    </p>
                    <Link href="/admin/categories" className="btn btn-primary">
                      Manage Categories
                    </Link>
                  </div>
                </div>
              </div>

              {/* Servicemen Management Card */}
              <div className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Servicemen</h5>
                    <p className="card-text">
                      Approve serviceman applications and manage their profiles.
                    </p>
                    <Link href="/admin/servicemen" className="btn btn-primary">
                      Manage Servicemen
                    </Link>
                  </div>
                </div>
              </div>

              {/* Skills Management Card */}
              <div className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Skills</h5>
                    <p className="card-text">
                      Manage skills and assign them to servicemen.
                    </p>
                    <Link href="/admin/skills" className="btn btn-primary">
                      Manage Skills
                    </Link>
                  </div>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Analytics</h5>
                    <p className="card-text">
                      View platform analytics, revenue, and top performers.
                    </p>
                    <Link href="/admin/analytics" className="btn btn-primary">
                      View Analytics
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Recent Activity</h5>
                    {requestsLoading ? (
                      <div className="text-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : serviceRequests.length > 0 ? (
                      <div>
                        <p className="small text-muted mb-2">Latest service requests:</p>
                        <ul className="list-unstyled mb-0">
                          {serviceRequests.slice(0, 3).map((request: ServiceRequest) => (
                            <li key={request.id} className="mb-2">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <span className="small text-truncate d-block">
                                    #{request.id} - {request.service_description}
                                  </span>
                                  <small className="text-muted">
                                    {new Date(request.created_at).toLocaleDateString()}
                                  </small>
                                </div>
                                <span className={`badge badge-sm ${
                                  request.status === 'AWAITING_PAYMENT' ? 'bg-warning text-dark' :
                                  request.status === 'ASSIGNED_TO_SERVICEMAN' ? 'bg-info' :
                                  request.status === 'COMPLETED' ? 'bg-success' : 'bg-secondary'
                                }`}>
                                  {request.status.split('_').map((word: string) => 
                                    word.charAt(0) + word.slice(1).toLowerCase()
                                  ).join(' ')}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-muted small">No service requests yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Quick Actions</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex gap-2 flex-wrap">
                      <Link href="/admin/service-requests" className="btn btn-outline-primary">
                        <i className="bi bi-inbox me-1"></i>
                        View All Requests
                      </Link>
                      <Link href="/admin/categories" className="btn btn-outline-success">
                        <i className="bi bi-grid me-1"></i>
                        Manage Categories
                      </Link>
                      <Link href="/admin/servicemen" className="btn btn-outline-info">
                        <i className="bi bi-people me-1"></i>
                        Approve Servicemen
                      </Link>
                      <Link href="/admin/skills" className="btn btn-outline-warning">
                        <i className="bi bi-star me-1"></i>
                        Manage Skills
                      </Link>
                      <Link href="/admin/analytics" className="btn btn-outline-secondary">
                        <i className="bi bi-graph-up me-1"></i>
                        View Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Actions Alert */}
            {stats.pendingPayment > 0 && (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="alert alert-warning d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle me-2 fs-4"></i>
                    <div>
                      <h6 className="alert-heading mb-1">Action Required</h6>
                      <p className="mb-0">
                        You have {stats.pendingPayment} service request{stats.pendingPayment !== 1 ? 's' : ''} pending payment approval. 
                        <Link href="/admin/service-requests?filter=pending_payment" className="alert-link ms-1">
                          Review now
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Debug Component - Remove in production */}
      <TokenDebugger />
    </AdminGuard>
  );
}

'use client';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../hooks/useAdmin';
import AdminGuard from '../../components/admin/AdminGuard';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { serviceRequestsService } from '../../services/serviceRequests';
import { usePendingServicemen } from '../../hooks/useAPI';
import { useNotifications } from '../../contexts/NotificationContext';
import type { ServiceRequest } from '../../types/api';
import TokenDebugger from '../../components/admin/TokenDebugger';

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  
  // Use pending servicemen hook
  const { 
    pendingApplications,
    totalPending,
    loading: pendingLoading 
  } = usePendingServicemen(isAdmin);
  
  // Use notifications hook - now uses global context
  const { unreadCount } = useNotifications();
  
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingPayment: 0,
    assigned: 0,
    completed: 0,
    inProgress: 0,
    cancelled: 0
  });

  // Additional analytics
  const analytics = useMemo(() => {
    if (!serviceRequests || serviceRequests.length === 0) {
      return {
        todayRequests: 0,
        weekRequests: 0,
        monthRequests: 0,
        averageCompletionTime: 0,
        recentTrend: 'stable'
      };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRequests = serviceRequests.filter(req => 
      new Date(req.created_at) >= todayStart
    ).length;

    const weekRequests = serviceRequests.filter(req => 
      new Date(req.created_at) >= weekStart
    ).length;

    const monthRequests = serviceRequests.filter(req => 
      new Date(req.created_at) >= monthStart
    ).length;

    // Trend calculation (comparing last 7 days vs previous 7 days)
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekRequests = serviceRequests.filter(req => {
      const date = new Date(req.created_at);
      return date >= prevWeekStart && date < weekStart;
    }).length;

    let recentTrend = 'stable';
    if (weekRequests > prevWeekRequests * 1.1) recentTrend = 'up';
    else if (weekRequests < prevWeekRequests * 0.9) recentTrend = 'down';

    return { todayRequests, weekRequests, monthRequests, averageCompletionTime: 0, recentTrend };
  }, [serviceRequests]);

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
          const inProgress = requests.filter((req: ServiceRequest) => req.status === 'IN_PROGRESS').length;
          const cancelled = requests.filter((req: ServiceRequest) => req.status === 'CANCELLED').length;
          
          setStats({ totalRequests, pendingPayment, assigned, completed, inProgress, cancelled });
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
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div>
                <h1 className="mb-1 fw-bold">Admin Dashboard</h1>
                <p className="text-muted mb-0 small">Manage your service platform</p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <Link 
                  href="/notifications"
                  className="btn btn-outline-primary rounded-pill px-3 position-relative"
                >
                  <i className="bi bi-bell me-1"></i>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount}
                      <span className="visually-hidden">unread notifications</span>
                    </span>
                  )}
                </Link>
                <button 
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => router.push('/')}
                >
                  <i className="bi bi-house me-1"></i>
                  Back to Site
                </button>
              </div>
            </div>

            {/* Enhanced Quick Stats Overview */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3 col-xl-2">
                <div className="card border-0 shadow-sm bg-primary text-white h-100 hover-lift">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-white bg-opacity-20 rounded-circle p-2">
                        <i className="bi bi-inbox fs-5"></i>
                      </div>
                      <div>
                        <div className="fs-3 fw-bold">{stats.totalRequests}</div>
                        <small>Total</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3 col-xl-2">
                <div className="card border-0 shadow-sm bg-warning text-dark h-100 hover-lift">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-dark bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-clock fs-5"></i>
                      </div>
                      <div>
                        <div className="fs-3 fw-bold">{stats.pendingPayment}</div>
                        <small>Payment</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3 col-xl-2">
                <div className="card border-0 shadow-sm bg-info text-white h-100 hover-lift">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-white bg-opacity-20 rounded-circle p-2">
                        <i className="bi bi-person-check fs-5"></i>
                      </div>
                      <div>
                        <div className="fs-3 fw-bold">{stats.assigned}</div>
                        <small>Assigned</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3 col-xl-2">
                <div className="card border-0 shadow-sm bg-primary text-white h-100 hover-lift">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-white bg-opacity-20 rounded-circle p-2">
                        <i className="bi bi-gear fs-5"></i>
                      </div>
                      <div>
                        <div className="fs-3 fw-bold">{stats.inProgress}</div>
                        <small>In Progress</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3 col-xl-2">
                <div className="card border-0 shadow-sm bg-success text-white h-100 hover-lift">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-white bg-opacity-20 rounded-circle p-2">
                        <i className="bi bi-check-circle fs-5"></i>
                      </div>
                      <div>
                        <div className="fs-3 fw-bold">{stats.completed}</div>
                        <small>Completed</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3 col-xl-2">
                <div className="card border-0 shadow-sm bg-secondary text-white h-100 hover-lift">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-white bg-opacity-20 rounded-circle p-2">
                        <i className="bi bi-x-circle fs-5"></i>
                      </div>
                      <div>
                        <div className="fs-3 fw-bold">{stats.cancelled}</div>
                        <small>Cancelled</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics & System Health */}
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                      <i className="bi bi-graph-up text-primary me-2"></i>
                      Platform Analytics
                    </h6>
                    <span className={`badge ${
                      analytics.recentTrend === 'up' ? 'bg-success' :
                      analytics.recentTrend === 'down' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {analytics.recentTrend === 'up' && <><i className="bi bi-arrow-up me-1"></i>Trending Up</>}
                      {analytics.recentTrend === 'down' && <><i className="bi bi-arrow-down me-1"></i>Trending Down</>}
                      {analytics.recentTrend === 'stable' && <>Stable</>}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="row g-4 text-center">
                      <div className="col-4">
                        <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                          <div className="fs-2 fw-bold" style={{ color: '#0d6efd' }}>{analytics.todayRequests}</div>
                          <small className="text-muted">Today</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="bg-info bg-opacity-10 rounded-3 p-3">
                          <div className="fs-2 fw-bold" style={{ color: '#0dcaf0' }}>{analytics.weekRequests}</div>
                          <small className="text-muted">This Week</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="bg-success bg-opacity-10 rounded-3 p-3">
                          <div className="fs-2 fw-bold" style={{ color: '#198754' }}>{analytics.monthRequests}</div>
                          <small className="text-muted">This Month</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h6 className="mb-0 fw-semibold">
                      <i className="bi bi-gear text-warning me-2"></i>
                      System Health
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="small">API Status</span>
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Online
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="small">Pending Reviews</span>
                      <span className="badge bg-warning text-dark">
                        {totalPending || 0}
                      </span>
                    </div>
                    <Link href="/notifications" className="d-flex align-items-center justify-content-between text-decoration-none text-dark">
                      <span className="small">Unread Notifications</span>
                      <span className="badge bg-info">
                        {unreadCount || 0}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3">
              {/* Service Requests Management Card */}
              <div className="col-12 col-md-6 col-lg-4">
                <Link href="/admin/service-requests" className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '56px', height: '56px' }}>
                          <i className="bi bi-inbox text-primary fs-3"></i>
                        </div>
                        <h5 className="card-title mb-0">Service Requests</h5>
                      </div>
                      <p className="card-text text-muted mb-3">
                        Manage all service requests - assign servicemen, track status, and monitor payments.
                      </p>
                      <div className="d-flex align-items-center text-primary">
                        <span className="small">Manage Requests</span>
                        <i className="bi bi-arrow-right ms-2"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Categories Management Card */}
              <div className="col-12 col-md-6 col-lg-4">
                <Link href="/admin/categories" className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-success bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '56px', height: '56px' }}>
                          <i className="bi bi-grid text-success fs-3"></i>
                        </div>
                        <h5 className="card-title mb-0">Categories</h5>
                      </div>
                      <p className="card-text text-muted mb-3">
                        Manage service categories - create, edit, and delete categories.
                      </p>
                      <div className="d-flex align-items-center text-success">
                        <span className="small">Manage Categories</span>
                        <i className="bi bi-arrow-right ms-2"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Servicemen Management Card */}
              <div className="col-12 col-md-6 col-lg-4">
                <Link href="/admin/servicemen" className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-info bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '56px', height: '56px' }}>
                          <i className="bi bi-people text-info fs-3"></i>
                        </div>
                        <h5 className="card-title mb-0">Servicemen</h5>
                      </div>
                      <p className="card-text text-muted mb-3">
                        Approve serviceman applications and manage their profiles.
                      </p>
                      <div className="d-flex align-items-center text-info">
                        <span className="small">Manage Servicemen</span>
                        <i className="bi bi-arrow-right ms-2"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Skills Management Card */}
              <div className="col-12 col-md-6 col-lg-4">
                <Link href="/admin/skills" className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-warning bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '56px', height: '56px' }}>
                          <i className="bi bi-star text-warning fs-3"></i>
                        </div>
                        <h5 className="card-title mb-0">Skills</h5>
                      </div>
                      <p className="card-text text-muted mb-3">
                        Manage skills and assign them to servicemen.
                      </p>
                      <div className="d-flex align-items-center text-warning">
                        <span className="small">Manage Skills</span>
                        <i className="bi bi-arrow-right ms-2"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Analytics Card */}
              <div className="col-12 col-md-6 col-lg-4">
                <Link href="/admin/analytics" className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-secondary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '56px', height: '56px' }}>
                          <i className="bi bi-graph-up text-secondary fs-3"></i>
                        </div>
                        <h5 className="card-title mb-0">Analytics</h5>
                      </div>
                      <p className="card-text text-muted mb-3">
                        View platform analytics, revenue, and top performers.
                      </p>
                      <div className="d-flex align-items-center text-secondary">
                        <span className="small">View Analytics</span>
                        <i className="bi bi-arrow-right ms-2"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Recent Activity Card */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="bg-dark bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" 
                           style={{ width: '56px', height: '56px' }}>
                        <i className="bi bi-clock-history text-dark fs-3"></i>
                      </div>
                      <h5 className="card-title mb-0">Recent Activity</h5>
                    </div>
                    {requestsLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : serviceRequests.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {serviceRequests.slice(0, 3).map((request: ServiceRequest) => (
                          <div key={request.id} className="list-group-item border-0 px-0">
                            <div className="d-flex align-items-start gap-2">
                              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <div className="small fw-semibold text-truncate" title={request.service_description}>
                                  #{request.id} - {request.service_description}
                                </div>
                                <small className="text-muted d-block">
                                  <i className="bi bi-calendar3 me-1"></i>
                                  {new Date(request.created_at).toLocaleDateString()}
                                </small>
                              </div>
                              <span className={`badge text-nowrap ${
                                request.status === 'AWAITING_PAYMENT' ? 'bg-warning text-dark' :
                                request.status === 'ASSIGNED_TO_SERVICEMAN' ? 'bg-info' :
                                request.status === 'COMPLETED' ? 'bg-success' : 'bg-secondary'
                              }`}>
                                {request.status.split('_').map((word: string) => 
                                  word.charAt(0) + word.slice(1).toLowerCase()
                                ).join(' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">No service requests yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Workflow Action Items */}
            <div className="row mt-4 g-3">
              {/* Pending Price Approval */}
              {(() => {
                const pendingClientApproval = serviceRequests.filter((req: ServiceRequest) => 
                  req.status === 'AWAITING_CLIENT_APPROVAL'
                );
                
                if (pendingClientApproval.length > 0) {
                  return (
                    <div className="col-12 col-lg-6">
                      <div className="alert alert-warning border-0 shadow-sm mb-0">
                        <div className="d-flex align-items-start gap-3">
                          <div className="bg-warning bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                               style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-calculator fs-4 text-warning"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="alert-heading mb-1 fw-bold">
                              <i className="bi bi-clipboard-check me-2"></i>
                              Awaiting Client Approval
                            </h6>
                            <p className="mb-2 small">
                              <strong>{pendingClientApproval.length}</strong> estimate{pendingClientApproval.length !== 1 ? 's' : ''} submitted, waiting for client approval.
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                              {pendingClientApproval.slice(0, 2).map((req: ServiceRequest) => (
                                <Link
                                  key={req.id}
                                  href={`/service-requests/${req.id}`}
                                  className="btn btn-warning btn-sm"
                                >
                                  Request #{req.id}
                                </Link>
                              ))}
                              {pendingClientApproval.length > 2 && (
                                <span className="badge bg-dark align-self-center">
                                  +{pendingClientApproval.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Pending Payment Approvals */}
              {stats.pendingPayment > 0 && (
                <div className="col-12 col-lg-6">
                  <div className="alert alert-info border-0 shadow-sm mb-0">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-info bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                           style={{ width: '48px', height: '48px' }}>
                        <i className="bi bi-credit-card fs-4 text-info"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="alert-heading mb-1 fw-bold">
                          <i className="bi bi-wallet2 me-2"></i>
                          Review Payments
                        </h6>
                        <p className="mb-2 small">
                          <strong>{stats.pendingPayment}</strong> payment{stats.pendingPayment !== 1 ? 's' : ''} awaiting authorization.
                        </p>
                        <Link href="/admin/service-requests?filter=pending_payment" className="btn btn-info btn-sm">
                          <i className="bi bi-eye me-1"></i>
                          Review All
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Serviceman Approvals */}
              {totalPending > 0 && (
                <div className="col-12 col-lg-6">
                  <div className="alert alert-primary border-0 shadow-sm mb-0">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-primary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                           style={{ width: '48px', height: '48px' }}>
                        <i className="bi bi-person-check fs-4 text-primary"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="alert-heading mb-1 fw-bold">
                          <i className="bi bi-people me-2"></i>
                          Approve Servicemen
                        </h6>
                        <p className="mb-2 small">
                          <strong>{totalPending}</strong> serviceman application{totalPending !== 1 ? 's' : ''} pending review.
                        </p>
                        <Link href="/admin/servicemen" className="btn btn-primary btn-sm">
                          <i className="bi bi-person-check-fill me-1"></i>
                          Review Applications
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Assignment */}
              {(() => {
                const pendingAssignment = serviceRequests.filter((req: ServiceRequest) => 
                  req.status === 'PENDING_ADMIN_ASSIGNMENT'
                );
                
                if (pendingAssignment.length > 0) {
                  return (
                    <div className="col-12 col-lg-6">
                      <div className="alert alert-secondary border-0 shadow-sm mb-0">
                        <div className="d-flex align-items-start gap-3">
                          <div className="bg-secondary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                               style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-person-plus fs-4 text-secondary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="alert-heading mb-1 fw-bold">
                              <i className="bi bi-person-gear me-2"></i>
                              Assign Servicemen
                            </h6>
                            <p className="mb-2 small">
                              <strong>{pendingAssignment.length}</strong> request{pendingAssignment.length !== 1 ? 's' : ''} need serviceman assignment.
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                              {pendingAssignment.slice(0, 2).map((req: ServiceRequest) => (
                                <Link
                                  key={req.id}
                                  href={`/service-requests/${req.id}`}
                                  className="btn btn-secondary btn-sm"
                                >
                                  Request #{req.id}
                                </Link>
                              ))}
                              {pendingAssignment.length > 2 && (
                                <span className="badge bg-dark align-self-center">
                                  +{pendingAssignment.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Component - Remove in production */}
      <TokenDebugger />
    </AdminGuard>
  );
}

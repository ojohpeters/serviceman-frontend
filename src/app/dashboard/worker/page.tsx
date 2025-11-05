'use client';

import React, { useMemo, useState } from "react";
import Nav from "../../components/common/Nav";
import SecondFooter from "../../components/common/SecondFooter";
import WorkerSidebar from "../../components/workerdashboard/WorkerSidebar";
import DashboardHeader from "../../components/clientdashboard/DashboardHeader";
import WorkerStats from "../../components/workerdashboard/WorkerStats";
import JobRequests from "../../components/workerdashboard/JobRequests";
import JobHistory from "../../components/workerdashboard/JobHistory";
import ServicemanProfileEdit from '../../components/profile/ServicemanProfileEdit';
import ServicemanProfileCompletion from "../../components/workerdashboard/ServicemanProfileCompletion";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/UserContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useServiceRequests } from "../../hooks/useAPI";
import { useNotifications } from "../../contexts/NotificationContext";
import type { ServiceRequest } from "../../types/api";
import Link from "next/link";

export default function WorkerDashboardPage(): React.ReactElement {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { user, servicemanProfile, loading: userLoading } = useUser();
  const [isAvailable, setIsAvailable] = useState(servicemanProfile?.is_available || false);
  
  // Use hooks for service requests and notifications
  const { 
    serviceRequests, 
    loading: dataLoading, 
    error,
    refetch 
  } = useServiceRequests(true);
  
  const {
    notifications,
    unreadCount 
  } = useNotifications(); // Now uses global context - no more individual polling!

  // Calculate earnings and performance metrics
  const metrics = useMemo(() => {
    console.log('📊 [Worker Metrics] Calculating metrics...');
    console.log('📊 [Worker Metrics] Service requests:', serviceRequests);
    console.log('📊 [Worker Metrics] Current user ID:', user?.id);
    
    if (!serviceRequests || !Array.isArray(serviceRequests)) {
      console.log('⚠️ [Worker Metrics] No service requests available');
      return {
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        pendingReview: 0,
        estimatedEarnings: 0,
        completionRate: 0
      };
    }

    // Filter only jobs assigned to this serviceman (primary or backup)
    const myJobs = serviceRequests.filter(req => {
      // Check primary serviceman
      if (req.serviceman) {
        const serviceman = req.serviceman as any;
        const servicemanUserId = typeof serviceman === 'object'
          ? (typeof serviceman.user === 'object' ? serviceman.user.id : serviceman.user)
          : serviceman;
        if (servicemanUserId === user?.id) {
          return true;
        }
      }
      // Check backup serviceman
      if (req.backup_serviceman) {
        const backup = req.backup_serviceman as any;
        const backupUserId = typeof backup === 'object'
          ? (typeof backup.user === 'object' ? backup.user.id : backup.user)
          : backup;
        if (backupUserId === user?.id) {
          return true;
        }
      }
      return false;
    });

    console.log('📊 [Worker Metrics] My jobs:', myJobs);
    console.log('📊 [Worker Metrics] Total jobs:', myJobs.length);

    const totalJobs = myJobs.length;
    const activeJobs = myJobs.filter(req => 
      req.status === 'IN_PROGRESS' || req.status === 'PAYMENT_COMPLETED'
    ).length;
    const completedJobs = myJobs.filter(req => 
      req.status === 'COMPLETED' || req.status === 'CLIENT_REVIEWED'
    ).length;
    const pendingReview = myJobs.filter(req => 
      req.status === 'PENDING_ESTIMATION'
    ).length;

    // Calculate estimated earnings from completed and ongoing jobs
    // Use serviceman_estimated_cost or final_cost
    const estimatedEarnings = myJobs.reduce((sum, req) => {
      if (req.status === 'COMPLETED' || req.status === 'CLIENT_REVIEWED' || req.status === 'IN_PROGRESS') {
        const amount = req.serviceman_estimated_cost || req.final_cost || req.initial_booking_fee || 0;
        return sum + (typeof amount === 'string' ? parseFloat(amount) : amount);
      }
      return sum;
    }, 0);

    const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    console.log('📊 [Worker Metrics] Results:', { 
      totalJobs, 
      activeJobs, 
      completedJobs, 
      pendingReview, 
      estimatedEarnings, 
      completionRate 
    });

    return { totalJobs, activeJobs, completedJobs, pendingReview, estimatedEarnings, completionRate };
  }, [serviceRequests, user]);

  // Update availability status
  React.useEffect(() => {
    setIsAvailable(servicemanProfile?.is_available || false);
  }, [servicemanProfile]);

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Fixed Nav */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          backgroundColor: 'white' 
        }}>
          <Nav />
        </div>

        <div
          className="min-vh-100 position-relative overflow-hidden bg-light"
          style={{ paddingTop: '80px' }}
        >
          {/* Background elements remain the same */}
          <div
            className="position-fixed w-100 h-100 overflow-hidden"
            style={{ pointerEvents: "none", zIndex: 0 }}
          >
            {/* ... your existing background styles ... */}
          </div>

          <main
            className="d-flex flex-row align-items-stretch justify-content-stretch w-100 position-relative p-0"
            style={{ zIndex: 10, minHeight: 'calc(100vh - 80px)' }}
          >
            {/* Sidebar */}
            <aside
              className="d-none d-lg-block position-relative"
              style={{
                minWidth: "280px",
                maxWidth: "320px",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                borderRight: "1px solid rgba(0,0,0,0.1)",
                minHeight: "calc(100vh - 80px)",
                boxShadow: "2px 0 8px rgba(0,0,0,0.04)"
              }}
            >
              <WorkerSidebar />
            </aside>

            {/* Main dashboard content */}
            <section
              className="flex-grow-1 d-flex flex-column justify-content-start align-items-stretch p-4 position-relative"
              style={{ minHeight: "calc(100vh - 80px)", overflowY: "auto" }}
            >
              <div className="position-relative z-2">
                {/* Dashboard Header with Quick Actions */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <DashboardHeader />
                  <div className="d-flex gap-2 align-items-center">
                    <button
                      onClick={refetch}
                      className="btn btn-outline-secondary btn-sm"
                      title="Refresh data"
                      disabled={dataLoading}
                    >
                      <i className={`bi bi-arrow-clockwise ${dataLoading ? 'spinning' : ''}`}></i>
                    </button>
                  </div>
                </div>

                {/* Professional Welcome Card */}
                <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h4 className="mb-2 fw-bold">Welcome, {user?.username}! 👷</h4>
                        <p className="mb-0 opacity-75">
                          {servicemanProfile?.is_approved 
                            ? "Ready to take on new jobs today!" 
                            : "Your application is pending approval"}
                        </p>
                      </div>
                      <div className="col-md-6 mt-3 mt-md-0">
                        <div className="d-flex flex-column gap-2">
                          {/* Availability Toggle */}
                          <div className="d-flex align-items-center justify-content-md-end gap-3">
                            <span className="small">Status:</span>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="availabilitySwitch"
                                checked={isAvailable}
                                onChange={(e) => setIsAvailable(e.target.checked)}
                                style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                              />
                              <label className="form-check-label ms-2 fw-semibold" htmlFor="availabilitySwitch">
                                {isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                              </label>
                            </div>
                          </div>
                          {unreadCount > 0 && (
                            <Link href="/notifications" className="btn btn-light btn-sm ms-auto">
                              <i className="bi bi-bell-fill me-1"></i>
                              {unreadCount} New
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approval Status Alert */}
                {servicemanProfile && !servicemanProfile.is_approved && (
                  <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
                    <div className="bg-warning bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '48px', height: '48px' }}>
                      <i className="bi bi-clock-history fs-4 text-warning"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1 fw-bold">Application Pending Approval</h6>
                      <p className="mb-0">
                        Your serviceman application is awaiting admin approval. You'll be notified once approved.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle fs-4 me-3"></i>
                    <div className="flex-grow-1">{error}</div>
                    <button onClick={refetch} className="btn btn-sm btn-outline-danger">
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Retry
                    </button>
                  </div>
                )}

                {/* Profile Completion */}
                <ServicemanProfileCompletion profile={servicemanProfile} />

                {/* Enhanced Performance Metrics */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-4 col-xl-2">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-briefcase-fill text-primary"></i>
                          </div>
                          <div>
                            <div className="fs-4 fw-bold">{metrics.totalJobs}</div>
                            <small className="text-muted">Total Jobs</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 col-xl-2">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-info bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-gear-fill text-info"></i>
                          </div>
                          <div>
                            <div className="fs-4 fw-bold">{metrics.activeJobs}</div>
                            <small className="text-muted">Active</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 col-xl-2">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-success bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-check-circle-fill text-success"></i>
                          </div>
                          <div>
                            <div className="fs-4 fw-bold">{metrics.completedJobs}</div>
                            <small className="text-muted">Completed</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 col-xl-2">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-hourglass-split text-warning"></i>
                          </div>
                          <div>
                            <div className="fs-4 fw-bold">{metrics.pendingReview}</div>
                            <small className="text-muted">Pending</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 col-xl-2">
                    <div className="card border-0 shadow-sm h-100 bg-success text-white">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-white bg-opacity-20 rounded-circle p-2">
                            <i className="bi bi-currency-dollar"></i>
                          </div>
                          <div>
                            <div className="fs-5 fw-bold">₦{metrics.estimatedEarnings.toLocaleString()}</div>
                            <small>Earnings</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 col-xl-2">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-graph-up text-primary"></i>
                          </div>
                          <div>
                            <div className="fs-4 fw-bold">{metrics.completionRate}%</div>
                            <small className="text-muted">Success</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating and Profile Summary */}
                {servicemanProfile && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <div className="row align-items-center">
                        <div className="col-md-3 text-center mb-3 mb-md-0">
                          <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-4 mb-2">
                            <i className="bi bi-star-fill text-warning display-4"></i>
                          </div>
                          <div className="fs-2 fw-bold">{servicemanProfile.rating || 'N/A'}</div>
                          <div className="text-muted small">Your Rating</div>
                        </div>
                        <div className="col-md-9">
                          <div className="row g-4">
                            <div className="col-6 col-sm-3">
                              <div className="text-center">
                                <div className="fs-5 fw-bold text-primary">{servicemanProfile.total_jobs_completed}</div>
                                <small className="text-muted">Jobs Done</small>
                              </div>
                            </div>
                            <div className="col-6 col-sm-3">
                              <div className="text-center">
                                <div className="fs-5 fw-bold text-info">{servicemanProfile.years_of_experience || 0}</div>
                                <small className="text-muted">Years Exp.</small>
                              </div>
                            </div>
                            <div className="col-6 col-sm-3">
                              <div className="text-center">
                                <div className="fs-5 fw-bold text-success">{servicemanProfile.active_jobs_count}</div>
                                <small className="text-muted">Active Now</small>
                              </div>
                            </div>
                            <div className="col-6 col-sm-3">
                              <div className="text-center">
                                <span className={`badge ${isAvailable ? 'bg-success' : 'bg-secondary'} fs-6 px-3 py-2`}>
                                  {isAvailable ? 'Available' : 'Busy'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Notifications */}
                {notifications && notifications.length > 0 && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-bell text-primary me-2"></i>
                        Recent Notifications
                      </h6>
                      <Link href="/notifications" className="btn btn-sm btn-outline-primary">
                        View All
                      </Link>
                    </div>
                    <div className="card-body p-0">
                      <div className="list-group list-group-flush">
                        {notifications.slice(0, 3).map((notif: any) => (
                          <div key={notif.id} className="list-group-item">
                            <div className="d-flex align-items-start gap-3">
                              <div className={`bg-${notif.is_read ? 'secondary' : 'primary'} bg-opacity-10 rounded-circle p-2`}>
                                <i className={`bi bi-bell${notif.is_read ? '' : '-fill'} text-${notif.is_read ? 'secondary' : 'primary'}`}></i>
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-semibold">{notif.title}</div>
                                <div className="small text-muted">{notif.message}</div>
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  {new Date(notif.created_at).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Estimation Tasks - Action Required */}
                {(() => {
                  const pendingEstimation = serviceRequests?.filter(req => 
                    req.status === 'PENDING_ESTIMATION' && 
                    req.serviceman && 
                    (typeof req.serviceman === 'object' ? req.serviceman.id === user?.id : req.serviceman === user?.id)
                  ) || [];

                  if (pendingEstimation.length > 0) {
                    return (
                      <div className="alert alert-warning border-0 shadow-sm mb-4" role="alert">
                        <div className="d-flex align-items-start gap-3">
                          <div className="bg-warning bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                               style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-exclamation-triangle fs-4 text-warning"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="alert-heading mb-2 fw-bold">
                              <i className="bi bi-clipboard-check me-2"></i>
                              Action Required: Pending Estimations
                            </h6>
                            <p className="mb-3">
                              You have <strong>{pendingEstimation.length}</strong> service request{pendingEstimation.length !== 1 ? 's' : ''} waiting for your cost estimate. 
                              Clients are expecting your professional assessment.
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                              {pendingEstimation.slice(0, 3).map((req) => (
                                <Link
                                  key={req.id}
                                  href={`/service-requests/${req.id}`}
                                  className="btn btn-warning btn-sm"
                                >
                                  <i className="bi bi-calculator me-1"></i>
                                  Request #{req.id}
                                </Link>
                              ))}
                              {pendingEstimation.length > 3 && (
                                <span className="badge bg-dark align-self-center">
                                  +{pendingEstimation.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Job Requests */}
                <JobRequests 
                  serviceRequests={serviceRequests}
                  loading={dataLoading}
                />

                {/* Job History */}
                <JobHistory className="mt-4" />
              </div>
            </section>
          </main>

          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: "white",
            }}
          >
            <SecondFooter />
          </div>
        </div>

        {/* Custom styles */}
        <style jsx>{`
          .spinning {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
"use client";

import React, { useMemo, useState } from "react";
import Nav from "../../components/common/Nav";
import SecondFooter from "../../components/common/SecondFooter";
import ClientSidebar from "../../components/clientdashboard/ClientSidebar";
import DashboardHeader from "../../components/clientdashboard/DashboardHeader";
import ServiceRequestStats from "../../components/clientdashboard/ServiceRequestStats";
import ServiceRequestsList from "../../components/clientdashboard/ServiceRequestsList";
import ClientProfileEdit from "../../components/profile/ClientProfileEdit";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/UserContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useServiceRequests } from "../../hooks/useAPI";
import { useNotifications } from "../../contexts/NotificationContext";
import Link from "next/link";

export default function ClientDashboardPage(): React.ReactElement {
  const { loading: authLoading } = useAuth();
  const { user: userData, loading: userLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Use the service requests hook
  const { 
    serviceRequests, 
    loading: dataLoading, 
    error,
    refetch 
  } = useServiceRequests(true, { limit: 50 });

  // Use notifications hook
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading 
  } = useNotifications(); // Now uses global context - no more individual polling!

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!serviceRequests || !Array.isArray(serviceRequests)) {
      return { 
        totalRequests: 0, 
        ongoingJobs: 0, 
        completedJobs: 0,
        pendingPayment: 0,
        awaitingAssignment: 0
      };
    }
    
    const totalRequests = serviceRequests.length;
    const ongoingJobs = serviceRequests.filter(request => 
      request.status === 'ASSIGNED_TO_SERVICEMAN' || 
      request.status === 'IN_PROGRESS'
    ).length;
    const completedJobs = serviceRequests.filter(request => 
      request.status === 'COMPLETED'
    ).length;
    const pendingPayment = serviceRequests.filter(request => 
      request.status === 'AWAITING_PAYMENT'
    ).length;
    const awaitingAssignment = serviceRequests.filter(request => 
      request.status === 'PENDING_ADMIN_ASSIGNMENT' || 
      request.status === 'AWAITING_ASSIGNMENT'
    ).length;

    return { totalRequests, ongoingJobs, completedJobs, pendingPayment, awaitingAssignment };
  }, [serviceRequests]);

  // Filter service requests based on search and status
  const filteredRequests = useMemo(() => {
    if (!serviceRequests || !Array.isArray(serviceRequests)) {
      return [];
    }

    return serviceRequests.filter(request => {
      const matchesSearch = searchTerm === "" || 
        request.service_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.client_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [serviceRequests, searchTerm, statusFilter]);

  // Combine loading states
  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <div className="min-vh-100 position-relative overflow-hidden d-flex justify-content-center align-items-center bg-light">
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "white",
          }}
        >
          <Nav />
        </div>

        <div
          className="min-vh-100 position-relative overflow-hidden bg-light"
          style={{ paddingTop: "60px" }}
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
            style={{ zIndex: 10, minHeight: "calc(100vh - 80px)" }}
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
                boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
              }}
            >
              <ClientSidebar />
            </aside>

            {/* Main dashboard content */}
            <section
              className="flex-grow-1 d-flex flex-column justify-content-start align-items-stretch p-4 position-relative"
              style={{ minHeight: "calc(100vh - 80px)", overflowY: "auto" }}
            >
              <div className="position-relative z-2">
                {/* Dashboard Header with Refresh Button */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <DashboardHeader />
                  <div className="d-flex gap-2">
                    <Link 
                      href="/categories"
                      className="btn btn-primary btn-sm px-3"
                    >
                      <i className="bi bi-plus-lg me-1"></i>
                      New Request
                    </Link>
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

                {/* Welcome Card with Quick Stats */}
                <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h4 className="mb-2 fw-bold">Welcome back, {userData?.username || 'User'}! 👋</h4>
                        <p className="mb-0 opacity-75">Here's what's happening with your service requests today</p>
                      </div>
                      <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <div className="d-flex flex-column gap-2">
                          {unreadCount > 0 && (
                            <Link href="/notifications" className="btn btn-light btn-sm">
                              <i className="bi bi-bell-fill me-1"></i>
                              {unreadCount} New Notification{unreadCount !== 1 ? 's' : ''}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-warning d-flex align-items-center mb-4 border-0 shadow-sm" role="alert">
                    <i className="bi bi-exclamation-triangle fs-4 me-3"></i>
                    <div className="flex-grow-1">
                      <strong>Unable to load data:</strong> {error}
                    </div>
                    <button 
                      onClick={refetch}
                      className="btn btn-sm btn-outline-warning"
                      disabled={dataLoading}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Retry
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {dataLoading && (
                  <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="text-center">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Loading your service requests...</p>
                    </div>
                  </div>
                )}

                {/* Dashboard Content */}
                {!dataLoading && (
                  <>
                    {/* Enhanced Stats Cards */}
                    <div className="row g-3 mb-4">
                      <div className="col-6 col-md-4 col-lg-2">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                                <i className="bi bi-inbox-fill text-primary"></i>
                              </div>
                              <div className="overflow-hidden">
                                <div className="fs-4 fw-bold">{stats.totalRequests}</div>
                                <small className="text-muted text-nowrap">Total</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-4 col-lg-2">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-warning bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                                <i className="bi bi-clock-fill text-warning"></i>
                              </div>
                              <div className="overflow-hidden">
                                <div className="fs-4 fw-bold">{stats.pendingPayment}</div>
                                <small className="text-muted text-nowrap">Payment</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-4 col-lg-2">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-info bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                                <i className="bi bi-hourglass-split text-info"></i>
                              </div>
                              <div className="overflow-hidden">
                                <div className="fs-4 fw-bold">{stats.awaitingAssignment}</div>
                                <small className="text-muted text-nowrap">Pending</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-4 col-lg-2">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                                <i className="bi bi-gear-fill text-primary"></i>
                              </div>
                              <div className="overflow-hidden">
                                <div className="fs-4 fw-bold">{stats.ongoingJobs}</div>
                                <small className="text-muted text-nowrap">Ongoing</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-4 col-lg-2">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                                <i className="bi bi-check-circle-fill text-success"></i>
                              </div>
                              <div className="overflow-hidden">
                                <div className="fs-4 fw-bold">{stats.completedJobs}</div>
                                <small className="text-muted text-nowrap">Complete</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-4 col-lg-2">
                        <div className="card border-0 shadow-sm h-100 bg-primary text-white">
                          <div className="card-body p-3 d-flex align-items-center justify-content-center">
                            <Link href="/categories" className="text-white text-decoration-none text-center w-100">
                              <i className="bi bi-plus-circle-fill d-block fs-3 mb-1"></i>
                              <small className="text-nowrap">New Request</small>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                          <div className="col-md-6">
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-search"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search requests by description or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              {searchTerm && (
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => setSearchTerm("")}
                                >
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex gap-2 flex-wrap">
                              <button 
                                className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setStatusFilter('all')}
                              >
                                All ({serviceRequests?.length || 0})
                              </button>
                              <button 
                                className={`btn btn-sm ${statusFilter === 'AWAITING_PAYMENT' ? 'btn-warning' : 'btn-outline-secondary'}`}
                                onClick={() => setStatusFilter('AWAITING_PAYMENT')}
                              >
                                Payment ({stats.pendingPayment})
                              </button>
                              <button 
                                className={`btn btn-sm ${statusFilter === 'IN_PROGRESS' ? 'btn-info' : 'btn-outline-secondary'}`}
                                onClick={() => setStatusFilter('IN_PROGRESS')}
                              >
                                Active ({stats.ongoingJobs})
                              </button>
                              <button 
                                className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={() => setStatusFilter('COMPLETED')}
                              >
                                Completed ({stats.completedJobs})
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Notifications Card */}
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
                                  <div className={`bg-${notif.is_read ? 'secondary' : 'primary'} bg-opacity-10 rounded-circle p-2 flex-shrink-0`}>
                                    <i className={`bi bi-bell${notif.is_read ? '' : '-fill'} text-${notif.is_read ? 'secondary' : 'primary'}`}></i>
                                  </div>
                                  <div className="flex-grow-1 overflow-hidden">
                                    <div className="fw-semibold text-truncate" title={notif.title}>{notif.title}</div>
                                    <div className="small text-muted text-truncate" style={{ maxHeight: '2.4em', lineHeight: '1.2em' }} title={notif.message}>
                                      {notif.message}
                                    </div>
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

                    {/* Pending Payment Actions - Action Required */}
                    {(() => {
                      const pendingPayment = serviceRequests?.filter(req => 
                        req.status === 'AWAITING_PAYMENT'
                      ) || [];

                      if (pendingPayment.length > 0) {
                        return (
                          <div className="alert alert-info border-0 shadow-sm mb-4" role="alert">
                            <div className="d-flex align-items-start gap-3">
                              <div className="bg-info bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                                   style={{ width: '48px', height: '48px' }}>
                                <i className="bi bi-credit-card fs-4 text-info"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="alert-heading mb-2 fw-bold">
                                  <i className="bi bi-wallet2 me-2"></i>
                                  Payment Required
                                </h6>
                                <p className="mb-3">
                                  You have <strong>{pendingPayment.length}</strong> service request{pendingPayment.length !== 1 ? 's' : ''} awaiting payment authorization. 
                                  Review the finalized cost{pendingPayment.length !== 1 ? 's' : ''} and authorize payment to proceed.
                                </p>
                                <div className="d-flex flex-wrap gap-2">
                                  {pendingPayment.slice(0, 3).map((req) => (
                                    <Link
                                      key={req.id}
                                      href={`/service-requests/${req.id}`}
                                      className="btn btn-info btn-sm"
                                    >
                                      <i className="bi bi-credit-card me-1"></i>
                                      Request #{req.id}
                                    </Link>
                                  ))}
                                  {pendingPayment.length > 3 && (
                                    <span className="badge bg-dark align-self-center">
                                      +{pendingPayment.length - 3} more
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

                    {/* Pending Review Actions - Action Required */}
                    {(() => {
                      const pendingReview = serviceRequests?.filter(req => 
                        req.status === 'PENDING_CLIENT_REVIEW'
                      ) || [];

                      if (pendingReview.length > 0) {
                        return (
                          <div className="alert alert-success border-0 shadow-sm mb-4" role="alert">
                            <div className="d-flex align-items-start gap-3">
                              <div className="bg-success bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                                   style={{ width: '48px', height: '48px' }}>
                                <i className="bi bi-star fs-4 text-success"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="alert-heading mb-2 fw-bold">
                                  <i className="bi bi-chat-heart me-2"></i>
                                  Review & Rate Service
                                </h6>
                                <p className="mb-3">
                                  You have <strong>{pendingReview.length}</strong> completed service{pendingReview.length !== 1 ? 's' : ''} waiting for your review. 
                                  Share your experience and help other clients make informed decisions.
                                </p>
                                <div className="d-flex flex-wrap gap-2">
                                  {pendingReview.slice(0, 3).map((req) => (
                                    <Link
                                      key={req.id}
                                      href={`/service-requests/${req.id}`}
                                      className="btn btn-success btn-sm"
                                    >
                                      <i className="bi bi-star-fill me-1"></i>
                                      Review Request #{req.id}
                                    </Link>
                                  ))}
                                  {pendingReview.length > 3 && (
                                    <span className="badge bg-dark align-self-center">
                                      +{pendingReview.length - 3} more
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

                    {/* Service Requests List */}
                    <ServiceRequestsList 
                      serviceRequests={filteredRequests} 
                    />

                    {filteredRequests.length === 0 && serviceRequests && serviceRequests.length > 0 && (
                      <div className="text-center py-5">
                        <i className="bi bi-search text-muted display-1 mb-3"></i>
                        <h5 className="text-muted">No requests match your filters</h5>
                        <button 
                          className="btn btn-primary mt-3"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                          }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </>
                )}
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
'use client';

import React from "react";
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
import { useServiceRequests, useNotifications } from "../../hooks/useAPI";
import type { ServiceRequest } from "../../types/api";

export default function WorkerDashboardPage(): React.ReactElement {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { user, servicemanProfile, loading: userLoading } = useUser();
  
  // Use hooks for service requests and notifications
  const { 
    serviceRequests, 
    loading: dataLoading, 
    error,
    refetch 
  } = useServiceRequests(true);
  
  const { 
    unreadCount 
  } = useNotifications();

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
              style={{ minHeight: "calc(100vh - 80px)" }}
            >
              <div className="position-relative z-2">
                <DashboardHeader />

                {/* Approval Status Alert */}
                {servicemanProfile && !servicemanProfile.is_approved && (
                  <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-clock-history fs-4 me-3"></i>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1">Application Pending Approval</h6>
                      <p className="mb-0">
                        Your serviceman application is awaiting admin approval. You'll be notified once approved.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Profile Completion */}
                <ServicemanProfileCompletion profile={servicemanProfile} />
                
                <WorkerStats 
                  serviceRequests={serviceRequests}
                  servicemanProfile={servicemanProfile}
                />

                <JobRequests 
                  serviceRequests={serviceRequests}
                  loading={dataLoading}
                />

                <JobHistory className="mt-4" />

                <div className="row">
                  <div className="col-12">
                    <ServicemanProfileEdit />
                  </div>
                </div>

                {/* Notifications */}
                {unreadCount > 0 && (
                  <div className="alert alert-info border-0 shadow-sm d-flex align-items-center mb-4">
                    <i className="bi bi-bell-fill fs-4 me-3"></i>
                    <div className="flex-grow-1">
                      <strong>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</strong>
                    </div>
                    <a href="/notifications" className="btn btn-info btn-sm">
                      View All
                    </a>
                  </div>
                )}

                {/* Quick Actions */}
                <div 
                  className="card border-0 shadow-sm mb-4"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="card-body p-4">
                    <h5 className="fw-semibold text-gray-800 mb-3">
                      Quick Actions
                    </h5>
                    <div className="d-flex gap-3 mt-3 flex-wrap">
                      <button
                        onClick={refetch}
                        className="btn btn-outline-primary rounded-pill px-4 fw-semibold hover-lift"
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh Jobs
                      </button>
                      <a 
                        href="/categories"
                        className="btn btn-outline-secondary rounded-pill px-4 fw-semibold hover-lift"
                      >
                        <i className="bi bi-grid me-2"></i>
                        Browse Categories
                      </a>
                      <button
                        onClick={logout}
                        className="btn btn-outline-danger rounded-pill px-4 fw-semibold hover-lift"
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
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

        {/* ... your existing styles ... */}
      </div>
    </ProtectedRoute>
  );
}
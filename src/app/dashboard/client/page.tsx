"use client";

import React, { useMemo } from "react";
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

export default function ClientDashboardPage(): React.ReactElement {
  const { loading: authLoading } = useAuth();
  const { loading: userLoading } = useUser();
  
  // Use the service requests hook
  const { 
    serviceRequests, 
    loading: dataLoading, 
    error,
    refetch 
  } = useServiceRequests(true, { limit: 50 });

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!serviceRequests || !Array.isArray(serviceRequests)) {
      return { totalRequests: 0, ongoingJobs: 0, completedJobs: 0 };
    }
    
    const totalRequests = serviceRequests.length;
    const ongoingJobs = serviceRequests.filter(request => 
      request.status === 'ASSIGNED_TO_SERVICEMAN' || 
      request.status === 'IN_PROGRESS'
    ).length;
    const completedJobs = serviceRequests.filter(request => 
      request.status === 'COMPLETED'
    ).length;

    return { totalRequests, ongoingJobs, completedJobs };
  }, [serviceRequests]);

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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <DashboardHeader />
                  <button
                    onClick={refetch}
                    className="btn btn-outline-secondary btn-sm"
                    title="Refresh data"
                    disabled={dataLoading}
                  >
                    <i className={`bi bi-arrow-clockwise ${dataLoading ? 'spinning' : ''}`}></i>
                    {dataLoading ? ' Refreshing...' : ' Refresh'}
                  </button>
                </div>

                {error && (
                  <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
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
                    {/* Stats Cards */}
                    <ServiceRequestStats
                      totalRequests={stats.totalRequests}
                      ongoingServices={stats.ongoingJobs}
                      completedServices={stats.completedJobs}
                    />

                    {/* Service Requests List */}
                    <ServiceRequestsList 
                      serviceRequests={serviceRequests || []} 
                    />
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
"use client";
import React from "react";
import { ServiceRequest } from "../../types/api";
import { useRouter } from "next/navigation";
import { getStatusConfig, getProgressPercent } from "../../utils/statusHelpers";

interface ServiceRequestsListProps {
  serviceRequests?: ServiceRequest[];
}

export default function ServiceRequestsList({ serviceRequests = [] }: ServiceRequestsListProps): React.ReactElement {
  const router = useRouter();

  // Helper function to get status display info
  const getStatusInfo = (status: string) => {
    const config = getStatusConfig(status);
    const progress = getProgressPercent(status);
    
    return {
      class: config.badgeClass,
      text: config.label,
      description: config.description,
      icon: config.icon,
      progress: progress,
      requiresAction: config.isActionRequired,
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (requestId: number) => {
    router.push(`/service-requests/${requestId}`);
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">My Service Requests</h5>
        <span className="badge bg-secondary">{serviceRequests.length} active</span>
      </div>

      {serviceRequests.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <i className="bi bi-inbox display-2 text-muted"></i>
            </div>
            <h5 className="text-muted mb-2">No service requests yet</h5>
            <p className="text-muted mb-4">
              Start by booking a service from our service providers
            </p>
            <a href="/servicemen" className="btn btn-primary btn-lg rounded-pill px-4">
              <i className="bi bi-search me-2"></i>Find Service Providers
            </a>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {serviceRequests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            return (
              <div key={request.id} className="col-12">
                <div className="card shadow-sm border-0 hover-shadow transition-all" 
                     style={{ cursor: 'pointer' }}
                     onClick={() => handleViewDetails(request.id)}>
                  <div className="card-body p-3 p-md-4">
                    <div className="row align-items-center g-3">
                      {/* Left Section - Service Info */}
                      <div className="col-12 col-md-6 col-lg-4">
                        <div className="d-flex align-items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{ width: '48px', height: '48px' }}>
                              <i className="bi bi-tools fs-5 text-primary"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <h6 className="mb-1 fw-semibold text-truncate" title={request.service_description}>
                              {request.service_description || 'No description'}
                            </h6>
                            <div className="small text-muted text-truncate">
                              <i className="bi bi-geo-alt me-1"></i>
                              <span title={request.client_address}>
                                {request.client_address || 'No address'}
                              </span>
                            </div>
                            <div className="small text-muted mt-1">
                              <i className="bi bi-calendar3 me-1"></i>
                              {formatDate(request.booking_date)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle Section - Status */}
                      <div className="col-12 col-md-6 col-lg-4">
                        <div className="d-flex flex-column gap-2">
                          <div>
                            <span className={`badge px-3 py-2 fs-6 ${statusInfo.class}`}>
                              <i className={`bi bi-${statusInfo.icon} me-1`}></i>
                              {statusInfo.text}
                            </span>
                          </div>
                          {statusInfo.progress > 0 && statusInfo.progress < 100 && (
                            <div className="progress" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                                style={{ width: `${statusInfo.progress}%` }}
                                role="progressbar"
                              ></div>
                            </div>
                          )}
                          {statusInfo.requiresAction && (
                            <small className="text-danger">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Action Required
                            </small>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Price & Action */}
                      <div className="col-12 col-md-12 col-lg-4 text-md-end">
                        <div className="mb-2">
                          {request.initial_booking_fee ? (
                            <div>
                              <div className="text-muted small">Booking Fee</div>
                              <div className="fw-bold fs-5 text-success">
                                ₦{parseFloat(request.initial_booking_fee).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted small">Fee pending</div>
                          )}
                        </div>
                        <button 
                          className={`btn btn-sm ${statusInfo.requiresAction ? 'btn-warning' : 'btn-outline-primary'} rounded-pill px-3`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(request.id);
                          }}
                        >
                          {statusInfo.requiresAction ? (
                            <>
                              <i className="bi bi-exclamation-circle me-1"></i>
                              Take Action
                            </>
                          ) : (
                            <>
                              View Details
                              <i className="bi bi-arrow-right ms-1"></i>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
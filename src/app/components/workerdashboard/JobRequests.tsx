import React from "react";
import { ServiceRequest } from "../../services/serviceRequests";
import { useRouter } from "next/navigation";
import { getStatusConfig } from "../../utils/statusHelpers";

interface JobRequestsProps {
  serviceRequests: ServiceRequest[];
  loading?: boolean;
}

export default function JobRequests({ serviceRequests, loading = false }: JobRequestsProps): React.ReactElement {
  const router = useRouter();

  // Helper function to get status display info using centralized config
  const getStatusInfo = (status: string) => {
    const config = getStatusConfig(status);
    return { 
      class: config.badgeClass, 
      text: config.label, 
      actionable: config.isActionRequired 
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

  const handleProvideEstimate = (requestId: number) => {
    router.push(`/service-requests/${requestId}/estimate`);
  };

  const handleViewDetails = (requestId: number) => {
    router.push(`/service-requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading job requests...</span>
          </div>
          <p className="mt-2 text-muted">Loading job requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="fw-semibold mb-3" style={{ color: "var(--foreground)" }}>
          Job Requests
        </h5>

        {serviceRequests.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <h6 className="text-muted">No job requests yet</h6>
            <p className="text-muted small mb-3">
              You'll see job requests here when clients book your services
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Client</th>
                  <th>Service Date</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {serviceRequests.map((request) => {
                  const statusInfo = getStatusInfo(request.status);
                  return (
                    <tr key={request.id}>
                      <td>
                        <div className="fw-semibold">{request.description}</div>
                        <div className="small text-muted">ID: {request.id}</div>
                      </td>
                      <td>
                        <div className="small">Client #{request.client}</div>
                      </td>
                      <td>{formatDate(request.booking_date)}</td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: '120px' }}>
                          {request.address}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td>
                        {statusInfo.actionable ? (
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleProvideEstimate(request.id)}
                            >
                              Provide Estimate
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewDetails(request.id)}
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(request.id)}
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
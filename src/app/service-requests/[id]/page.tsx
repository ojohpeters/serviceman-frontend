'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { serviceRequestsService, ServiceRequest } from '../../services/serviceRequests';
import { notificationsService, Notification } from '../../services/notifications';
import { adminService } from '../../services/admin';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../hooks/useAPI';
import { getStatusConfig, getProgressPercent, requiresPayment, requiresReview, canCancelRequest } from '../../utils/statusHelpers';
import Nav from '../../components/common/Nav';
import SecondFooter from '../../components/common/SecondFooter';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { user: userData } = useUser();
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [availableServicemen, setAvailableServicemen] = useState<any[]>([]);
  const [estimateAmount, setEstimateAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [selectedServiceman, setSelectedServiceman] = useState<number | null>(null);

  const requestId = params.id as string;
  
  // Fetch notifications for this service request
  const { notifications, markAsRead } = useNotifications(30000, { limit: 10 });

  useEffect(() => {
    const fetchServiceRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const request = await serviceRequestsService.getServiceRequestById(Number(requestId));
        setServiceRequest(request);
        
        // If admin and request needs assignment, fetch available servicemen
        if (user?.user_type === 'ADMIN' && request.status !== 'PENDING_PAYMENT' && !request.serviceman) {
          const servicemen = await serviceRequestsService.getAvailableServicemenForAssignment(request.category.id);
          setAvailableServicemen(servicemen);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load service request');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchServiceRequest();
    }
  }, [requestId, user]);

  // Check if current user has permission to view this request
  const hasPermission = () => {
    if (!user || !serviceRequest) return false;
    
    // Admin can view all requests
    if (user.user_type === 'ADMIN') return true;
    
    // Client can view their own requests
    if (user.user_type === 'CLIENT' && userData?.id === serviceRequest.client?.id) return true;
    
    // Serviceman can view requests assigned to them
    if (user.user_type === 'SERVICEMAN' && userData?.id === serviceRequest.serviceman?.id) return true;
    
    return false;
  };

  // Action handlers
  const handleAssignServiceman = async () => {
    if (!selectedServiceman || !serviceRequest) return;
    
    try {
      setActionLoading(true);
      console.log('🔧 Assigning serviceman:', {
        requestId: serviceRequest.id,
        servicemanId: selectedServiceman,
        currentStatus: serviceRequest.status
      });
      
      // Use the new working backend endpoint
      const updatedRequest = await serviceRequestsService.assignServiceman(
        serviceRequest.id, 
        selectedServiceman,
        undefined, // backup serviceman (optional)
        `Assigned by ${user?.username || 'admin'}`
      );
      
      // Update the service request state
      setServiceRequest(updatedRequest);
      setShowAssignModal(false);
      
      // Send notification to serviceman
      try {
        await notificationsService.sendNotification({
          user_id: selectedServiceman,
          title: 'New Service Assignment',
          message: `You have been assigned to service request #${serviceRequest.id}. Please review the details and provide a cost estimate.`
        });
        console.log('✅ Notification sent successfully');
      } catch (notifError) {
        console.warn('Failed to send notification:', notifError);
      }
      
      alert('Serviceman assigned successfully!');
      
    } catch (error: any) {
      console.error('❌ Assignment error:', error);
      alert('Failed to assign serviceman: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleProvideEstimate = async () => {
    if (!estimateAmount || !serviceRequest) return;
    
    try {
      setActionLoading(true);
      console.log('💰 Providing cost estimate:', {
        requestId: serviceRequest.id,
        estimateAmount: estimateAmount,
        currentStatus: serviceRequest.status
      });
      
      // Use PATCH to update the service request
      const updatedRequest = await serviceRequestsService.updateServiceRequest(serviceRequest.id, {
        serviceman_estimated_cost: estimateAmount,
        status: 'AWAITING_CLIENT_APPROVAL'
      });
      
      // Update the service request state
      setServiceRequest(updatedRequest);
      setShowEstimateModal(false);
      setEstimateAmount('');
      
      // Send notification to client
      try {
        await notificationsService.sendNotification({
          user_id: serviceRequest.client.id,
          title: 'Cost Estimate Received',
          message: `Your serviceman has provided a cost estimate of ₦${parseFloat(estimateAmount).toLocaleString()} for service request #${serviceRequest.id}. Please review and approve.`
        });
        console.log('✅ Notification sent successfully');
      } catch (notifError) {
        console.warn('Failed to send notification:', notifError);
      }
      
      alert('Cost estimate submitted successfully!');
      
    } catch (error: any) {
      console.error('❌ Estimate error:', error);
      alert('Failed to submit estimate: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async () => {
    if (!serviceRequest) return;
    
    try {
      setActionLoading(true);
      console.log('🚀 Starting service:', {
        requestId: serviceRequest.id,
        currentStatus: serviceRequest.status
      });
      
      // Use PATCH to update the service request status
      const updatedRequest = await serviceRequestsService.updateServiceRequest(serviceRequest.id, {
        status: 'IN_PROGRESS'
      });
      
      // Update the service request state
      setServiceRequest(updatedRequest);
      
      // Send notification to client
      try {
        await notificationsService.sendNotification({
          user_id: serviceRequest.client.id,
          title: 'Service Started',
          message: `Your serviceman has started working on service request #${serviceRequest.id}.`
        });
        console.log('✅ Notification sent successfully');
      } catch (notifError) {
        console.warn('Failed to send notification:', notifError);
      }
      
      alert('Service started successfully!');
      
    } catch (error: any) {
      console.error('❌ Start service error:', error);
      alert('Failed to start service: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!serviceRequest) return;
    
    try {
      setActionLoading(true);
      console.log('✅ Marking service as completed:', {
        requestId: serviceRequest.id,
        finalAmount: finalAmount,
        currentStatus: serviceRequest.status
      });
      
      // Prepare update data
      const updateData: any = {
        status: 'COMPLETED'
      };
      
      if (finalAmount) {
        updateData.final_cost = finalAmount;
      }
      
      // Use PATCH to update the service request
      const updatedRequest = await serviceRequestsService.updateServiceRequest(serviceRequest.id, updateData);
      
      // Update the service request state
      setServiceRequest(updatedRequest);
      setShowCompleteModal(false);
      setFinalAmount('');
      
      // Send notification to client
      try {
        await notificationsService.sendNotification({
          user_id: serviceRequest.client.id,
          title: 'Service Completed',
          message: `Your service request #${serviceRequest.id} has been completed${finalAmount ? ` with final cost of ₦${parseFloat(finalAmount).toLocaleString()}` : ''}. Please rate the service.`
        });
        console.log('✅ Notification sent successfully');
      } catch (notifError) {
        console.warn('Failed to send notification:', notifError);
      }
      
      alert('Service marked as completed!');
      
    } catch (error: any) {
      console.error('❌ Mark completed error:', error);
      alert('Failed to mark as completed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number | undefined) => {
  if (!amount) return 'Not set';
  return `₦${amount.toLocaleString()}`;
};

  // Get status display info using the new status helpers
  const getStatusInfo = (status: string) => {
    const config = getStatusConfig(status);
    const progress = getProgressPercent(status);
    
    return {
      class: config.badgeClass,
      text: config.label,
      description: config.description,
      icon: config.icon,
      progress: progress,
      canCancel: config.canCancel,
      isActionRequired: config.isActionRequired,
      requiresPayment: config.requiresPayment || false,
      requiresReview: config.requiresReview || false,
      isFinal: config.isFinal || false,
    };
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !serviceRequest) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="alert alert-danger">
          <h5>Error Loading Service Request</h5>
          <p>{error || 'Service request not found'}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!hasPermission()) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="alert alert-warning">
          <h5>Access Denied</h5>
          <p>You don't have permission to view this service request.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(serviceRequest.status);

  return (
    <ProtectedRoute>
      <div className="min-vh-100 bg-light">
        {/* Fixed Nav */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "white",
            boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Nav />
        </div>

        {/* Main Content */}
        <div
          className="container py-4"
          style={{ marginTop: "80px", marginBottom: "80px" }}
        >
          {/* Back Button */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    router.back();
                  }}
                  className="text-decoration-none text-primary d-flex align-items-center"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </a>
              </li>
            </ol>
          </nav>

          {/* Service Request Header */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                <div>
                  <h4 className="mb-1">Service Request #{serviceRequest.id}</h4>
                  <p className="text-muted mb-0">{statusInfo.description}</p>
                </div>
                <span className={`badge ${statusInfo.class} fs-6 mt-2 mt-md-0`}>
                  {statusInfo.text}
                </span>
              </div>
              
              {/* Progress Indicator */}
              {statusInfo.progress > 0 && !statusInfo.isFinal && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Request Progress</small>
                    <small className="fw-semibold">{statusInfo.progress}%</small>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${statusInfo.progress}%` }}
                      aria-valuenow={statusInfo.progress} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row g-4">
            {/* Left Column - Request Details */}
            <div className="col-12 col-lg-8">
              {/* Basic Information Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Service Details
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Service Description:</strong>
                        <p className="mb-0 mt-1">{serviceRequest.description}</p>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Service Address:</strong>
                        <p className="mb-0 mt-1">{serviceRequest.address}</p>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Scheduled Date & Time:</strong>
                        <p className="mb-0 mt-1">
                          {new Date(serviceRequest.booking_date).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Emergency Service:</strong>
                        <p className="mb-0 mt-1">
                          {serviceRequest.is_emergency ? (
                            <span className="badge bg-danger">Yes - Emergency</span>
                          ) : (
                            <span className="badge bg-secondary">No - Standard</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Request Created:</strong>
                        <p className="mb-0 mt-1">
                          {new Date(serviceRequest.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Booking Fee:</strong>
                        <p className="mb-0 mt-1">
                          {serviceRequest.initial_fee ? (
                            <span className="fw-bold text-success">
                              {formatCurrency(serviceRequest.initial_fee)}
                            </span>
                          ) : (
                            <span className="text-muted">Not set</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Information Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-currency-exchange me-2"></i>
                    Cost Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-4 mb-3">
                      <div className="p-3 bg-light rounded">
                        <strong className="d-block mb-2">Serviceman Estimate</strong>
                        <h4 className={`mb-0 ${
                          serviceRequest.serviceman_estimated_cost ? 'text-primary' : 'text-muted'
                        }`}>
                          {formatCurrency(serviceRequest.serviceman_estimated_cost)}
                        </h4>
                        <small className="text-muted">
                          {serviceRequest.serviceman_estimated_cost ? 
                            'Estimate provided' : 'Awaiting estimate'
                          }
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="p-3 bg-light rounded">
                        <strong className="d-block mb-2">Final Cost</strong>
                        <h4 className={`mb-0 ${
                          serviceRequest.final_cost ? 'text-success' : 'text-muted'
                        }`}>
                          {formatCurrency(serviceRequest.final_cost)}
                        </h4>
                        <small className="text-muted">
                          {serviceRequest.final_cost ? 
                            'Including platform fee' : 'To be determined'
                          }
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="p-3 bg-light rounded">
                        <strong className="d-block mb-2">Payment Status</strong>
                        <div className="mb-2">
                          {serviceRequest.status === 'PENDING_PAYMENT' ? (
                            <span className="badge bg-warning text-dark">Booking Fee Pending</span>
                          ) : serviceRequest.final_cost ? (
                            <span className="badge bg-success">Final Payment Ready</span>
                          ) : (
                            <span className="badge bg-secondary">Awaiting Process</span>
                          )}
                        </div>
                        <small className="text-muted">
                          {serviceRequest.status === 'PENDING_PAYMENT' ?
                            'Pay booking fee to proceed' : 'Follow the workflow'
                          }
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messaging Section - Placeholder */}
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-chat-dots me-2"></i>
                    Communication
                  </h5>
                </div>
                <div className="card-body text-center py-5">
                  <i className="bi bi-chat-square-text display-4 text-muted mb-3"></i>
                  <h5 className="text-muted">Messaging Feature</h5>
                  <p className="text-muted">
                    Direct messaging between client and serviceman will be available soon.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Info */}
            <div className="col-12 col-lg-4">
              {/* Notifications Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-bell me-2"></i>
                    Recent Notifications
                  </h5>
                </div>
                <div className="card-body">
                  {!notifications || notifications.length === 0 ? (
                    <p className="text-muted text-center">No notifications</p>
                  ) : (
                    <div className="list-group list-group-flush">
                      {notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`list-group-item list-group-item-action ${!notification.is_read ? 'bg-light' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{notification.title}</h6>
                            <small>{new Date(notification.created_at).toLocaleDateString()}</small>
                          </div>
                          <p className="mb-1 small">{notification.message}</p>
                          {!notification.is_read && <small className="badge bg-primary">New</small>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-lightning me-2"></i>
                    Available Actions
                  </h5>
                </div>
                <div className="card-body">
                  {/* Client Actions */}
                  {user?.user_type === 'CLIENT' && (
                    <div className="d-grid gap-2">
                      {serviceRequest.status === 'PENDING_PAYMENT' && (
                        <button className="btn btn-primary btn-lg">
                          <i className="bi bi-credit-card me-2"></i>
                          Pay Booking Fee
                        </button>
                      )}
                      {serviceRequest.status === 'COMPLETED' && (
                        <button className="btn btn-success btn-lg">
                          <i className="bi bi-star me-2"></i>
                          Rate Service
                        </button>
                      )}
                      <button className="btn btn-outline-secondary" disabled>
                        <i className="bi bi-telephone me-2"></i>
                        Contact Support
                      </button>
                    </div>
                  )}

                  {/* Serviceman Actions */}
                  {user?.user_type === 'SERVICEMAN' && (
                    <div className="d-grid gap-2">
                      {serviceRequest.status === 'ASSIGNED_TO_SERVICEMAN' && (
                        <>
                          <button 
                            className="btn btn-primary btn-lg"
                            onClick={() => setShowEstimateModal(true)}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-calculator me-2"></i>
                            {actionLoading ? 'Loading...' : 'Provide Cost Estimate'}
                          </button>
                          <button 
                            className="btn btn-success"
                            onClick={handleStartService}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-play-circle me-2"></i>
                            {actionLoading ? 'Loading...' : 'Start Service'}
                          </button>
                        </>
                      )}
                      {serviceRequest.status === 'IN_PROGRESS' && (
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={() => setShowCompleteModal(true)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          {actionLoading ? 'Loading...' : 'Mark as Completed'}
                        </button>
                      )}
                      <button className="btn btn-outline-primary">
                        <i className="bi bi-telephone me-2"></i>
                        Contact Client
                      </button>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {user?.user_type === 'ADMIN' && (
                    <div className="d-grid gap-2">
                      {serviceRequest.status === 'PENDING_PAYMENT' && (
                        <button className="btn btn-warning btn-lg" disabled>
                          <i className="bi bi-clock me-2"></i>
                          Waiting for Payment
                        </button>
                      )}
                      {serviceRequest.status !== 'PENDING_PAYMENT' && serviceRequest.status !== 'COMPLETED' && !serviceRequest.serviceman && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => setShowAssignModal(true)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-person-plus me-2"></i>
                          {actionLoading ? 'Loading...' : 'Assign Serviceman'}
                        </button>
                      )}
                      {serviceRequest.serviceman && (
                        <div className="alert alert-info">
                          <strong>Assigned to:</strong> {typeof serviceRequest.serviceman === 'object' ? serviceRequest.serviceman.username : `User #${serviceRequest.serviceman}`}
                        </div>
                      )}
                      <button className="btn btn-outline-info">
                        <i className="bi bi-eye me-2"></i>
                        View Full History
                      </button>
                    </div>
                  )}

                  {/* Shared Actions */}
                  <div className="mt-3 pt-3 border-top">
                    <button 
                      className="btn btn-outline-secondary w-100"
                      onClick={() => window.print()}
                    >
                      <i className="bi bi-printer me-2"></i>
                      Print Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Request Timeline
                  </h5>
                </div>
                <div className="card-body">
                  <div className="timeline">
                    <div className="timeline-item completed">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <strong>Request Created</strong>
                        <small className="text-muted d-block">
                          {new Date(serviceRequest.created_at).toLocaleString()}
                        </small>
                        <small>Client submitted service request</small>
                      </div>
                    </div>

                    {serviceRequest.status !== 'PENDING_PAYMENT' && (
                      <div className="timeline-item completed">
                        <div className="timeline-marker bg-success"></div>
                        <div className="timeline-content">
                          <strong>Booking Fee Paid</strong>
                          <small className="text-muted d-block">
                            Payment confirmed
                          </small>
                          <small>Client paid the initial booking fee</small>
                        </div>
                      </div>
                    )}

                    {serviceRequest.status === 'ASSIGNED_TO_SERVICEMAN' && (
                      <div className="timeline-item completed">
                        <div className="timeline-marker bg-success"></div>
                        <div className="timeline-content">
                          <strong>Assigned to Serviceman</strong>
                          <small className="text-muted d-block">
                            Admin assigned this job
                          </small>
                          <small>Serviceman can now provide estimate</small>
                        </div>
                      </div>
                    )}

                    {/* Current status indicator */}
                    <div className="timeline-item current">
                      <div className="timeline-marker bg-primary"></div>
                      <div className="timeline-content">
                        <strong>{statusInfo.text}</strong>
                        <small className="text-muted d-block">
                          Current Status
                        </small>
                        <small>{statusInfo.description}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "white",
            boxShadow: "0 -2px 20px rgba(0,0,0,0.1)",
          }}
        >
          <SecondFooter />
        </div>

        {/* Assign Serviceman Modal */}
        {showAssignModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Assign Serviceman</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Select a serviceman to assign to this service request:</p>
                  <div className="list-group">
                    {availableServicemen.map((serviceman) => (
                      <button
                        key={serviceman.user}
                        className={`list-group-item list-group-item-action ${selectedServiceman === serviceman.user ? 'active' : ''}`}
                        onClick={() => setSelectedServiceman(serviceman.user)}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{typeof serviceman.user === 'object' ? serviceman.user.username : `User #${serviceman.user}`}</h6>
                          <span className={`badge ${serviceman.is_available ? 'bg-success' : 'bg-secondary'}`}>
                            {serviceman.is_available ? 'Available' : 'Busy'}
                          </span>
                        </div>
                        <p className="mb-1 small">Rating: {serviceman.rating}/5.0 | Jobs: {serviceman.total_jobs_completed}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleAssignServiceman}
                    disabled={!selectedServiceman || actionLoading}
                  >
                    {actionLoading ? 'Assigning...' : 'Assign Serviceman'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Provide Estimate Modal */}
        {showEstimateModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Provide Cost Estimate</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEstimateModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Estimated Cost (₦)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={estimateAmount}
                      onChange={(e) => setEstimateAmount(e.target.value)}
                      placeholder="Enter estimated cost"
                      min="0"
                      step="100"
                    />
                  </div>
                  <div className="alert alert-info">
                    <small>This estimate will be sent to the client for approval before work begins.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEstimateModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleProvideEstimate}
                    disabled={!estimateAmount || actionLoading}
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Estimate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mark Completed Modal */}
        {showCompleteModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Mark Service as Completed</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCompleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Final Cost (₦) - Optional</label>
                    <input
                      type="number"
                      className="form-control"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                      placeholder="Enter final cost if different from estimate"
                      min="0"
                      step="100"
                    />
                  </div>
                  <div className="alert alert-success">
                    <small>Marking this service as completed will notify the client and allow them to rate the service.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-success" 
                    onClick={handleMarkCompleted}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Completing...' : 'Mark as Completed'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
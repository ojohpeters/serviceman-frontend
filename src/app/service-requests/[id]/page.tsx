'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import serviceRequestsService from '../../services/serviceRequests';
import { ServiceRequest, ServiceRequestStatus } from '../../types/api';
import notificationsService from '../../services/notifications';
import { adminService } from '../../services/admin';
import { paymentsService } from '../../services/payments';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
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
  const [showFinalizePriceModal, setShowFinalizePriceModal] = useState(false);
  const [showConfirmCompletionModal, setShowConfirmCompletionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [availableServicemen, setAvailableServicemen] = useState<any[]>([]);
  const [estimateAmount, setEstimateAmount] = useState('');
  const [estimateNotes, setEstimateNotes] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState('10');
  const [adminNotes, setAdminNotes] = useState('');
  const [messageToClient, setMessageToClient] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedServiceman, setSelectedServiceman] = useState<number | null>(null);
  const [selectedBackupServiceman, setSelectedBackupServiceman] = useState<number | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const requestId = params.id as string;

  useEffect(() => {
    const fetchServiceRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const request = await serviceRequestsService.getServiceRequestById(Number(requestId));
        
        // 🔍 DEBUG: Log the full API response
        console.log('🔍 [Service Request API Response]', {
          id: request.id,
          status: request.status,
          serviceman: request.serviceman,
          client: request.client,
          category: request.category,
          service_description: request.service_description,
          booking_date: request.booking_date,
          created_at: request.created_at,
          updated_at: request.updated_at,
          initial_booking_fee: request.initial_booking_fee,
          serviceman_estimated_cost: request.serviceman_estimated_cost,
          final_cost: request.final_cost,
          fullResponse: request
        });
        
        setServiceRequest(request);
        
        // If admin and request is in assignment phase, fetch available servicemen
        // Allow fetching even if serviceman is already assigned (for reassignment)
        if (user?.user_type === 'ADMIN' && request.status === 'PENDING_ADMIN_ASSIGNMENT') {
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
    // Handle both cases: client as ID or as object
    if (user.user_type === 'CLIENT') {
      const clientId = typeof serviceRequest.client === 'object' 
        ? serviceRequest.client.id 
        : serviceRequest.client;
      if (userData?.id === clientId) return true;
    }
    
    // Serviceman can view requests assigned to them (primary or backup)
    if (user.user_type === 'SERVICEMAN') {
      // Check primary serviceman
      if (serviceRequest.serviceman) {
        const serviceman = serviceRequest.serviceman as any;
        const servicemanUserId = typeof serviceman === 'object'
          ? (typeof serviceman.user === 'object' 
              ? serviceman.user.id 
              : serviceman.user)
          : serviceman;
        
        if (userData?.id === servicemanUserId) {
          console.log('✅ [Permission] Serviceman has access as PRIMARY serviceman');
          return true;
        }
      }
      
      // Check backup serviceman
      if (serviceRequest.backup_serviceman) {
        const backup = serviceRequest.backup_serviceman as any;
        const backupUserId = typeof backup === 'object'
          ? (typeof backup.user === 'object'
              ? backup.user.id
              : backup.user)
          : backup;
        
        if (userData?.id === backupUserId) {
          console.log('✅ [Permission] Serviceman has access as BACKUP serviceman');
          return true;
        }
      }
    }
    
    console.log('❌ [Permission] Access denied:', {
      userType: user.user_type,
      userId: userData?.id,
      servicemanUserId: serviceRequest.serviceman,
      backupUserId: serviceRequest.backup_serviceman,
      clientId: serviceRequest.client
    });
    
    return false;
  };

  // Action handlers
  const handleAssignServiceman = async () => {
    if (!selectedServiceman || !serviceRequest) return;
    
    // Validate primary and backup are not the same
    if (selectedBackupServiceman && selectedServiceman === selectedBackupServiceman) {
      alert('Primary and backup servicemen cannot be the same person');
      return;
    }
    
    try {
      setActionLoading(true);
      console.log('🔧 Assigning servicemen:', {
        requestId: serviceRequest.id,
        primaryServicemanId: selectedServiceman,
        backupServicemanId: selectedBackupServiceman,
        notes: assignmentNotes,
        currentStatus: serviceRequest.status
      });
      
      // Use the new working backend endpoint with backup and notes
      const updatedRequest = await serviceRequestsService.assignServiceman(
        serviceRequest.id, 
        selectedServiceman,
        selectedBackupServiceman || undefined, // backup serviceman (optional)
        assignmentNotes || `Assigned by ${(user as any)?.username || 'admin'}`
      );
      
      // Update the service request state
      setServiceRequest(updatedRequest);
      setShowAssignModal(false);
      setSelectedBackupServiceman(null);
      setAssignmentNotes('');
      
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

  // STEP 3: Submit Estimate (Serviceman)
  const handleSubmitEstimate = async () => {
    if (!estimateAmount || !serviceRequest) return;
    
    const amount = parseFloat(estimateAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid cost estimate');
      return;
    }
    
    try {
      setActionLoading(true);
      console.log('💰 Submitting cost estimate:', {
        requestId: serviceRequest.id,
        estimateAmount: amount,
        notes: estimateNotes,
        currentStatus: serviceRequest.status
      });
      
      const result = await serviceRequestsService.submitEstimate(
        serviceRequest.id,
        amount,
        estimateNotes
      );
      
      setServiceRequest(result.service_request);
      setShowEstimateModal(false);
      setEstimateAmount('');
      setEstimateNotes('');
      
      alert(result.message || 'Cost estimate submitted successfully!');
      
    } catch (error: any) {
      console.error('❌ Submit estimate error:', error);
      alert('Failed to submit estimate: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
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
        status: 'IN_PROGRESS' as any
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

  // STEP 4: Finalize Price (Admin)
  const handleFinalizePrice = async () => {
    if (!serviceRequest) return;
    
    const markup = parseFloat(markupPercentage);
    if (isNaN(markup) || markup < 0 || markup > 100) {
      alert('Please enter a valid markup percentage (0-100)');
      return;
    }
    
    try {
      setActionLoading(true);
      console.log('💵 Finalizing price:', {
        requestId: serviceRequest.id,
        markupPercentage: markup,
        adminNotes,
        currentStatus: serviceRequest.status
      });
      
      const result = await serviceRequestsService.finalizePrice(
        serviceRequest.id,
        markup,
        adminNotes
      );
      
      setServiceRequest(result.service_request);
      setShowFinalizePriceModal(false);
      setMarkupPercentage('10');
      setAdminNotes('');
      
      alert(`${result.message}\n\nPrice finalized successfully!`);
      
    } catch (error: any) {
      console.error('❌ Finalize price error:', error);
      alert('Failed to finalize price: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // STEP 6: Authorize Work (Admin)
  const handleAuthorizeWork = async () => {
    if (!serviceRequest) return;
    
    try {
      setActionLoading(true);
      console.log('✅ Authorizing work:', {
        requestId: serviceRequest.id,
        currentStatus: serviceRequest.status
      });
      
      const result = await serviceRequestsService.authorizeWork(serviceRequest.id);
      
      setServiceRequest(result.service_request);
      alert(result.message || 'Work authorized successfully!');
      
    } catch (error: any) {
      console.error('❌ Authorize work error:', error);
      alert('Failed to authorize work: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // STEP 7: Complete Job (Serviceman)
  const handleCompleteJob = async () => {
    if (!serviceRequest) return;
    
    try {
      setActionLoading(true);
      console.log('✅ Completing job:', {
        requestId: serviceRequest.id,
        completionNotes,
        currentStatus: serviceRequest.status
      });
      
      const result = await serviceRequestsService.completeJob(
        serviceRequest.id,
        completionNotes
      );
      
      setServiceRequest(result.service_request);
      setShowCompleteModal(false);
      setCompletionNotes('');
      
      alert(result.message || 'Job marked as complete!');
      
    } catch (error: any) {
      console.error('❌ Complete job error:', error);
      alert('Failed to complete job: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // STEP 8: Confirm Completion (Admin)
  const handleConfirmCompletion = async () => {
    if (!serviceRequest) return;
    
    try {
      setActionLoading(true);
      console.log('✅ Confirming completion:', {
        requestId: serviceRequest.id,
        messageToClient,
        currentStatus: serviceRequest.status
      });
      
      const result = await serviceRequestsService.confirmCompletion(
        serviceRequest.id,
        messageToClient
      );
      
      setServiceRequest(result.service_request);
      setShowConfirmCompletionModal(false);
      setMessageToClient('');
      
      alert(result.message || 'Completion confirmed to client!');
      
    } catch (error: any) {
      console.error('❌ Confirm completion error:', error);
      alert('Failed to confirm completion: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // STEP 5: Client Payment for Final Service Cost
  const handleFinalPayment = async () => {
    if (!serviceRequest || !serviceRequest.final_cost) {
      alert('Final cost not available yet');
      return;
    }

    if (serviceRequest.status !== 'AWAITING_CLIENT_APPROVAL') {
      alert('This request is not ready for payment');
      return;
    }

    try {
      setPaymentLoading(true);
      console.log('💳 [Final Payment] Initializing payment for service request:', serviceRequest.id);
      console.log('💰 [Final Payment] Amount:', serviceRequest.final_cost);
      console.log('📧 [Final Payment] Client email:', typeof serviceRequest.client === 'object' ? serviceRequest.client.email : user?.email);

      // Initialize final service payment
      // Backend expects: { service_request, payment_type, amount }
      const requestBody = {
        service_request: serviceRequest.id,
        payment_type: 'SERVICE_PAYMENT',
        amount: parseFloat(serviceRequest.final_cost)
      };
      
      console.log('📤 [Final Payment] Request body:', requestBody);
      
      const paymentResponse = await paymentsService.initializePayment(requestBody as any);

      console.log('✅ [Final Payment] Payment initialized:', paymentResponse);

      // Save reference for verification
      localStorage.setItem('pendingPaymentReference', paymentResponse.reference);
      localStorage.setItem('pendingServiceRequestId', serviceRequest.id.toString());
      localStorage.setItem('paymentType', 'SERVICE_PAYMENT');

      console.log('📍 [Final Payment] Redirecting to Paystack:', paymentResponse.paystack_url);

      // Redirect to Paystack
      window.location.href = paymentResponse.paystack_url;

    } catch (error: any) {
      console.error('❌ [Final Payment] Payment initialization failed:', error);
      
      let errorMessage = 'Failed to initialize payment. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setPaymentLoading(false);
    }
  };

  // STEP 9: Submit Review (Client)
  const handleSubmitReview = async () => {
    if (!serviceRequest) return;
    
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5 stars');
      return;
    }
    
    try {
      setActionLoading(true);
      console.log('⭐ Submitting review:', {
        requestId: serviceRequest.id,
        rating,
        reviewText,
        currentStatus: serviceRequest.status
      });
      
      const result = await serviceRequestsService.submitReview(
        serviceRequest.id,
        rating,
        reviewText
      );
      
      setServiceRequest(result.service_request);
      setShowReviewModal(false);
      setRating(5);
      setReviewText('');
      
      alert(result.message || 'Thank you for your review!');
      
    } catch (error: any) {
      console.error('❌ Submit review error:', error);
      alert('Failed to submit review: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
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

  // Smart status display: Handle backend inconsistency where serviceman is assigned but status not updated
  const displayStatus = useMemo(() => {
    if (!serviceRequest) return 'PENDING_ADMIN_ASSIGNMENT';
    
    const rawStatus = serviceRequest.status;
    
    // 🔍 DEBUG: Log status logic
    console.log('🔍 [Status Display Logic]', {
      rawStatus: rawStatus,
      hasServiceman: !!serviceRequest.serviceman,
      servicemanData: serviceRequest.serviceman,
      willOverride: serviceRequest.serviceman && rawStatus === 'PENDING_ADMIN_ASSIGNMENT'
    });
    
    // If serviceman is assigned but status still shows pending assignment, 
    // the backend hasn't updated yet - show correct status
    if (serviceRequest.serviceman) {
      if (rawStatus === 'PENDING_ADMIN_ASSIGNMENT') {
        // Serviceman assigned but waiting for estimate
        console.log('✅ [Status Override] Changing status from', rawStatus, 'to PENDING_ESTIMATION');
        return 'PENDING_ESTIMATION';
      }
    }
    
    // Otherwise use backend status as is
    console.log('✅ [Status No Override] Using backend status:', rawStatus);
    return rawStatus;
  }, [serviceRequest]);

  const statusInfo = useMemo(() => {
    return getStatusInfo(displayStatus);
  }, [displayStatus]);

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
                        <p className="mb-0 mt-1">{serviceRequest.service_description || 'No description provided'}</p>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Service Address:</strong>
                        <p className="mb-0 mt-1">{serviceRequest.client_address || 'No address provided'}</p>
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
                      
                      {serviceRequest.initial_booking_fee && (
                        <div className="mb-3">
                          <strong>Booking Fee:</strong>
                          <p className="mb-0 mt-1">
                            <span className="fw-bold text-success">
                              {formatCurrency(parseFloat(serviceRequest.initial_booking_fee || '0'))}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-telephone me-2"></i>
                    Contact Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Admin sees all contacts */}
                    {user?.user_type === 'ADMIN' && (
                      <>
                        {/* Client Contact */}
                        <div className="col-md-4 mb-3">
                          <div className="p-3 bg-primary bg-opacity-10 rounded h-100 border border-primary">
                            <h6 className="fw-bold mb-3 text-primary">
                              <i className="bi bi-person-circle me-2"></i>
                              Client
                            </h6>
                            {(() => {
                              const client = serviceRequest.client as any;
                              const clientName = typeof client === 'object' 
                                ? (client.full_name || client.username || `Client #${client.id}`)
                                : `Client #${client}`;
                              const clientEmail = typeof client === 'object' ? client.email : '';
                              const clientPhone = typeof client === 'object' ? client.phone_number : '';
                              
                              return (
                                <>
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Name:</small>
                                    <strong className="text-break">{clientName}</strong>
                                  </div>
                                  {clientEmail && (
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Email:</small>
                                      <a href={`mailto:${clientEmail}`} className="text-decoration-none text-break d-block" style={{ fontSize: '0.9rem' }}>
                                        {clientEmail}
                                      </a>
                                    </div>
                                  )}
                                  {clientPhone && (
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Phone:</small>
                                      <a href={`tel:${clientPhone}`} className="text-decoration-none">
                                        {clientPhone}
                                      </a>
                                    </div>
                                  )}
                                  <div className="mb-0">
                                    <small className="text-muted d-block">Address:</small>
                                    <span className="text-break" style={{ fontSize: '0.9rem' }}>{serviceRequest.client_address}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Primary Serviceman Contact */}
                        {serviceRequest.serviceman && (
                          <div className="col-md-4 mb-3">
                            <div className="p-3 bg-success bg-opacity-10 rounded h-100 border border-success">
                              <h6 className="fw-bold mb-3 text-success">
                                <i className="bi bi-wrench me-2"></i>
                                Primary Serviceman
                              </h6>
                              {(() => {
                                const serviceman = serviceRequest.serviceman as any;
                                const user = typeof serviceman.user === 'object' ? serviceman.user : null;
                                const servicemanName = (user as any)?.full_name || user?.username || `Serviceman #${serviceman.id || serviceman}`;
                                const servicemanEmail = user?.email || '';
                                const servicemanPhone = serviceman.phone_number || '';
                                
                                return (
                                  <>
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Name:</small>
                                      <strong className="text-break">{servicemanName}</strong>
                                    </div>
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Email:</small>
                                      {servicemanEmail ? (
                                        <a href={`mailto:${servicemanEmail}`} className="text-decoration-none text-break d-block" style={{ fontSize: '0.9rem' }}>
                                          {servicemanEmail}
                                        </a>
                                      ) : (
                                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
                                      )}
                                    </div>
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Phone Number:</small>
                                      {servicemanPhone ? (
                                        <a href={`tel:${servicemanPhone}`} className="text-decoration-none">
                                          {servicemanPhone}
                                        </a>
                                      ) : (
                                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
                                      )}
                                    </div>
                                    {serviceman.rating && (
                                      <div className="mb-0">
                                        <small className="text-muted d-block">Rating:</small>
                                        <span className="text-warning">
                                          {'★'.repeat(Math.round(parseFloat(serviceman.rating)))}
                                          <span className="ms-1">{parseFloat(serviceman.rating).toFixed(1)}</span>
                                        </span>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Backup Serviceman Contact */}
                        {serviceRequest.backup_serviceman && (
                          <div className="col-md-4 mb-3">
                            <div className="p-3 bg-warning bg-opacity-10 rounded h-100 border border-warning">
                              <h6 className="fw-bold mb-3 text-warning">
                                <i className="bi bi-person-plus me-2"></i>
                                Backup Serviceman
                              </h6>
                              {(() => {
                                const backup = serviceRequest.backup_serviceman as any;
                                const user = typeof backup.user === 'object' ? backup.user : null;
                                const backupName = (user as any)?.full_name || user?.username || `Serviceman #${backup.id || backup}`;
                                const backupEmail = user?.email || '';
                                const backupPhone = backup.phone_number || '';
                                
                                return (
                                  <>
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Name:</small>
                                      <strong className="text-break">{backupName}</strong>
                                    </div>
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Email:</small>
                                      {backupEmail ? (
                                        <a href={`mailto:${backupEmail}`} className="text-decoration-none text-break d-block" style={{ fontSize: '0.9rem' }}>
                                          {backupEmail}
                                        </a>
                                      ) : (
                                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
                                      )}
                                    </div>
                                    <div className="mb-2">
                                      <small className="text-muted d-block">Phone Number:</small>
                                      {backupPhone ? (
                                        <a href={`tel:${backupPhone}`} className="text-decoration-none">
                                          {backupPhone}
                                        </a>
                                      ) : (
                                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
                                      )}
                                    </div>
                                    {backup.rating && (
                                      <div className="mb-0">
                                        <small className="text-muted d-block">Rating:</small>
                                        <span className="text-warning">
                                          {'★'.repeat(Math.round(parseFloat(backup.rating)))}
                                          <span className="ms-1">{parseFloat(backup.rating).toFixed(1)}</span>
                                        </span>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Client sees serviceman contact */}
                    {user?.user_type === 'CLIENT' && serviceRequest.serviceman && (
                      <div className="col-md-6 mb-3">
                        <div className="p-3 bg-success bg-opacity-10 rounded h-100 border border-success">
                          <h6 className="fw-bold mb-3 text-success">
                            <i className="bi bi-person-check me-2"></i>
                            Your Assigned Serviceman
                          </h6>
                          {(() => {
                            const serviceman = serviceRequest.serviceman as any;
                            const user = typeof serviceman.user === 'object' ? serviceman.user : null;
                            const servicemanName = (user as any)?.full_name || user?.username || 'Assigned Professional';
                            const servicemanPhone = serviceman.phone_number || '';
                            
                            return (
                              <>
                                <div className="mb-2">
                                  <small className="text-muted d-block">Name:</small>
                                  <strong className="text-break">{servicemanName}</strong>
                                </div>
                                <div className="mb-2">
                                  <small className="text-muted d-block">Phone Number:</small>
                                  {servicemanPhone ? (
                                    <a href={`tel:${servicemanPhone}`} className="btn btn-sm btn-success">
                                      <i className="bi bi-telephone me-1"></i>
                                      {servicemanPhone}
                                    </a>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
                                  )}
                                </div>
                                {serviceman.rating && (
                                  <div className="mb-0">
                                    <small className="text-muted d-block">Rating:</small>
                                    <span className="text-warning">
                                      {'★'.repeat(Math.round(parseFloat(serviceman.rating)))}
                                      <span className="ms-1">{parseFloat(serviceman.rating).toFixed(1)}</span>
                                    </span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Serviceman sees client contact */}
                    {user?.user_type === 'SERVICEMAN' && (
                      <div className="col-md-6 mb-3">
                        <div className="p-3 bg-primary bg-opacity-10 rounded h-100 border border-primary">
                          <h6 className="fw-bold mb-3 text-primary">
                            <i className="bi bi-person-circle me-2"></i>
                            Client Contact
                          </h6>
                          {(() => {
                            const client = serviceRequest.client as any;
                            const clientName = typeof client === 'object' 
                              ? (client.full_name || client.username || 'Client')
                              : 'Client';
                            const clientPhone = typeof client === 'object' ? client.phone_number : '';
                            
                            return (
                              <>
                                <div className="mb-2">
                                  <small className="text-muted d-block">Name:</small>
                                  <strong className="text-break">{clientName}</strong>
                                </div>
                                <div className="mb-2">
                                  <small className="text-muted d-block">Service Address:</small>
                                  <span className="text-break" style={{ fontSize: '0.9rem' }}>{serviceRequest.client_address}</span>
                                </div>
                                <div className="mb-0">
                                  <small className="text-muted d-block">Phone Number:</small>
                                  {clientPhone ? (
                                    <a href={`tel:${clientPhone}`} className="btn btn-sm btn-primary">
                                      <i className="bi bi-telephone me-1"></i>
                                      {clientPhone}
                                    </a>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
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
                    {/* Only show serviceman estimate to admin and serviceman, not to client */}
                    {(user?.user_type === 'ADMIN' || user?.user_type === 'SERVICEMAN') && (
                      <div className="col-md-4 mb-3">
                        <div className="p-3 bg-light rounded">
                          <strong className="d-block mb-2">Serviceman Estimate</strong>
                          <h4 className={`mb-0 ${
                            serviceRequest.serviceman_estimated_cost ? 'text-primary' : 'text-muted'
                          }`}>
                            {formatCurrency(parseFloat(serviceRequest.serviceman_estimated_cost || '0'))}
                          </h4>
                          <small className="text-muted">
                            {serviceRequest.serviceman_estimated_cost ? 
                              'Estimate provided' : 'Awaiting estimate'
                            }
                          </small>
                        </div>
                      </div>
                    )}
                    <div className={user?.user_type === 'CLIENT' ? 'col-md-6 mb-3' : 'col-md-4 mb-3'}>
                      <div className="p-3 bg-light rounded">
                        <strong className="d-block mb-2">Final Cost</strong>
                        <h4 className={`mb-0 ${
                          serviceRequest.final_cost ? 'text-success' : 'text-muted'
                        }`}>
                          {formatCurrency(parseFloat(serviceRequest.final_cost || '0'))}
                        </h4>
                        <small className="text-muted">
                          {serviceRequest.final_cost ? 
                            'Including platform fee' : 'To be determined'
                          }
                        </small>
                      </div>
                    </div>
                    <div className={user?.user_type === 'CLIENT' ? 'col-md-6 mb-3' : 'col-md-4 mb-3'}>
                      <div className="p-3 bg-light rounded">
                        <strong className="d-block mb-2">Payment Status</strong>
                        <div className="mb-2">
                          {serviceRequest.final_cost ? (
                            <span className="badge bg-success">Final Payment Ready</span>
                          ) : (
                            <span className="badge bg-secondary">Awaiting Process</span>
                          )}
                        </div>
                        <small className="text-muted">
                          Follow the workflow
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Actions & Info */}
            <div className="col-12 col-lg-4">
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
                      {/* STEP 5: Client Payment */}
                      {serviceRequest.status === 'AWAITING_CLIENT_APPROVAL' && (
                        <div>
                          <div className="card border-primary mb-3">
                            <div className="card-body">
                              <h5 className="card-title text-primary mb-3">
                                <i className="bi bi-currency-exchange me-2"></i>
                                Final Price Ready
                              </h5>
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong>Total Amount to Pay:</strong>
                                  <strong className="text-success" style={{ fontSize: '2rem' }}>
                                    ₦{serviceRequest.final_cost ? parseFloat(serviceRequest.final_cost).toLocaleString() : '0'}
                                  </strong>
                                </div>
                              </div>
                              <div className="alert alert-info small mb-0">
                                <i className="bi bi-info-circle me-1"></i>
                                Pay now to authorize the serviceman to begin work
                              </div>
                            </div>
                          </div>
                          <button 
                            className="btn btn-success btn-lg w-100"
                            onClick={handleFinalPayment}
                            disabled={paymentLoading}
                          >
                            <i className="bi bi-credit-card me-2"></i>
                            {paymentLoading ? 'Redirecting to Paystack...' : 'Pay Now'}
                          </button>
                        </div>
                      )}
                      
                      {/* STEP 9: Submit Review */}
                      {serviceRequest.status === ServiceRequestStatus.COMPLETED && (
                        <button 
                          className="btn btn-warning btn-lg"
                          onClick={() => setShowReviewModal(true)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-star me-2"></i>
                          {actionLoading ? 'Processing...' : 'Rate Serviceman'}
                        </button>
                      )}
                      
                      {/* Status Info */}
                      {serviceRequest.status === 'PENDING_ADMIN_ASSIGNMENT' && (
                        <div className="alert alert-info border-0 mb-0">
                          <i className="bi bi-clock me-2"></i>
                          Admin is assigning a serviceman to your request
                        </div>
                      )}
                      
                      {(displayStatus === 'PENDING_ESTIMATION' || serviceRequest.status === 'ESTIMATION_SUBMITTED') && (
                        <div className="alert alert-info border-0 mb-0">
                          <i className="bi bi-hourglass-split me-2"></i>
                          {displayStatus === 'PENDING_ESTIMATION' 
                            ? 'Your estimate is being prepared by the serviceman'
                            : 'Your estimate is being processed. You will be notified when ready for approval.'}
                        </div>
                      )}
                      
                      {serviceRequest.status === 'PAYMENT_COMPLETED' && (
                        <div className="alert alert-success border-0 mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          Payment received! Serviceman will begin work soon.
                        </div>
                      )}
                      
                      {serviceRequest.status === 'IN_PROGRESS' && (
                        <div className="alert alert-primary border-0 mb-0">
                          <i className="bi bi-tools me-2"></i>
                          Serviceman is currently working on your request
                        </div>
                      )}
                      
                      {serviceRequest.status === ServiceRequestStatus.CLIENT_REVIEWED && (
                        <div className="alert alert-success border-0 mb-0">
                          <i className="bi bi-check-all me-2"></i>
                          Thank you for your review! Service complete.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Serviceman Actions */}
                  {user?.user_type === 'SERVICEMAN' && (
                    <div className="d-grid gap-2">
                      {/* STEP 3: Submit Estimate */}
                      {(displayStatus === 'PENDING_ESTIMATION' || serviceRequest.status === 'PENDING_ESTIMATION') && (
                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={() => setShowEstimateModal(true)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-calculator me-2"></i>
                          {actionLoading ? 'Processing...' : 'Submit Cost Estimate'}
                        </button>
                      )}
                      
                      {/* STEP 7: Complete Job */}
                      {serviceRequest.status === 'IN_PROGRESS' && (
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={() => setShowCompleteModal(true)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          {actionLoading ? 'Processing...' : 'Mark Job as Complete'}
                        </button>
                      )}
                      
                      {/* Status Info */}
                      {(serviceRequest.status === 'ESTIMATION_SUBMITTED' || serviceRequest.status === 'AWAITING_CLIENT_APPROVAL') && (
                        <div className="alert alert-info border-0 mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          {serviceRequest.status === 'ESTIMATION_SUBMITTED' 
                            ? 'Waiting for admin to finalize pricing'
                            : 'Waiting for client to approve and pay'}
                        </div>
                      )}
                      
                      {serviceRequest.status === 'PAYMENT_COMPLETED' && (
                        <div className="alert alert-success border-0 mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          Payment received! Admin will authorize work to begin.
                        </div>
                      )}
                      
                      {serviceRequest.status === 'COMPLETED' && (
                        <div className="alert alert-success border-0 mb-0">
                          <i className="bi bi-star me-2"></i>
                          Job completed! Waiting for client review.
                        </div>
                      )}
                      
                      {serviceRequest.status === ServiceRequestStatus.CLIENT_REVIEWED && (
                        <div className="alert alert-success border-0 mb-0">
                          <i className="bi bi-check-all me-2"></i>
                          All done! Client has reviewed your service.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Actions */}
                  {user?.user_type === 'ADMIN' && (
                    <div className="d-grid gap-2">
                      {/* STEP 2: Assign/Reassign Serviceman */}
                      {serviceRequest.status === 'PENDING_ADMIN_ASSIGNMENT' && (
                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={() => {
                            // Reset selections when opening modal
                            setSelectedServiceman(null);
                            setSelectedBackupServiceman(null);
                            setAssignmentNotes('');
                            
                            // Debug: Log what API returned for preferred_serviceman
                            console.log('🔍 [Modal Open] Full service request:', serviceRequest);
                            console.log('🔍 [Modal Open] Preferred serviceman from API:', serviceRequest.preferred_serviceman);
                            if (serviceRequest.preferred_serviceman) {
                              const pref = serviceRequest.preferred_serviceman as any;
                              console.log('✨ [Modal Open] Preferred serviceman ID:', pref.id);
                              console.log('✨ [Modal Open] Preferred serviceman user:', pref.user);
                            } else {
                              console.log('ℹ️ [Modal Open] No preferred serviceman set for this request');
                            }
                            console.log('🔍 [Modal Open] Available servicemen:', availableServicemen);
                            
                            setShowAssignModal(true);
                          }}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-person-plus me-2"></i>
                          {actionLoading ? 'Processing...' : serviceRequest.serviceman ? 'Reassign Serviceman' : 'Assign Serviceman'}
                        </button>
                      )}
                      
                      {/* STEP 4: Finalize Price */}
                      {serviceRequest.status === 'ESTIMATION_SUBMITTED' && (
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={() => setShowFinalizePriceModal(true)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-currency-dollar me-2"></i>
                          {actionLoading ? 'Processing...' : 'Finalize Price & Send to Client'}
                        </button>
                      )}
                      
                      {/* STEP 6: Authorize Work */}
                      {serviceRequest.status === 'PAYMENT_COMPLETED' && (
                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={handleAuthorizeWork}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-play-circle me-2"></i>
                          {actionLoading ? 'Processing...' : 'Authorize Work to Begin'}
                        </button>
                      )}
                      
                      {/* STEP 8: Confirm Completion */}
                      {serviceRequest.status === ServiceRequestStatus.COMPLETED && (
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={() => setShowConfirmCompletionModal(true)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-check2-all me-2"></i>
                          {actionLoading ? 'Processing...' : 'Confirm to Client'}
                        </button>
                      )}
                      
                      {/* Serviceman Info */}
                      {serviceRequest.serviceman && (
                        <div className="alert alert-info border-0 shadow-sm mb-0">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-check-fill fs-5 me-2 text-info"></i>
                            <div className="flex-grow-1">
                              <strong>Assigned:</strong> {typeof serviceRequest.serviceman === 'object' ? serviceRequest.serviceman.username : `User #${serviceRequest.serviceman}`}
                              <div className="small text-muted mt-1">
                                {displayStatus === 'PENDING_ESTIMATION' 
                                  ? '⏳ Waiting for estimate'
                                  : serviceRequest.status === 'ESTIMATION_SUBMITTED'
                                  ? '💵 Estimate ready for review'
                                  : serviceRequest.status === 'AWAITING_CLIENT_APPROVAL'
                                  ? '⏰ Waiting for client payment'
                                  : displayStatus === 'IN_PROGRESS'
                                  ? '🔧 Working on service'
                                  : displayStatus === 'COMPLETED'
                                  ? '✅ Job completed'
                                  : 'Assigned and notified'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Info Alerts */}
                      {serviceRequest.status === 'AWAITING_CLIENT_APPROVAL' && (
                        <div className="alert alert-warning border-0 mb-0">
                          <i className="bi bi-clock me-2"></i>
                          Waiting for client to approve price and pay
                        </div>
                      )}
                      
                      {serviceRequest.status === 'IN_PROGRESS' && (
                        <div className="alert alert-primary border-0 mb-0">
                          <i className="bi bi-tools me-2"></i>
                          Serviceman is currently working on this job
                        </div>
                      )}
                      
                      {serviceRequest.status === ServiceRequestStatus.CLIENT_REVIEWED && (
                        <div className="alert alert-success border-0 mb-0">
                          <i className="bi bi-check-all me-2"></i>
                          Workflow complete! Client has reviewed the service.
                        </div>
                      )}
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-person-plus me-2"></i>
                    {serviceRequest?.serviceman ? 'Reassign Serviceman' : 'Assign Serviceman'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAssignModal(false)}></button>
                </div>
                <div className="modal-body">
                  {/* Show Client's Preferred Serviceman if exists */}
                  {serviceRequest?.preferred_serviceman && (() => {
                    const preferred = serviceRequest.preferred_serviceman as any;
                    
                    // Handle different response formats from backend
                    let userName = 'Unknown Serviceman';
                    let servicemanId = null;
                    
                    // Case 1: preferred_serviceman is just a number (ID only)
                    if (typeof preferred === 'number') {
                      servicemanId = preferred;
                      // Try to find the serviceman in availableServicemen list
                      const foundServiceman = availableServicemen.find((s: any) => s.id === preferred);
                      if (foundServiceman && foundServiceman.user) {
                        if (typeof foundServiceman.user === 'object') {
                          userName = foundServiceman.user.full_name || foundServiceman.user.username || `Serviceman #${preferred}`;
                        } else {
                          userName = `Serviceman #${preferred}`;
                        }
                      } else {
                        userName = `Serviceman #${preferred}`;
                      }
                    }
                    // Case 2: preferred_serviceman is an object with user property
                    else if (preferred && typeof preferred === 'object') {
                      servicemanId = preferred.id;
                      if (preferred.user) {
                        if (typeof preferred.user === 'object') {
                          userName = preferred.user.full_name || preferred.user.username || 'Unknown Serviceman';
                        } else {
                          // user is just an ID, try to find in availableServicemen
                          const foundServiceman = availableServicemen.find((s: any) => {
                            const sUserId = typeof s.user === 'object' ? s.user.id : s.user;
                            return sUserId === preferred.user;
                          });
                          if (foundServiceman && typeof foundServiceman.user === 'object') {
                            userName = foundServiceman.user.full_name || foundServiceman.user.username || `Serviceman #${preferred.user}`;
                          } else {
                            userName = `Serviceman #${preferred.user}`;
                          }
                        }
                      } else if (servicemanId) {
                        userName = `Serviceman #${servicemanId}`;
                      }
                    }
                    
                    console.log('🎨 [Preferred Display] Rendering preferred serviceman card:', {
                      preferred,
                      servicemanId,
                      userName,
                      availableServicemenCount: availableServicemen.length
                    });
                    
                    // Show warning if backend returned incomplete data
                    const isIncompleteData = typeof preferred === 'number' || 
                                            (typeof preferred === 'object' && !preferred.user) ||
                                            (typeof preferred === 'object' && typeof preferred.user !== 'object');
                    
                    return (
                      <>
                        {isIncompleteData && (
                          <div className="alert alert-warning border-warning mb-3">
                            <div className="d-flex align-items-start">
                              <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                              <div>
                                <strong>⚠️ Backend API Issue Detected</strong>
                                <p className="mb-1 small">
                                  <strong>Problem:</strong> The backend is returning <code>preferred_serviceman: {typeof preferred === 'number' ? preferred : preferred.id}</code> (incomplete data).
                                </p>
                                <p className="mb-1 small">
                                  <strong>Expected:</strong> Full serviceman object with expanded user details.
                                </p>
                                <p className="mb-0 small">
                                  <strong>Backend Team:</strong> Please update the <code>GET /api/services/service-requests/{'{id}'}/</code> endpoint 
                                  to return <code>preferred_serviceman</code> with full details (user object, rating, skills, etc.)
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="card border-success border-3 mb-4 shadow">
                          <div className="card-header bg-success bg-opacity-10 border-bottom border-success">
                            <h5 className="mb-0 text-success">
                              <i className="bi bi-star-fill me-2"></i>
                              💡 Client's Preferred Serviceman
                            </h5>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-8">
                                <h4 className="mb-3 text-dark">{userName}</h4>
                              
                              {preferred.rating && (
                                <div className="mb-3">
                                  <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-primary px-3 py-2">
                                      ⭐ {preferred.rating} rating
                                    </span>
                                    <span className="badge bg-info px-3 py-2">
                                      📊 {preferred.total_jobs_completed || 0} jobs completed
                                    </span>
                                    <span className="badge bg-secondary px-3 py-2">
                                      💼 {preferred.years_of_experience || 0} years experience
                                    </span>
                                    <span className={`badge px-3 py-2 ${preferred.is_available ? 'bg-success' : 'bg-warning text-dark'}`}>
                                      {preferred.is_available ? '✓ Available Now' : '⚠ Currently Busy'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {preferred.skills && preferred.skills.length > 0 && (
                                <div className="mb-2">
                                  <strong className="d-block mb-2">Skills:</strong>
                                  <div className="d-flex flex-wrap gap-1">
                                    {preferred.skills.map((s: any, idx: number) => (
                                      <span key={idx} className="badge bg-light text-dark border">
                                        {s.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {preferred.bio && (
                                <div className="mt-3">
                                  <strong className="d-block mb-1">About:</strong>
                                  <p className="small text-muted mb-0">{preferred.bio}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="col-md-4 d-flex flex-column justify-content-center align-items-center border-start">
                              <div className="text-center">
                                <div className="bg-success bg-opacity-10 rounded-circle p-4 mb-3 mx-auto" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="bi bi-hand-thumbs-up-fill text-success fs-1"></i>
                                </div>
                                <h6 className="text-success mb-2">
                                  <i className="bi bi-info-circle me-1"></i>
                                  Client's Choice
                                </h6>
                                <p className="small text-muted mb-0">
                                  Look for this serviceman in the list below and select them as primary.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </>
                    );
                  })()}
                  
                  {serviceRequest?.serviceman && (
                    <div className="alert alert-info mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Currently Assigned:</strong> {typeof serviceRequest.serviceman === 'object' ? serviceRequest.serviceman.username : `User #${serviceRequest.serviceman}`}
                      <div className="small mt-1">Select a different serviceman to reassign this request</div>
                    </div>
                  )}
                  
                  <h6 className="mb-2">
                    <i className="bi bi-person-check me-2"></i>
                    Primary Serviceman (Required)
                  </h6>
                  {selectedServiceman && (
                    <div className="alert alert-primary small mb-3">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <strong>Selected:</strong> {(() => {
                        const selected = availableServicemen.find((s: any) => {
                          const userId = typeof s.user === 'object' ? s.user.id : s.user;
                          return userId === selectedServiceman;
                        });
                        if (selected) {
                          return typeof selected.user === 'object' 
                            ? (selected.user.full_name || selected.user.username) 
                            : `User #${selected.user}`;
                        }
                        return `User #${selectedServiceman}`;
                      })()}
                    </div>
                  )}
                  
                  {availableServicemen.length === 0 ? (
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      No available servicemen found for this category. Please check back later or contact servicemen directly.
                    </div>
                  ) : (
                    <div className="list-group">
                      {availableServicemen.map((serviceman) => {
                        // Extract the actual user ID from serviceman.user (which might be an object or number)
                        const servicemanUserId = typeof serviceman.user === 'object' ? serviceman.user.id : serviceman.user;
                        
                        const isCurrentlyAssigned = serviceRequest?.serviceman && 
                          (typeof serviceRequest.serviceman === 'object' 
                            ? serviceRequest.serviceman.id === servicemanUserId 
                            : serviceRequest.serviceman === servicemanUserId);
                        
                        // Check if this is the client's preferred serviceman
                        // API returns: preferred_serviceman: { id: 42, user: { full_name: "..." }, ... }
                        const preferredServiceman = serviceRequest?.preferred_serviceman as any;
                        const isPreferred = preferredServiceman && preferredServiceman.id && 
                          preferredServiceman.id === serviceman.id;
                        
                        // Only log if there's a preferred serviceman to avoid console spam
                        if (preferredServiceman) {
                          console.log('🔍 [Serviceman List] Checking serviceman:', {
                            servicemanId: serviceman.id,
                            servicemanUserId,
                            preferredServicemanId: preferredServiceman?.id,
                            isPreferred,
                            match: preferredServiceman.id === serviceman.id ? '✅ MATCH!' : '❌ No match'
                          });
                        }
                        
                        return (
                          <button
                            key={serviceman.id}
                            className={`list-group-item list-group-item-action ${selectedServiceman === servicemanUserId ? 'active' : ''} ${isCurrentlyAssigned ? 'border-primary' : ''} ${isPreferred ? 'border-success border-2' : ''}`}
                            onClick={() => {
                              console.log('✅ [Selection] Selected serviceman user ID:', servicemanUserId);
                              setSelectedServiceman(servicemanUserId);
                            }}
                          >
                            <div className="d-flex w-100 justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">
                                  {typeof serviceman.user === 'object' 
                                    ? (serviceman.user.full_name || serviceman.user.username) 
                                    : `User #${serviceman.user}`}
                                  {isCurrentlyAssigned && (
                                    <span className="badge bg-primary ms-2" style={{ fontSize: '10px' }}>Current</span>
                                  )}
                                  {isPreferred && (
                                    <span className="badge bg-success ms-2" style={{ fontSize: '10px' }}>
                                      <i className="bi bi-star-fill me-1"></i>
                                      Client's Choice
                                    </span>
                                  )}
                                </h6>
                                <div className="d-flex gap-3 small text-muted">
                                  <span>
                                    <i className="bi bi-star-fill text-warning me-1"></i>
                                    {serviceman.rating}/5.0
                                  </span>
                                  <span>
                                    <i className="bi bi-briefcase me-1"></i>
                                    {serviceman.total_jobs_completed} jobs
                                  </span>
                                  {serviceman.years_of_experience && (
                                    <span>
                                      <i className="bi bi-clock-history me-1"></i>
                                      {serviceman.years_of_experience} yrs exp
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={`badge ${serviceman.is_available ? 'bg-success' : 'bg-secondary'}`}>
                                {serviceman.is_available ? 'Available' : 'Busy'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Backup Serviceman Selection */}
                  <div className="mt-4">
                    <h6 className="mb-3">
                      <i className="bi bi-person-plus me-2"></i>
                      Backup Serviceman (Recommended)
                    </h6>
                    <p className="small text-muted mb-3">
                      Select a backup serviceman from the same category who can take over if the primary serviceman becomes unavailable.
                    </p>
                    {availableServicemen.length > 0 ? (
                      <>
                        <select 
                          className="form-select form-select-lg"
                          value={selectedBackupServiceman?.toString() || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value, 10) : null;
                            console.log('🔄 [Backup] Raw value:', e.target.value);
                            console.log('🔄 [Backup] Parsed value:', value);
                            setSelectedBackupServiceman(value);
                          }}
                        >
                          <option value="">-- Optional: Select Backup Serviceman --</option>
                          {availableServicemen
                            .filter(s => {
                              const userId = typeof s.user === 'object' ? s.user.id : s.user;
                              return userId !== selectedServiceman; // Exclude primary serviceman
                            })
                            .map((serviceman) => {
                              const userId = typeof serviceman.user === 'object' ? serviceman.user.id : serviceman.user;
                              const userName = typeof serviceman.user === 'object' 
                                ? (serviceman.user.full_name || serviceman.user.username) 
                                : `User #${serviceman.user}`;
                              
                              return (
                                <option key={serviceman.id} value={userId}>
                                  {userName} ⭐ {serviceman.rating} ({serviceman.total_jobs_completed} jobs)
                                  {serviceman.is_available ? ' ✓ Available' : ' ⚠ Busy'}
                                </option>
                              );
                            })}
                        </select>
                        {selectedBackupServiceman && (
                          <div className="alert alert-success mt-2 mb-0 small">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            Backup serviceman selected: <strong>
                              {(() => {
                                const backup = availableServicemen.find((s: any) => {
                                  const userId = typeof s.user === 'object' ? s.user.id : s.user;
                                  return userId === selectedBackupServiceman;
                                });
                                if (backup) {
                                  return typeof backup.user === 'object' 
                                    ? (backup.user.full_name || backup.user.username) 
                                    : `User #${backup.user}`;
                                }
                                return 'Unknown';
                              })()}
                            </strong>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="alert alert-warning small mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        No other servicemen available in the {typeof serviceRequest?.category === 'object' ? serviceRequest.category.name : ''} category for backup.
                      </div>
                    )}
                  </div>
                  
                  {/* Admin Notes */}
                  <div className="mt-4">
                    <h6 className="mb-2">
                      <i className="bi bi-pencil-square me-2"></i>
                      Notes for Serviceman (Optional)
                    </h6>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Add any special instructions or notes for the serviceman..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                    />
                    <div className="small text-muted mt-1">
                      These notes will be included in the notification sent to the serviceman.
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleAssignServiceman}
                    disabled={!selectedServiceman || actionLoading || availableServicemen.length === 0}
                  >
                    <i className="bi bi-check2 me-1"></i>
                    {actionLoading ? 'Assigning...' : serviceRequest?.serviceman ? 'Reassign' : 'Assign Servicemen & Send Notifications'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Submit Estimate Modal (Serviceman) */}
        {showEstimateModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-calculator me-2"></i>
                    Submit Cost Estimate
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEstimateModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Estimated Cost (₦) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={estimateAmount}
                      onChange={(e) => setEstimateAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={estimateNotes}
                      onChange={(e) => setEstimateNotes(e.target.value)}
                      placeholder="e.g. Includes parts replacement and 2 days labor"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEstimateModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSubmitEstimate}
                    disabled={!estimateAmount || actionLoading}
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Estimate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Complete Job Modal (Serviceman) */}
        {showCompleteModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-check-circle me-2"></i>
                    Complete Job
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowCompleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Completion Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="e.g. All pipes repaired and tested. No leaks detected."
                    ></textarea>
                  </div>
                  <div className="alert alert-success mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>Admin will verify and notify the client. Client can then rate your service.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-success" 
                    onClick={handleCompleteJob}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Mark Job Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Finalize Price Modal (Admin) */}
        {showFinalizePriceModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Finalize Pricing
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowFinalizePriceModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info mb-3">
                    <strong>Serviceman's Estimate:</strong> ₦{serviceRequest?.serviceman_estimated_cost ? parseFloat(serviceRequest.serviceman_estimated_cost).toLocaleString() : '0'}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Platform Fee (%) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(e.target.value)}
                      placeholder="10"
                      min="0"
                      max="100"
                      step="1"
                      required
                    />
                    <small className="text-muted">Standard platform fee is 10%</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Admin Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Price includes all materials and labor"
                    ></textarea>
                  </div>
                  {markupPercentage && serviceRequest?.serviceman_estimated_cost && (
                    <div className="alert alert-success mb-0">
                      <strong>Final Price:</strong> ₦{Math.round(parseFloat(serviceRequest.serviceman_estimated_cost) * (1 + parseFloat(markupPercentage) / 100)).toLocaleString()}
                      <div className="small mt-1">
                        (Base: ₦{parseFloat(serviceRequest.serviceman_estimated_cost).toLocaleString()} + Fee: ₦{Math.round(parseFloat(serviceRequest.serviceman_estimated_cost) * parseFloat(markupPercentage) / 100).toLocaleString()})
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowFinalizePriceModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-success" 
                    onClick={handleFinalizePrice}
                    disabled={!markupPercentage || actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Finalize & Send to Client'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Confirm Completion Modal (Admin) */}
        {showConfirmCompletionModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-check2-all me-2"></i>
                    Confirm Completion to Client
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmCompletionModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Message to Client (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={messageToClient}
                      onChange={(e) => setMessageToClient(e.target.value)}
                      placeholder="e.g. Work has been verified and completed successfully. Please check and rate the service."
                    ></textarea>
                  </div>
                  <div className="alert alert-success mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>Client will be notified and asked to rate the serviceman</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmCompletionModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleConfirmCompletion}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Confirm to Client'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Submit Review Modal (Client) */}
        {showReviewModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="bi bi-star me-2"></i>
                    Rate Your Experience
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3 text-center">
                    <label className="form-label fw-bold">Rating <span className="text-danger">*</span></label>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => setRating(star)}
                          style={{ fontSize: '2rem', textDecoration: 'none' }}
                        >
                          {star <= rating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-muted">
                      {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Review (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tell us about your experience with this serviceman..."
                    ></textarea>
                  </div>
                  <div className="alert alert-info mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>Your feedback helps us maintain quality service</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-warning" 
                    onClick={handleSubmitReview}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Review'}
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
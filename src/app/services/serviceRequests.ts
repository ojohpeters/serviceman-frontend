// ============================================
// Service Requests Service
// Handles all service request-related API operations
// ============================================

import api from './api';
import {
  ServiceRequest,
  CreateServiceRequestData,
  ServiceRequestStatus
} from '../types/api';

export const serviceRequestsService = {
  /**
   * Create new service request (Client only)
   * @param requestData - Service request data
   */
  createServiceRequest: async (requestData: CreateServiceRequestData): Promise<ServiceRequest> => {
    const response = await api.post('/services/service-requests/', requestData);
    return response.data;
  },

  /**
   * Get all service requests for current user with pagination and filtering
   * - Admin: sees all requests
   * - Client: sees their own requests
   * - Serviceman: sees assigned requests
   * @param filters - Optional filters (status, category, is_emergency, limit, offset)
   */
  getServiceRequests: async (): Promise<ServiceRequest[]> => {
    // Backend returns plain array; no pagination or filters implemented
    const response = await api.get('/services/service-requests/');
    return response.data;
  },

  /**
   * Get service request details by ID
   * @param requestId - Service request ID
   */
  getServiceRequestById: async (requestId: number): Promise<ServiceRequest> => {
    const response = await api.get(`/services/service-requests/${requestId}/`);
    return response.data;
  },

  /**
   * Update service request
   * @param requestId - Service request ID
   * @param updateData - Updated data
   */
  updateServiceRequest: async (
    requestId: number,
    updateData: Partial<ServiceRequest>
  ): Promise<ServiceRequest> => {
    const response = await api.patch(`/services/service-requests/${requestId}/`, updateData);
    return response.data;
  },

  /**
   * Delete service request
   * @param requestId - Service request ID
   */
  deleteServiceRequest: async (requestId: number): Promise<void> => {
    await api.delete(`/services/service-requests/${requestId}/`);
  },

  /**
   * Get service requests by status
   * @param status - Service request status
   */
  getServiceRequestsByStatus: async (status: ServiceRequestStatus): Promise<ServiceRequest[]> => {
    const allRequests = await serviceRequestsService.getServiceRequests();
    return allRequests.filter(request => request.status === status);
  },

  /**
   * Get emergency service requests
   */
  getEmergencyRequests: async (): Promise<ServiceRequest[]> => {
    const allRequests = await serviceRequestsService.getServiceRequests();
    return allRequests.filter(request => request.is_emergency);
  },

  /**
   * Assign serviceman to service request (Admin only)
   * @param requestId - Service request ID
   * @param servicemanId - Serviceman user ID
   * @param backupServicemanId - Optional backup serviceman ID
   * @param notes - Optional assignment notes
   */
  assignServiceman: async (
    requestId: number, 
    servicemanId: number, 
    backupServicemanId?: number, 
    notes?: string
  ): Promise<ServiceRequest> => {
    const response = await api.post(`/services/service-requests/${requestId}/assign/`, {
      serviceman_id: servicemanId,
      backup_serviceman_id: backupServicemanId,
      notes: notes
    });
    return response.data.service_request;
  },

  /**
   * Provide cost estimate (Serviceman only)
   * @param requestId - Service request ID
   * @param estimatedCost - Estimated cost amount
   */
  provideCostEstimate: async (requestId: number, estimatedCost: number): Promise<ServiceRequest> => {
    const response = await api.patch(`/services/service-requests/${requestId}/`, {
      serviceman_estimated_cost: estimatedCost.toString(),
      status: 'AWAITING_CLIENT_APPROVAL'
    });
    return response.data;
  },

  /**
   * Start service (Serviceman only)
   * @param requestId - Service request ID
   */
  startService: async (requestId: number): Promise<ServiceRequest> => {
    const response = await api.patch(`/services/service-requests/${requestId}/`, {
      status: 'IN_PROGRESS'
    });
    return response.data;
  },

  /**
   * Mark service as completed (Serviceman only)
   * @param requestId - Service request ID
   * @param finalCost - Final cost amount
   */
  markAsCompleted: async (requestId: number, finalCost?: number): Promise<ServiceRequest> => {
    const updateData: any = {
      status: 'COMPLETED'
    };
    
    if (finalCost) {
      updateData.final_cost = finalCost.toString();
    }
    
    const response = await api.patch(`/services/service-requests/${requestId}/`, updateData);
    return response.data;
  },

  /**
   * Cancel service request
   * @param requestId - Service request ID
   * @param reason - Cancellation reason
   */
  cancelServiceRequest: async (requestId: number, reason?: string): Promise<ServiceRequest> => {
    const response = await api.patch(`/services/service-requests/${requestId}/`, {
      status: 'CANCELLED',
      cancellation_reason: reason
    });
    return response.data;
  },

  /**
   * Get available servicemen for assignment (Admin only)
   * @param categoryId - Optional category filter
   */
  getAvailableServicemenForAssignment: async (categoryId?: number): Promise<any[]> => {
    const params = new URLSearchParams();
    params.append('is_available', 'true');
    if (categoryId) {
      params.append('category', categoryId.toString());
    }
    
    const response = await api.get(`/users/servicemen/?${params.toString()}`);
    return response.data.results || [];
  },

  // ============================================
  // NEW PROFESSIONAL WORKFLOW ENDPOINTS
  // Based on API Documentation v1.0
  // ============================================

  /**
   * STEP 3: Serviceman submits cost estimate
   * Required status: PENDING_ESTIMATION
   * API Endpoint: POST /api/services/service-requests/{id}/submit-estimate/
   * 
   * @param requestId - Service request ID
   * @param estimatedPrice - Estimated price amount (API expects "estimated_price")
   * @param estimatedCompletionDays - Estimated completion time in days (API expects "estimated_completion_days")
   * @param notes - Optional estimation notes
   * 
   * API Request Body (per docs v2.0):
   * {
   *   "estimated_price": 350.00,
   *   "estimated_completion_days": 1,
   *   "notes": "Need to replace valve and reseal connections. Materials included."
   * }
   */
  submitEstimate: async (
    requestId: number,
    estimatedPrice: number,
    estimatedCompletionDays?: number,
    notes?: string
  ): Promise<{ message: string; service_request: ServiceRequest }> => {
    const response = await api.post(
      `/services/service-requests/${requestId}/submit-estimate/`,
      {
        estimated_price: estimatedPrice,  // ✅ Fixed: was "estimated_cost", should be "estimated_price"
        estimated_completion_days: estimatedCompletionDays || 1,  // ✅ Added missing field
        notes: notes || ''
      }
    );
    return response.data;
  },

  /**
   * STEP 4: Admin finalizes price
   * Required status: ESTIMATION_SUBMITTED
   * API Endpoint: POST /api/services/service-requests/{id}/finalize-price/
   * 
   * @param requestId - Service request ID
   * @param finalPrice - Final price amount (API expects "final_price", not calculated)
   * @param adminNotes - Optional admin notes
   * 
   * API Request Body (per docs v2.0):
   * {
   *   "final_price": 300.00,  // ⚠️ Direct price, not markup percentage
   *   "admin_notes": "Negotiated price. Materials confirmed available."
   * }
   * 
   * ⚠️ DISCREPANCY: Frontend was sending "markup_percentage", but API expects "final_price" directly
   */
  finalizePrice: async (
    requestId: number,
    finalPrice: number,  // ✅ Changed from markupPercentage
    adminNotes?: string
  ): Promise<{
    message: string;
    service_request: ServiceRequest;
  }> => {
    const response = await api.post(
      `/services/service-requests/${requestId}/finalize-price/`,
      {
        final_price: finalPrice,  // ✅ Fixed: was "markup_percentage", should be "final_price"
        admin_notes: adminNotes || ''
      }
    );
    return response.data;
  },

  /**
   * STEP 6: Admin authorizes serviceman to begin work
   * Required status: PAYMENT_COMPLETED
   * API Endpoint: POST /api/services/service-requests/{id}/authorize-work/
   * 
   * @param requestId - Service request ID
   * @param adminNotes - Optional admin notes (API expects "admin_notes", not "instructions")
   * 
   * API Request Body (per docs v2.0):
   * {
   *   "admin_notes": "Payment verified. Serviceman authorized to proceed."
   * }
   */
  authorizeWork: async (
    requestId: number,
    adminNotes?: string  // ✅ Changed parameter name for clarity
  ): Promise<{ message: string; service_request: ServiceRequest }> => {
    const response = await api.post(
      `/services/service-requests/${requestId}/authorize-work/`,
      {
        admin_notes: adminNotes || ''  // ✅ Fixed: was "instructions", should be "admin_notes"
      }
    );
    return response.data;
  },

  /**
   * STEP 7: Serviceman marks job as complete
   * Required status: IN_PROGRESS
   * API Endpoint: POST /api/services/service-requests/{id}/complete-job/
   * 
   * @param requestId - Service request ID
   * @param completionNotes - Completion notes
   * @param completionImages - Optional array of base64-encoded images
   * 
   * API Request Body (per docs v2.0):
   * {
   *   "completion_notes": "Replaced faulty valve, resealed all connections...",
   *   "completion_images": ["base64_image_1", "base64_image_2"]  // Optional
   * }
   */
  completeJob: async (
    requestId: number,
    completionNotes?: string,
    completionImages?: string[]  // ✅ Added missing field
  ): Promise<{ message: string; service_request: ServiceRequest }> => {
    const response = await api.post(
      `/services/service-requests/${requestId}/complete-job/`,
      {
        completion_notes: completionNotes || '',
        completion_images: completionImages || []  // ✅ Added support for images
      }
    );
    return response.data;
  },

  /**
   * STEP 8: Admin confirms completion
   * Required status: COMPLETED
   * API Endpoint: POST /api/services/service-requests/{id}/confirm-completion/
   * 
   * @param requestId - Service request ID
   * @param adminNotes - Admin notes (API expects "admin_notes", not "message_to_client")
   * 
   * API Request Body (per docs v2.0):
   * {
   *   "admin_notes": "Verified completion with client. Quality confirmed."
   * }
   * 
   * ⚠️ DISCREPANCY: Frontend was sending "message_to_client", but API expects "admin_notes"
   */
  confirmCompletion: async (
    requestId: number,
    adminNotes?: string  // ✅ Changed parameter name
  ): Promise<{ message: string; service_request: ServiceRequest }> => {
    const response = await api.post(
      `/services/service-requests/${requestId}/confirm-completion/`,
      {
        admin_notes: adminNotes || ''  // ✅ Fixed: was "message_to_client", should be "admin_notes"
      }
    );
    return response.data;
  },

  /**
   * STEP 9: Client submits review and rating
   * Required status: COMPLETED
   * @param requestId - Service request ID
   * @param rating - Rating (1-5 stars)
   * @param review - Optional review text
   */
  submitReview: async (
    requestId: number,
    rating: number,
    review?: string
  ): Promise<{ message: string; service_request: ServiceRequest; rating: number }> => {
    const response = await api.post(
      `/services/service-requests/${requestId}/submit-review/`,
      {
        rating,
        review: review || ''
      }
    );
    return response.data;
  },
};

export default serviceRequestsService;
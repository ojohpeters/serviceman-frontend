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
};

export default serviceRequestsService;
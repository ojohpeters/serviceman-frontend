// ============================================
// Admin Service
// Handles all admin-related API operations
// ============================================

import api from './api';
import {
  CreateAdminData,
  PendingServicemenResponse,
  ApproveServicemanData,
  ApproveServicemanResponse,
  RejectServicemanData,
  RejectServicemanResponse,
  AssignCategoryData,
  AssignCategoryResponse,
  BulkAssignCategoryData,
  BulkAssignCategoryResponse,
  ServicemenByCategoryResponse,
  User
} from '../types/api';

export const adminService = {
  /**
   * Create new admin user (Admin only)
   * @param adminData - Admin user data
   */
  createAdmin: async (adminData: CreateAdminData): Promise<User> => {
    const response = await api.post('/users/admin/create/', adminData);
    return response.data;
  },

  /**
   * Get pending serviceman applications (Admin only)
   */
  getPendingServicemen: async (): Promise<PendingServicemenResponse> => {
    const response = await api.get('/users/admin/pending-servicemen/');
    return response.data;
  },

  /**
   * Approve serviceman application (Admin only)
   * @param data - Approval data including serviceman ID, optional category, and notes
   */
  approveServiceman: async (data: ApproveServicemanData): Promise<ApproveServicemanResponse> => {
    const response = await api.post('/users/admin/approve-serviceman/', data);
    return response.data;
  },

  /**
   * Reject serviceman application (Admin only)
   * @param data - Rejection data including serviceman ID and reason
   */
  rejectServiceman: async (data: RejectServicemanData): Promise<RejectServicemanResponse> => {
    const response = await api.post('/users/admin/reject-serviceman/', data);
    return response.data;
  },

  /**
   * Assign category to serviceman (Admin only)
   * @param data - Assignment data including serviceman ID and category ID
   */
  assignCategory: async (data: AssignCategoryData): Promise<AssignCategoryResponse> => {
    const response = await api.post('/users/admin/assign-category/', data);
    return response.data;
  },

  /**
   * Bulk assign category to multiple servicemen (Admin only)
   * @param data - Bulk assignment data including serviceman IDs and category ID
   */
  bulkAssignCategory: async (data: BulkAssignCategoryData): Promise<BulkAssignCategoryResponse> => {
    const response = await api.post('/users/admin/bulk-assign-category/', data);
    return response.data;
  },

  /**
   * Get servicemen grouped by category (Admin only)
   */
  getServicemenByCategory: async (): Promise<ServicemenByCategoryResponse> => {
    const response = await api.get('/users/admin/servicemen-by-category/');
    return response.data;
  },

  /**
   * Assign serviceman to service request (Admin only)
   * @param data - Assignment data including service request ID and serviceman ID
   */
  assignServicemanToRequest: async (data: { service_request_id: number; serviceman_id: number }): Promise<any> => {
    const response = await api.post('/users/admin/assign-serviceman-to-request/', data);
    return response.data;
  },
};

export default adminService;


// ============================================
// User Profile Service
// Handles all user profile-related API operations
// ============================================

import api from './api';
import {
  User,
  ClientProfile,
  ServicemanProfile,
  UpdateClientProfileData,
  UpdateServicemanProfileData,
  ServicemenListResponse,
  ServicemenFilters
} from '../types/api';

// Re-export types for convenience
export type { User, ClientProfile, ServicemanProfile, UpdateClientProfileData, UpdateServicemanProfileData };

export const userProfileService = {
  // ==================== Current User ====================

  /**
   * Get current authenticated user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  /**
   * Get user by ID
   * @param userId - User ID
   */
  getUserById: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}/`);
    return response.data;
  },

  // ==================== Client Profile ====================

  /**
   * Get current client's profile
   */
  getClientProfile: async (): Promise<ClientProfile> => {
    const response = await api.get('/users/client-profile/');
    return response.data;
  },

  /**
   * Get client profile by ID (Admin or self)
   * @param clientId - Client user ID
   */
  getClientProfileById: async (clientId: number): Promise<ClientProfile> => {
    const response = await api.get(`/users/clients/${clientId}/`);
    return response.data;
  },

  /**
   * Update current client's profile
   * @param data - Updated profile data
   */
  updateClientProfile: async (data: UpdateClientProfileData): Promise<ClientProfile> => {
    const response = await api.patch('/users/client-profile/', data);
    return response.data;
  },

  // ==================== Serviceman Profile ====================

  /**
   * Get current serviceman's profile
   */
  getServicemanProfile: async (): Promise<ServicemanProfile> => {
    const response = await api.get('/users/serviceman-profile/');
    return response.data;
  },

  /**
   * Update current serviceman's profile
   * @param data - Updated profile data
   */
  updateServicemanProfile: async (data: UpdateServicemanProfileData): Promise<ServicemanProfile> => {
    const response = await api.patch('/users/serviceman-profile/', data);
    return response.data;
  },

  /**
   * Get public serviceman profile by ID
   * @param servicemanId - Serviceman user ID
   */
  getPublicServicemanProfile: async (servicemanId: number): Promise<ServicemanProfile> => {
    const response = await api.get(`/users/servicemen/${servicemanId}/`);
    return response.data;
  },

  // ==================== Servicemen Listing ====================

  /**
   * Get all servicemen with filtering and statistics
   * @param filters - Optional filters for servicemen list
   */
  getAllServicemen: async (filters?: ServicemenFilters): Promise<ServicemenListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.category) params.append('category', filters.category.toString());
      if (filters.is_available !== undefined) params.append('is_available', filters.is_available.toString());
      if (filters.min_rating) params.append('min_rating', filters.min_rating.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.ordering) params.append('ordering', filters.ordering);
      if (filters.show_all) params.append('show_all', filters.show_all.toString());
    }
    
    const url = `/users/servicemen/${params.toString() ? '?' + params.toString() : ''}`;
    console.log('📡 [API] GET', url);
    const response = await api.get(url);
    console.log('📦 [API] Response from /users/servicemen/:', response.data);
    return response.data;
  },

  /**
   * Get available servicemen only
   */
  getAvailableServicemen: async (): Promise<ServicemenListResponse> => {
    return userProfileService.getAllServicemen({ is_available: true });
  },

  /**
   * Get top rated servicemen
   * @param minRating - Minimum rating (default: 4.0)
   */
  getTopRatedServicemen: async (minRating: number = 4.0): Promise<ServicemenListResponse> => {
    return userProfileService.getAllServicemen({ 
      min_rating: minRating,
      ordering: '-rating'
    });
  },
};

export default userProfileService;
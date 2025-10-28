// ============================================
// Ratings Service
// Handles all rating and review-related API operations
// ============================================

import api from './api';
import {
  Rating,
  CreateRatingData,
  RevenueAnalytics,
  TopServiceman,
  TopCategory
} from '../types/api';

export const ratingsService = {
  /**
   * Create a rating for a service request
   * @param ratingData - Rating data including service request, rating, and review
   */
  createRating: async (ratingData: CreateRatingData): Promise<Rating> => {
    const response = await api.post('/ratings/create/', ratingData);
    return response.data;
  },

  /**
   * List all ratings
   * @param servicemanId - Optional filter by serviceman ID
   */
  getRatings: async (servicemanId?: number): Promise<Rating[]> => {
    const url = servicemanId 
      ? `/ratings/?serviceman_id=${servicemanId}`
      : '/ratings/';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get rating by ID
   * @param ratingId - Rating ID
   */
  getRatingById: async (ratingId: number): Promise<Rating> => {
    const response = await api.get(`/ratings/${ratingId}/`);
    return response.data;
  },

  /**
   * Get ratings for a specific serviceman
   * @param servicemanId - Serviceman user ID
   */
  getServicemanRatings: async (servicemanId: number): Promise<Rating[]> => {
    return ratingsService.getRatings(servicemanId);
  },

  // ==================== Analytics (Admin only) ====================

  /**
   * Get revenue analytics (Admin only)
   * @returns Total revenue and this month's revenue
   */
  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    const response = await api.get('/ratings/analytics/revenue/');
    return response.data;
  },

  /**
   * Get top servicemen by rating and jobs completed (Admin only)
   * @returns List of top servicemen
   */
  getTopServicemen: async (): Promise<TopServiceman[]> => {
    const response = await api.get('/ratings/analytics/servicemen/');
    return response.data;
  },

  /**
   * Get top categories by request count (Admin only)
   * @returns List of top categories
   */
  getTopCategories: async (): Promise<TopCategory[]> => {
    const response = await api.get('/ratings/analytics/categories/');
    return response.data;
  },
};

export default ratingsService;


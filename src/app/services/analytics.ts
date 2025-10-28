// ============================================
// Analytics Service
// Handles all analytics-related API operations (Admin only)
// This is a convenience wrapper around ratings analytics endpoints
// ============================================

import api from './api';
import {
  RevenueAnalytics,
  TopServiceman,
  TopCategory
} from '../types/api';

export const analyticsService = {
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

  /**
   * Get all analytics data at once (Admin only)
   * @returns Combined analytics data
   */
  getAllAnalytics: async (): Promise<{
    revenue: RevenueAnalytics;
    topServicemen: TopServiceman[];
    topCategories: TopCategory[];
  }> => {
    const [revenue, topServicemen, topCategories] = await Promise.all([
      analyticsService.getRevenueAnalytics(),
      analyticsService.getTopServicemen(),
      analyticsService.getTopCategories(),
    ]);

    return {
      revenue,
      topServicemen,
      topCategories,
    };
  },
};

export default analyticsService;


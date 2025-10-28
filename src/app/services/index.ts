// ============================================
// ServiceMan Platform - Main API Export
// Version: 2.0.0
// Complete API client for all 50+ endpoints
// ============================================

// Export API instance
export { default as api } from './api';

// Export all service modules
export * from './auth';
export * from './userProfile';
export * from './categories';
export * from './serviceRequests';
export * from './skills';
export * from './admin';
export * from './payments';
export * from './ratings';
export * from './negotiations';
export * from './notifications';
export * from './analytics';
export * from './servicemanJobHistory';

// Export individual services
export { authService } from './auth';
export { userProfileService } from './userProfile';
export { categoriesService } from './categories';
export { serviceRequestsService } from './serviceRequests';
export { skillsService } from './skills';
export { adminService } from './admin';
export { paymentsService } from './payments';
export { ratingsService } from './ratings';
export { negotiationsService } from './negotiations';
export { notificationsService } from './notifications';
export { analyticsService } from './analytics';
export { servicemanJobHistoryService } from './servicemanJobHistory';

// Export all types
export * from '../types/api';

// ============================================
// Unified API Client - All methods in one object
// ============================================

import { authService } from './auth';
import { userProfileService } from './userProfile';
import { categoriesService } from './categories';
import { serviceRequestsService } from './serviceRequests';
import { skillsService } from './skills';
import { adminService } from './admin';
import { paymentsService } from './payments';
import { ratingsService } from './ratings';
import { negotiationsService } from './negotiations';
import { notificationsService } from './notifications';
import { analyticsService } from './analytics';
import { servicemanJobHistoryService } from './servicemanJobHistory';

/**
 * Unified API client with all methods organized by domain
 * Usage: import { API } from '@/app/services';
 *        API.auth.login(...)
 *        API.users.getCurrentUser(...)
 */
export const API = {
  // Authentication
  auth: authService,
  
  // Users & Profiles
  users: userProfileService,
  
  // Categories
  categories: categoriesService,
  
  // Service Requests
  serviceRequests: serviceRequestsService,
  
  // Skills
  skills: skillsService,
  
  // Admin Operations
  admin: adminService,
  
  // Payments
  payments: paymentsService,
  
  // Ratings & Reviews
  ratings: ratingsService,
  
  // Negotiations
  negotiations: negotiationsService,
  
  // Notifications
  notifications: notificationsService,
  
  // Analytics
  analytics: analyticsService,
  
  // Serviceman Job History
  servicemanJobHistory: servicemanJobHistoryService,
};

export default API;

// ============================================
// Quick Access Helpers
// ============================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return authService.isAuthenticated();
};

/**
 * Get stored tokens
 */
export const getTokens = () => {
  return authService.getTokens();
};

/**
 * Logout and clear tokens
 */
export const logout = (): void => {
  authService.logout();
};

/**
 * Complete payment flow - initialize and redirect
 */
export const completePaymentFlow = paymentsService.completePaymentFlow;


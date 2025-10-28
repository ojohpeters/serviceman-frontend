// ============================================
// Comprehensive React Hooks for ServiceMan API
// Version: 2.0.0
// Custom hooks for common API operations
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  ServicemanProfile,
  ServicemenFilters,
  ServicemenListResponse,
  Notification,
  ServiceRequest,
  Category,
  Skill,
  Rating,
  PriceNegotiation,
  Payment,
  ServiceRequestStatus
} from '../types/api';
import { API } from '../services';
import { isServerDown, getServerDownUntil } from '../services/api';

// ==================== Servicemen Hooks ====================

/**
 * Hook to fetch and manage servicemen list with filters
 * @param filters - Optional filters for servicemen
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useServicemen(filters?: ServicemenFilters, autoFetch: boolean = true) {
  const [data, setData] = useState<ServicemenListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServicemen = useCallback(async (customFilters?: ServicemenFilters) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [useServicemen] Fetching servicemen with filters:', customFilters || filters);
      const response = await API.users.getAllServicemen(customFilters || filters);
      console.log('✅ [useServicemen] Received response:', {
        count: response.results?.length || 0,
        total: response.statistics?.total_servicemen || 0,
        available: response.statistics?.available || 0,
        busy: response.statistics?.busy || 0,
      });
      setData(response);
      return response;
    } catch (err: any) {
      console.error('❌ [useServicemen] Error fetching servicemen:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to fetch servicemen';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchServicemen();
    }
  }, [autoFetch, fetchServicemen]);

  return {
    servicemen: data?.results || [],
    statistics: data?.statistics || null,
    loading,
    error,
    refetch: fetchServicemen,
  };
}

/**
 * Hook to fetch single serviceman profile
 * @param servicemanId - Serviceman user ID
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useServicemanProfile(servicemanId: number | null, autoFetch: boolean = true) {
  const [profile, setProfile] = useState<ServicemanProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!servicemanId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await API.users.getPublicServicemanProfile(servicemanId);
      setProfile(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch serviceman profile';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [servicemanId]);

  useEffect(() => {
    if (autoFetch && servicemanId) {
      fetchProfile();
    }
  }, [autoFetch, servicemanId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}

// ==================== Notifications Hooks ====================

/**
 * Hook to manage notifications with auto-refresh
 * @param refreshInterval - Auto-refresh interval in ms (default: 30000 = 30 seconds)
 */
export function useNotifications(refreshInterval: number = 30000, filters?: {
  is_read?: boolean;
  notification_type?: string;
  limit?: number;
  offset?: number;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  }>({ count: 0, next: null, previous: null });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (customFilters?: typeof filters) => {
    // Skip polling while server is down
    if (isServerDown()) {
      setError('Server is currently unavailable. Please try again later.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [notifsArray, count] = await Promise.all([
        API.notifications.getNotifications(customFilters || filters),
        API.notifications.getUnreadCount(),
      ]);

      setNotifications(notifsArray);
      setPagination({ count: notifsArray.length, next: null, previous: null });
      setUnreadCount(count);
    } catch (err: any) {
      // Handle server down errors gracefully
      if (err.message?.includes('Server appears to be down') || err.message?.includes('server may be unavailable')) {
        setError('Server is currently unavailable. Please try again later.');
        // Don't throw the error to prevent unhandled promise rejections
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      const errorMsg = err.response?.data?.detail || 'Failed to fetch notifications';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await API.notifications.markAsRead(notificationId);
      await loadNotifications();
    } catch (err: any) {
      // Handle server down errors gracefully
      if (err.message?.includes('Server appears to be down') || err.message?.includes('server may be unavailable')) {
        setError('Server is currently unavailable. Please try again later.');
        return;
      }
      
      const errorMsg = err.response?.data?.detail || 'Failed to mark notification as read';
      setError(errorMsg);
    }
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await API.notifications.markAllAsRead();
      await loadNotifications();
    } catch (err: any) {
      // Handle server down errors gracefully
      if (err.message?.includes('Server appears to be down') || err.message?.includes('server may be unavailable')) {
        setError('Server is currently unavailable. Please try again later.');
        return;
      }
      
      const errorMsg = err.response?.data?.detail || 'Failed to mark all notifications as read';
      setError(errorMsg);
    }
  }, [loadNotifications]);

  useEffect(() => {
    let interval: any;
    const start = async () => {
      await loadNotifications();
      interval = setInterval(() => {
        if (!isServerDown()) {
          loadNotifications();
        }
      }, refreshInterval);
    };
    start();
    return () => interval && clearInterval(interval);
  }, [loadNotifications, refreshInterval]);

  return {
    notifications,
    pagination,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllRead,
    reload: loadNotifications,
  };
}

// ==================== Service Requests Hooks ====================

/**
 * Hook to manage service requests
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useServiceRequests(autoFetch: boolean = true, _filters?: {
  status?: ServiceRequestStatus;
  category?: number;
  is_emergency?: boolean;
  limit?: number;
  offset?: number;
}) {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  }>({ count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceRequests = useCallback(async () => {
    if (isServerDown()) {
      setError('Server is currently unavailable. Please try again later.');
      setLoading(false);
      return [] as ServiceRequest[];
    }
    setLoading(true);
    setError(null);
    try {
      const list = await API.serviceRequests.getServiceRequests();
      setServiceRequests(list);
      setPagination({ count: list.length, next: null, previous: null });
      return list;
    } catch (err: any) {
      // Handle server down errors gracefully
      if (err.message?.includes('Server appears to be down') || err.message?.includes('server may be unavailable')) {
        setError('Server is currently unavailable. Please try again later.');
        // Don't throw the error to prevent unhandled promise rejections
        return [] as ServiceRequest[];
      }
      
      const errorMsg = err.response?.data?.detail || 'Failed to fetch service requests';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createServiceRequest = useCallback(async (requestData: any) => {
    setLoading(true);
    setError(null);
    try {
      const newRequest = await API.serviceRequests.createServiceRequest(requestData);
      setServiceRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to create service request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRequestById = useCallback(async (requestId: number) => {
    setLoading(true);
    setError(null);
    try {
      const request = await API.serviceRequests.getServiceRequestById(requestId);
      return request;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch service request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchServiceRequests();
    }
  }, [autoFetch, fetchServiceRequests]);

  return {
    serviceRequests,
    pagination,
    loading,
    error,
    createServiceRequest,
    fetchServiceRequests,
    getRequestById,
    refetch: fetchServiceRequests,
  };
}

// ==================== Serviceman Job History Hooks ====================

/**
 * Hook to manage serviceman job history and statistics
 * @param autoFetch - Auto fetch on mount (default: true)
 * @param filters - Optional filters (status, year, month, limit)
 */
export function useServicemanJobHistory(autoFetch: boolean = true, filters?: {
  status?: string;
  year?: number;
  month?: number;
  limit?: number;
}) {
  const [jobHistory, setJobHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobHistory = useCallback(async (customFilters?: typeof filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.servicemanJobHistory.getJobHistory(customFilters || filters);
      setJobHistory(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch job history';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchJobHistory();
    }
  }, [autoFetch, fetchJobHistory]);

  return {
    jobHistory,
    loading,
    error,
    fetchJobHistory,
    refetch: fetchJobHistory,
  };
}

// ==================== Categories Hooks ====================

/**
 * Hook to fetch and manage categories
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useCategories(autoFetch: boolean = true) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.categories.getCategories();
      setCategories(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch categories';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

/**
 * Hook to fetch servicemen in a category
 * @param categoryId - Category ID
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useCategoryServicemen(categoryId: number | null, autoFetch: boolean = true) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServicemen = useCallback(async () => {
    if (!categoryId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await API.categories.getServicemenByCategory(categoryId);
      setData(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch category servicemen';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (autoFetch && categoryId) {
      fetchServicemen();
    }
  }, [autoFetch, categoryId, fetchServicemen]);

  return {
    servicemen: data?.servicemen || [],
    statistics: data ? {
      total: data.total_servicemen,
      available: data.available_servicemen,
      busy: data.busy_servicemen,
    } : null,
    availabilityMessage: data?.availability_message || null,
    loading,
    error,
    refetch: fetchServicemen,
  };
}

// ==================== Skills Hooks ====================

/**
 * Hook to fetch and manage skills
 * @param category - Optional skill category filter
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useSkills(category?: string, autoFetch: boolean = true) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.skills.getSkills(category as any);
      setSkills(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch skills';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (autoFetch) {
      fetchSkills();
    }
  }, [autoFetch, fetchSkills]);

  return {
    skills,
    loading,
    error,
    refetch: fetchSkills,
  };
}

// ==================== Ratings Hooks ====================

/**
 * Hook to fetch ratings
 * @param servicemanId - Optional serviceman ID filter
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useRatings(servicemanId?: number, autoFetch: boolean = true) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.ratings.getRatings(servicemanId);
      setRatings(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch ratings';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [servicemanId]);

  useEffect(() => {
    if (autoFetch) {
      fetchRatings();
    }
  }, [autoFetch, fetchRatings]);

  return {
    ratings,
    loading,
    error,
    refetch: fetchRatings,
  };
}

// ==================== Negotiations Hooks ====================

/**
 * Hook to manage negotiations for a service request
 * @param requestId - Service request ID
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useNegotiations(requestId: number | null, autoFetch: boolean = true) {
  const [negotiations, setNegotiations] = useState<PriceNegotiation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNegotiations = useCallback(async () => {
    if (!requestId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await API.negotiations.getNegotiations(requestId);
      setNegotiations(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch negotiations';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const createNegotiation = useCallback(async (proposedAmount: number, message: string) => {
    if (!requestId) return;
    
    setLoading(true);
    setError(null);
    try {
      const newNegotiation = await API.negotiations.createNegotiation({
        service_request: requestId,
        proposed_amount: proposedAmount,
        message,
      });
      await fetchNegotiations();
      return newNegotiation;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to create negotiation';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requestId, fetchNegotiations]);

  const acceptNegotiation = useCallback(async (negotiationId: number) => {
    setLoading(true);
    setError(null);
    try {
      await API.negotiations.acceptNegotiation(negotiationId);
      await fetchNegotiations();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to accept negotiation';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNegotiations]);

  const counterNegotiation = useCallback(async (negotiationId: number, proposedAmount: number, message: string) => {
    setLoading(true);
    setError(null);
    try {
      await API.negotiations.counterNegotiation(negotiationId, {
        proposed_amount: proposedAmount,
        message,
      });
      await fetchNegotiations();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to counter negotiation';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNegotiations]);

  useEffect(() => {
    if (autoFetch && requestId) {
      fetchNegotiations();
    }
  }, [autoFetch, requestId, fetchNegotiations]);

  return {
    negotiations,
    loading,
    error,
    createNegotiation,
    acceptNegotiation,
    counterNegotiation,
    refetch: fetchNegotiations,
  };
}

// ==================== Admin Hooks ====================

/**
 * Hook to fetch pending serviceman applications (Admin only)
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function usePendingServicemen(autoFetch: boolean = true) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.admin.getPendingServicemen();
      setData(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch pending applications';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveServiceman = useCallback(async (servicemanId: number, categoryId?: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await API.admin.approveServiceman({ serviceman_id: servicemanId, category_id: categoryId, notes });
      await fetchPending();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to approve serviceman';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPending]);

  const rejectServiceman = useCallback(async (servicemanId: number, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      await API.admin.rejectServiceman({ serviceman_id: servicemanId, rejection_reason: reason });
      await fetchPending();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to reject serviceman';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPending]);

  useEffect(() => {
    if (autoFetch) {
      fetchPending();
    }
  }, [autoFetch, fetchPending]);

  return {
    pendingApplications: data?.pending_applications || [],
    totalPending: data?.total_pending || 0,
    loading,
    error,
    approveServiceman,
    rejectServiceman,
    refetch: fetchPending,
  };
}

// ==================== Analytics Hooks ====================

/**
 * Hook to fetch all analytics data (Admin only)
 * @param autoFetch - Auto fetch on mount (default: true)
 */
export function useAnalytics(autoFetch: boolean = true) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await API.analytics.getAllAnalytics();
      setData(analytics);
      return analytics;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch analytics';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics();
    }
  }, [autoFetch, fetchAnalytics]);

  return {
    revenue: data?.revenue || null,
    topServicemen: data?.topServicemen || [],
    topCategories: data?.topCategories || [],
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

// ==================== Payment Hook ====================

/**
 * Hook to manage payment flow
 */
export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = useCallback(async (serviceRequestId: number, paymentType: 'INITIAL_BOOKING_FEE' | 'FINAL_PAYMENT', amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.payments.initializePayment({
        service_request: serviceRequestId,
        payment_type: paymentType,
        amount,
      });
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to initialize payment';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPayment = useCallback(async (reference: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.payments.verifyPayment(reference);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to verify payment';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    initializePayment,
    verifyPayment,
  };
}


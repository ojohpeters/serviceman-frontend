// ============================================
// Notifications Service
// Handles all notification-related API operations
// ============================================

import api from './api';
import {
  Notification,
  SendNotificationData,
  UnreadCountResponse
} from '../types/api';

export const notificationsService = {
  /**
   * Get all notifications for the current user with pagination and filtering
   * @param filters - Optional filters (is_read, notification_type, limit, offset)
   */
  getNotifications: async (filters?: {
    is_read?: boolean;
    notification_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = params.toString() ? `/notifications/?${params.toString()}` : '/notifications/';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get notification by ID
   * @param notificationId - Notification ID
   */
  getNotificationById: async (notificationId: number): Promise<Notification> => {
    const response = await api.get(`/notifications/${notificationId}/`);
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count/');
    return response.data.unread_count;
  },

  /**
   * Mark notification as read
   * @param notificationId - Notification ID
   */
  markAsRead: async (notificationId: number): Promise<{ detail: string }> => {
    const response = await api.post(`/notifications/${notificationId}/read/`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ detail: string; updated_count: number }> => {
    const response = await api.post('/notifications/mark-all-read/');
    return response.data;
  },

  /**
   * Send notification (Admin only)
   * @param notificationData - Notification data including user ID, title, and message
   */
  sendNotification: async (notificationData: SendNotificationData): Promise<{
    detail: string;
    notification: Notification;
    email_queued: boolean;
    recipient: any;
  }> => {
    const response = await api.post('/notifications/send/', notificationData);
    return response.data;
  },

  /**
   * Get unread notifications only
   */
  getUnreadNotifications: async (limit?: number): Promise<Notification[]> => {
    const response = await notificationsService.getNotifications({ 
      is_read: false,
      limit: limit || 50
    });
    return response.results;
  },

  /**
   * Get read notifications only
   */
  getReadNotifications: async (limit?: number): Promise<Notification[]> => {
    const response = await notificationsService.getNotifications({ 
      is_read: true,
      limit: limit || 50
    });
    return response.results;
  },
};

export default notificationsService;


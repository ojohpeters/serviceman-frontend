'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Notification } from '../types/api';
import { API } from '../services';
import { isServerDown } from '../services/api';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reload: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  refreshInterval?: number; // Default: 60 seconds (reduced from 30)
  autoFetch?: boolean;
}

export function NotificationProvider({ 
  children, 
  refreshInterval = 60000, // 60 seconds - much less aggressive
  autoFetch = true 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    // Skip polling while server is down
    if (isServerDown()) {
      setError('Server is currently unavailable. Please try again later.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Only fetch unread count - much lighter than full notifications
      const count = await API.notifications.getUnreadCount();
      setUnreadCount(count);
      
      // Optionally fetch recent notifications (limit to 5 for sidebar)
      const notifsArray = await API.notifications.getNotifications({ limit: 5 });
      setNotifications(notifsArray);
    } catch (err: any) {
      // Handle server down errors gracefully
      if (err.message?.includes('Server appears to be down') || err.message?.includes('server may be unavailable')) {
        setError('Server is currently unavailable.');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      const errorMsg = err.response?.data?.detail || 'Failed to fetch notifications';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await API.notifications.markAsRead(notificationId);
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Reload in background
      setTimeout(loadNotifications, 1000);
    } catch (err: any) {
      if (err.message?.includes('Server appears to be down') || err.message?.includes('server may be unavailable')) {
        setError('Server is currently unavailable.');
        return;
      }
      
      const errorMsg = err.response?.data?.detail || 'Failed to mark notification as read';
      setError(errorMsg);
    }
  }, [loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await API.notifications.markAllAsRead();
      // Optimistically update UI
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      // Reload in background
      setTimeout(loadNotifications, 1000);
    } catch (err: any) {
      if (err.message?.includes('Server appears to be down') || err.message?.includes('server may be unavailable')) {
        setError('Server is currently unavailable.');
        return;
      }
      
      const errorMsg = err.response?.data?.detail || 'Failed to mark all notifications as read';
      setError(errorMsg);
    }
  }, [loadNotifications]);

  useEffect(() => {
    if (!autoFetch) return;

    let interval: NodeJS.Timeout;

    const start = async () => {
      await loadNotifications();
      
      // Start interval polling
      interval = setInterval(() => {
        if (!isServerDown()) {
          loadNotifications();
        }
      }, refreshInterval);
    };

    start();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadNotifications, refreshInterval, autoFetch]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    reload: loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}


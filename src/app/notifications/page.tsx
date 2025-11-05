'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import Nav from '../components/common/Nav';
import SecondFooter from '../components/common/SecondFooter';
import ProtectedRoute from '../components/ProtectedRoute';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { user: userData } = useUser();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    markAllRead 
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    // Handle undefined/null notifications
    if (!notifications || !Array.isArray(notifications)) {
      return [];
    }

    return notifications.filter(notification => {
      switch (filter) {
        case 'unread':
          return !notification.is_read;
        case 'read':
          return notification.is_read;
        default:
          return true;
      }
    });
  }, [notifications, filter]);

  // Get user's dashboard URL based on role
  const getDashboardUrl = () => {
    if (!user) return '/dashboard/client';
    switch (user.user_type) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'SERVICEMAN':
        return '/dashboard/worker';
      default:
        return '/dashboard/client';
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-vh-100 bg-light">
        {/* Fixed Nav */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "white",
            boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Nav />
        </div>

        {/* Main Content */}
        <div
          className="container py-4"
          style={{ marginTop: "80px", marginBottom: "80px" }}
        >
          {/* Back Button */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(getDashboardUrl());
                  }}
                  className="text-decoration-none text-primary d-flex align-items-center"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </a>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-1">Notifications</h1>
              <p className="text-muted mb-0">
                {unreadCount > 0 ? (
                  <>You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}</>
                ) : (
                  'All caught up! No unread notifications.'
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn btn-outline-primary"
                disabled={loading}
              >
                <i className="bi bi-check-all me-2"></i>
                Mark All as Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <ul className="nav nav-tabs nav-fill">
                <li className="nav-item">
                  <button
                    className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All ({notifications?.length || 0})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                  >
                    Unread ({unreadCount})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                  >
                    Read ({(notifications?.length || 0) - unreadCount})
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Notifications List */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading notifications...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger m-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-bell-slash display-4 text-muted mb-3"></i>
                  <h5 className="text-muted">No notifications</h5>
                  <p className="text-muted">
                    {filter === 'all' 
                      ? "You don't have any notifications yet."
                      : filter === 'unread'
                      ? "All notifications have been read."
                      : "No read notifications to show."
                    }
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`list-group-item list-group-item-action ${
                        !notification.is_read ? 'bg-light' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex w-100 justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <h6 className={`mb-0 ${!notification.is_read ? 'fw-bold' : ''}`}>
                              {notification.title}
                            </h6>
                            {!notification.is_read && (
                              <span className="badge bg-primary ms-2">New</span>
                            )}
                          </div>
                          <p className="mb-1 text-muted">{notification.message}</p>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(notification.created_at)}
                          </small>
                        </div>
                        <div className="ms-3">
                          {!notification.is_read ? (
                            <i className="bi bi-circle-fill text-primary" style={{ fontSize: '0.5rem' }}></i>
                          ) : (
                            <i className="bi bi-check-circle text-muted"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-arrow-clockwise display-6 text-primary mb-3"></i>
                  <h5>Refresh Notifications</h5>
                  <p className="text-muted">Check for new notifications</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-gear display-6 text-secondary mb-3"></i>
                  <h5>Notification Settings</h5>
                  <p className="text-muted">Manage your notification preferences</p>
                  <button className="btn btn-outline-secondary" disabled>
                    <i className="bi bi-gear me-2"></i>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "white",
            boxShadow: "0 -2px 20px rgba(0,0,0,0.1)",
          }}
        >
          <SecondFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Nav from '../components/common/Nav';
import SecondFooter from '../components/common/SecondFooter';

export default function SettingsPage() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');

  const isLoading = authLoading || userLoading;

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Fixed Nav */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
          }}
        >
          <Nav />
        </div>

        <div
          className="min-vh-100 position-relative overflow-hidden bg-light"
          style={{ paddingTop: '80px', paddingBottom: '80px' }}
        >
          <div className="container py-5">
            <div className="row">
              <div className="col-12">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h1 className="h2 mb-2">
                      <i className="bi bi-gear-fill me-2 text-primary"></i>
                      Settings
                    </h1>
                    <p className="text-muted mb-0">
                      Manage your account settings and preferences
                    </p>
                  </div>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      if (authUser?.user_type === 'CLIENT') {
                        router.push('/dashboard/client');
                      } else if (authUser?.user_type === 'SERVICEMAN') {
                        router.push('/dashboard/worker');
                      } else if (authUser?.user_type === 'ADMIN') {
                        router.push('/admin/dashboard');
                      } else {
                        router.push('/');
                      }
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </button>
                </div>

                <div className="row">
                  {/* Settings Navigation */}
                  <div className="col-md-3 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="list-group list-group-flush">
                        <button
                          className={`list-group-item list-group-item-action ${
                            activeTab === 'account' ? 'active' : ''
                          }`}
                          onClick={() => setActiveTab('account')}
                        >
                          <i className="bi bi-person me-2"></i>
                          Account
                        </button>
                        <button
                          className={`list-group-item list-group-item-action ${
                            activeTab === 'notifications' ? 'active' : ''
                          }`}
                          onClick={() => setActiveTab('notifications')}
                        >
                          <i className="bi bi-bell me-2"></i>
                          Notifications
                        </button>
                        <button
                          className={`list-group-item list-group-item-action ${
                            activeTab === 'privacy' ? 'active' : ''
                          }`}
                          onClick={() => setActiveTab('privacy')}
                        >
                          <i className="bi bi-shield-check me-2"></i>
                          Privacy & Security
                        </button>
                        <button
                          className={`list-group-item list-group-item-action ${
                            activeTab === 'preferences' ? 'active' : ''
                          }`}
                          onClick={() => setActiveTab('preferences')}
                        >
                          <i className="bi bi-sliders me-2"></i>
                          Preferences
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settings Content */}
                  <div className="col-md-9">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        {/* Account Settings */}
                        {activeTab === 'account' && (
                          <div>
                            <h4 className="mb-4">Account Information</h4>
                            
                            <div className="mb-4">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Username</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={user?.username || ''}
                                    disabled
                                  />
                                  <small className="text-muted">Username cannot be changed</small>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Email</label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    value={user?.email || ''}
                                    disabled
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">First Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={user?.first_name || ''}
                                    readOnly
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Last Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={user?.last_name || ''}
                                    readOnly
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Phone Number</label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    value={user?.phone_number || ''}
                                    readOnly
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Account Type</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={authUser?.user_type || ''}
                                    disabled
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="alert alert-info">
                              <i className="bi bi-info-circle me-2"></i>
                              To update your profile information, please visit the{' '}
                              <a href="/profile" className="alert-link">Profile page</a>.
                            </div>

                            <hr className="my-4" />

                            <h5 className="mb-3 text-danger">Danger Zone</h5>
                            <div className="alert alert-danger">
                              <h6 className="alert-heading">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                Delete Account
                              </h6>
                              <p className="mb-2 small">
                                Once you delete your account, there is no going back. Please be certain.
                              </p>
                              <button className="btn btn-danger btn-sm" disabled>
                                <i className="bi bi-trash me-2"></i>
                                Delete My Account
                              </button>
                              <small className="d-block mt-2 text-muted">
                                Contact support to delete your account
                              </small>
                            </div>
                          </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                          <div>
                            <h4 className="mb-4">Notification Preferences</h4>
                            
                            <div className="mb-4">
                              <h6 className="mb-3">Email Notifications</h6>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="emailNewRequest"
                                  defaultChecked
                                />
                                <label className="form-check-label" htmlFor="emailNewRequest">
                                  New service requests
                                </label>
                              </div>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="emailStatusUpdate"
                                  defaultChecked
                                />
                                <label className="form-check-label" htmlFor="emailStatusUpdate">
                                  Status updates
                                </label>
                              </div>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="emailMessages"
                                  defaultChecked
                                />
                                <label className="form-check-label" htmlFor="emailMessages">
                                  New messages
                                </label>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h6 className="mb-3">Push Notifications</h6>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="pushEnabled"
                                  defaultChecked
                                />
                                <label className="form-check-label" htmlFor="pushEnabled">
                                  Enable push notifications
                                </label>
                              </div>
                            </div>

                            <div className="alert alert-info">
                              <i className="bi bi-info-circle me-2"></i>
                              Notification settings coming soon! These preferences will be saved to your account.
                            </div>
                          </div>
                        )}

                        {/* Privacy Settings */}
                        {activeTab === 'privacy' && (
                          <div>
                            <h4 className="mb-4">Privacy & Security</h4>
                            
                            <div className="mb-4">
                              <h6 className="mb-3">Password</h6>
                              <button className="btn btn-primary" disabled>
                                <i className="bi bi-key me-2"></i>
                                Change Password
                              </button>
                              <p className="text-muted small mt-2">
                                Password management coming soon
                              </p>
                            </div>

                            <hr className="my-4" />

                            <div className="mb-4">
                              <h6 className="mb-3">Two-Factor Authentication</h6>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="twoFactor"
                                  disabled
                                />
                                <label className="form-check-label" htmlFor="twoFactor">
                                  Enable two-factor authentication
                                </label>
                              </div>
                              <p className="text-muted small">
                                2FA coming soon for enhanced security
                              </p>
                            </div>

                            <hr className="my-4" />

                            <div className="mb-4">
                              <h6 className="mb-3">Session Management</h6>
                              <button className="btn btn-warning" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Logout
                              </button>
                              <p className="text-muted small mt-2">
                                Sign out from this device
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Preferences */}
                        {activeTab === 'preferences' && (
                          <div>
                            <h4 className="mb-4">Preferences</h4>
                            
                            <div className="mb-4">
                              <h6 className="mb-3">Language</h6>
                              <select className="form-select" defaultValue="en">
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                              </select>
                            </div>

                            <div className="mb-4">
                              <h6 className="mb-3">Theme</h6>
                              <div className="btn-group" role="group">
                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="theme"
                                  id="themeLight"
                                  defaultChecked
                                />
                                <label className="btn btn-outline-primary" htmlFor="themeLight">
                                  <i className="bi bi-sun me-1"></i>
                                  Light
                                </label>

                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="theme"
                                  id="themeDark"
                                  disabled
                                />
                                <label className="btn btn-outline-primary" htmlFor="themeDark">
                                  <i className="bi bi-moon me-1"></i>
                                  Dark
                                </label>

                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="theme"
                                  id="themeAuto"
                                  disabled
                                />
                                <label className="btn btn-outline-primary" htmlFor="themeAuto">
                                  <i className="bi bi-circle-half me-1"></i>
                                  Auto
                                </label>
                              </div>
                              <p className="text-muted small mt-2">
                                Dark mode coming soon!
                              </p>
                            </div>

                            <div className="alert alert-info">
                              <i className="bi bi-info-circle me-2"></i>
                              More preferences and customization options coming soon!
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
          }}
        >
          <SecondFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}


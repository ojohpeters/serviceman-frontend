'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Nav from '../components/common/Nav';
import SecondFooter from '../components/common/SecondFooter';
import ClientProfileEdit from '../components/profile/ClientProfileEdit';
import ServicemanProfileEdit from '../components/profile/ServicemanProfileEdit';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { user, servicemanProfile, loading: userLoading } = useUser();
  const router = useRouter();

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading profile...</p>
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
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      My Profile
                    </h1>
                    <p className="text-muted mb-0">
                      Update your personal information and preferences
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

                {/* Profile Edit Component */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    {authUser?.user_type === 'CLIENT' && <ClientProfileEdit />}
                    {authUser?.user_type === 'SERVICEMAN' && (
                      <ServicemanProfileEdit />
                    )}
                    {authUser?.user_type === 'ADMIN' && (
                      <div className="text-center py-5">
                        <i className="bi bi-shield-check display-1 text-primary mb-3"></i>
                        <h4>Admin Profile</h4>
                        <p className="text-muted">
                          Admin profile management coming soon.
                        </p>
                      </div>
                    )}
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


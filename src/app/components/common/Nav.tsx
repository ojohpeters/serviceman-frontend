"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/UserContext";
import { useAdmin } from "../../hooks/useAdmin"; 

const Nav = () => {
  const { isAuthenticated, logout } = useAuth();
  const { user, loading } = useUser();
  const { isAdmin } = useAdmin();

  const handleLogout = () => {
    logout();
  };

  // Dynamic dashboard link based on user type
  const dashboardLink = user?.user_type
    ? (user.user_type === 'ADMIN' ? '/admin/dashboard' : 
       user.user_type === 'SERVICEMAN' ? '/dashboard/worker' : '/dashboard/client')
    : '/dashboard';

  // Show loading only for a brief initial period
  if (loading) {
    return (
      <nav className="position-relative border-bottom sophisticated-nav" style={{ zIndex: 10 }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <Link href="/" className="text-decoration-none">
                <h1 className="h2 fw-bold mb-0" style={{ color: "var(--foreground)" }}>
                  ServiceHub
                </h1>
              </Link>
            </div>
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const userInitial = user?.username?.charAt(0).toUpperCase();
  const username = user?.username;

  return (
    <nav
      className="position-relative border-bottom sophisticated-nav"
      style={{ zIndex: 10 }}
    >
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center py-3">
          {/* Logo */}
          <div className="d-flex align-items-center">
            <Link href="/" className="text-decoration-none">
              <h1
                className="h2 fw-bold mb-0"
                style={{ color: "var(--foreground)" }}
              >
                ServiceHub
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="d-none d-md-flex align-items-center">
            <a href="#" className="text-decoration-none me-4 sophisticated-nav-link">
              About Us
            </a>
            <a href="#" className="text-decoration-none me-4 sophisticated-nav-link">
              FAQs
            </a>
            <a href="#" className="text-decoration-none me-4 sophisticated-nav-link">
              Contact Us
            </a>
            
            {/* Admin Link - Visible to everyone */}
            <Link href="/admin/login" className="text-decoration-none me-4 sophisticated-nav-link">
              Admin
            </Link>
          </div>

          {/* User Actions */}
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                {/* Single Dynamic Dashboard Button */}
                <Link href={dashboardLink} className="btn btn-primary">
                  {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>
                
                {/* User Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: 'var(--primary)',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {userInitial || 'U'}
                    </div>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <span className="dropdown-item-text small">
                        Signed in as <strong>{username || 'User'}</strong>
                        {isAdmin && (
                          <span className="badge bg-warning text-dark ms-2">Admin</span>
                        )}
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    
                    {/* Admin Menu Items */}
                    {isAdmin && (
                      <>
                        <li>
                          <Link className="dropdown-item" href="/admin/dashboard">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Admin Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/admin/categories">
                            <i className="bi bi-tags me-2"></i>
                            Manage Categories
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    
                    {/* Common Menu Items */}
                    <li>
                      <Link className="dropdown-item" href="/profile">
                        <i className="bi bi-person me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/settings">
                        <i className="bi bi-gear me-2"></i>
                        Settings
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              /* Unauthenticated User Actions */
              <>
                <Link href="/auth/login" className="btn btn-outline-secondary me-3">
                  Sign In
                </Link>
                <Link href="/auth/register/client" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
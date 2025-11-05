"use client";

import React, { useEffect, useState } from "react";
import { userProfileService } from "../../services/userProfile";
import { serviceRequestsService } from "../../services/serviceRequests";
import { paymentsService } from "../../services/payments";
import type { CreateServiceRequestData, ServicemanProfile } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import Nav from "../../components/common/Nav";
import SecondFooter from "../../components/common/SecondFooter";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ userId: string }>;
}

// Note: Using ServicemanProfile from API types
// This matches the backend API response structure

export default function ServicemanPublicProfilePage({ params }: PageProps) {
  const { userId } = React.use(params);
  const router = useRouter();
  const { user } = useAuth(); // Get current logged-in user
  const [profile, setProfile] = useState<ServicemanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking form state - matches API documentation
  const [bookingDetails, setBookingDetails] = useState({
    booking_date: "", // Date only (YYYY-MM-DD)
    service_description: "",
    client_address: "",
    is_emergency: false,
  });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userProfileService.getPublicServicemanProfile(
          Number(userId)
        );
        console.log('📦 [Serviceman Profile] Received data:', data);
        if (isMounted) setProfile(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleBookService = () => {
    // Check if user is logged in
    if (!user) {
      alert("Please log in to book a service");
      router.push("/auth/login");
      return;
    }

    // Check if user is a client
    if (user.user_type !== "CLIENT") {
      alert("Only clients can book services. Please register as a client.");
      return;
    }

    setShowBookingModal(true);
    setBookingSuccess(false);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.user_type !== "CLIENT") {
      alert("You must be logged in as a client to book services");
      return;
    }

    if (!profile) {
      alert("Serviceman profile not loaded");
      return;
    }

    // Check if serviceman has a category assigned
    const categoryId = typeof profile.category === 'object' 
      ? profile.category?.id 
      : profile.category;
      
    if (!categoryId) {
      alert(
        "This serviceman doesn't have a service category assigned yet. Please try another serviceman."
      );
      return;
    }

    // Format date and prepare data
    const formattedDate = bookingDetails.booking_date.split('T')[0];
    const initialBookingFee = bookingDetails.is_emergency ? 5000 : 2000;
    
    // Prepare request data (without payment_reference for now)
    const requestData = {
      category_id: categoryId,
      booking_date: formattedDate,
      is_emergency: bookingDetails.is_emergency,
      client_address: bookingDetails.client_address,
      service_description: bookingDetails.service_description,
      initial_booking_fee: initialBookingFee,
    };

    console.log('📋 [Booking] Request data prepared:', requestData);

    // Save to localStorage for use after payment
    localStorage.setItem('pendingServiceRequest', JSON.stringify(requestData));

    // Close booking modal and show payment modal
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    setBookingLoading(true);
    
    try {
      console.log('💳 [Payment] Initializing booking fee payment...');
      
      // Initialize booking fee payment
      const paymentResponse = await paymentsService.initializeBookingFee(bookingDetails.is_emergency);
      
      // Save payment reference
      localStorage.setItem('pendingPaymentReference', paymentResponse.reference);
      
      console.log('✅ [Payment] Payment initialized, redirecting to Paystack...');
      console.log('📍 [Payment] Callback URL: /payment/booking-callback?reference=' + paymentResponse.reference);
      
      // Redirect to Paystack
      window.location.href = paymentResponse.paystack_url;
      
    } catch (error: any) {
      console.error('❌ [Payment] Payment initialization failed:', error);
      
      let errorMessage = "Failed to initialize payment. Please try again.";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setBookingLoading(false);
      setShowPaymentModal(false);
      setShowBookingModal(true); // Return to booking form
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setShowBookingModal(true); // Return to booking form
    localStorage.removeItem('pendingServiceRequest');
  };

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Get display name from user object or fallback
  const getDisplayName = () => {
    if (!profile) return "Service Professional";
    
    // Debug log to see what we have
    console.log('🔍 [Name Debug] Profile user:', profile.user);
    console.log('🔍 [Name Debug] Profile user type:', typeof profile.user);
    console.log('🔍 [Name Debug] Full profile:', profile);
    
    // If user is just a number (ID), we can't get the name
    if (typeof profile.user === 'number') {
      console.warn('⚠️ [Name] User is just an ID:', profile.user);
      console.warn('⚠️ [Name] Backend should return full user object, not just ID');
      console.warn('⚠️ [Name] Contact backend team to fix this endpoint');
      return "Service Professional";
    }
    
    // Try to get name from user object (when it's an object)
    if (profile.user && typeof profile.user === 'object') {
      const user = profile.user as any;
      
      // Try multiple fields
      const possibleNames = [
        user.full_name,
        user.username,
        user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
        user.first_name,
        user.last_name
      ].filter(Boolean);
      
      if (possibleNames.length > 0) {
        console.log('✅ [Name] Using name:', possibleNames[0]);
        return possibleNames[0];
      }
      
      console.warn('⚠️ [Name] User object exists but has no name fields:', user);
    }
    
    console.warn('⚠️ [Name] Using fallback - no name found in profile');
    return "Service Professional";
  };

  // Get category name
  const getCategoryName = () => {
    if (!profile) return "Professional Service Provider";
    
    if (profile.category && typeof profile.category === 'object') {
      return profile.category.name;
    }
    
    return "Professional Service Provider";
  };

  // Add Bootstrap Icons
  React.useEffect(() => {
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css";
      document.head.appendChild(link);
    }
  }, []);

  return (
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
          backdropFilter: "blur(10px)",
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
                  router.back();
                }}
                className="text-decoration-none text-primary d-flex align-items-center"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Servicemen
              </a>
            </li>
          </ol>
        </nav>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-dark mb-2">Loading Profile</h5>
            <p className="text-muted">Getting serviceman information...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className="alert alert-danger d-flex align-items-center border-0 shadow-sm"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-1">Unable to Load Profile</h6>
              <div className="mb-0">{error}</div>
            </div>
            <button
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Try Again
            </button>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && profile && (
          <>
            {/* Backend Warning - Only shows if user is just an ID */}
            {typeof profile.user === 'number' && (
              <div className="alert alert-danger border-0 shadow-sm mb-4" role="alert">
                <div className="d-flex align-items-start">
                  <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                  <div className="flex-grow-1">
                    <h5 className="alert-heading mb-2">⚠️ Backend API Issue Detected</h5>
                    <p className="mb-2">
                      <strong>Problem:</strong> The backend is returning <code>user: {String(profile.user)}</code> (just an ID) 
                      instead of a full user object.
                    </p>
                    <p className="mb-2">
                      <strong>Impact:</strong> Cannot display serviceman's real name, showing "Service Professional" as fallback.
                    </p>
                    <hr className="my-2" />
                    <small className="mb-0">
                      <strong>Backend Team:</strong> Please update <code>/users/servicemen/{'{id}'}/</code> endpoint to return:
                      <pre className="mt-2 mb-0 p-2 bg-dark text-light rounded" style={{ fontSize: '0.75rem' }}>
{`{
  "user": {
    "id": ${profile.user},
    "username": "...",
    "full_name": "...",
    "email": "..."
  }
}`}
                      </pre>
                    </small>
                  </div>
                </div>
              </div>
            )}
            
            <div className="row g-4">
              {/* Left Column - Profile Info */}
              <div className="col-12 col-lg-8">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                  {/* Profile Header */}
                  <div className="d-flex align-items-start mb-4">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: 80,
                          height: 80,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "1.5rem",
                          border: "4px solid #f8f9fa",
                        }}
                      >
                        {getDisplayName()
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase() || "SP"}
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-4">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <h1 className="h2 fw-bold text-dark mb-1">
                            {getDisplayName()}
                          </h1>
                          <p className="text-muted mb-2" style={{ color: '#6c757d !important' }}>
                            {getCategoryName()}
                          </p>
                          <div className="d-flex align-items-center gap-3 flex-wrap">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              <span className="fw-bold" style={{ color: '#212529' }}>
                                {profile.rating || '0.0'}
                              </span>
                              <span className="ms-1" style={{ color: '#6c757d' }}>
                                ({profile.total_jobs_completed || 0} jobs)
                              </span>
                            </div>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-briefcase text-primary me-1"></i>
                              <span style={{ color: '#6c757d' }}>
                                {profile.years_of_experience !== null && profile.years_of_experience !== undefined 
                                  ? `${profile.years_of_experience} year${profile.years_of_experience !== 1 ? 's' : ''} experience`
                                  : 'Experience not specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`badge ${
                            profile.is_available ? "bg-success" : "bg-secondary"
                          } fs-6`}
                        >
                          {profile.is_available ? "Available" : "Unavailable"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: '#212529' }}>
                      <i className="bi bi-person-badge me-2 text-primary"></i>
                      About Me
                    </h5>
                    <p
                      className="mb-0"
                      style={{ lineHeight: "1.6", fontSize: "1.05rem", color: '#495057' }}
                    >
                      {profile.bio ||
                        `Hi, I'm ${getDisplayName()}, a dedicated professional with ${
                          profile.years_of_experience ?? 0
                        } years of experience. I'm committed to providing top-quality service and ensuring complete customer satisfaction.`}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                      <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                        <div className="fw-bold fs-4" style={{ color: '#0d6efd !important' }}>
                          {profile.years_of_experience !== null && profile.years_of_experience !== undefined 
                            ? `${profile.years_of_experience}+` 
                            : 'N/A'}
                        </div>
                        <small style={{ color: '#6c757d' }}>Years Experience</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                        <div className="fw-bold fs-4" style={{ color: '#198754 !important' }}>
                          {profile.total_jobs_completed || 0}
                        </div>
                        <small style={{ color: '#6c757d' }}>Jobs Completed</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                        <div className="fw-bold fs-4" style={{ color: '#d97706 !important' }}>
                          {profile.rating || '0.0'}
                        </div>
                        <small style={{ color: '#6c757d' }}>Rating</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                        <div className="fw-bold fs-4" style={{ color: '#0891b2 !important' }}>
                          {profile.is_available ? "Yes" : "No"}
                        </div>
                        <small style={{ color: '#6c757d' }}>Available Now</small>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                    <div className="mb-4">
                      <h5 className="fw-bold text-dark mb-3">
                        <i className="bi bi-tools me-2 text-primary"></i>
                        Skills & Expertise
                      </h5>
                      <div className="d-flex flex-wrap gap-2">
                        {profile.skills.map((skill: any, index: number) => {
                          // Handle both string and object skills
                          const skillName = typeof skill === 'string' ? skill : (skill.name || skill);
                          
                          return (
                            <span
                              key={skill.id || index}
                              className="badge px-3 py-2"
                              style={{ 
                                fontSize: '0.95rem',
                                backgroundColor: '#e7f3ff',
                                color: '#0066cc',
                                border: '1px solid #0066cc'
                              }}
                            >
                              <i className="bi bi-check-circle-fill me-1"></i>
                              {skillName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Contact Information - Removed for privacy */}
                  {/* Phone numbers are now only visible after booking */}

                  {/* Availability Status */}
                  {profile.active_jobs_count !== undefined && profile.active_jobs_count > 0 && (
                    <div className="alert alert-warning border-0 mb-0">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-exclamation-triangle fs-5 me-3"></i>
                        <div>
                          <h6 className="alert-heading mb-1">Currently Busy</h6>
                          <p className="mb-0 small">
                            {getDisplayName()} is currently working on {profile.active_jobs_count} active job{profile.active_jobs_count !== 1 ? 's' : ''}. 
                            Response time may be longer than usual.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="col-12 col-lg-4">
              <div
                className="card shadow-sm border-0 sticky-top"
                style={{ top: "100px" }}
              >
                <div className="card-body p-4">
                  <h5 className="fw-bold text-dark mb-3">Request Service</h5>

                  {profile.is_available ? (
                    <>
                      <div className="alert alert-success border-0 mb-4">
                        <i className="bi bi-check-circle me-2"></i>
                        Available for immediate booking
                      </div>

                      <div className="d-grid">
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={handleBookService}
                          disabled={Boolean(
                            // Only disable if logged in as non-client or no category
                            // NOT disabled if not logged in (so they can click to login)
                            (user && user.user_type !== "CLIENT") ||
                            (user && profile && !profile.category)
                          )}
                          title={
                            !user
                              ? "Click to login and book this service"
                              : !profile.category
                              ? "This serviceman needs to set up their service category"
                              : user.user_type !== "CLIENT"
                              ? "Only clients can book services"
                              : "Book this service now"
                          }
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          {!user
                            ? "Login to Book"
                            : user.user_type !== "CLIENT"
                            ? "Clients Only"
                            : !profile.category
                            ? "Category Not Set"
                            : "Book Service Now"}
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-top">
                        <h6 className="fw-bold text-dark mb-2">
                          Service Details
                        </h6>
                        <ul className="list-unstyled text-muted small">
                          <li className="mb-1">
                            <i className="bi bi-check text-success me-2"></i>
                            Professional quality service
                          </li>
                          <li className="mb-1">
                            <i className="bi bi-check text-success me-2"></i>
                            {profile.years_of_experience ?? 0}+ years experience
                          </li>
                          <li className="mb-1">
                            <i className="bi bi-check text-success me-2"></i>
                            {profile.total_jobs_completed} completed jobs
                          </li>
                          <li className="mb-1">
                            <i className="bi bi-check text-success me-2"></i>
                            Rated {profile.rating}/5 by clients
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-clock text-muted display-6 mb-3"></i>
                      <h6 className="text-dark mb-2">Currently Unavailable</h6>
                      <p className="text-muted small mb-3">
                        This serviceman is not available for new bookings at the
                        moment.
                      </p>
                      <button className="btn btn-outline-secondary" disabled>
                        Not Available
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Booking Modal - Professional UI */}
      {showBookingModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white border-0">
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    <i className="bi bi-calendar-check me-2"></i>
                    Book Service
                  </h5>
                  <small className="opacity-75">Complete the form to request service</small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowBookingModal(false)}
                  disabled={bookingLoading}
                ></button>
              </div>

              {bookingSuccess ? (
                <div className="modal-body text-center py-5">
                  <div className="mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                      <i className="bi bi-check-circle-fill text-success display-3"></i>
                    </div>
                  </div>
                  <h4 className="text-success fw-bold mb-3">Booking Request Sent!</h4>
                  <p className="text-muted mb-4">
                    Your service request has been submitted successfully.<br/>
                    <strong>{getDisplayName()}</strong> will review your request shortly.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowBookingModal(false)}
                  >
                    <i className="bi bi-check-lg me-2"></i>
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking}>
                  <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    
                    {/* Serviceman Info Summary */}
                    <div className="card bg-light border-0 mb-4">
                      <div className="card-body py-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-person-badge text-primary fs-4"></i>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{getDisplayName()}</div>
                            <small className="text-muted">
                              {(profile?.category && typeof profile.category === 'object' && profile.category.name) || 'Service Professional'} • 
                              <span className="ms-1">
                                <i className="bi bi-star-fill text-warning"></i> {profile?.rating || 'N/A'}
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row g-4">
                      {/* Date Only */}
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label fw-semibold d-flex align-items-center mb-2">
                            <i className="bi bi-calendar-event text-primary me-2"></i>
                            Service Date
                            <span className="text-danger ms-1">*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-lg"
                            value={bookingDetails.booking_date}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              
                              const bookingDate = new Date(selectedDate);
                              bookingDate.setHours(0, 0, 0, 0);
                              
                              // Calculate days difference
                              const diffTime = bookingDate.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              // Auto-flag as emergency if less than 2 days
                              const isEmergency = diffDays < 2;
                              
                              console.log('📅 [Date Change] Selected date:', selectedDate);
                              console.log('📅 [Date Change] Days from today:', diffDays);
                              console.log('📅 [Date Change] Auto-flagged emergency:', isEmergency);
                              
                              setBookingDetails({
                                ...bookingDetails,
                                booking_date: selectedDate,
                                is_emergency: isEmergency,
                              });
                            }}
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <div className="form-text mt-2">
                            <i className="bi bi-info-circle text-primary me-1"></i>
                            <span className="small">
                              Select the date when you need the service. 
                              {bookingDetails.booking_date && (() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const bookingDate = new Date(bookingDetails.booking_date);
                                bookingDate.setHours(0, 0, 0, 0);
                                const diffTime = bookingDate.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                if (diffDays < 2) {
                                  return (
                                    <strong className="text-warning d-block mt-1">
                                      <i className="bi bi-lightning-charge-fill me-1"></i>
                                      Auto-flagged as emergency (less than 2 days away) - ₦5,000 booking fee
                                    </strong>
                                  );
                                }
                                return null;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Service Address */}
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label fw-semibold d-flex align-items-center mb-2">
                            <i className="bi bi-geo-alt text-danger me-2"></i>
                            Service Address
                            <span className="text-danger ms-1">*</span>
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-house-door"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0 ps-0"
                              placeholder="e.g., 123 Main Street, Victoria Island, Lagos"
                              value={bookingDetails.client_address}
                              onChange={(e) =>
                                setBookingDetails({
                                  ...bookingDetails,
                                  client_address: e.target.value,
                                })
                              }
                              required
                              minLength={10}
                            />
                          </div>
                          <div className="form-text mt-2">
                            <i className="bi bi-info-circle text-primary me-1"></i>
                            <span className="small">Provide your complete address where the service is needed</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Description */}
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label fw-semibold d-flex align-items-center justify-content-between mb-2">
                            <span>
                              <i className="bi bi-pencil-square text-success me-2"></i>
                              Service Description
                              <span className="text-danger ms-1">*</span>
                            </span>
                            <small className="text-muted fw-normal">
                              {bookingDetails.service_description.length}/500
                            </small>
                          </label>
                          <textarea
                            className="form-control form-control-lg"
                            rows={4}
                            placeholder="Describe the service you need in detail...&#10;&#10;Example: I need help installing a new ceiling fan in my living room. The fan is already purchased and ready. I need the old fan removed and the new one installed, including proper wiring and testing."
                            value={bookingDetails.service_description}
                            onChange={(e) =>
                              setBookingDetails({
                                ...bookingDetails,
                                service_description: e.target.value.slice(0, 500),
                              })
                            }
                            required
                            minLength={20}
                            maxLength={500}
                            style={{ resize: 'vertical' }}
                          />
                          <div className="form-text mt-2">
                            <i className="bi bi-info-circle text-primary me-1"></i>
                            <span className="small">
                              Be specific about what needs to be done (minimum 20 characters). This helps the serviceman prepare better.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Service Toggle */}
                      <div className="col-12">
                        {(() => {
                          // Check if auto-flagged due to date
                          let isAutoFlagged = false;
                          if (bookingDetails.booking_date) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const bookingDate = new Date(bookingDetails.booking_date);
                            bookingDate.setHours(0, 0, 0, 0);
                            const diffTime = bookingDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            isAutoFlagged = diffDays < 2;
                          }
                          
                          return (
                            <div className={`card border-2 ${bookingDetails.is_emergency ? 'border-warning bg-warning bg-opacity-10' : 'border-success bg-success bg-opacity-10'}`}>
                              <div className="card-body">
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="emergency"
                                    style={{ width: '3em', height: '1.5em', cursor: isAutoFlagged ? 'not-allowed' : 'pointer' }}
                                    checked={bookingDetails.is_emergency}
                                    disabled={isAutoFlagged}
                                    onChange={(e) => {
                                      if (!isAutoFlagged) {
                                        setBookingDetails({
                                          ...bookingDetails,
                                          is_emergency: e.target.checked,
                                        });
                                      }
                                    }}
                                  />
                              <label
                                className="form-check-label fw-semibold"
                                htmlFor="emergency"
                                style={{ cursor: 'pointer', marginLeft: '0.5em' }}
                              >
                                <i className={`bi ${bookingDetails.is_emergency ? 'bi-lightning-charge-fill text-warning' : 'bi-clock-history text-success'} me-2`}></i>
                                {bookingDetails.is_emergency ? 'Emergency Service' : 'Standard Service'}
                              </label>
                            </div>
                                <div className="mt-2 ps-5">
                                  {bookingDetails.is_emergency ? (
                                    <div>
                                      <div className="fw-bold text-warning mb-1">
                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                        Initial Booking Fee: ₦5,000
                                      </div>
                                      <small className="text-dark">
                                        Priority service with faster response time. The serviceman will prioritize your request.
                                        {isAutoFlagged && (
                                          <span className="d-block mt-1 text-warning">
                                            <i className="bi bi-info-circle-fill me-1"></i>
                                            <strong>Auto-flagged:</strong> Bookings within 2 days require emergency fee for priority service.
                                          </span>
                                        )}
                                      </small>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="fw-bold text-success mb-1">
                                        <i className="bi bi-check-circle-fill me-1"></i>
                                        Initial Booking Fee: ₦2,000
                                      </div>
                                      <small className="text-dark">
                                        Standard service booking. The serviceman will respond within normal timeframes.
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Important Notice */}
                      <div className="col-12">
                        <div className="alert alert-info border-0 mb-0">
                          <div className="d-flex">
                            <i className="bi bi-info-circle-fill me-3 fs-5"></i>
                            <div className="small">
                              <strong>What happens next?</strong>
                              <ul className="mb-0 mt-2 ps-3">
                                <li>Your request will be sent to {getDisplayName()}</li>
                                <li>You'll receive a notification when reviewed</li>
                                <li>Payment of the booking fee will be required to confirm</li>
                                <li>Final service cost will be provided after assessment</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-top bg-light">
                    <button
                      type="button"
                      className="btn btn-lg btn-outline-secondary"
                      onClick={() => setShowBookingModal(false)}
                      disabled={bookingLoading}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-lg btn-primary px-4"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill me-2"></i>
                          Send Booking Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer */}
      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-credit-card me-2 text-primary"></i>
                  Booking Fee Required
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handlePaymentCancel}
                  disabled={bookingLoading}
                ></button>
              </div>

              <div className="modal-body py-4">
                <div className="text-center mb-4">
                  <p className="text-muted mb-3">
                    You need to pay a booking fee before submitting your service request.
                  </p>
                  
                  <div 
                    className="p-4 rounded-3"
                    style={{ 
                      backgroundColor: bookingDetails.is_emergency ? '#FEF3C7' : '#D1FAE5',
                      border: bookingDetails.is_emergency ? '2px solid #F59E0B' : '2px solid #10B981'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="fs-4 fw-bold text-dark">₦</span>
                      <span className="display-4 fw-bold text-dark">
                        {bookingDetails.is_emergency ? '5,000' : '2,000'}
                      </span>
                    </div>
                    <small 
                      className="d-block mt-2"
                      style={{ 
                        color: bookingDetails.is_emergency ? '#92400E' : '#065F46',
                        fontWeight: 600
                      }}
                    >
                      {bookingDetails.is_emergency ? (
                        <>
                          <i className="bi bi-lightning-charge me-1"></i>
                          Emergency Booking Fee
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          Standard Booking Fee
                        </>
                      )}
                    </small>
                  </div>
                </div>

                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>What happens next:</strong>
                  <ol className="mb-0 mt-2 ps-3">
                    <li>You'll be redirected to Paystack for secure payment</li>
                    <li>Complete the payment using your card</li>
                    <li>Return automatically to complete your booking</li>
                  </ol>
                </div>

                {bookingDetails.is_emergency && (
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Emergency Service:</strong> Your request will be prioritized and processed within 24 hours.
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handlePaymentCancel}
                  disabled={bookingLoading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handlePaymentConfirm}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill me-2"></i>
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: "0 -2px 20px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <SecondFooter />
      </div>
    </div>
  );
}

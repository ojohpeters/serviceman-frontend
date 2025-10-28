"use client";

import React, { useEffect, useState } from "react";
import { userProfileService } from "../../services/userProfile";
import { serviceRequestsService } from "../../services/serviceRequests";
import { paymentsService } from "../../services/payments";
import type { CreateServiceRequestData } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import Nav from "../../components/common/Nav";
import SecondFooter from "../../components/common/SecondFooter";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ userId: string }>;
}

// Public serviceman profile interface
interface PublicServicemanProfile {
  user: number;
  full_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  category?: number | { id: number; name: string };
  category_name?: string;
  skills: Array<{ id: number; name: string; category: string }>;
  rating?: string;
  bio?: string;
  years_of_experience?: number;
  total_jobs_completed?: number;
  is_available?: boolean;
  active_jobs_count?: number;
  booking_warning?: {
    message: string;
    show_warning: boolean;
  } | null;
  created_at?: string;
}

export default function ServicemanPublicProfilePage({ params }: PageProps) {
  const { userId } = React.use(params);
  const router = useRouter();
  const { user } = useAuth(); // Get current logged-in user
  const [profile, setProfile] = useState<PublicServicemanProfile | null>(null);
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
        if (isMounted) setProfile(data as PublicServicemanProfile);
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

  // Fallback for missing full_name
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    return "Service Professional";
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
                          .map((n) => n[0])
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
                          <p className="text-muted mb-2">
                            {profile.category_name ||
                              "Professional Service Provider"}
                          </p>
                          <div className="d-flex align-items-center gap-3 flex-wrap">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              <span className="fw-bold text-dark">
                                {profile.rating}
                              </span>
                              <span className="text-muted ms-1">
                                ({profile.total_jobs_completed} jobs)
                              </span>
                            </div>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-briefcase text-primary me-1"></i>
                              <span className="text-muted">
                                {profile.years_of_experience ?? 0} years
                                experience
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
                    <h5 className="fw-bold text-dark mb-3">
                      <i className="bi bi-person-badge me-2 text-primary"></i>
                      About Me
                    </h5>
                    <p
                      className="text-muted mb-0"
                      style={{ lineHeight: "1.6", fontSize: "1.05rem" }}
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
                        <div className="fw-bold text-primary fs-4">
                          {profile.years_of_experience ?? 0}+
                        </div>
                        <small className="text-muted">Years Experience</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                        <div className="fw-bold text-success fs-4">
                          {profile.total_jobs_completed}
                        </div>
                        <small className="text-muted">Jobs Completed</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                        <div className="fw-bold text-warning fs-4">
                          {profile.rating}
                        </div>
                        <small className="text-muted">Rating</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                        <div className="fw-bold text-info fs-4">
                          {profile.is_available ? "Yes" : "No"}
                        </div>
                        <small className="text-muted">Available Now</small>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-4">
                    <h5 className="fw-bold text-dark mb-3">
                      <i className="bi bi-telephone me-2 text-primary"></i>
                      Contact Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center p-3 bg-light rounded">
                          <i className="bi bi-phone text-primary me-3 fs-5"></i>
                          <div>
                            <small className="text-muted">Phone</small>
                            <div className="fw-medium text-dark">
                              {profile.phone_number || "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center p-3 bg-light rounded">
                          <i className="bi bi-envelope text-primary me-3 fs-5"></i>
                          <div>
                            <small className="text-muted">
                              Contact via Platform
                            </small>
                            <div className="fw-medium text-dark">
                              Message to book
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

                      <div className="d-grid gap-2">
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
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-chat me-2"></i>
                          Send Message
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
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Book Service with {getDisplayName()}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBookingModal(false)}
                  disabled={bookingLoading}
                ></button>
              </div>

              {bookingSuccess ? (
                <div className="modal-body text-center py-5">
                  <i className="bi bi-check-circle-fill text-success display-4 mb-3"></i>
                  <h5 className="text-success mb-2">Booking Request Sent!</h5>
                  <p className="text-muted">
                    Your service request has been submitted successfully.
                    {getDisplayName()} will review your request shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-medium">
                          Service Date & Time{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={bookingDetails.booking_date}
                          onChange={(e) =>
                            setBookingDetails({
                              ...bookingDetails,
                              booking_date: e.target.value,
                            })
                          }
                          required
                          min={new Date().toISOString().slice(0, 16)}
                        />
                        <small className="form-text text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Bookings within 2 days are marked as emergency (₦5,000 fee instead of ₦2,000)
                        </small>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-medium">
                          Service Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your complete address (e.g., 123 Main St, Lagos, Nigeria)"
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
                        <small className="form-text text-muted">
                          Provide your full address where the service is needed
                        </small>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-medium">
                          Service Description{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Describe the service you need in detail..."
                          value={bookingDetails.service_description}
                          onChange={(e) =>
                            setBookingDetails({
                              ...bookingDetails,
                              service_description: e.target.value,
                            })
                          }
                          required
                          minLength={20}
                        />
                        <small className="form-text text-muted">
                          Be specific about what needs to be done (minimum 20 characters)
                        </small>
                      </div>

                      <div className="col-12">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emergency"
                            checked={bookingDetails.is_emergency}
                            onChange={(e) =>
                              setBookingDetails({
                                ...bookingDetails,
                                is_emergency: e.target.checked,
                              })
                            }
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="emergency"
                          >
                            This is an emergency service
                          </label>
                          <div className="form-text">
                            <i className="bi bi-info-circle me-1"></i>
                            {bookingDetails.is_emergency ? (
                              <span className="text-warning">
                                <strong>Initial booking fee: ₦5,000</strong> (Emergency service)
                              </span>
                            ) : (
                              <span className="text-success">
                                <strong>Initial booking fee: ₦2,000</strong> (Standard service)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowBookingModal(false)}
                      disabled={bookingLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
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
                          <i className="bi bi-send me-2"></i>
                          Send Request
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

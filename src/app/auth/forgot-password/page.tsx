"use client";

import { useState } from "react";
import { authService } from "../../services/auth";
import SecondNav from "../../components/common/SecondNav";
import SecondFooter from "../../components/common/SecondFooter";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: 'white'
      }}>
        <SecondNav />
      </div>
      
      <div style={{ 
        paddingTop: '80px',
        paddingBottom: '60px',
        minHeight: '100vh'
      }}>
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
          <h2 className="mb-4">Reset Password</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success ? (
            <div className="alert alert-success" role="alert">
              <h4 className="alert-heading">Check your email!</h4>
              <p>We've sent password reset instructions to your email address.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
                <div className="form-text">
                  Enter your email address and we'll send you reset instructions.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span 
                      className="spinner-border spinner-border-sm me-2" 
                      role="status" 
                      aria-hidden="true"
                    ></span>
                    Sending...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </form>
          )}

          <div className="mt-3 text-center">
            <a href="/auth/login" className="text-decoration-none">
              Back to Login
            </a>
          </div>
        </div>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: 'white'
      }}>
        <SecondFooter />
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerWorker } from "../../../services/auth";
import SecondNav from "../../../components/common/SecondNav";
import SecondFooter from "../../../components/common/SecondFooter";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function ServiceManRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Clear previous errors
    setFieldErrors({});
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (!formData.terms) {
      setError("You must accept the Terms of Service.");
      setLoading(false);
      return;
    }

    try {
      console.log('📤 [Register] Submitting serviceman application...');
      await registerWorker({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log('✅ [Register] Application submitted successfully!');
      setSuccess("Application submitted successfully! Please check your email to verify your account. Your application will be reviewed by our admin team. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 4000);
    } catch (err: any) {
      console.error('❌ [Register] Registration failed:', err);
      console.error('❌ [Register] Response:', err.response?.data);
      
      // Handle field-level errors from backend
      if (err.response?.data && typeof err.response.data === 'object') {
        const backendErrors = err.response.data;
        
        // Check for field-level errors
        const hasFieldErrors = Object.keys(backendErrors).some(key => 
          Array.isArray(backendErrors[key])
        );
        
        if (hasFieldErrors) {
          setFieldErrors(backendErrors);
          
          // Create a summary error message
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join(' | ');
          
          setError(errorMessages);
        } else if (backendErrors.detail) {
          setError(backendErrors.detail);
        } else if (backendErrors.message) {
          setError(backendErrors.message);
        } else {
          setError(JSON.stringify(backendErrors));
        }
      } else {
        setError(err.message || "Application failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
        className="bg-white"
      >
        <SecondNav />
      </div>
      <div
        style={{
          paddingTop: "100px",
          paddingBottom: "100px",
          minHeight: "100vh",
        }}
      >
        <div className="container" style={{ maxWidth: "500px" }}>
          {/* Back to Home Link */}
          <div className="mb-3">
            <a href="/" className="text-decoration-none text-muted d-flex align-items-center">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Home
            </a>
          </div>

          <h2 className="mb-4">Apply to be a Service Provider</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              <strong><i className="bi bi-exclamation-triangle me-2"></i>Registration Error:</strong>
              <div className="mt-2">
                {Object.keys(fieldErrors).length > 0 ? (
                  <ul className="mb-0">
                    {Object.entries(fieldErrors).map(([field, messages]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                      </li>
                    ))}
                  </ul>
                ) : (
                  error
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
                placeholder="Choose a unique username"
              />
              {fieldErrors.username && (
                <div className="invalid-feedback d-block">
                  {fieldErrors.username.join(', ')}
                </div>
              )}
              <div className="form-text">
                Choose a unique username for your provider account.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
                placeholder="your.email@example.com"
              />
              {fieldErrors.email && (
                <div className="invalid-feedback d-block">
                  {fieldErrors.email.join(', ')}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                disabled={loading}
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {fieldErrors.password.join(', ')}
                </div>
              )}
              <div className="form-text">
                <i className="bi bi-info-circle me-1"></i>
                Must be at least 8 characters long
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="termsCheck"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="termsCheck">
                I agree to the Terms of Service and Provider Agreement
              </label>
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
                  Submitting Application...
                </>
              ) : (
                "Apply as Provider"
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="mb-0">
              Want to hire a service provider?{" "}
              <a href="/auth/register/client" className="text-decoration-none">
                Register as Client
              </a>
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        className="bg-white"
      >
        <SecondFooter />
      </div>
    </div>
  );
}
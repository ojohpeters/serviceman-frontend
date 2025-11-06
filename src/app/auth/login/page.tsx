"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext"; 
import { useUser } from "../../contexts/UserContext";
import SecondNav from "../../components/common/SecondNav";
import SecondFooter from "../../components/common/SecondFooter";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); 
  const { user, loading: userLoading } = useUser();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirect already logged-in users to their dashboard
  useEffect(() => {
    // Only redirect if we're sure user is logged in (not during loading)
    if (!userLoading && user && user.id !== 0) {
      console.log('🔄 [Login] User already logged in, redirecting to dashboard');
      const dashboardUrl = user.user_type === 'ADMIN' 
        ? '/admin/dashboard' 
        : user.user_type === 'SERVICEMAN'
        ? '/dashboard/worker'
        : '/dashboard/client';
      router.push(dashboardUrl);
    }
  }, [user, userLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await login({
      username: formData.username.trim(),
      password: formData.password,
    });

    if (result.success) {
      setLoginSuccess(true);
      // Don't push yet — wait for user to be loaded
    } else {
      setError(result.error || "Invalid username or password. Please try again.");
    }
  } catch (err: any) {
    setError(err.message || "Invalid username or password. Please try again.");
  } finally {
    setLoading(false);
  }
};

// After loginSuccess is true, wait for user to be ready before redirect
useEffect(() => {
  if (loginSuccess && user && !userLoading) {
    // Check if there's a saved redirect path
    const savedRedirect = typeof window !== 'undefined' 
      ? sessionStorage.getItem('redirectAfterLogin') 
      : null;
    
    let redirectTo: string;
    
    if (savedRedirect && savedRedirect !== '/auth/login') {
      // Redirect back to where they were trying to go
      console.log('🎯 [Login] Redirecting back to saved path:', savedRedirect);
      redirectTo = savedRedirect;
      sessionStorage.removeItem('redirectAfterLogin'); // Clean up
    } else {
      // Redirect based on user type to their appropriate dashboard
      redirectTo = user.user_type === 'ADMIN' 
        ? '/admin/dashboard' 
        : user.user_type === 'SERVICEMAN'
        ? '/dashboard/worker'
        : '/dashboard/client';
      
      console.log('🎯 [Login] Redirecting to default dashboard:', redirectTo);
    }
    
    router.push(redirectTo);
  }
}, [loginSuccess, user, userLoading, router]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Fixed Nav with background */}
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
      
      {/* Main Content */}
      <div style={{ 
        paddingTop: '80px',
        paddingBottom: '60px',
        minHeight: '100vh'
      }}>
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
          {/* Back to Home Link */}
          <div className="mb-3">
            <a href="/" className="text-decoration-none text-muted d-flex align-items-center">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Home
            </a>
          </div>
          
          <h2 className="mb-4">Login</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Show loading message while waiting for user data */}
          {loginSuccess && userLoading && (
            <div className="alert alert-info" role="alert">
              Loading user data...
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
              />
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
                minLength={6}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="mb-3 text-end">
              <a href="/auth/forgot-password" className="text-decoration-none">
                Forgot Password?
              </a>
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="mb-1">
              Don't have an account?{" "}
              <a href="/auth/register/client" className="text-decoration-none">
                Register as Client
              </a>
            </p>
            <p className="mb-0">
              <a href="/auth/register/serviceman" className="text-decoration-none">
                Apply to be a Provider
              </a>
            </p>
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
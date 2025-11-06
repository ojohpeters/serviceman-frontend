'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login: authContextLogin } = useAuth();
  const { user, loading: userLoading, refreshUser } = useUser();

  // Redirect already logged-in users to their dashboard
  useEffect(() => {
    // Only redirect if we're sure user is logged in (not during loading or minimal state)
    if (!userLoading && user && user.id !== 0) {
      console.log('🔄 [Admin Login] User already logged in, redirecting to dashboard');
      const dashboardUrl = user.user_type === 'ADMIN' 
        ? '/admin/dashboard' 
        : user.user_type === 'SERVICEMAN'
        ? '/dashboard/worker'
        : '/dashboard/client';
      router.push(dashboardUrl);
    }
  }, [user, userLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use authService directly
      const tokens = await authService.login({ username, password });
      
      // Manually refresh user data to get the latest user_type
      await refreshUser();
      
      // Wait a bit longer for contexts to fully update
      setTimeout(() => {
        window.location.href = '/';
      }, 1000); // Increased delay to ensure contexts update
      
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid admin credentials');
      } else if (err.message?.includes('timeout')) {
        setError('Server is taking too long to respond. Please try again.');
      } else {
        setError(err.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">Admin Login</h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter admin username"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter admin password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Logging in...
                    </>
                  ) : (
                    'Login as Admin'
                  )}
                </button>
              </form>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  Note: Admin credentials are provided by system administrator
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
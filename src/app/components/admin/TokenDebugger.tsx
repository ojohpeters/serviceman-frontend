'use client';
import { useState, useEffect } from 'react';
import { authService } from '../../services/auth';

/**
 * Token Debugger Component
 * Shows current token status for debugging auth issues
 * Only visible in development or for admins
 */
export default function TokenDebugger() {
  const [tokens, setTokens] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkTokens = () => {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        setTokens({
          accessToken: accessToken ? {
            exists: true,
            length: accessToken.length,
            preview: accessToken.substring(0, 20) + '...'
          } : null,
          refreshToken: refreshToken ? {
            exists: true,
            length: refreshToken.length,
            preview: refreshToken.substring(0, 20) + '...'
          } : null,
          allKeys: Object.keys(localStorage),
          isAuthenticated: authService.isAuthenticated()
        });
      }
    };

    checkTokens();
    
    // Refresh every 5 seconds when debug is open
    if (showDebug) {
      const interval = setInterval(checkTokens, 5000);
      return () => clearInterval(interval);
    }
  }, [showDebug]);

  const handleClearTokens = () => {
    if (confirm('Clear all tokens? You will be logged out.')) {
      authService.logout();
      setTokens(null);
      window.location.reload();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {!showDebug ? (
        <button
          className="btn btn-sm btn-dark"
          onClick={() => setShowDebug(true)}
          title="Show token debugger"
        >
          <i className="bi bi-bug"></i> Debug
        </button>
      ) : (
        <div className="card shadow-lg" style={{ width: '400px' }}>
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <span><i className="bi bi-bug me-2"></i>Token Debug Info</span>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => setShowDebug(false)}
            >
              ✕
            </button>
          </div>
          <div className="card-body">
            {tokens ? (
              <>
                <div className="mb-3">
                  <strong>Access Token:</strong>
                  {tokens.accessToken ? (
                    <div className="small mt-1">
                      <div className="text-success">✅ Present</div>
                      <div className="text-muted">Length: {tokens.accessToken.length}</div>
                      <div className="text-muted font-monospace small">{tokens.accessToken.preview}</div>
                    </div>
                  ) : (
                    <div className="text-danger small">❌ Missing</div>
                  )}
                </div>

                <div className="mb-3">
                  <strong>Refresh Token:</strong>
                  {tokens.refreshToken ? (
                    <div className="small mt-1">
                      <div className="text-success">✅ Present</div>
                      <div className="text-muted">Length: {tokens.refreshToken.length}</div>
                      <div className="text-muted font-monospace small">{tokens.refreshToken.preview}</div>
                    </div>
                  ) : (
                    <div className="text-danger small">❌ Missing</div>
                  )}
                </div>

                <div className="mb-3">
                  <strong>Authentication Status:</strong>
                  <div className={`small mt-1 ${tokens.isAuthenticated ? 'text-success' : 'text-danger'}`}>
                    {tokens.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                  </div>
                </div>

                <div className="mb-3">
                  <strong>LocalStorage Keys:</strong>
                  <div className="small mt-1 text-muted">
                    {tokens.allKeys.join(', ') || 'None'}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-danger flex-fill"
                    onClick={handleClearTokens}
                  >
                    Clear Tokens
                  </button>
                  <button
                    className="btn btn-sm btn-secondary flex-fill"
                    onClick={() => {
                      setTokens(null);
                      setShowDebug(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted">Loading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


import axios from "axios";
import { refresh, logout } from "./auth";

// Create axios instance
const api = axios.create({
  baseURL: "https://serviceman-backend.onrender.com/api", 
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // Align with backend guidance (suggest ~30s)
});

// Track refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Track pending requests to prevent duplicate calls when server is down
const pendingRequests = new Map<string, Promise<any>>();

// Global flag to prevent all requests when server is consistently failing
let serverDown = false;
let serverDownUntil = 0;

// Expose server health for hooks to respect the down window
export function isServerDown(): boolean {
  return serverDown && Date.now() < serverDownUntil;
}

export function getServerDownUntil(): number {
  return serverDownUntil;
}

// Function to add subscribers to the refresh queue
function subscribeTokenRefresh(callback: (token: string) => void) {''
  refreshSubscribers.push(callback);
}

// Function to notify all subscribers when refresh is complete
function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// Request interceptor → attach access token and deduplicate requests
api.interceptors.request.use((config) => {
  // Check if server is marked as down
  if (serverDown && Date.now() < serverDownUntil) {
    // Avoid noisy logs: only log for first blocked request per second
    if ((Date.now() / 1000 | 0) % 1 === 0) {
      console.warn('🚫 [API] Server marked as down - blocking request');
    }
    return Promise.reject(new Error('Server appears to be down - please try again later'));
  }
  
  // Create a unique key for this request
  const requestKey = `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`;
  
  // Check if this exact request is already pending
  if (pendingRequests.has(requestKey)) {
    // Deduplicate silently to avoid console noise
    return pendingRequests.get(requestKey)!;
  }
  
  // Add access token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Store this request as pending - but don't store the config promise
  // Instead, we'll let the actual request go through and deduplicate at the response level
  pendingRequests.set(requestKey, Promise.resolve(config));
  
  // Clean up after a short delay to prevent immediate re-requests
  setTimeout(() => {
    pendingRequests.delete(requestKey);
  }, 1000);
  
  return config;
});

// Response interceptor → handle expired tokens and timeouts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout errors - don't retry, just fail gracefully
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      // Keep logs minimal to avoid spam
      console.warn('⏰ [API] Request timeout');
      
      // Mark server as down for 2 minutes after 3 consecutive timeouts
      consecutiveFailures++;
      if (consecutiveFailures >= 3) {
        serverDown = true;
        serverDownUntil = Date.now() + 120000; // 2 minutes
        console.warn('🚫 [API] Server marked as down for 2 minutes due to consecutive timeouts');
      }
      
      return Promise.reject(new Error('Request timeout - server may be unavailable'));
    }

    // Handle network errors - don't retry, just fail gracefully
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('🌐 [API] Network error');
      return Promise.reject(new Error('Network error - server may be down'));
    }

    // If this is a refresh token request that failed, don't try to refresh again
    if (error.response?.status === 401 && originalRequest?.url?.includes('/token/refresh/')) {
      logout(); // clear tokens
      
      // Only redirect if NOT already on a login page (prevent loop)
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAlreadyOnLoginPage = currentPath === '/auth/login' || currentPath === '/admin/login';
        
        if (!isAlreadyOnLoginPage) {
          window.location.href = "/auth/login";
        } else {
          console.log('ℹ️ [API Interceptor] Already on login page, skipping redirect');
        }
      }
      
      return Promise.reject(error);
    }

    // If this is a login request, don't intercept (let login handler deal with it)
    if (originalRequest?.url?.includes('/token/') || originalRequest?.url?.includes('/login/')) {
      return Promise.reject(error);
    }

    // if 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If we're already refreshing, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 [API Interceptor] Attempting token refresh...');
        const newTokens = await refresh(); // calls /users/token/refresh/
        
        if (newTokens?.access) {
          console.log('✅ [API Interceptor] Token refresh successful');
          isRefreshing = false;
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          
          // Notify all queued requests
          onRefreshed(newTokens.access);
          
          return api(originalRequest); // retry request
        } else {
          console.error('❌ [API Interceptor] No access token in refresh response');
          throw new Error('No access token in refresh response');
        }
      } catch (err: any) {
        console.error('❌ [API Interceptor] Token refresh failed:', err.message);
        isRefreshing = false;
        refreshSubscribers = [];
        
        // Handle NO_REFRESH_TOKEN gracefully (not a real error, just session expired)
        if (err.message === 'NO_REFRESH_TOKEN') {
          console.log('⚠️ [API Interceptor] No refresh token available');
          
          // Only redirect if NOT already on a login page (prevent loop)
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isAlreadyOnLoginPage = currentPath === '/auth/login' || currentPath === '/admin/login';
            
            if (!isAlreadyOnLoginPage) {
              console.log('🚪 [API Interceptor] Redirecting to login');
              const isAdminPath = currentPath.startsWith('/admin');
              setTimeout(() => {
                window.location.href = isAdminPath ? "/admin/login" : "/auth/login";
              }, 100);
            } else {
              console.log('ℹ️ [API Interceptor] Already on login page, skipping redirect');
            }
          }
          
          // Don't show error message - just reject silently
          return Promise.reject(error);
        }
        
        // Handle other refresh token errors
        if (err.message?.includes('refresh token') || err.response?.status === 401) {
          console.log('🚪 [API Interceptor] Logging out and redirecting to login');
          logout(); // clear tokens
          
          // Only redirect if NOT already on a login page (prevent loop)
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isAlreadyOnLoginPage = currentPath === '/auth/login' || currentPath === '/admin/login';
            
            if (!isAlreadyOnLoginPage) {
              const isAdminPath = currentPath.startsWith('/admin');
              window.location.href = isAdminPath ? "/admin/login" : "/auth/login";
            } else {
              console.log('ℹ️ [API Interceptor] Already on login page, skipping redirect');
            }
          }
        }
        
        return Promise.reject(err);
      }
    } else {
    }
    return Promise.reject(error);
  }
);

// Circuit breaker to prevent requests when server is consistently failing
let consecutiveFailures = 0;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_THRESHOLD = 2; // Reduced threshold
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 60 seconds

// Add circuit breaker check to all requests
const originalRequest = api.request;
api.request = function(config: any): any {
  const now = Date.now();
  
  // If we've had too many consecutive failures recently, block requests
  if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD && 
      (now - lastFailureTime) < CIRCUIT_BREAKER_TIMEOUT) {
    // Minimal log when breaker is open
    console.warn('🚫 [API] Circuit breaker open - blocking requests');
    return Promise.reject(new Error('Server appears to be down - please try again later'));
  }
  
  return originalRequest.call(this, config)
    .then(response => {
      // Reset circuit breaker and server down flag on success
      consecutiveFailures = 0;
      serverDown = false;
      serverDownUntil = 0;
      return response;
    })
    .catch(error => {
      // Increment failure count for timeout/network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
          error.message?.includes('timeout') || error.message?.includes('unavailable')) {
        consecutiveFailures++;
        lastFailureTime = now;
        console.warn(`🚫 [API] Circuit breaker: ${consecutiveFailures}/${CIRCUIT_BREAKER_THRESHOLD} failures`);
        
        // If we've hit the threshold, immediately block future requests
        if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
          console.warn('🚫 [API] Circuit breaker activated - server appears down');
        }
      }
      throw error;
    });
};

export default api;
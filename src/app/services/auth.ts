// ============================================
// Auth Service
// Handles all authentication-related API operations
// ============================================

import api from './api';
import {
  LoginCredentials,
  TokenResponse,
  RegisterData,
  VerifyEmailParams,
  ResendVerificationData,
  PasswordResetData,
  PasswordResetConfirmData,
  User
} from '../types/api';

// Re-export types for convenience
export type { LoginCredentials, TokenResponse, RegisterData, User };

const BASE_URL = 'https://serviceman-backend.onrender.com/api';

export interface ClientRegisterData {
  username: string;
  email: string;
  password: string;
  skill_ids?: number[];
}

// ==================== Auth Service ====================
export const authService = {
  /**
   * Login user
   * @param credentials - Username and password
   * @returns Access and refresh tokens
   */
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    console.log('📤 [Auth] Sending login request...');
    console.log('📤 [Auth] Username:', credentials.username);
    console.log('📤 [Auth] Endpoint:', 'https://serviceman-backend.onrender.com/api/users/token/');
    
    try {
      const response = await api.post('/users/token/', credentials);
      const data = response.data;
      
      console.log('📥 [Auth] Backend response received');
      console.log('📥 [Auth] Response status:', response.status);
      console.log('📥 [Auth] Response keys:', Object.keys(data));
      console.log('📥 [Auth] Has access:', !!data.access);
      console.log('📥 [Auth] Has refresh:', !!data.refresh);
      
      // Check if we got tokens
      if (!data.access) {
        console.error('❌ [Auth] No access token in response!');
        console.error('❌ [Auth] Full response:', JSON.stringify(data));
        throw new Error('No access token received from server');
      }
      
      if (!data.refresh) {
        console.warn('⚠️ [Auth] No refresh token in response!');
        console.warn('⚠️ [Auth] Will only store access token');
        console.warn('⚠️ [Auth] Full response:', JSON.stringify(data));
        // Don't throw - some backends might not return refresh token
      }
      
      console.log('🔐 [Auth] Login successful');
      console.log('🔑 [Auth] Access token length:', data.access?.length || 0);
      console.log('🔄 [Auth] Refresh token length:', data.refresh?.length || 0);
      
      // Store tokens
      if (typeof window !== 'undefined') {
        console.log('💾 [Auth] Storing tokens...');
        
        try {
          localStorage.setItem('accessToken', data.access);
          console.log('✅ [Auth] Access token stored');
          
          if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh);
            console.log('✅ [Auth] Refresh token stored');
          }
          
          // Wait a tiny bit for storage to complete
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify
          const storedAccess = localStorage.getItem('accessToken');
          const storedRefresh = localStorage.getItem('refreshToken');
          
          console.log('🔍 [Auth] Verification:');
          console.log('   Access:', storedAccess ? `✅ Stored (${storedAccess.length} chars)` : '❌ Not stored');
          console.log('   Refresh:', storedRefresh ? `✅ Stored (${storedRefresh.length} chars)` : '⚠️ Not stored');
          
          if (!storedAccess) {
            throw new Error('Failed to store access token');
          }
          
        } catch (storageError: any) {
          console.error('❌ [Auth] Storage error:', storageError);
          throw new Error('Failed to save tokens to browser storage: ' + storageError.message);
        }
      }
      
      console.log('🎉 [Auth] Login process complete!');
      return data;
      
    } catch (error: any) {
      console.error('💥 [Auth] Login failed!');
      
      if (error.response) {
        console.error('💥 [Auth] Server responded with:', error.response.status);
        console.error('💥 [Auth] Error data:', error.response.data);
        
        if (error.response.status === 401) {
          throw new Error('Invalid username or password');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data?.detail || 'Invalid login credentials');
        }
      } else if (error.request) {
        console.error('💥 [Auth] No response from server');
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      console.error('💥 [Auth] Error:', error.message);
      throw error;
    }
  },

  /**
   * Register user (generic)
   * @param userData - User registration data
   * @returns Registered user data
   */
  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },

  /**
   * Register client
   * @param clientData - Client registration data
   * @returns Registered client user data
   */
  registerClient: async (clientData: ClientRegisterData): Promise<User> => {
    const registerData: RegisterData = {
      ...clientData,
      user_type: 'CLIENT',
    };
    
    const response = await api.post('/users/register/', registerData);
    return response.data;
  },

  /**
   * Register serviceman (worker)
   * @param workerData - Serviceman registration data
   * @returns Registered serviceman user data
   */
  registerWorker: async (workerData: ClientRegisterData): Promise<User> => {
    const registerData: RegisterData = {
      ...workerData,
      user_type: 'SERVICEMAN',
      skill_ids: workerData.skill_ids,
    };
    
    const response = await api.post('/users/register/', registerData);
    return response.data;
  },

  /**
   * Refresh access token
   * @param refreshToken - Refresh token
   * @returns New access token
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post('/users/token/refresh/', { refresh: refreshToken });
    const data = response.data;
    
    // Store the new tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.access);
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }
      console.log('✅ [Auth] Tokens updated after refresh');
    }
    
    return data;
  },

  /**
   * Verify email address
   * @param uid - User ID from verification link
   * @param token - Verification token
   */
  verifyEmail: async (uid: string, token: string): Promise<{ detail: string }> => {
    const response = await api.get(`/users/verify-email/?uid=${uid}&token=${token}`);
    return response.data;
  },

  /**
   * Resend email verification
   * @param email - User email address
   */
  resendVerification: async (email: string): Promise<{ detail: string }> => {
    const response = await api.post('/users/resend-verification-email/', { email });
    return response.data;
  },

  /**
   * Request password reset
   * @param email - User email address
   */
  requestPasswordReset: async (email: string): Promise<{ detail: string }> => {
    const response = await api.post('/users/password-reset/', { email });
    return response.data;
  },

  /**
   * Confirm password reset
   * @param uid - User ID from reset link
   * @param token - Reset token
   * @param newPassword - New password
   */
  confirmPasswordReset: async (
    uid: string, 
    token: string, 
    newPassword: string
  ): Promise<{ detail: string }> => {
    const response = await api.post(`/users/password-reset-confirm/?uid=${uid}&token=${token}`, { 
      password: newPassword 
    });
    return response.data;
  },

  /**
   * Logout user (clear tokens)
   */
  logout: (): void => {
    console.log('🚪 [Auth Service] Clearing all authentication data...');
    if (typeof window !== 'undefined') {
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear any cached user data
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      
      // Clear any pending requests/payments
      localStorage.removeItem('pendingServiceRequest');
      localStorage.removeItem('pendingPaymentReference');
      localStorage.removeItem('pendingServiceRequestId');
      localStorage.removeItem('paymentType');
      
      console.log('✅ [Auth Service] All data cleared');
    }
  },

  /**
   * Get stored tokens
   * @returns Access and refresh tokens from localStorage
   */
  getTokens: (): { accessToken: string | null; refreshToken: string | null } => {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
      };
    }
    return { accessToken: null, refreshToken: null };
  },

  /**
   * Check if user is authenticated
   * @returns True if user has access token
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  },
};

// Export individual functions for backward compatibility
export const refresh = async (): Promise<TokenResponse> => {
  console.log('🔄 [Auth] Attempting to refresh token...');
  const tokens = authService.getTokens();
  
  console.log('🔍 [Auth] Checking for refresh token...');
  console.log('🔑 [Auth] Access token exists:', !!tokens.accessToken);
  console.log('🔄 [Auth] Refresh token exists:', !!tokens.refreshToken);
  
  if (!tokens.refreshToken) {
    console.warn('⚠️ [Auth] No refresh token found - this is usually OK');
    console.warn('⚠️ [Auth] Reasons: Backend may not return refresh token, or session expired');
    console.warn('⚠️ [Auth] Action: Cleaning up and will redirect to login');
    
    // Log all localStorage keys for debugging
    if (typeof window !== 'undefined') {
      console.log('🗄️ [Auth] All localStorage keys:', Object.keys(localStorage));
    }
    
    // Clean up tokens
    authService.logout();
    
    // Return a special error code that the interceptor can handle gracefully
    throw new Error('NO_REFRESH_TOKEN');
  }
  
  console.log('✅ [Auth] Refresh token found, proceeding with refresh...');
  return authService.refreshToken(tokens.refreshToken);
};

export const login = authService.login;
export const register = authService.register;
export const registerClient = authService.registerClient;
export const registerWorker = authService.registerWorker;
export const logout = authService.logout;


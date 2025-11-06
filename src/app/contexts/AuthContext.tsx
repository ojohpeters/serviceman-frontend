'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials } from '../services/auth';
import { userProfileService } from '../services/userProfile';

interface User {
  id: number;
  email: string;
  user_type: 'CLIENT' | 'SERVICEMAN' | 'ADMIN';
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokens = authService.getTokens();

        if (!tokens.accessToken) {
          console.log('🔓 [AuthContext] No access token found - user not logged in');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('🔑 [AuthContext] Access token found - verifying authentication...');
        const isAuthenticated = authService.isAuthenticated();
        
        if (isAuthenticated) {
          // Try to fetch user data if we have tokens
          try {
            console.log('👤 [AuthContext] Fetching user profile...');
            const userData = await userProfileService.getCurrentUser();
            console.log('✅ [AuthContext] User authenticated:', userData.username, `(${userData.user_type})`);
            
            setUser({
              id: userData.id,
              email: userData.email,
              user_type: userData.user_type,
              isAuthenticated: true
            });
          } catch (error: any) {
            // Only logout if it's an authentication error (401)
            if (error.response?.status === 401) {
              console.warn('⚠️ [AuthContext] Token expired or invalid - logging out');
              authService.logout();
              setUser(null);
            } else {
              // For other errors (network, 500, etc.), keep a minimal user state
              // This prevents redirect loops on network issues
              console.error('❌ [AuthContext] Failed to fetch user data (non-auth error):', error.message);
              console.log('ℹ️ [AuthContext] Keeping tokens and minimal auth state - will retry on next page load');
              
              // Set minimal user state to keep isAuthenticated true
              setUser({
                id: 0,
                email: 'loading@temp.com',
                user_type: 'CLIENT', // Default, will be updated on successful fetch
                isAuthenticated: true // Keep authenticated status
              });
            }
          }
        } else {
          console.log('🔓 [AuthContext] Not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ [AuthContext] Unexpected error during auth check:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 [AuthContext] Starting login process...');
      
      // Step 1: Login to get tokens
      const tokenResponse = await authService.login(credentials);
      console.log('✅ [AuthContext] Login successful, tokens received');
      
      // Step 2: Small delay to ensure tokens are persisted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 3: Verify at least access token is stored
      const storedTokens = authService.getTokens();
      console.log('🔍 [AuthContext] Checking tokens...');
      console.log('   Access:', storedTokens.accessToken ? '✅ Present' : '❌ Missing');
      console.log('   Refresh:', storedTokens.refreshToken ? '✅ Present' : '⚠️ Missing (may not be critical)');
      
      // Only require access token - refresh token might not be returned by some backends
      if (!storedTokens.accessToken) {
        throw new Error('Access token not found. Please try logging in again.');
      }
      
      // Step 4: Fetch user data using the new access token
      console.log('👤 [AuthContext] Fetching user data...');
      let userData;
      try {
        userData = await userProfileService.getCurrentUser();
        console.log('✅ [AuthContext] User data fetched:', userData.username, `(${userData.user_type})`);
      } catch (userError: any) {
        console.error('❌ [AuthContext] Failed to fetch user data:', userError.message);
        // If fetching user data fails, throw a more specific error
        throw new Error('Failed to verify user credentials. Please try again.');
      }
      
      // Step 5: Set user in context
      setUser({
        id: userData.id,
        email: userData.email,
        user_type: userData.user_type,
        isAuthenticated: true
      });
      
      console.log('🎉 [AuthContext] Login complete! Redirecting...');
      return { success: true };
    } catch (error: any) {
      console.error('❌ [AuthContext] Login failed:', error.message);
      console.error('❌ [AuthContext] Full error:', error);
      
      // Clear any partial tokens
      authService.logout();
      setUser(null);
      
      // Extract user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Invalid username or password')) {
        errorMessage = 'Invalid username or password. Please check your credentials.';
      } else if (error.message.includes('Cannot connect')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('Access token not found')) {
        errorMessage = 'Login failed. Please clear your browser cache and try again.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    console.log('🚪 [AuthContext] Logging out...');
    authService.logout();
    setUser(null);
    
    // Force a hard reload to clear all state
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user?.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
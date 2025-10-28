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
          setUser(null);
          setLoading(false);
          return;
        }

        const isAuthenticated = authService.isAuthenticated();
        
        if (isAuthenticated) {
          // Try to fetch user data if we have tokens
          try {
            const userData = await userProfileService.getCurrentUser();
            setUser({
              id: userData.id,
              email: userData.email,
              user_type: userData.user_type,
              isAuthenticated: true
            });
          } catch (error) {
            // If we can't fetch user data, logout
            console.error('Failed to fetch user data:', error);
            authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
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
    authService.logout();
    setUser(null);
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
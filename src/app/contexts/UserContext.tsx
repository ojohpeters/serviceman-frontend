'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { userProfileService, User, ClientProfile, ServicemanProfile } from '../services/userProfile';
import { authService } from '../services/auth';
import { useAuth } from './AuthContext'; 

interface UserContextType {
  user: User | null;
  clientProfile: ClientProfile | null;
  servicemanProfile: ServicemanProfile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateClientProfile: (data: any) => Promise<void>;
  updateServicemanProfile: (data: any) => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [servicemanProfile, setServicemanProfile] = useState<ServicemanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth(); // Now using the actual useAuth hook

  const clearError = () => setError(null);

  const loadUserData = async () => {
    const tokens = authService.getTokens();
    const hasAccess = !!tokens.accessToken;
    
    if (!hasAccess || !isAuthenticated) {
      setUser(null);
      setClientProfile(null);
      setServicemanProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userData = await userProfileService.getCurrentUser();
      setUser(userData);

      if (userData.user_type === 'CLIENT') {
        try {
          const clientData = await userProfileService.getClientProfile();
          setClientProfile(clientData);
        } catch (error) {
          console.warn('Failed to load client profile:', error);
        }
      } else if (userData.user_type === 'SERVICEMAN') {
        try {
          const servicemanData = await userProfileService.getServicemanProfile();
          setServicemanProfile(servicemanData);
        } catch (error) {
          console.warn('Failed to load serviceman profile:', error);
        }
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('token')) {
        authService.logout();
        setUser(null);
        setClientProfile(null);
        setServicemanProfile(null);
      } else {
        setError(error.message || 'Failed to load user data');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUserData();
  };

  const updateClientProfile = async (data: any) => {
    try {
      const updatedProfile = await userProfileService.updateClientProfile(data);
      setClientProfile(updatedProfile);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const updateServicemanProfile = async (data: any) => {
    try {
      const updatedProfile = await userProfileService.updateServicemanProfile(data);
      setServicemanProfile(updatedProfile);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    }
  };

  // Load user data when authentication state changes
  useEffect(() => {
    loadUserData();
  }, [isAuthenticated]);

  const value: UserContextType = {
    user,
    clientProfile,
    servicemanProfile,
    loading,
    error,
    refreshUser,
    updateClientProfile,
    updateServicemanProfile,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
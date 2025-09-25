'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on component mount
  useEffect(() => {
    console.log('[AuthContext] Initializing auth state...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // First check if we have stored user data
      const storedUser = authService.getUser();
      if (storedUser) {
        console.log('[AuthContext] Found stored user, setting initial state:', storedUser);
        setUser(storedUser);
        
        // Try to verify the session with the API
        try {
          console.log('[AuthContext] Verifying session with API...');
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            console.log('[AuthContext] Session verified, updating user:', currentUser);
            setUser(currentUser);
          }
        } catch (error) {
          console.log('[AuthContext] Session verification failed, keeping stored user');
          // Keep the stored user even if API verification fails
          // This allows offline usage with cached data
        }
      } else {
        console.log('[AuthContext] No stored user found');
      }
    } catch (error) {
      console.error('[AuthContext] Error during auth initialization:', error);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] Auth initialization complete');
    }
  };

  const login = async (email, password) => {
    console.log('[AuthContext] Login attempt for:', email);
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      console.log('[AuthContext] Login response:', response);
      
      if (response && response.user) {
        setUser(response.user);
        console.log('[AuthContext] User logged in successfully:', response.user);
        return response;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('[AuthContext] Registration attempt for:', userData.email);
    setIsLoading(true);
    
    try {
      const response = await authService.register(userData);
      console.log('[AuthContext] Registration response:', response);
      
      if (response && response.user) {
        setUser(response.user);
        console.log('[AuthContext] User registered successfully:', response.user);
        return response;
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out user');
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (userData) => {
    console.log('[AuthContext] Updating profile:', userData);
    
    try {
      const updatedUser = await authService.updateProfile(userData);
      if (updatedUser) {
        setUser(updatedUser);
        console.log('[AuthContext] Profile updated successfully:', updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error('[AuthContext] Profile update failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
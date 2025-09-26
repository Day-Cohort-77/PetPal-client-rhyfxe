'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add debugging to track user state changes
  useEffect(() => {
    console.log('[AuthContext] User state changed:', user?.email || 'null');
  }, [user]);

  // Load the user on initial render to maintain session
  useEffect(() => {
    let isActive = true;
    let hasRun = false; // Prevent multiple executions
    
    const loadUser = async () => {
      // Prevent multiple simultaneous calls
      if (hasRun) return;
      hasRun = true;
      
      try {
        console.log('[AuthContext] Loading user from session...');
        setLoading(true);
        setError(null);
        
        // Try to get the current user from the API
        const userData = await getCurrentUser();
        
        // Only update state if component is still active
        if (!isActive) return;

        console.log('[AuthContext] User data received:', userData);

        // Check if we got valid user data
        if (userData && userData.id) {
          setUser(userData);
          console.log('[AuthContext] User authenticated from session:', userData.email);
        } else {
          console.log('[AuthContext] No valid user data received');
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext] Error loading user:', err);
        
        // Only update state if component is still active
        if (!isActive) return;
        
        // Handle different types of errors
        if (err.isConnectionError) {
          setError('Unable to connect to the server. Please check your connection.');
          console.warn('[AuthContext] Connection error - server may be unavailable');
          setUser(null);
        } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          // User is not logged in - this is normal, don't show as error
          console.log('[AuthContext] User not authenticated (401)');
          setError(null);
          // Only clear user if we don't already have one (don't interfere with fresh logins)
          setUser(prevUser => {
            if (prevUser) {
              console.log('[AuthContext] Keeping existing user despite 401 (may be session timing issue)');
              return prevUser;
            }
            return null;
          });
        } else {
          setError('Failed to load user information');
          console.error('[AuthContext] Unexpected error:', err);
          setUser(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
          console.log('[AuthContext] User loading completed');
        }
      }
    };

    // Small delay to prevent rapid-fire calls
    const timer = setTimeout(loadUser, 100);
    
    return () => {
      isActive = false;
      clearTimeout(timer);
      console.log('[AuthContext] Cleanup completed');
    };
  }, []); // Empty dependency array - run only once

  // Login function
  const login = async (email, password) => {
    console.log('[AuthContext] Attempting login for:', email);
    setLoading(true);
    setError(null);

    try {
      // Call the authService login method
      const response = await authService.login(email, password);
      console.log('[AuthContext] Login response:', response);
      
      // authService.login returns { user: userData }
      const userData = response.user;
      
      // Validate user data before setting
      if (userData && userData.id) {
        setUser(userData);
        setError(null);
        console.log('[AuthContext] Login successful for user:', userData.email);
        console.log('[AuthContext] User state set, no automatic refresh to avoid interference');
        return response; // Return the full response for the login page
      } else {
        throw new Error('Invalid user data received from server');
      }
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);
      setUser(null);
      setError(err.message || 'Login failed');
      throw err; // Re-throw so the login page can handle it
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user');
      // Call the API logout endpoint to clear server-side session/cookie
      const { logout: apiLogout } = await import('../services/authService');
      await apiLogout();
    } catch (err) {
      console.error('Error during API logout:', err);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local user state regardless of API call success
      setUser(null);
      setError(null);
    }
  };

  // Update user function (for profile updates)
  const updateUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData && "id" in userData) {
        setUser(userData);
        return userData;
      } else {
        // If no valid user data, clear the user
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Error updating user:', err);
      // Clear user on error
      setUser(null);
      throw err;
    }
  };

  // Force refresh auth state (useful for checking if session is still valid)
  const refreshAuth = async () => {
    setLoading(true);
    try {
      const userData = await getCurrentUser();
      if (userData && "id" in userData) {
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Error refreshing auth:', err);
      setUser(null);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if the user has a specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // Check if the user is an admin
  const isAdmin = () => hasRole('Admin');

  // Check if the user is a veterinarian
  const isVeterinarian = () => hasRole('Veterinarian');

  // The value that will be provided to consumers of this context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    refreshAuth,
    hasRole,
    isAdmin,
    isVeterinarian,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

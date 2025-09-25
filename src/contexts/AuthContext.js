'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/authService';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get the current user directly from the API
        // The API will use the HttpOnly cookie automatically
        const userData = await getCurrentUser();

        // If we got user data, set the user
        if (userData && "id" in userData) {
          setUser(userData);
        } else {
          // If no valid user data, ensure user is null
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err.message);
        // Ensure user is null on error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (userData) => {
    console.log('Logging in user:', userData);

    // Validate user data before setting
    if (userData && userData.id) {
      setUser(userData);
      setError(null);
    } else if (userData === null) {
      // Explicit null means clear user (for logout/error cases)
      setUser(null);
      setError(null);
    } else {
      // Invalid user data
      console.error('Invalid user data provided to login:', userData);
      setUser(null);
      setError('Invalid user data received');
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
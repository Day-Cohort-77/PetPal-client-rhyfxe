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
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (userData) => {
    console.log('Logging in user:', userData);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    // The cookie will be removed by the server
  };

  // Update user function (for profile updates)
  const updateUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData && "id" in userData) {
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
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
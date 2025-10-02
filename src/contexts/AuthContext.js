// src/contexts/AuthContext.js - UNIFIED PRODUCTION VERSION
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthService from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider - Provides authentication state and methods to the entire app
 * 
 * Features:
 * - Automatic session restoration on page load
 * - Role-based access control (Admin, Veterinarian, Pet Owner)
 * - Secure login/logout with backend integration
 * - User profile management
 * - Error handling and loading states
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing authentication state...');
      setLoading(true);
      
      try {
        const currentUser = await AuthService.getCurrentUser();
        console.log('[AuthContext] Current user retrieved:', currentUser);
        setUser(currentUser);
        setError(null);
      } catch (err) {
        console.log('[AuthContext] No authenticated user found:', err.message);
        // 401 errors are expected when not logged in - don't set as error
        if (err.status === 401 || err.isAuthError || err.message.includes('not authenticated')) {
          console.log('[AuthContext] User not authenticated (this is normal for initial page load)');
          setUser(null);
          setError(null); // Clear any previous errors
        } else {
          // Only set error for actual errors (network issues, etc.)
          console.error('[AuthContext] Authentication initialization error:', err);
          setError(err.message);
          setUser(null);
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
        console.log('[AuthContext] Authentication initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('[AuthContext] Login attempt for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(email, password);
      console.log('[AuthContext] Login successful:', response);
      
      // Fetch the full user profile after successful login
      const currentUser = await AuthService.getCurrentUser();
      console.log('[AuthContext] User profile retrieved:', currentUser);
      
      setUser(currentUser);
      setError(null);
      return { user: currentUser };
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      const errorMessage = err.message || 'Failed to login';
      setError(errorMessage);
      setUser(null);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    console.log('[AuthContext] Logout initiated');
    setLoading(true);
    
    try {
      await AuthService.logout();
      console.log('[AuthContext] Logout successful');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
      // Even if logout fails, clear local state
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user function (for profile updates)
  const updateUser = async (userData) => {
    console.log('[AuthContext] Updating user:', userData);
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await AuthService.updateProfile(userData);
      console.log('[AuthContext] User updated successfully:', updatedUser);
      setUser(updatedUser);
      setError(null);
      return updatedUser;
    } catch (err) {
      console.error('[AuthContext] Update user error:', err);
      const errorMessage = err.message || 'Failed to update user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh auth state
  const refreshAuth = async () => {
    console.log('[AuthContext] Refreshing authentication state');
    setLoading(true);
    
    try {
      const currentUser = await AuthService.getCurrentUser();
      console.log('[AuthContext] Auth refreshed:', currentUser);
      setUser(currentUser);
      setError(null);
      return currentUser;
    } catch (err) {
      console.log('[AuthContext] Refresh failed - user not authenticated:', err.message);
      // 401 errors during refresh mean user session expired - this is expected
      if (err.status === 401 || err.message.includes('Unauthorized')) {
        console.log('[AuthContext] Session expired, clearing user');
        setUser(null);
        setError(null);
      } else {
        console.error('[AuthContext] Refresh error:', err);
        setError(err.message);
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if the user has a specific role
  const hasRole = (role) => {
    if (!user || !user.roles) {
      console.log('[AuthContext] hasRole: No user or roles available');
      return false;
    }
    
    const hasRoleResult = user.roles.includes(role);
    console.log(`[AuthContext] hasRole(${role}):`, hasRoleResult);
    return hasRoleResult;
  };

  // Check if the user is an admin
  const isAdmin = () => {
    const result = hasRole('Admin');
    console.log('[AuthContext] isAdmin:', result);
    return result;
  };

  // Check if the user is a veterinarian
  const isVeterinarian = () => {
    const result = hasRole('Veterinarian');
    console.log('[AuthContext] isVeterinarian:', result);
    return result;
  };

  // Check if the user is a pet owner
  const isPetOwner = () => {
    const result = hasRole('PetOwner');
    console.log('[AuthContext] isPetOwner:', result);
    return result;
  };

  // Check if user can edit a specific pet
  const canEditPet = (petOwnerId) => {
    if (!user) return false;
    
    // Admins can edit any pet
    if (isAdmin()) return true;
    
    // Pet owners can edit their own pets
    if (user.id === petOwnerId) return true;
    
    return false;
  };

  // Check if user can manage medications (Admins and Veterinarians only)
  const canManageMedications = () => {
    return isAdmin() || isVeterinarian();
  };

  const contextValue = {
    user,
    loading,
    error,
    isInitialized,
    login,
    logout,
    updateUser,
    refreshAuth,
    hasRole,
    isAdmin,
    isVeterinarian,
    isPetOwner,
    canEditPet,
    canManageMedications,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

// src/contexts/AuthContext.js - TESTING VERSION WITH MANUAL USER
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false for testing
  const [error, setError] = useState(null);

  // TESTING: Manually set a fake user for medication testing
  useEffect(() => {
    console.log('[AuthContext] TESTING MODE: Setting fake user for medication testing');
    setUser({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    });
    setLoading(false);
    
    // Also add mock data to localStorage for testing
    const mockPets = [
      {
        id: 1,
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 65,
        ownerId: 1
      },
      {
        id: 2, 
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Persian',
        age: 2,
        weight: 12,
        ownerId: 1
      }
    ];
    
    const mockMedications = [
      {
        id: 1,
        petId: 1,
        name: 'Heartgard Plus',
        dosage: '1 chew',
        frequency: 'Monthly',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        instructions: 'Give with food'
      },
      {
        id: 2,
        petId: 2,
        name: 'Revolution',
        dosage: '0.25ml',
        frequency: 'Monthly',
        startDate: '2025-01-15',
        endDate: '2025-12-15',
        instructions: 'Apply to back of neck'
      }
    ];
    
    localStorage.setItem('mockPets', JSON.stringify(mockPets));
    localStorage.setItem('mockMedications', JSON.stringify(mockMedications));
    console.log('[AuthContext] TESTING MODE: Mock data set in localStorage');
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('[AuthContext] TESTING: Login called with:', email);
    // For testing, just set a fake user
    setUser({
      id: 1,
      email: email,
      firstName: 'Test',
      lastName: 'User'
    });
    setError(null);
    return { user: { id: 1, email, firstName: 'Test', lastName: 'User' } };
  };

  // Logout function
  const logout = async () => {
    console.log('[AuthContext] TESTING: Logout called');
    setUser(null);
    setError(null);
  };

  // Update user function (for profile updates)
  const updateUser = async () => {
    console.log('[AuthContext] TESTING: updateUser called');
    return user;
  };

  // Force refresh auth state
  const refreshAuth = async () => {
    console.log('[AuthContext] TESTING: refreshAuth called');
    return user;
  };

  // Check if the user has a specific role
  const hasRole = (role) => {
    console.log('[AuthContext] TESTING: hasRole called with:', role);
    return true; // For testing, assume user has all roles
  };

  const contextValue = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    refreshAuth,
    hasRole,
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
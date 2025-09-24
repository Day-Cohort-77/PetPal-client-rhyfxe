'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import settingsService from '../services/settingsService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize theme based on user authentication state
  useEffect(() => {
    const initTheme = async () => {
      try {
        setIsLoading(true);

        if (currentUser) {
          // User is logged in - load their preferences from API
          console.log('Loading theme preferences for user:', currentUser.id);
          const preferences = await settingsService.getThemePreferences(currentUser.id);
          console.log('Loaded preferences:', preferences);
          setThemeSettings(preferences);
          settingsService.applyTheme(preferences);
        } else {
          // No user - use default light theme (forced light mode)
          const defaultTheme = {
            theme: 'light',
            accentColor: 'blue',
            fontSize: 'medium',
            useSystemPreference: false, // Force light mode for anonymous users
          };

          setThemeSettings(defaultTheme);
          settingsService.applyTheme(defaultTheme);
        }

        setError(null);
      } catch (err) {
        console.error('Error initializing theme:', err);
        setError('Failed to load theme preferences');

        // Fall back to default light theme on error
        const fallbackTheme = {
          theme: 'light',
          accentColor: 'blue',
          fontSize: 'medium',
          useSystemPreference: false, // Always force light on error
        };

        setThemeSettings(fallbackTheme);
        settingsService.applyTheme(fallbackTheme);
      } finally {
        setIsLoading(false);
      }
    };

    initTheme();
  }, [currentUser]); // Re-run when user changes (login/logout)

  // Set up system theme listener
  useEffect(() => {
    const cleanup = settingsService.setupSystemThemeListener((updatedPrefs) => {
      setThemeSettings(updatedPrefs);
    }, currentUser?.id);

    return cleanup;
  }, [currentUser?.id]); // Re-setup listener when user changes

  // Update theme function
  const updateTheme = async (newSettings) => {
    try {
      setThemeSettings(newSettings);

      // Apply immediately for real-time preview
      settingsService.applyTheme(newSettings);

      // Only save to API if user is logged in
      if (currentUser) {
        console.log('Saving theme preferences for user:', currentUser.id, newSettings);
        await settingsService.updateThemePreferences(newSettings, currentUser.id);
        console.log('Theme preferences saved successfully');
      } else {
        console.log('No user logged in, saving locally only');
        // For anonymous users, just save locally for session continuity
        settingsService.setLocalThemePreferences(newSettings);
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating theme:', err);

      // Revert on error
      if (themeSettings) {
        setThemeSettings(themeSettings);
        settingsService.applyTheme(themeSettings);
      }

      return { success: false, error: err.message };
    }
  };

  // Refresh theme from server (only if logged in)
  const refreshTheme = async () => {
    try {
      if (currentUser) {
        const preferences = await settingsService.getThemePreferences(currentUser.id);
        setThemeSettings(preferences);
        settingsService.applyTheme(preferences);
      }
      return { success: true };
    } catch (err) {
      console.error('Error refreshing theme:', err);
      return { success: false, error: err.message };
    }
  };

  // Get current theme values
  const getCurrentTheme = () => {
    if (!themeSettings) return 'light';

    if (themeSettings.useSystemPreference) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return themeSettings.theme || 'light';
  };

  // Handle user logout - reset to anonymous theme
  const handleLogout = (userId) => {
    try {
      // Clear user-specific theme data
      if (userId) {
        settingsService.clearUserThemeData(userId);
      }

      // Reset to default theme (light mode, blue accent)
      const defaultTheme = settingsService.resetToDefaultTheme();
      setThemeSettings(defaultTheme);

    } catch (error) {
      console.error('Error handling theme logout:', error);
    }
  };

  // Function to update current user (called by AuthContext or components)
  const setUser = (user) => {
    setCurrentUser(user);
  };

  const value = {
    themeSettings,
    isLoading,
    error,
    updateTheme,
    refreshTheme,
    getCurrentTheme,
    handleLogout,
    setUser, // Allow external components to update user
    currentUser,
    // Helper functions
    isSystemTheme: themeSettings?.useSystemPreference || false,
    isDark: getCurrentTheme() === 'dark',
    accentColor: themeSettings?.accentColor || 'blue',
    fontSize: themeSettings?.fontSize || 'medium',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
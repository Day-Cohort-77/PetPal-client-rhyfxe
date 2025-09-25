import apiService from './apiService';

// Local storage keys for theme preferences (fallback when offline)
const THEME_STORAGE_KEY_PREFIX = 'petpal_theme_preferences';
const ANONYMOUS_THEME_KEY = 'petpal_anonymous_theme';

// Default theme preferences (always light mode)
const DEFAULT_THEME_PREFERENCES = {
  theme: 'light',
  accentColor: 'blue',
  fontSize: 'medium',
  useSystemPreference: false, // Force light mode by default
};

// Get user-specific storage key
const getStorageKey = (userId = null) => {
  return userId ? `${THEME_STORAGE_KEY_PREFIX}_${userId}` : ANONYMOUS_THEME_KEY;
};

// Get theme preferences from localStorage (fallback)
const getLocalThemePreferences = (userId = null) => {
  try {
    const storageKey = getStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : DEFAULT_THEME_PREFERENCES;
  } catch (error) {
    console.error('Error reading theme preferences from localStorage:', error);
    return DEFAULT_THEME_PREFERENCES;
  }
};

// Save theme preferences to localStorage (fallback)
const setLocalThemePreferences = (preferences, userId = null) => {
  try {
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving theme preferences to localStorage:', error);
  }
};

// Get user's theme preferences from API
export const getThemePreferences = async (userId = null) => {
  try {
    console.log('Fetching theme preferences from API for userId:', userId);
    const response = await apiService.get('/settings/theme');
    console.log('API response:', response);

    // Handle wrapped API response
    if (response && response.success) {
      const preferences = response.preferences;

      // If no preferences exist (first time user), use defaults
      if (!preferences) {
        console.log('No preferences found, using defaults');
        const defaultPrefs = DEFAULT_THEME_PREFERENCES;
        setLocalThemePreferences(defaultPrefs, userId);
        return defaultPrefs;
      }

      // Save actual preferences to localStorage and return
      console.log('Found preferences:', preferences);
      setLocalThemePreferences(preferences, userId);
      return preferences;
    }

    // If no response (e.g., first time user), return defaults
    console.log('No API response, returning defaults');
    return DEFAULT_THEME_PREFERENCES;
  } catch (error) {
    console.error('Error fetching theme preferences:', error);

    // Fall back to localStorage if API fails
    const localPrefs = getLocalThemePreferences(userId);
    console.log('Using local preferences fallback:', localPrefs);
    return localPrefs;
  }
};

// Update user's theme preferences via API
export const updateThemePreferences = async (preferences, userId = null) => {
  try {
    // Validate input
    const validatedPreferences = {
      theme: preferences.theme || DEFAULT_THEME_PREFERENCES.theme,
      accentColor: preferences.accentColor || DEFAULT_THEME_PREFERENCES.accentColor,
      fontSize: preferences.fontSize || DEFAULT_THEME_PREFERENCES.fontSize,
      useSystemPreference: Boolean(preferences.useSystemPreference),
    };

    console.log('Sending to API:', validatedPreferences);
    const response = await apiService.put('/settings/theme', validatedPreferences);
    console.log('API update response:', response);

    // Handle wrapped response
    if (response && response.success && response.preferences) {
      // Save the returned preferences to localStorage
      setLocalThemePreferences(response.preferences, userId);
      return response.preferences;
    }

    // Fallback: save what we sent
    setLocalThemePreferences(validatedPreferences, userId);
    return validatedPreferences;
  } catch (error) {
    console.error('Error updating theme preferences via API:', error);

    // If API fails, at least save locally
    setLocalThemePreferences(preferences, userId);

    // Re-throw the error so the UI can handle it
    throw error;
  }
};

// Apply theme to the document (for real-time updates)
export const applyTheme = (preferences) => {
  try {
    const { theme, accentColor, fontSize, useSystemPreference } = preferences;

    // Handle system preference
    let actualTheme = theme;
    if (useSystemPreference) {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to document root
    const root = document.documentElement;

    // Set theme class
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${actualTheme}`);

    // Set CSS custom properties for accent color and font size
    root.style.setProperty('--accent-color', `var(--${accentColor}-9)`);
    root.style.setProperty('--accent-color-hover', `var(--${accentColor}-10)`);
    root.style.setProperty('--accent-color-light', `var(--${accentColor}-3)`);

    // Set font size scale
    const fontSizeScales = {
      small: '0.875',
      medium: '1',
      large: '1.125',
    };
    const scale = fontSizeScales[fontSize] || '1';
    root.style.setProperty('--font-size-scale', scale);

    // Save to localStorage (userId will be passed from context)
    // Note: This function will be called with userId from the theme context

  } catch (error) {
    console.error('Error applying theme:', error);
  }
};

// Initialize theme on app startup
export const initializeTheme = async (userId = null) => {
  try {
    // First try to get preferences from API (only if userId provided)
    const preferences = userId ? await getThemePreferences(userId) : getLocalThemePreferences(userId);

    // Apply the theme
    applyTheme(preferences);

    return preferences;
  } catch (error) {
    console.error('Error initializing theme:', error);

    // Fall back to localStorage
    const localPreferences = getLocalThemePreferences(userId);
    applyTheme(localPreferences);

    return localPreferences;
  }
};

// Listen for system theme changes when useSystemPreference is enabled
export const setupSystemThemeListener = (onThemeChange, userId = null) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (event) => {
    // Get current preferences for the specific user
    const currentPreferences = getLocalThemePreferences(userId);

    // Only respond if user has system preference enabled
    if (currentPreferences.useSystemPreference) {
      const systemTheme = event.matches ? 'dark' : 'light';
      const updatedPreferences = {
        ...currentPreferences,
        theme: systemTheme,
      };

      // Apply the theme
      applyTheme(updatedPreferences);

      // Notify the component
      if (onThemeChange) {
        onThemeChange(updatedPreferences);
      }
    }
  };

  // Add listener
  mediaQuery.addEventListener('change', handleChange);

  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
};

// Clear user-specific theme data (for logout) - only clear specific user's data
export const clearUserThemeData = (userId) => {
  try {
    if (userId) {
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
      console.log(`Cleared theme data for user ${userId}`);
    }
  } catch (error) {
    console.error('Error clearing user theme data:', error);
  }
};

// Reset to default theme (for logout) - only clear anonymous data
export const resetToDefaultTheme = () => {
  const defaultTheme = {
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
    useSystemPreference: false, // Force light mode on logout
  };

  // Only clear anonymous theme data, preserve user-specific data
  localStorage.removeItem(ANONYMOUS_THEME_KEY);

  // Set the default theme for anonymous session
  setLocalThemePreferences(defaultTheme);
  applyTheme(defaultTheme);

  console.log('Reset to default theme:', defaultTheme);
  return defaultTheme;
};

// Export a default object with all methods
const settingsService = {
  getThemePreferences,
  updateThemePreferences,
  applyTheme,
  initializeTheme,
  setupSystemThemeListener,
  getLocalThemePreferences,
  setLocalThemePreferences,
  clearUserThemeData,
  resetToDefaultTheme,
};

export default settingsService;
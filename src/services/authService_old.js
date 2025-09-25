import { get, post, put } from './apiService';

// Register a new user
export const register = async (userData) => {
  return post('/auth/register', userData);
};

// Login a user
export const login = async (credentials) => {
  try {
    console.log('Attempting login with credentials:', credentials);
    const response = await post('/auth/login', credentials);
    console.log('Login response:', response);
    
    // The API uses cookie-based auth, so we just need to store the user data
    if (response && response.email) {
      // Store user info in localStorage for persistence across page reloads
      localStorage.setItem('user', JSON.stringify(response));
      console.log('Stored user data in localStorage');
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Logout the current user
export const logout = async () => {
  try {
    await post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear localStorage, even if the API call fails
    localStorage.removeItem('user');
  }
};

// Get the current user's profile
export const getCurrentUser = async () => {
  try {
    return await get('/auth/me');
  } catch (error) {
    // If there's an error (like 401 Unauthorized), return null
    console.error('Error getting current user:', error);
    return null;
  }
};

// Update the current user's profile
export const updateUserProfile = async (profileData) => {
  try {
    return await put('/auth/profile', profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error; // Re-throw to handle in components
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserProfile,
};

export default authService;
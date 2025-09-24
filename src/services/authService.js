import { get, post, put } from './apiService';

// Register a new user
export const register = async (userData) => {
  return post('/auth/register', userData);
};

// Login a user
export const login = async (credentials) => {
  return post('/auth/login', credentials);
};

// Logout the current user
export const logout = async () => {
  return post('/auth/logout');
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
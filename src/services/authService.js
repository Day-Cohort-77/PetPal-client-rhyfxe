import apiService from './apiService';

class AuthService {
  // User login
  async login(email, password) {
    console.log('[AuthService] Attempting login for:', email);
    
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });
      
      console.log('[AuthService] Login response:', response);
      
      if (response) {
        // Store user data (API uses cookies for authentication)
        localStorage.setItem('user', JSON.stringify(response));
        console.log('[AuthService] Login successful, user stored');
        return { user: response }; // Wrap in object for consistency
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  // User registration
  async register(userData) {
    console.log('[AuthService] Attempting registration for:', userData.email);
    
    try {
      const response = await apiService.post('/auth/register', userData);
      
      console.log('[AuthService] Registration response:', response);
      
      if (response) {
        // Store user data (API uses cookies for authentication)
        localStorage.setItem('user', JSON.stringify(response));
        console.log('[AuthService] Registration successful, user stored');
        return { user: response }; // Wrap in object for consistency
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser() {
    console.log('[AuthService] Fetching current user profile');
    
    try {
      const response = await apiService.get('/auth/me');
      console.log('[AuthService] Current user response:', response);
      
      if (response) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response));
        console.log('[AuthService] Updated stored user data');
        return response;
      }
      return null;
    } catch (error) {
      console.error('[AuthService] Failed to fetch current user:', error);
      
      // If we get a 401, the session is invalid
      if (error.message.includes('401')) {
        this.logout();
      }
      
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData) {
    console.log('[AuthService] Updating user profile:', userData);
    
    try {
      const response = await apiService.put('/auth/profile', userData);
      console.log('[AuthService] Profile update response:', response);
      
      if (response) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response));
        console.log('[AuthService] Updated stored user data after profile update');
        return response;
      }
      return null;
    } catch (error) {
      console.error('[AuthService] Profile update failed:', error);
      throw error;
    }
  }

  // User logout
  logout() {
    console.log('[AuthService] Logging out user');
    
    // Try to call logout API endpoint
    try {
      apiService.post('/auth/logout');
    } catch (error) {
      console.log('[AuthService] Logout API call failed, continuing with local cleanup');
    }
    
    // Clear stored user data
    localStorage.removeItem('user');
    
    console.log('[AuthService] Cleared stored user data');
    
    // Redirect to login page
    window.location.href = '/auth/login';
  }

  // Check if user is authenticated
  isAuthenticated() {
    const user = this.getUser();
    const hasUser = !!user;
    console.log('[AuthService] Is authenticated:', hasUser);
    return hasUser;
  }

  // Get stored user data
  getUser() {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log('[AuthService] Retrieved stored user:', user);
        return user;
      }
      console.log('[AuthService] No stored user found');
      return null;
    } catch (error) {
      console.error('[AuthService] Error parsing stored user:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
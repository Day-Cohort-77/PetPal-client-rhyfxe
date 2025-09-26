// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get headers for API requests
const getHeaders = () => {
  console.log('[ApiService] Getting headers for API request');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  console.log('[ApiService] Headers prepared (using cookies for auth):', headers);
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log(`[ApiService] Handling response with status: ${response.status}`);
  
  // Check if the response is ok (status in the range 200-299)
  if (!response.ok) {
<<<<<<< HEAD
    // If the response is 401 Unauthorized
    if (response.status === 401) {
      // Only redirect if we're not on a login/auth page and not making a login request
      const isAuthPage = window.location.pathname.includes('/auth/');
      const isLoginRequest = response.url.includes('/auth/login');

      if (!isAuthPage && !isLoginRequest) {
        window.location.href = '/auth/login';
        return null; // Don't throw error after redirect
=======
    // If the response is 401 Unauthorized, redirect to login
    if (response.status === 401) {
      console.log('[ApiService] 401 Unauthorized - redirecting to login');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
>>>>>>> 91989ec (reviewed and added extra cookies authentication, as well as a view medications button for pet view that navigated to medications view)
      }

      // For login requests or auth pages, throw an error with proper context
      let errorData;
      try {
        errorData = await response.json();
      } catch (error) {
        errorData = { message: 'Unauthorized' };
      }

      throw new Error(
        `API Error ${response.status}: ${errorData.message || 'Unauthorized'}`
      );
    }

    // Try to parse the error response
    let errorData;
    try {
      errorData = await response.json();
      console.log('[ApiService] Error response data:', errorData);
    } catch (error) {
      console.log('[ApiService] Failed to parse error response, using statusText');
      errorData = { message: response.statusText };
    }

    // Throw an error with the status and message
    const errorMessage = `API Error ${response.status}: ${errorData.message || 'Unknown error'}`;
    console.error('[ApiService]', errorMessage);
    throw new Error(errorMessage);
  }

  // If the response is 204 No Content, return null
  if (response.status === 204) {
    console.log('[ApiService] 204 No Content response');
    return null;
  }

  // Otherwise, parse the JSON response
  const responseData = await response.json();
  console.log('[ApiService] Response data:', responseData);
  return responseData;
};

// GET request
export const get = async (endpoint, options = {}) => {
  console.log(`[ApiService] GET request to: ${endpoint}`);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`[ApiService] GET request failed:`, error);
    throw error;
  }
};

// POST request
export const post = async (endpoint, data, options = {}) => {
  console.log(`[ApiService] POST request to: ${endpoint}`, data);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(data),
      ...options,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`[ApiService] POST request failed:`, error);
    throw error;
  }
};

// PUT request
export const put = async (endpoint, data, options = {}) => {
  console.log(`[ApiService] PUT request to: ${endpoint}`, data);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(data),
      ...options,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`[ApiService] PUT request failed:`, error);
    throw error;
  }
};

// DELETE request
export const del = async (endpoint, options = {}) => {
  console.log(`[ApiService] DELETE request to: ${endpoint}`);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`[ApiService] DELETE request failed:`, error);
    throw error;
  }
};

// Export the API service object
const apiService = {
  get,
  post,
  put,
  delete: del,
  getHeaders,
  baseURL: API_BASE_URL,
};

export default apiService;
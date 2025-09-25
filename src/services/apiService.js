// Base URL for the API
const API_BASE_URL = 'http://localhost:5000';

// Default headers for all requests
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if the response is ok (status in the range 200-299)
  if (!response.ok) {
    // If the response is 401 Unauthorized
    if (response.status === 401) {
      // Only redirect if we're not on a login/auth page and not making a login request
      const isAuthPage = window.location.pathname.includes('/auth/');
      const isLoginRequest = response.url.includes('/auth/login');

      if (!isAuthPage && !isLoginRequest) {
        window.location.href = '/auth/login';
        return null; // Don't throw error after redirect
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
    } catch (error) {
      errorData = { message: response.statusText };
    }

    // Throw an error with the status and message
    throw new Error(
      `API Error ${response.status}: ${errorData.message || 'Unknown error'}`
    );
  }

  // If the response is 204 No Content, return null
  if (response.status === 204) {
    return null;
  }

  // Otherwise, parse the JSON response
  return response.json();
};

// GET request
export const get = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies in the request
    ...options,
  });

  return handleResponse(response);
};

// POST request
export const post = async (endpoint, data, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify(data),
    ...options,
  });

  return handleResponse(response);
};

// PUT request
export const put = async (endpoint, data, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies in the request
    body: JSON.stringify(data),
    ...options,
  });

  return handleResponse(response);
};

// DELETE request
export const del = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies in the request
    ...options,
  });

  return handleResponse(response);
};

// Export a default object with all methods
const apiService = {
  get,
  post,
  put,
  delete: del,
};

export default apiService;
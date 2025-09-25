// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get headers for API requests
  getHeaders() {
    console.log('[ApiService] Getting headers for API request');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('[ApiService] Added Authorization header with token');
    } else {
      console.log('[ApiService] No token found in localStorage');
    }
    
    console.log('[ApiService] Headers prepared:', headers);
    return headers;
  }

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if the response is ok (status in the range 200-299)
  if (!response.ok) {
    // If the response is 401 Unauthorized, redirect to login
    // But only if we're not already on the login page
    if (response.status === 401) {
      // Check if we're already on the login page to prevent redirect loops
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
      return null;
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
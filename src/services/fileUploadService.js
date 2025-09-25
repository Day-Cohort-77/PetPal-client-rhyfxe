// Base URL for the API
const API_BASE_URL = 'http://localhost:5000';

// Upload pet image
export const uploadPetImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/pet-image`, {
    method: 'POST',
    credentials: 'include', // Include cookies for authentication
    body: formData, // Don't set Content-Type header - let browser set it with boundary
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (error) {
      errorData = { message: response.statusText };
    }

    throw new Error(
      `Upload Error ${response.status}: ${errorData.message || 'Unknown error'}`
    );
  }

  return response.json();
};
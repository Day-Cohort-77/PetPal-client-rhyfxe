// Base URL for the API
<<<<<<< HEAD
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
=======
const API_BASE_URL = 'http://localhost:5000';
>>>>>>> 196aa41 (Same reasons)

// Upload pet image
export const uploadPetImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

<<<<<<< HEAD
  const response = await fetch(`${API_BASE_URL}/api/upload/pet-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
=======
  const response = await fetch(`${API_BASE_URL}/upload/pet-image`, {
    method: 'POST',
    credentials: 'include', // Include cookies for authentication
    body: formData, // Don't set Content-Type header - let browser set it with boundary
>>>>>>> 196aa41 (Same reasons)
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
<<<<<<< HEAD
};

// Helper function to validate file before upload
export const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    throw new Error('No file selected');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
  }

  return true;
};

// Helper to get full image URL for display
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
=======
>>>>>>> 196aa41 (Same reasons)
};
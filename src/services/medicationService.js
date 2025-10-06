import { get, post, put, del } from './apiService';

// Get all medications for a pet
export const getMedicationsForPet = async (petId, options = {}) => {
  console.log('getMedicationsForPet called with petId:', petId, 'type:', typeof petId, 'options:', options);
  
  if (!petId) {
    throw new Error('Pet ID is required');
  }
  
  // Convert petId to integer if it's a string number
  const numericPetId = typeof petId === 'string' ? parseInt(petId, 10) : petId;
  console.log('Converted petId to:', numericPetId, 'type:', typeof numericPetId);
  
  const params = new URLSearchParams();
  
  // Add query parameters for filtering and sorting
  if (options.isActive !== undefined && options.isActive !== null) {
    params.append('isActive', options.isActive.toString());
  }
  
  if (options.medicationName) {
    params.append('medicationName', options.medicationName);
  }
  
  if (options.sortBy) {
    params.append('sortBy', options.sortBy);
  }
  
  if (options.sortOrder) {
    params.append('sortOrder', options.sortOrder);
  }
  
  const endpoint = `/medications/pet/${numericPetId}${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('Making request to endpoint:', endpoint);
  console.log('Full URL would be:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`);
  
  try {
    const response = await get(endpoint);
    console.log('Medications response:', response);
    console.log('Response type:', typeof response, 'Array?', Array.isArray(response));
    if (Array.isArray(response)) {
      console.log('Response length:', response.length);
      if (response.length > 0) {
        console.log('First medication sample:', response[0]);
      }
    }
    return response;
  } catch (error) {
    console.error('Error fetching medications:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific error cases for better UX
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in to view medications.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Insufficient permissions to view medications.');
    } else if (error.message.includes('404')) {
      throw new Error('Pet not found or no medications available for this pet.');
    }
    
    throw error;
  }
};

// Get specific medication details
export const getMedicationById = async (id) => {
  try {
    return await get(`/medications/${id}`);
  } catch (error) {
    if (error.message.includes('403')) {
      throw new Error('Access denied. Insufficient permissions to view medication.');
    } else if (error.message.includes('404')) {
      throw new Error('Medication not found.');
    }
    throw error;
  }
};

// Add new medication (Veterinarian/Admin only)
export const createMedication = async (medicationData) => {
  try {
    return await post('/medications', medicationData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can prescribe medications.');
    }
    throw error;
  }
};

// Update medication (Veterinarian/Admin only)
export const updateMedication = async (id, medicationData) => {
  try {
    return await put(`/medications/${id}`, medicationData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can modify medications.');
    } else if (error.message.includes('404')) {
      throw new Error('Medication not found.');
    }
    throw error;
  }
};

// Delete medication (Veterinarian/Admin only)
export const deleteMedication = async (id) => {
  try {
    return await del(`/medications/${id}`);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can remove medications.');
    } else if (error.message.includes('404')) {
      throw new Error('Medication not found.');
    }
    throw error;
  }
};
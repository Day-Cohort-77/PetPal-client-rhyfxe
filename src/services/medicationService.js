import { get, post, put, del } from './apiService';

// Get all medications for a pet
export const getMedicationsForPet = async (petId, filters = {}) => {
  console.log('getMedicationsForPet called with petId:', petId, 'filters:', filters);
  
  if (!petId) {
    throw new Error('Pet ID is required');
  }
  
  const params = new URLSearchParams();
  
  if (filters.isActive !== undefined && filters.isActive !== null) {
    params.append('isActive', filters.isActive.toString());
  }
  
  const endpoint = `/medications/${petId}${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('Making request to endpoint:', endpoint);
  
  try {
    const response = await get(endpoint);
    console.log('Medications response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching medications:', error);
    throw error;
  }
};

// Get specific medication details
export const getMedicationById = async (id) => {
  return await get(`/medications/${id}`);
};

// Add new medication  
export const addMedication = async (petId, medicationData) => {
  return await post(`/medications`, medicationData);
};

// Update medication
export const updateMedication = async (id, medicationData) => {
  return await put(`/medications/${id}`, medicationData);
};

// Delete medication
export const deleteMedication = async (id) => {
  return await del(`/medications/${id}`);
};
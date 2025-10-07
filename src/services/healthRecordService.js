import { get, post, put, del } from './apiService';

// Get all health records for a pet
export const getPetHealthRecords = async (petId) => {
  try {
    return await get(`/pets/${petId}/healthrecords`);
  } catch (error) {
    if (error.message.includes('403')) {
      throw new Error('Access denied. You can only view health records for your own pets.');
    } else if (error.message.includes('404')) {
      throw new Error('Pet not found.');
    }
    throw error;
  }
};

// Get a specific health record by ID
export const getHealthRecordById = async (recordId) => {
  try {
    return await get(`/healthrecords/${recordId}`);
  } catch (error) {
    if (error.message.includes('403')) {
      throw new Error('Access denied. You can only view health records for your own pets.');
    } else if (error.message.includes('404')) {
      throw new Error('Health record not found.');
    }
    throw error;
  }
};

// Create a new health record (Veterinarian/Admin only for vaccinations)
export const createHealthRecord = async (recordData) => {
  try {
    return await post('/healthrecords', recordData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can add health records.');
    }
    throw error;
  }
};

// Update a health record (Veterinarian/Admin only for vaccinations)
export const updateHealthRecord = async (recordId, recordData) => {
  try {
    return await put(`/healthrecords/${recordId}`, recordData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can modify health records.');
    } else if (error.message.includes('404')) {
      throw new Error('Health record not found.');
    }
    throw error;
  }
};

// Delete a health record (Veterinarian/Admin only for vaccinations)
export const deleteHealthRecord = async (recordId) => {
  try {
    return await del(`/healthrecords/${recordId}`);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can remove health records.');
    } else if (error.message.includes('404')) {
      throw new Error('Health record not found.');
    }
    throw error;
  }
};

export default {
  getPetHealthRecords,
  getHealthRecordById,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
};
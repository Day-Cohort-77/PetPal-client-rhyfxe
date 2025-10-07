import { get, post, put, del } from './apiService';

// Get all vaccination records for a pet
export const getPetVaccinations = async (petId) => {
  try {
    return await get(`/vaccinations/pet/${petId}`);
  } catch (error) {
    if (error.message.includes('403')) {
      throw new Error('Access denied. You can only view vaccination records for your own pets.');
    } else if (error.message.includes('404')) {
      throw new Error('Pet not found.');
    }
    throw error;
  }
};

// Get a specific vaccination record by ID
export const getVaccinationById = async (vaccinationId) => {
  try {
    return await get(`/vaccinations/${vaccinationId}`);
  } catch (error) {
    if (error.message.includes('403')) {
      throw new Error('Access denied. You can only view vaccination records for your own pets.');
    } else if (error.message.includes('404')) {
      throw new Error('Vaccination record not found.');
    }
    throw error;
  }
};

// Create a new vaccination record (Veterinarian/Admin only)
export const createVaccination = async (vaccinationData) => {
  try {
    return await post('/vaccinations', vaccinationData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can add vaccination records.');
    } else if (error.message.includes('400')) {
      throw new Error('Invalid vaccination data. Please check all required fields.');
    }
    throw error;
  }
};

// Update a vaccination record (Veterinarian/Admin only)
export const updateVaccination = async (vaccinationId, vaccinationData) => {
  try {
    return await put(`/vaccinations/${vaccinationId}`, vaccinationData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can modify vaccination records.');
    } else if (error.message.includes('404')) {
      throw new Error('Vaccination record not found.');
    } else if (error.message.includes('400')) {
      throw new Error('Invalid vaccination data. Please check all required fields.');
    }
    throw error;
  }
};

// Delete a vaccination record (Veterinarian/Admin only)
export const deleteVaccination = async (vaccinationId) => {
  try {
    return await del(`/vaccinations/${vaccinationId}`);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can remove vaccination records.');
    } else if (error.message.includes('404')) {
      throw new Error('Vaccination record not found.');
    }
    throw error;
  }
};

export default {
  getPetVaccinations,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination,
};
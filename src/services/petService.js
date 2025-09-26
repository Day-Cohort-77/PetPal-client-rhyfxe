import { get, post, put, del } from './apiService';

// Get all pets (admin only)
export const getAllPets = async () => {
  return get('/pets');
};

// Get pets for the current user
export const getUserPets = async () => {
  try {
    console.log('getUserPets: Making API call to /user/pets');
    const response = await get('/user/pets');
    console.log('getUserPets: API response:', response);
    return response;
  } catch (error) {
    console.error('getUserPets: API call failed:', error);
    
    // For testing mode, provide helpful logging
    if (error.message?.includes('404')) {
      console.log('getUserPets: User not found (404) - this is expected for testing with fake user');
    } else if (error.message?.includes('401')) {
      console.log('getUserPets: Unauthorized (401) - user may not be properly authenticated');
    }
    
    throw error;
  }
};

// Get a specific pet by ID
export const getPetById = async (petId) => {
  return get(`/pets/${petId}`);
};

// Create a new pet
export const createPet = async (petData) => {
  return post('/pets', petData);
};

// Update a pet
export const updatePet = async (petId, petData) => {
  return put(`/pets/${petId}`, petData);
};

// Delete a pet
export const deletePet = async (petId) => {
  return del(`/pets/${petId}`);
};

// Add an owner to a pet
export const addPetOwner = async (petId, ownerData) => {
  return post(`/pets/${petId}/owners`, ownerData);
};

// Remove an owner from a pet
export const removePetOwner = async (petId, ownerId) => {
  return del(`/pets/${petId}/owners/${ownerId}`);
};

export default {
  getAllPets,
  getUserPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  addPetOwner,
  removePetOwner,
};
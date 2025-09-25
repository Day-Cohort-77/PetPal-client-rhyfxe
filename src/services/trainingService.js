import { get, post, put, del } from './apiService';

export const getTrainingProgress = async (petId) => {
  return await get(`/pets/${petId}/training-progress`);
};

export const addTrainingProgress = async (petId, trainingData) => {
  return await post(`/pets/${petId}/training-progress`, trainingData);
};

export const updateTrainingProgress = async (petId, progressId, trainingData) => {
  return await put(`/pets/${petId}/training-progress/${progressId}`, trainingData);
};

export const deleteTrainingProgress = async (petId, progressId) => {
  return await del(`/pets/${petId}/training-progress/${progressId}`);
};

export const getTrainingProgressSummary = async (petId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return await get(`/pets/${petId}/training-progress/summary${query}`);
};

export const getFilteredTrainingProgress = async (petId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return await get(`/pets/${petId}/training-progress/filter${query}`);
};

export const getTrainingProgressCharts = async (petId, skillName, startDate, endDate) => {
  const params = new URLSearchParams();
  if (skillName) params.append('skillName', skillName);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return await get(`/pets/${petId}/training-progress/charts${query}`);
};
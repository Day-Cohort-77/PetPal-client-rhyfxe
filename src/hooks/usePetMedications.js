import { useQuery } from '@tanstack/react-query';
import { getMedicationsForPet } from '../services/medicationService';

export const usePetMedications = (petId, options = {}) => {
  return useQuery({
    queryKey: ['medications', petId, options],
    queryFn: () => getMedicationsForPet(petId, options),
    enabled: !!petId,
    retry: (failureCount, error) => {
      // Don't retry on authentication or authorization errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Retry network errors up to 3 times
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
};
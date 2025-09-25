import { useQuery } from '@tanstack/react-query';
import { getMedicationsForPet } from '../services/medicationService';

export const usePetMedications = (petId, filters = {}) => {
  return useQuery({
    queryKey: ['medications', petId, filters],
    queryFn: () => getMedicationsForPet(petId, filters),
    enabled: !!petId,
  });
};
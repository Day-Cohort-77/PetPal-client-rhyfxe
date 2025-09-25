'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Heading, Card } from '@radix-ui/themes';
import MedicationsList from '../../../components/medications/MedicationsList';
import { getUserPets } from '../../../services/petService';

export default function AllMedicationsPage() {
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [pets, setPets] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        console.log('Fetching pets...');
        const petsData = await getUserPets();
        console.log('Raw pets data received:', petsData);
        console.log('Pets array length:', petsData?.length || 0);
        
        if (petsData && petsData.length > 0) {
          console.log('First pet details:', petsData[0]);
          console.log('All pet IDs:', petsData.map(pet => ({ id: pet.id, name: pet.name })));
        }
        
        setPets(petsData || []);
        if (petsData && petsData.length > 0) {
          const firstPetId = petsData[0].id;
          console.log('Setting selected pet ID to:', firstPetId);
          setSelectedPetId(firstPetId);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      }
    };

    fetchPets();
  }, []);

  return (
    <Container size="3" py="9">
      <Card>
        <Heading size="6" mb="4">Pet Medications</Heading>
        
        {/* Pet Selector */}
        <div className="mb-6">
          <select
            value={selectedPetId || ''}
            onChange={(e) => setSelectedPetId(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a pet</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>

        {/* Medications List */}
        {selectedPetId ? (
          <MedicationsList petId={selectedPetId} />
        ) : (
          <p>Please select a pet to view their medications</p>
        )}
      </Card>
    </Container>
  );
}
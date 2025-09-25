'use client';

import { useParams } from 'next/navigation';
import MedicationsList from '@/components/medications/MedicationsList';

export default function PetMedicationsPage() {
  const params = useParams();
  const petId = parseInt(params.id as string);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pet Medications</h1>
      <MedicationsList petId={petId} />
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { usePetMedications } from '../../hooks/usePetMedications';
import { format } from 'date-fns';
import TodaysReminders from './TodaysReminders';

const MedicationsList = ({ petId }) => {
  const router = useRouter();
  const { isAdmin, isVeterinarian } = useAuth();
  const canManageMedications = isAdmin() || isVeterinarian();

  const [filters, setFilters] = useState({
    sortBy: 'StartDate',
    sortOrder: 'desc',
    isActive: null,
    medicationName: '',
  });

  const { data: medications, isLoading, error } = usePetMedications(petId, filters);

  console.log('MedicationsList - petId:', petId);
  console.log('MedicationsList - filters:', filters);
  console.log('MedicationsList - medications:', medications);
  console.log('MedicationsList - isLoading:', isLoading);
  console.log('MedicationsList - error:', error);

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (name) => {
    setFilters(prev => ({
      ...prev,
      medicationName: name
    }));
  };

  const handleActiveFilter = (isActive) => {
    setFilters(prev => ({
      ...prev,
      isActive
    }));
  };

  if (isLoading) return <div>Loading medications...</div>;
  if (error) return <div>Error loading medications: {error.message}</div>;

  // Handle empty medications array
  if (medications && medications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Medications</h3>
          <p className="text-gray-500 mb-2">This pet currently has no medications prescribed.</p>
          <p className="text-sm text-gray-400">
            Medications will appear here once prescribed by a veterinarian.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Today's Reminders */}
      <TodaysReminders petId={petId} />
      
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search medications..."
          value={filters.medicationName || ''}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <select
          value={filters.isActive === null ? 'all' : filters.isActive.toString()}
          onChange={(e) => {
            const value = e.target.value;
            handleActiveFilter(value === 'all' ? null : value === 'true');
          }}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Medications Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSortChange('name')}
              >
                Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left">Dosage</th>
              <th 
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSortChange('frequency')}
              >
                Frequency {filters.sortBy === 'frequency' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSortChange('StartDate')}
              >
                Start Date {filters.sortBy === 'StartDate' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSortChange('enddate')}
              >
                End Date {filters.sortBy === 'enddate' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left">Status</th>
              {canManageMedications && (
                <th className="px-6 py-3 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medications?.map((medication) => (
              <tr key={medication.id}>
                <td className="px-6 py-4">{medication.name}</td>
                <td className="px-6 py-4">{medication.dosage}</td>
                <td className="px-6 py-4">{medication.frequency}</td>
                <td className="px-6 py-4">
                  {format(new Date(medication.startDate), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  {medication.endDate 
                    ? format(new Date(medication.endDate), 'MMM d, yyyy')
                    : 'Ongoing'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    medication.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {medication.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {canManageMedications && (
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/pets/${petId}/medications/${medication.id}/edit`)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicationsList;
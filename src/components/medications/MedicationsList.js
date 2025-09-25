'use client';

import { useState } from 'react';
import { usePetMedications } from '../../hooks/usePetMedications';
import { format } from 'date-fns';

const MedicationsList = ({ petId }) => {
  const [filters, setFilters] = useState({
    sortBy: 'startdate',
    sortOrder: 'desc',
    isActive: null,
    medicationName: '',
  });

  const { data: medications, isLoading, error } = usePetMedications(petId, filters);

  console.log('MedicationsList - petId:', petId, 'type:', typeof petId);
  console.log('MedicationsList - filters:', filters);
  console.log('MedicationsList - medications:', medications);
  console.log('MedicationsList - isLoading:', isLoading);
  console.log('MedicationsList - error:', error);

  // Debug date values if medications exist
  if (medications && medications.length > 0) {
    console.log('Sample medication dates:', {
      startDate: medications[0].startDate,
      endDate: medications[0].endDate,
      startDateType: typeof medications[0].startDate,
      endDateType: typeof medications[0].endDate,
      name: medications[0].name,
      dosage: medications[0].dosage
    });
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading medications...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {error.message.includes('403') ? '🔒 Access Restricted' : '❌ Error Loading Medications'}
          </h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          {error.message.includes('401') && (
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

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
              <th className="px-6 py-3 text-left">Frequency</th>
              <th 
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSortChange('startdate')}
              >
                Start Date {filters.sortBy === 'startdate' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left">End Date</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medications?.map((medication) => (
              <tr key={medication.id}>
                <td className="px-6 py-4">{medication.name}</td>
                <td className="px-6 py-4">{medication.dosage}</td>
                <td className="px-6 py-4">{medication.frequency}</td>
                <td className="px-6 py-4">
                  {(() => {
                    try {
                      const startDate = new Date(medication.startDate);
                      return isNaN(startDate.getTime()) 
                        ? 'Invalid Date' 
                        : format(startDate, 'MMM d, yyyy');
                    } catch (error) {
                      console.error('Error formatting start date:', medication.startDate, error);
                      return 'Invalid Date';
                    }
                  })()}
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    if (!medication.endDate) return 'Ongoing';
                    try {
                      const endDate = new Date(medication.endDate);
                      return isNaN(endDate.getTime()) 
                        ? 'Invalid Date' 
                        : format(endDate, 'MMM d, yyyy');
                    } catch (error) {
                      console.error('Error formatting end date:', medication.endDate, error);
                      return 'Invalid Date';
                    }
                  })()}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicationsList;
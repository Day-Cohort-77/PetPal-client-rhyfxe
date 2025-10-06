'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getPetHealthRecords, deleteHealthRecord } from '../../services/healthRecordService';
import { format } from 'date-fns';
import { Card, Flex, Text, Box, Button, IconButton, Badge, Grid, Heading } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiCalendar, FiUser, FiMapPin } from 'react-icons/fi';

const VaccinationsList = ({ petId, onUpdate }) => {
  const router = useRouter();
  const { user, isAdmin, isVeterinarian } = useAuth();
  const canManageVaccinations = isAdmin() || isVeterinarian();

  const [vaccinations, setVaccinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVaccinations();
  }, [petId]);

  const fetchVaccinations = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const healthRecords = await getPetHealthRecords(petId);
      
      // Filter for vaccination records only
      const vaccinationRecords = healthRecords.filter(
        record => record.recordType.toLowerCase() === 'vaccination'
      );
      
      setVaccinations(vaccinationRecords);
    } catch (err) {
      console.error('Error fetching vaccinations:', err);
      setError('Failed to load vaccination records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVaccination = async (vaccinationId) => {
    if (!canManageVaccinations) {
      alert('You do not have permission to delete vaccination records. Only veterinarians and administrators can manage vaccination records.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this vaccination record? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        await deleteHealthRecord(vaccinationId);
        
        // Refresh the vaccinations list
        await fetchVaccinations();
        
        // Notify parent component of update
        if (onUpdate) {
          onUpdate();
        }
      } catch (err) {
        console.error('Error deleting vaccination:', err);
        if (err.message.includes('403') || err.message.includes('Forbidden')) {
          alert('You do not have permission to delete vaccination records. Only veterinarians and administrators can manage vaccination records.');
        } else {
          alert('Failed to delete vaccination record. Please try again.');
        }
      }
    }
  };

  const getVaccineTypeBadgeColor = (vaccineType) => {
    const type = vaccineType?.toLowerCase();
    switch (type) {
      case 'rabies':
        return 'red';
      case 'distemper':
      case 'dhpp':
        return 'blue';
      case 'parvo':
      case 'parvovirus':
        return 'orange';
      case 'bordetella':
        return 'green';
      case 'leptospirosis':
        return 'purple';
      case 'fvrcp':
      case 'felv':
        return 'violet';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Parse structured vaccination notes to extract individual fields
  const parseVaccinationNotes = (notes) => {
    const parsed = {
      vaccineType: '',
      lotNumber: '',
      administeredBy: '',
      location: '',
      expirationDate: '',
      notes: notes || ''
    };

    if (notes) {
      const lines = notes.split('\n');
      lines.forEach(line => {
        if (line.startsWith('Vaccine Type:')) {
          parsed.vaccineType = line.replace('Vaccine Type:', '').trim();
        } else if (line.startsWith('Lot Number:')) {
          parsed.lotNumber = line.replace('Lot Number:', '').trim();
          if (parsed.lotNumber === 'N/A') parsed.lotNumber = '';
        } else if (line.startsWith('Administered By:')) {
          parsed.administeredBy = line.replace('Administered By:', '').trim();
          if (parsed.administeredBy === 'N/A') parsed.administeredBy = '';
        } else if (line.startsWith('Location:')) {
          parsed.location = line.replace('Location:', '').trim();
          if (parsed.location === 'N/A') parsed.location = '';
        } else if (line.startsWith('Expiration Date:')) {
          const dateStr = line.replace('Expiration Date:', '').trim();
          if (dateStr && dateStr !== 'N/A') {
            parsed.expirationDate = dateStr;
          }
        }
      });

      // Remove structured lines from notes to get clean notes
      const cleanNotes = notes
        .split('\n')
        .filter(line => 
          !line.startsWith('Vaccine Type:') &&
          !line.startsWith('Lot Number:') &&
          !line.startsWith('Administered By:') &&
          !line.startsWith('Location:') &&
          !line.startsWith('Expiration Date:')
        )
        .join('\n')
        .trim();
      
      parsed.notes = cleanNotes || '';
    }

    return parsed;
  };

  if (isLoading) {
    return <Text>Loading vaccination records...</Text>;
  }

  if (error) {
    return (
      <Text color="red" size="2">
        {error}
      </Text>
    );
  }

  if (vaccinations.length === 0) {
    return (
      <Box>
        <Text>
          No vaccination records found.{' '}
          {canManageVaccinations 
            ? 'Add a vaccination record to get started.' 
            : 'Vaccination records from your veterinarian will appear here.'}
        </Text>
        
        {!canManageVaccinations && (
          <Box mt="3" p="4" style={{ 
            backgroundColor: 'var(--blue-2)', 
            borderRadius: 'var(--radius-3)',
            border: '1px solid var(--blue-6)'
          }}>
            <Text size="3" weight="medium" color="blue" style={{ display: 'block', marginBottom: '8px' }}>
              🏥 Veterinarian-Only Records
            </Text>
            <Text size="2" color="blue">
              Vaccination records can only be added, edited, or deleted by veterinarians and administrators. 
              This ensures the accuracy and authenticity of your pet's medical history. 
              Contact your veterinary clinic to add vaccination information.
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {!canManageVaccinations && (
        <Box p="4" style={{ 
          backgroundColor: 'var(--blue-2)', 
          borderRadius: 'var(--radius-3)',
          border: '1px solid var(--blue-6)'
        }}>
          <Text size="3" weight="medium" color="blue" style={{ display: 'block', marginBottom: '8px' }}>
            🏥 Veterinarian-Only Records
          </Text>
          <Text size="2" color="blue">
            Vaccination records can only be added, edited, or deleted by veterinarians and administrators. 
            This ensures the accuracy and authenticity of your pet's medical history. 
            Contact your veterinary clinic to add or update vaccination information.
          </Text>
        </Box>
      )}
      
      {vaccinations.map((vaccination) => {
        const parsedData = parseVaccinationNotes(vaccination.notes);
        
        return (
        <Card key={vaccination.id} variant="outline">
          <Flex gap="3" p="4" align="start">
            <Box style={{ flex: 1 }}>
              {/* Vaccination name and type */}
              <Flex justify="between" align="start" mb="2">
                <Box>
                  <Heading size="3" mb="1">{vaccination.description}</Heading>
                  <Flex gap="2" align="center">
                    <Badge color={getVaccineTypeBadgeColor(vaccination.description)} size="1">
                      Vaccination
                    </Badge>
                    {parsedData.vaccineType && parsedData.vaccineType !== vaccination.description && (
                      <Badge color="gray" size="1" variant="soft">
                        {parsedData.vaccineType}
                      </Badge>
                    )}
                  </Flex>
                </Box>
                
                {/* Action buttons for vets/admins only */}
                {canManageVaccinations && (
                  <Flex gap="2">
                    <IconButton
                      size="2"
                      variant="ghost"
                      color="blue"
                      onClick={() => router.push(`/pets/${petId}/vaccinations/${vaccination.id}/edit`)}
                    >
                      <FiEdit2 />
                    </IconButton>
                    <IconButton
                      size="2"
                      variant="ghost"
                      color="red"
                      onClick={() => handleDeleteVaccination(vaccination.id)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </Flex>
                )}
              </Flex>
              
              {/* Veterinarian information prominently displayed */}
              {vaccination.veterinarianName && (
                <Box mb="3">
                  <Text size="2" weight="bold" color="green">
                    <FiUser style={{ display: 'inline', marginRight: '4px' }} />
                    Administered by: {vaccination.veterinarianName}
                  </Text>
                </Box>
              )}
              
              {/* Structured vaccination details */}
              <Grid columns="2" gap="3" mt="2">
                <Box>
                  <Text size="2" weight="bold" color="gray">
                    <FiCalendar style={{ display: 'inline', marginRight: '4px' }} />
                    Date Administered: 
                  </Text>
                  <Text size="2"> {formatDate(vaccination.recordDate)}</Text>
                </Box>
                
                {parsedData.expirationDate && (
                  <Box>
                    <Text size="2" weight="bold" color="gray">
                      Expiration Date: 
                    </Text>
                    <Text size="2"> {parsedData.expirationDate}</Text>
                  </Box>
                )}
                
                {parsedData.lotNumber && (
                  <Box>
                    <Text size="2" weight="bold" color="gray">
                      Lot Number: 
                    </Text>
                    <Text size="2"> {parsedData.lotNumber}</Text>
                  </Box>
                )}
                
                {parsedData.administeredBy && (
                  <Box>
                    <Text size="2" weight="bold" color="gray">
                      Administered By: 
                    </Text>
                    <Text size="2"> {parsedData.administeredBy}</Text>
                  </Box>
                )}
                
                {parsedData.location && (
                  <Box>
                    <Text size="2" weight="bold" color="gray">
                      Location: 
                    </Text>
                    <Text size="2"> {parsedData.location}</Text>
                  </Box>
                )}
                

              </Grid>

              {/* User notes if available */}
              {parsedData.notes && (
                <Box mt="3" p="3" style={{ 
                  backgroundColor: 'var(--gray-2)', 
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--gray-4)'
                }}>
                  <Text size="2" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>
                    Notes: 
                  </Text>
                  <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                    {parsedData.notes}
                  </Text>
                </Box>
              )}

              {/* Additional vaccination details if available */}
              <Box mt="2">
                <Text size="2" color="gray">
                  Added on {formatDate(vaccination.createdAt)}
                  {vaccination.updatedAt !== vaccination.createdAt && 
                    `, updated on ${formatDate(vaccination.updatedAt)}`
                  }
                </Text>
              </Box>
            </Box>
          </Flex>
        </Card>
        );
      })}
    </Flex>
  );
};

export default VaccinationsList;
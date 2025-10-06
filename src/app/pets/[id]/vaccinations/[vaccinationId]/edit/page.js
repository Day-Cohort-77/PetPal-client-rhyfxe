'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../../services/petService';
import { getHealthRecordById, updateHealthRecord } from '../../../../../../services/healthRecordService';
import Navbar from '../../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../../../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea } from '@radix-ui/themes';

export default function EditVaccination() {
  const { user, isAdmin, isVeterinarian } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;
  const vaccinationId = params.vaccinationId;

  // Check if user has vaccination management permissions
  const canManageVaccinations = isAdmin() || isVeterinarian();

  const [pet, setPet] = useState(null);
  const [vaccination, setVaccination] = useState(null);
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    administrationDate: '',
    expirationDate: '',
    lotNumber: '',
    administeredBy: '',
    location: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Common vaccine types for selection
  const vaccineTypes = [
    { value: 'RABIES', label: 'Rabies' },
    { value: 'DISTEMPER', label: 'Distemper' },
    { value: 'PARVO', label: 'Parvovirus' },
    { value: 'BORDETELLA', label: 'Bordetella (Kennel Cough)' },
    { value: 'LEPTOSPIROSIS', label: 'Leptospirosis' },
    { value: 'FVRCP', label: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)' },
    { value: 'FELV', label: 'FeLV (Feline Leukemia Virus)' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Check permissions first
  useEffect(() => {
    if (user && !canManageVaccinations) {
      setError('Access denied. Only veterinarians and administrators can edit vaccination records.');
      router.push(`/pets/${petId}`);
      return;
    }
  }, [user, canManageVaccinations, router, petId]);

  // Fetch pet and vaccination data
  useEffect(() => {
    const fetchData = async () => {
      if (!canManageVaccinations) return; // Don't fetch if no permissions

      try {
        const [petData, vaccinationData] = await Promise.all([
          getPetById(petId),
          getHealthRecordById(vaccinationId)
        ]);

        setPet(petData);
        setVaccination(vaccinationData);

        // Verify this is actually a vaccination record
        if (vaccinationData.recordType.toLowerCase() !== 'vaccination') {
          setError('This record is not a vaccination record.');
          return;
        }

        // Parse structured notes to populate form fields
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
                  // Try to parse the date and convert to YYYY-MM-DD format
                  try {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                      parsed.expirationDate = date.toISOString().split('T')[0];
                    }
                  } catch (e) {
                    console.warn('Could not parse expiration date:', dateStr);
                  }
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
            
            if (cleanNotes) {
              parsed.notes = cleanNotes;
            } else {
              parsed.notes = '';
            }
          }

          return parsed;
        };

        const parsedNotes = parseVaccinationNotes(vaccinationData.notes);

        // Populate form with existing data
        setFormData({
          vaccineName: vaccinationData.description || '',
          vaccineType: parsedNotes.vaccineType || vaccinationData.description || '',
          administrationDate: vaccinationData.recordDate ? 
            new Date(vaccinationData.recordDate).toISOString().split('T')[0] : '',
          expirationDate: parsedNotes.expirationDate || '',
          lotNumber: parsedNotes.lotNumber || '',
          administeredBy: parsedNotes.administeredBy || vaccinationData.veterinarianName || '',
          location: parsedNotes.location || '',
          notes: parsedNotes.notes || ''
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load vaccination details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId && vaccinationId) {
      fetchData();
    }
  }, [petId, vaccinationId, canManageVaccinations]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Prepare health record data with structured notes
      const structuredNotes = [
        formData.notes || '', // User's custom notes first
        formData.vaccineType ? `Vaccine Type: ${formData.vaccineType}` : '',
        formData.lotNumber ? `Lot Number: ${formData.lotNumber}` : 'Lot Number: N/A',
        formData.administeredBy ? `Administered By: ${formData.administeredBy}` : 'Administered By: N/A',
        formData.location ? `Location: ${formData.location}` : 'Location: N/A',
        formData.expirationDate ? `Expiration Date: ${formData.expirationDate}` : ''
      ].filter(Boolean).join('\n');

      const healthRecordData = {
        recordType: 'VACCINATION',
        description: formData.vaccineName || formData.vaccineType,
        recordDate: new Date(formData.administrationDate).toISOString(),
        notes: structuredNotes,
        veterinarianId: vaccination.veterinarianId, // Keep existing veterinarian ID
        attachments: vaccination.attachments || '' // Keep existing attachments or empty string
      };

      // Call API to update health record
      await updateHealthRecord(vaccinationId, healthRecordData);

      // Redirect back to pet details page
      router.push(`/pets/${petId}?tab=vaccinations`);
    } catch (err) {
      console.error('Error updating vaccination:', err);
      
      let errorMessage = 'Failed to update vaccination. Please try again.';
      
      if (err.message.includes('401')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.message.includes('403')) {
        errorMessage = 'Access denied. Only veterinarians and administrators can modify vaccination records.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Vaccination record not found.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid vaccination data. Please check all required fields.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please check the console for details and ensure all required fields are filled.';
        console.error('500 Error Details - Data sent:', healthRecordData);
        console.error('500 Error - Full error:', err);
      }
      
      setError(errorMessage);
      setIsSaving(false);
    }
  };

  // Don't render anything if user doesn't have permissions (will redirect)
  if (!canManageVaccinations && user) {
    return null;
  }

  const editVaccinationContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">
              Edit Vaccination for {pet?.name || 'Pet'}
            </Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading vaccination details...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="vaccineName">
                      Vaccine Name*
                    </Text>
                    <TextField.Root
                      id="vaccineName"
                      value={formData.vaccineName}
                      onChange={handleChange}
                      placeholder="Enter vaccine name"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="vaccineType">
                      Vaccine Type*
                    </Text>
                    <Select.Root 
                      value={formData.vaccineType}
                      onValueChange={(value) => handleSelectChange('vaccineType', value)}
                    >
                      <Select.Trigger placeholder="Select vaccine type" />
                      <Select.Content>
                        {vaccineTypes.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="administrationDate">
                        Administration Date*
                      </Text>
                      <TextField.Root
                        id="administrationDate"
                        type="date"
                        value={formData.administrationDate}
                        onChange={handleChange}
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="expirationDate">
                        Expiration Date
                      </Text>
                      <TextField.Root
                        id="expirationDate"
                        type="date"
                        value={formData.expirationDate}
                        onChange={handleChange}
                      />
                    </Box>
                  </Grid>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="lotNumber">
                        Lot Number
                      </Text>
                      <TextField.Root
                        id="lotNumber"
                        value={formData.lotNumber}
                        onChange={handleChange}
                        placeholder="Enter lot number"
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="administeredBy">
                        Administered By
                      </Text>
                      <TextField.Root
                        id="administeredBy"
                        value={formData.administeredBy}
                        onChange={handleChange}
                        placeholder="Enter name of administrator"
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="location">
                      Location
                    </Text>
                    <TextField.Root
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location where administered"
                    />
                  </Box>



                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes about this vaccination"
                      rows={3}
                    />
                  </Box>

                  <Flex gap="3" justify="end">
                    <Button
                      type="button"
                      variant="soft"
                      color="gray"
                      onClick={() => router.push(`/pets/${petId}?tab=vaccinations`)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Update Vaccination'}
                    </Button>
                  </Flex>
                </Flex>
              </form>
            )}
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary>
      <ProtectedRoute>
        {editVaccinationContent}
      </ProtectedRoute>
    </FeatureErrorBoundary>
  );
}
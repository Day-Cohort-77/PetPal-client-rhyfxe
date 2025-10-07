'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../../services/petService';
import { getVaccinationById, updateVaccination } from '../../../../../../services/vaccinationService';
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
          getVaccinationById(vaccinationId)
        ]);

        setPet(petData);
        setVaccination(vaccinationData);

        // Populate form with existing vaccination record data
        setFormData({
          vaccineName: vaccinationData.vaccineName || '',
          vaccineType: vaccinationData.vaccineType || '',
          administrationDate: vaccinationData.administrationDate ? 
            new Date(vaccinationData.administrationDate).toISOString().split('T')[0] : '',
          expirationDate: vaccinationData.expirationDate ? 
            new Date(vaccinationData.expirationDate).toISOString().split('T')[0] : '',
          lotNumber: vaccinationData.lotNumber || '',
          administeredBy: vaccinationData.administeredBy || '',
          location: vaccinationData.location || '',
          notes: vaccinationData.notes || ''
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
      // Prepare vaccination record data
      const vaccinationData = {
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType,
        administrationDate: new Date(formData.administrationDate).toISOString(),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
        lotNumber: formData.lotNumber || '',
        administeredBy: formData.administeredBy || '',
        location: formData.location || '',
        notes: formData.notes || '',
        attachments: vaccination.attachments || '' // Keep existing attachments
      };

      // Call API to update vaccination record
      await updateVaccination(vaccinationId, vaccinationData);

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
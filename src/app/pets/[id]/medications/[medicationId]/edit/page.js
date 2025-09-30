'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../../services/petService';
import { getMedicationById, updateMedication } from '../../../../../../services/medicationService';
import ProtectedRoute from '../../../../../../components/ProtectedRoute';
import Navbar from '../../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea, Checkbox } from '@radix-ui/themes';

export default function EditMedication() {
  const { user, isAdmin, isVeterinarian } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;
  const medicationId = params.medicationId;

  // Check if user has medication management permissions
  const canManageMedications = isAdmin() || isVeterinarian();

  const [pet, setPet] = useState(null);
  const [medication, setMedication] = useState(null);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    dosageUnit: 'mg',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    reason: '',
    instructions: '',
    isOngoing: false,
    reminders: true,
    reminderTimes: ['08:00'],
    notes: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dosage units and frequency options (same as add page)
  const dosageUnits = [
    { value: 'mg', label: 'mg (milligrams) - e.g., 25 mg' },
    { value: 'ml', label: 'ml (milliliters) - e.g., 5 ml' },
    { value: 'g', label: 'g (grams) - e.g., 1 g' },
    { value: 'tablet', label: 'tablet(s) - e.g., 1 tablet' },
    { value: 'capsule', label: 'capsule(s) - e.g., 2 capsules' },
    { value: 'drop', label: 'drop(s) - e.g., 3 drops' },
    { value: 'puff', label: 'puff(s) - e.g., 2 puffs' },
    { value: 'unit', label: 'unit(s) - e.g., 10 units' },
    { value: 'cc', label: 'cc (cubic centimeters) - e.g., 2 cc' },
    { value: 'tsp', label: 'tsp (teaspoons) - e.g., 1 tsp' }
  ];

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'every_other_day', label: 'Every other day' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'as_needed', label: 'As needed (PRN)' },
    { value: 'custom', label: 'Custom' }
  ];

  // Check permissions first
  useEffect(() => {
    if (user && !canManageMedications) {
      setError('Access denied. Only veterinarians and administrators can edit medications.');
      router.push(`/pets/${petId}`);
      return;
    }
  }, [user, canManageMedications, router, petId]);

  // Fetch pet and medication data
  useEffect(() => {
    const fetchData = async () => {
      if (!canManageMedications) return; // Don't fetch if no permissions

      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch medication details
        const medicationData = await getMedicationById(medicationId);
        setMedication(medicationData);

        // Parse dosage to separate amount and unit
        let dosageAmount = '';
        let dosageUnit = 'mg';
        
        if (medicationData.dosage) {
          // Try to extract unit from combined dosage string
          const dosageMatch = medicationData.dosage.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
          if (dosageMatch) {
            dosageAmount = dosageMatch[1];
            dosageUnit = dosageMatch[2];
          } else {
            // If no match, assume it's just the amount
            dosageAmount = medicationData.dosage;
          }
        }

        // Format dates for input fields
        const startDate = medicationData.startDate ? 
          new Date(medicationData.startDate).toISOString().split('T')[0] : '';
        const endDate = medicationData.endDate ? 
          new Date(medicationData.endDate).toISOString().split('T')[0] : '';

        // Set form data
        setFormData({
          medicationName: medicationData.name || '',
          dosage: dosageAmount,
          dosageUnit: dosageUnit,
          frequency: medicationData.frequency || '',
          startDate: startDate,
          endDate: endDate,
          prescribedBy: medicationData.prescriber || '',
          reason: '', // This might not be in the response
          instructions: medicationData.instructions || '',
          isOngoing: !medicationData.endDate,
          reminders: true,
          reminderTimes: ['08:00'],
          notes: '', // This might not be in the response
          isActive: medicationData.isActive !== undefined ? medicationData.isActive : true
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        let errorMessage = 'Failed to load medication details. Please try again.';
        
        if (err.message.includes('401')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (err.message.includes('403')) {
          errorMessage = 'Access denied. You can only edit medications for your own pets.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Medication not found.';
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (petId && medicationId && user) {
      fetchData();
    }
  }, [petId, medicationId, user, canManageMedications]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReminderTimeChange = (index, value) => {
    const newReminderTimes = [...formData.reminderTimes];
    newReminderTimes[index] = value;
    setFormData(prev => ({
      ...prev,
      reminderTimes: newReminderTimes
    }));
  };

  const addReminderTime = () => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, '12:00']
    }));
  };

  const removeReminderTime = (index) => {
    const newReminderTimes = formData.reminderTimes.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      reminderTimes: newReminderTimes
    }));
  };

  // Client-side validation (matching backend required fields exactly)
  const validateForm = () => {
    const errors = [];
    
    // Required field validation (based on backend API structure)
    if (!formData.medicationName.trim()) {
      errors.push('Medication name is required');
    }
    
    if (!formData.dosage.trim()) {
      errors.push('Dosage is required');
    }
    
    if (!formData.frequency.trim()) {
      errors.push('Frequency is required');
    }
    
    if (!formData.startDate) {
      errors.push('Start date is required');
    }
    
    if (!formData.instructions.trim()) {
      errors.push('Instructions are required');
    }
    
    if (!formData.prescribedBy.trim()) {
      errors.push('Prescriber is required');
    }
    
    // Date validation
    if (formData.startDate && formData.endDate && !formData.isOngoing) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      setIsSaving(false);
      return;
    }

    try {
      // Prepare update data matching exact backend API structure
      const updateData = {
        name: formData.medicationName.trim(),
        dosage: formData.dosageUnit ? 
          `${formData.dosage.trim()} ${formData.dosageUnit}` : 
          formData.dosage.trim(),
        frequency: formData.frequency,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate && !formData.isOngoing ? 
          new Date(formData.endDate).toISOString() : null,
        instructions: formData.instructions.trim(),
        prescriber: formData.prescribedBy.trim(),
        isActive: formData.isActive
      };

      console.log('📋 Medication Update Data:');
      console.log('Sending to backend:', JSON.stringify(updateData, null, 2));

      // Call API to update medication
      const updatedRecord = await updateMedication(medicationId, updateData);

      console.log('Medication updated successfully:', updatedRecord);
      
      // Redirect back to pet details page with medications tab
      router.push(`/pets/${petId}?tab=medications`);
    } catch (err) {
      console.error('Error updating medication:', err);
      
      let errorMessage = 'Failed to update medication. Please try again.';
      
      if (err.message.includes('401')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.message.includes('403')) {
        errorMessage = 'Access denied. Only veterinarians and administrators can modify medications.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Medication not found.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid medication data. Please check all required fields.';
      }
      
      setError(errorMessage);
      setIsSaving(false);
    }
  };

  // Don't render anything if user doesn't have permissions (will redirect)
  if (!canManageMedications && user) {
    return null;
  }

  const editMedicationContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">
              Edit Medication for {pet?.name || 'Pet'}
            </Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading medication details...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="medicationName">
                      Medication Name*
                    </Text>
                    <TextField.Root
                      id="medicationName"
                      value={formData.medicationName}
                      onChange={handleChange}
                      placeholder="Enter medication name"
                      required
                    />
                  </Box>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="dosage">
                        Dosage Amount*
                      </Text>
                      <TextField.Root
                        id="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        placeholder="e.g., 25, 1, 2"
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="dosageUnit">
                        Dosage Unit*
                      </Text>
                      <Select.Root
                        value={formData.dosageUnit}
                        onValueChange={(value) => handleSelectChange('dosageUnit', value)}
                      >
                        <Select.Trigger id="dosageUnit" />
                        <Select.Content>
                          {dosageUnits.map(unit => (
                            <Select.Item key={unit.value} value={unit.value}>
                              {unit.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Grid>

                  {/* Dosage Preview */}
                  {formData.dosage && formData.dosageUnit && (
                    <Box p="2" style={{ backgroundColor: 'var(--blue-2)', borderRadius: '6px' }}>
                      <Text size="2" color="blue" weight="bold">
                        Dosage Preview: {formData.dosage} {formData.dosageUnit}
                      </Text>
                    </Box>
                  )}

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="frequency">
                      Frequency*
                    </Text>
                    <Select.Root
                      value={formData.frequency}
                      onValueChange={(value) => handleSelectChange('frequency', value)}
                    >
                      <Select.Trigger id="frequency" placeholder="Select frequency" />
                      <Select.Content>
                        {frequencyOptions.map(option => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  {formData.frequency === 'custom' && (
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="customFrequency">
                        Custom Frequency
                      </Text>
                      <TextField.Root
                        id="customFrequency"
                        value={formData.customFrequency || ''}
                        onChange={handleChange}
                        placeholder="Describe custom frequency (e.g., every 8 hours)"
                      />
                    </Box>
                  )}

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="startDate">
                        Start Date*
                      </Text>
                      <TextField.Root
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </Box>

                    <Box>
                      <Flex direction="column" gap="1">
                        <Flex align="center" gap="2">
                          <input
                            type="checkbox"
                            id="isOngoing"
                            checked={formData.isOngoing}
                            onChange={handleChange}
                          />
                          <Text as="label" size="2" htmlFor="isOngoing">
                            Ongoing Medication
                          </Text>
                        </Flex>

                        {!formData.isOngoing && (
                          <>
                            <Text as="label" size="2" mb="1" htmlFor="endDate">
                              End Date
                            </Text>
                            <TextField.Root
                              id="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleChange}
                            />
                          </>
                        )}
                      </Flex>
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="prescribedBy">
                      Prescribed By*
                    </Text>
                    <TextField.Root
                      id="prescribedBy"
                      value={formData.prescribedBy}
                      onChange={handleChange}
                      placeholder="Enter name of prescriber"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="reason">
                      Reason for Medication
                    </Text>
                    <TextField.Root
                      id="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Enter reason for medication"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="instructions">
                      Administration Instructions*
                    </Text>
                    <TextArea
                      id="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Enter instructions for administering medication"
                      required
                    />
                  </Box>

                  <Box>
                    <Flex align="center" gap="2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                      <Text as="label" size="2" htmlFor="isActive">
                        Medication is Active
                      </Text>
                    </Flex>
                  </Box>

                  <Box>
                    <Flex align="center" gap="2" mb="2">
                      <input
                        type="checkbox"
                        id="reminders"
                        checked={formData.reminders}
                        onChange={handleChange}
                      />
                      <Text as="label" size="2" htmlFor="reminders">
                        Set Reminders
                      </Text>
                    </Flex>

                    {formData.reminders && (
                      <Box>
                        <Text size="2" mb="2">Reminder Times:</Text>
                        {formData.reminderTimes.map((time, index) => (
                          <Flex key={index} gap="2" mb="2" align="center">
                            <TextField.Root
                              type="time"
                              value={time}
                              onChange={(e) => handleReminderTimeChange(index, e.target.value)}
                              style={{ flexGrow: 1 }}
                            />
                            {formData.reminderTimes.length > 1 && (
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                color="red"
                                onClick={() => removeReminderTime(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </Flex>
                        ))}
                        <Button
                          type="button"
                          size="1"
                          variant="soft"
                          onClick={addReminderTime}
                        >
                          Add Reminder Time
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Additional Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Updating...' : 'Update Medication'}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => router.push(`/pets/${petId}?tab=medications`)}
                    >
                      Cancel
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
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="EditMedication">
        {editMedicationContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
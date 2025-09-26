'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../services/petService';
import { createMedication } from '../../../../../services/medicationService';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import Navbar from '../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea, Checkbox } from '@radix-ui/themes';

export default function AddMedication() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    dosageUnit: 'mg',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    prescribedBy: '',
    reason: '',
    instructions: '',
    isOngoing: false,
    reminders: true,
    reminderTimes: ['08:00'],
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Common dosage units for selection with examples
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

  // Common frequency options
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

  // Check if user is authenticated and fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petData = await getPetById(petId);
        setPet(petData);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError('Failed to load pet details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [user, router, petId]);

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
      errors.push('Medication name is required (maps to backend "name" field)');
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
      errors.push('Prescriber is required (maps to backend "prescriber" field)');
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
      // Prepare medication data matching exact backend API structure
      const medicationData = {
        // Required fields (matching backend expectations exactly)
        petId: parseInt(petId),                    // integer (required)
        name: formData.medicationName.trim(),      // string (required) 
        dosage: formData.dosageUnit ? `${formData.dosage.trim()} ${formData.dosageUnit}` : formData.dosage.trim(), // combine amount and unit
        frequency: formData.frequency.trim(),      // string (required)
        startDate: new Date(formData.startDate).toISOString(), // datetime (required)
        instructions: formData.instructions.trim(), // string (required)
        prescriber: formData.prescribedBy.trim(),  // string (required)
        
        // Optional fields (only include if backend supports them)
        ...(formData.endDate && !formData.isOngoing && {
          endDate: new Date(formData.endDate).toISOString()
        }),
        ...(formData.reason.trim() && {
          reason: formData.reason.trim()
        }),
        ...(formData.notes.trim() && {
          notes: formData.notes.trim()
        })
      };

      console.log('📋 Medication Data Structure Check:');
      console.log('Sending to backend:', JSON.stringify(medicationData, null, 2));
      console.log('\n✅ Required Fields Validation:');
      console.log('- petId (integer):', medicationData.petId, typeof medicationData.petId === 'number' ? '✅' : '❌');
      console.log('- name (string):', medicationData.name ? '✅' : '❌');
      console.log('- dosage (combined):', medicationData.dosage ? '✅' : '❌');
      console.log('- frequency (string):', medicationData.frequency ? '✅' : '❌');
      console.log('- startDate (datetime):', medicationData.startDate ? '✅' : '❌');
      console.log('- instructions (string):', medicationData.instructions ? '✅' : '❌');
      console.log('- prescriber (string):', medicationData.prescriber ? '✅' : '❌');

      // Call API to create medication
      const newRecord = await createMedication(medicationData);

      console.log('Medication created successfully:', newRecord);
      
      // Redirect back to pet details page
      router.push(`/pets/${petId}?tab=medications`);
    } catch (err) {
      console.error('Error adding medication:', err);
      
      // Enhanced error handling based on HTTP status codes
      let errorMessage = 'Failed to add medication. Please try again.';
      
      if (err.message.includes('401')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.message.includes('403')) {
        errorMessage = 'Access denied. Only veterinarians and administrators can prescribe medications.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid medication data. Please check all required fields.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Pet not found. Please try again.';
      } else if (err.message.includes('500')) {
        // Check if it's a database constraint error
        if (err.message.includes('constraint') || err.message.includes('null value')) {
          errorMessage = 'Database error: Missing required field. Please ensure all required fields are filled.';
        } else {
          errorMessage = 'Server error (500). Please try again or contact support if the issue persists.';
        }
      } else if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        errorMessage = 'Unable to connect to backend server. Please ensure the API server is running on http://localhost:5001';
      }
      
      setError(errorMessage);
      setIsSaving(false);
    }
  };

  const addMedicationContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Add Medication for {pet?.name || 'Pet'}</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading pet details...</Text>
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
                      Prescribed By
                    </Text>
                    <TextField.Root
                      id="prescribedBy"
                      value={formData.prescribedBy}
                      onChange={handleChange}
                      placeholder="Enter name of prescriber"
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
                      Administration Instructions
                    </Text>
                    <TextArea
                      id="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Enter instructions for administering medication"
                    />
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
                      {isSaving ? 'Saving...' : 'Save Medication'}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => router.push(`/pets/${petId}`)}
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
      <FeatureErrorBoundary featureName="AddMedication">
        {addMedicationContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}

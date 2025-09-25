'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { createPet } from '../../../services/petService';
import { uploadPetImage } from '../../../services/fileUploadService';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea } from '@radix-ui/themes';

export default function AddPet() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    birthDate: '',
    weight: '',
    weightUnit: 'lbs',
    color: '',
    gender: 'Male',
    microchipNumber: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Create FormData for pet data
      const petData = { ...formData };

      // Convert birthDate to ISO format if needed
      if (petData.birthDate) {
        const date = new Date(petData.birthDate);
        if (!isNaN(date.getTime())) {
          petData.birthDate = date.toISOString();
        }
      }

      // Upload image first if one was selected
      if (imageFile) {
        try {
          const uploadResult = await uploadPetImage(imageFile);
          petData.imageUrl = uploadResult.imageUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError('Failed to upload pet image. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Call API to create pet
      const newPet = await createPet(petData);

      // Redirect to the new pet's page
      router.push(`/pets/${newPet.id}`);
    } catch (err) {
      console.error('Error adding pet:', err);
      setError('Failed to add pet. Please try again.');
      setIsLoading(false);
    }
  };

  const addPetContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Add a New Pet</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="name">
                    Pet Name*
                  </Text>
                  <TextField.Root
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter pet name"
                    required
                  />
                </Box>

                <Grid columns="2" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="species">
                      Species*
                    </Text>
                    <Select.Root
                      defaultValue={formData.species}
                      onValueChange={(value) => handleSelectChange('species', value)}
                    >
                      <Select.Trigger id="species" />
                      <Select.Content>
                        <Select.Item value="Dog">Dog</Select.Item>
                        <Select.Item value="Cat">Cat</Select.Item>
                        <Select.Item value="Bird">Bird</Select.Item>
                        <Select.Item value="Fish">Fish</Select.Item>
                        <Select.Item value="Reptile">Reptile</Select.Item>
                        <Select.Item value="Small Mammal">Small Mammal</Select.Item>
                        <Select.Item value="Other">Other</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="breed">
                      Breed
                    </Text>
                    <TextField.Root
                      id="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      placeholder="Enter breed"
                    />
                  </Box>
                </Grid>

                <Grid columns="2" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="birthDate">
                      Birth Date
                    </Text>
                    <TextField.Root
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="gender">
                      Gender
                    </Text>
                    <Select.Root
                      defaultValue={formData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <Select.Trigger id="gender" />
                      <Select.Content>
                        <Select.Item value="Male">Male</Select.Item>
                        <Select.Item value="Female">Female</Select.Item>
                        <Select.Item value="Unknown">Unknown</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Grid>

                <Grid columns="2" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="weight">
                      Weight
                    </Text>
                    <TextField.Root
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="Enter weight"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="weightUnit">
                      Weight Unit
                    </Text>
                    <Select.Root
                      defaultValue={formData.weightUnit}
                      onValueChange={(value) => handleSelectChange('weightUnit', value)}
                    >
                      <Select.Trigger id="weightUnit" />
                      <Select.Content>
                        <Select.Item value="lbs">lbs</Select.Item>
                        <Select.Item value="kg">kg</Select.Item>
                        <Select.Item value="g">g</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Grid>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="color">
                    Color
                  </Text>
                  <TextField.Root
                    id="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Enter color"
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="microchipNumber">
                    Microchip Number
                  </Text>
                  <TextField.Root
                    id="microchipNumber"
                    value={formData.microchipNumber}
                    onChange={handleChange}
                    placeholder="Enter microchip number (if available)"
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="petImage">
                    Pet Photo
                  </Text>
                  <input
                    type="file"
                    id="petImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--gray-6)',
                      borderRadius: 'var(--radius-2)'
                    }}
                  />
                  {imagePreview && (
                    <Box mt="2">
                      <img
                        src={imagePreview}
                        alt="Pet preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: 'var(--radius-2)'
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="notes">
                    Notes
                  </Text>
                  <TextArea
                    id="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter any additional information about your pet"
                    style={{ minHeight: '100px' }}
                  />
                </Box>

                <Flex gap="3" mt="4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Adding Pet...' : 'Add Pet'}
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => router.push('/pets')}
                  >
                    Cancel
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="AddPet">
      {addPetContent}
    </FeatureErrorBoundary>
  );
}
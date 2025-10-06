'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPets } from '../../services/petService';
import { getImageUrl } from '../../services/fileUploadService'; // Add this import
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Grid, Avatar } from '@radix-ui/themes';
import Link from 'next/link';

export default function Pets() {
  const { user } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user's pets
    const fetchPets = async () => {
      try {
        const petsData = await getUserPets();
        setPets(petsData || []);
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError('Failed to load pets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, [user, router]);

  const handleAddPet = () => {
    router.push('/pets/add');
  };

  const petsContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Flex direction="column" gap="6">
          <Flex justify="between" align="center">
            <Heading size="6">My Pets</Heading>
            <Button onClick={handleAddPet}>Add Pet</Button>
          </Flex>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {isLoading ? (
            <Text>Loading pets...</Text>
          ) : pets.length === 0 ? (
            <Card>
              <Flex direction="column" align="center" gap="4" p="6">
                <Text size="4">You don't have any pets yet.</Text>
                <Button onClick={handleAddPet}>Add Your First Pet</Button>
              </Flex>
            </Card>
          ) : (
            <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
              {pets.map((pet) => (
                <Link href={`/pets/${pet.id}`} key={pet.id} style={{ textDecoration: 'none' }}>
                  <Card style={{ cursor: 'pointer', height: '100%' }}>
                    <Flex direction="column" gap="3" p="3">
                      <Flex align="center" gap="3">
                        <Avatar
                          size="4"
                          src={getImageUrl(pet.imageUrl)} // ✅ FIX: Use getImageUrl here
                          fallback={pet.name.charAt(0)}
                          radius="full"
                        />
                        <Box>
                          <Text size="5" weight="bold">{pet.name}</Text>
                          <Text size="2" color="gray">{pet.species} • {pet.breed}</Text>
                        </Box>
                      </Flex>
                      <Flex gap="3">
                        <Text size="2">Age: {pet.age}</Text>
                        <Text size="2">Weight: {pet.weight} {pet.weightUnit}</Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Link>
              ))}
            </Grid>
          )}
        </Flex>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="Pets">
        {petsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import FeatureErrorBoundary from '../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, Box, Button } from '@radix-ui/themes';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    console.log('[Home] Auth state changed:', { 
      user: user?.email || null, 
      hasUser: !!user,
      loading: false // We get this from context but don't use it here
    });
    
    // Only redirect if we have a valid authenticated user
    if (user && user.id) {
      console.log('[Home] User authenticated, redirecting to dashboard...');
      router.push('/dashboard');
    } else {
      console.log('[Home] No authenticated user, staying on home page');
    }
  }, [user, router]);

  const homeContent = (
    <>
      <Navbar />
      <Container size="3" py="9">
        <Flex direction="column" gap="6">
          <Box>
            <Heading size="9" mb="2">Welcome to PetPal</Heading>
            <Text size="5" color="gray">
              A comprehensive pet management system for pet owners and veterinarians
            </Text>
          </Box>

          <Flex gap="6" wrap="wrap">
            <Card style={{ flex: '1 1 300px' }}>
              <Flex direction="column" gap="3">
                <Heading size="4">Manage Your Pets</Heading>
                <Text>
                  Keep track of all your pets' information in one place. Store details like breed, age, weight, and more.
                </Text>
                <Link href="/auth/login" passHref>
                  <Button size="3">View My Pets</Button>
                </Link>
              </Flex>
            </Card>

            <Card style={{ flex: '1 1 300px' }}>
              <Flex direction="column" gap="3">
                <Heading size="4">Health Records</Heading>
                <Text>
                  Maintain a complete health history for your pets, including vaccinations, check-ups, and medications.
                </Text>
                <Link href="/auth/login" passHref>
                  <Button size="3">View Health Records</Button>
                </Link>
              </Flex>
            </Card>

            <Card style={{ flex: '1 1 300px' }}>
              <Flex direction="column" gap="3">
                <Heading size="4">Appointments</Heading>
                <Text>
                  Schedule and manage veterinary appointments for your pets. Get reminders for upcoming visits.
                </Text>
                <Link href="/auth/login" passHref>
                  <Button size="3">Manage Appointments</Button>
                </Link>
              </Flex>
            </Card>

            <Card style={{ flex: '1 1 300px' }}>
              <Flex direction="column" gap="3">
                <Heading size="4">Medications</Heading>
                <Text>
                  Track your pets' medications, including dosage, frequency, and reminders for when to administer them.
                </Text>
                <Link href="/auth/login" passHref>
                  <Button size="3">View Medications</Button>
                </Link>
              </Flex>
            </Card>
          </Flex>

          <Card>
            <Flex direction="column" gap="3" align="center" py="4">
              <Heading size="6">New to PetPal?</Heading>
              <Text align="center" size="4">
                Create an account to start managing your pets' health and appointments.
              </Text>
              <Flex gap="4" mt="2">
                <Link href="/auth/register" passHref>
                  <Button size="3">Register Now</Button>
                </Link>
                <Link href="/auth/login" passHref>
                  <Button size="3" variant="outline">Login</Button>
                </Link>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="Home">
      {homeContent}
    </FeatureErrorBoundary>
  );
}

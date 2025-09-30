'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select } from '@radix-ui/themes';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    preferredContactMethod: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register: authRegister } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Handle address fields separately
    if (id.startsWith('address.')) {
      const addressField = id.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate preferred contact method is selected
    if (!formData.preferredContactMethod) {
      setError('Please select a preferred contact method');
      return;
    }

    setIsLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      console.log('Attempting registration via AuthContext:', registrationData.email);
      const response = await authRegister(registrationData);
      console.log('Registration successful:', response);
      
      // AuthContext register should handle the user state automatically
      router.push('/pets');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Create a PetPal Account</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Grid columns="2" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="firstName">
                      First Name
                    </Text>
                    <TextField.Root
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="lastName">
                      Last Name
                    </Text>
                    <TextField.Root
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </Box>
                </Grid>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="email">
                    Email
                  </Text>
                  <TextField.Root
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="phone">
                    Phone Number
                  </Text>
                  <TextField.Root
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="preferredContactMethod">
                    Preferred Contact Method
                  </Text>
                  <Select.Root
                    value={formData.preferredContactMethod}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        preferredContactMethod: value
                      }));
                    }}
                    required
                  >
                    <Select.Trigger placeholder="Select preferred contact method *" />
                    <Select.Content>
                      <Select.Item value="Email">Email</Select.Item>
                      <Select.Item value="Phone">Phone</Select.Item>
                      <Select.Item value="SMS">SMS</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>

                {/* Address Section */}
                <Box>
                  <Text size="3" weight="bold" mb="3">Address</Text>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="address.street">
                        Street Address
                      </Text>
                      <TextField.Root
                        id="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        placeholder="Enter your street address"
                        required
                      />
                    </Box>

                    <Grid columns="2" gap="3">
                      <Box>
                        <Text as="label" size="2" mb="1" htmlFor="address.city">
                          City
                        </Text>
                        <TextField.Root
                          id="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          placeholder="Enter your city"
                          required
                        />
                      </Box>

                      <Box>
                        <Text as="label" size="2" mb="1" htmlFor="address.state">
                          State
                        </Text>
                        <TextField.Root
                          id="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          placeholder="Enter your state"
                          required
                        />
                      </Box>
                    </Grid>

                    <Box style={{ maxWidth: '200px' }}>
                      <Text as="label" size="2" mb="1" htmlFor="address.zipCode">
                        ZIP Code
                      </Text>
                      <TextField.Root
                        id="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        placeholder="Enter your ZIP code"
                        required
                      />
                    </Box>
                  </Flex>
                </Box>

                <Grid columns="2" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="password">
                      Password
                    </Text>
                    <TextField.Root
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="confirmPassword">
                      Confirm Password
                    </Text>
                    <TextField.Root
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </Box>
                </Grid>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Register'}
                </Button>
              </Flex>
            </form>

            <Text size="2" align="center">
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--accent-9)' }}>
                Login
              </Link>
            </Text>
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="Register">
      {registerContent}
    </FeatureErrorBoundary>
  );
}
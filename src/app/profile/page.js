'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/authService';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select } from '@radix-ui/themes';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    preferredContactMethod: 'Email'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        },
        phone: user.phone || '',
        preferredContactMethod: user.preferredContactMethod || 'Email'
      });
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [user, router]);

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
    setSuccess('');
    setIsLoading(true);

    try {
      // Prepare the data to send to the API (excluding email as it's not updatable)
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        phone: formData.phone,
        preferredContactMethod: formData.preferredContactMethod
      };

      // Call API to update user profile
      const updatedUser = await updateUserProfile(profileData);
      console.log('Profile updated successfully:', updatedUser);

      // Refresh user data in context
      await updateUser();

      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const profileContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">My Profile</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {success && (
              <Text color="green" size="2">
                {success}
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
                    placeholder="Email cannot be changed"
                    disabled
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
                  >
                    <Select.Trigger placeholder="Select contact method" />
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

                <Flex gap="3" mt="4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button type="button" variant="soft" onClick={() => router.push('/change-password')}>
                    Change Password
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
    <FeatureErrorBoundary featureName="Profile">
      <ProtectedRoute>
        {profileContent}
      </ProtectedRoute>
    </FeatureErrorBoundary>
  );
}
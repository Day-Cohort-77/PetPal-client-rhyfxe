'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../services/authService';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box } from '@radix-ui/themes';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await login({ email, password });

      // Only proceed if we got valid user data
      if (userData && userData.id) {
        authLogin(userData);
        router.push('/');
      } else {
        // No valid user data - treat as failed login
        setError('Email or password was incorrect. Please try again.');
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
      // Show error and stay on login page
      setError('Email or password was incorrect. Please try again.');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const loginContent = (
    <>
      <Navbar />
      <Container size="1" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Login to PetPal</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="email">
                    Email
                  </Text>
                  <TextField.Root
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="password">
                    Password
                  </Text>
                  <TextField.Root
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </Box>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Flex>
            </form>

            <Flex justify="between" mt="4">
              <Text size="2">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" style={{ color: 'var(--accent-9)' }}>
                  Register
                </Link>
              </Text>
              <Link href="/auth/forgot-password" style={{ color: 'var(--accent-9)', fontSize: 'var(--font-size-1)' }}>
                Forgot password?
              </Link>
            </Flex>
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="Login">
      {loginContent}
    </FeatureErrorBoundary>
  );
}
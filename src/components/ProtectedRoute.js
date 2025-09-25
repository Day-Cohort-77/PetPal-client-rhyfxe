'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Using next/navigation for App Router
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Additional validation: if we have a user but it seems invalid, refresh auth
  useEffect(() => {
    if (!loading && user && (!user.id || !user.email)) {
      console.log('Invalid user data detected, refreshing auth');
      refreshAuth()
        .then((validUser) => {
          if (!validUser) {
            router.push('/auth/login');
          }
        })
        .catch((error) => {
          console.error('Error refreshing auth:', error);
          router.push('/auth/login');
        });
    }
  }, [user, loading, refreshAuth, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // More strict validation: user must have id and email
  if (!user || !user.id || !user.email) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
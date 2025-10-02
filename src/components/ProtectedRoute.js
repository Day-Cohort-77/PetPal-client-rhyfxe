'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Using next/navigation for App Router
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[ProtectedRoute] TESTING MODE: Auth state check:', { user: user?.email || null, loading });
    
    // In testing mode, we don't redirect - the fake user is always authenticated
    if (!loading && !user) {
      console.log('[ProtectedRoute] TESTING MODE: No user found, but not redirecting for testing');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // TESTING MODE: Allow access even without proper user for medication system testing
  if (!user || !user.id) {
    console.log('[ProtectedRoute] TESTING MODE: Allowing access even without proper user');
    // Don't return null, show the content anyway for testing
  }

  console.log('[ProtectedRoute] TESTING MODE: Rendering protected content for user:', user?.email || 'no user');
  return children;
}

export default ProtectedRoute;
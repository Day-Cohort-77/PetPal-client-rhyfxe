'use client';

import React from 'react';
import { NotificationDisplay } from './medications';
import { useAuth } from '../contexts/AuthContext';

const NotificationWrapper = ({ children }) => {
  const { user } = useAuth();

  return (
    <>
      {children}
      {/* Show medication reminders for authenticated users */}
      {user && <NotificationDisplay userId={user.id} />}
    </>
  );
};

export default NotificationWrapper;
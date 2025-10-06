import React from 'react';
import { NotificationDisplay } from '../medications';
import { useAuth } from '../../contexts/AuthContext';

// Example of how to integrate NotificationDisplay into your main layout
const LayoutWithNotifications = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-header">
        {/* Your existing header/navbar content */}
        <h1>PetPal</h1>
      </header>

      <main className="app-main">
        {children}
      </main>

      {/* Notification Display - shows medication reminders */}
      {user && (
        <NotificationDisplay userId={user.id} />
      )}

      <style jsx>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .app-header {
          background: #007bff;
          color: white;
          padding: 1rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .app-main {
          flex: 1;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default LayoutWithNotifications;
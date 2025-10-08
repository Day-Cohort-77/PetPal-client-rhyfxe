import React, { useState, useEffect, useCallback } from 'react';
import { getActiveReminders, logAdministration } from '../../services/medicationService';

const NotificationDisplay = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getActiveReminders(userId);
      setNotifications(response || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, fetchNotifications]);

  const handleAdministered = async (reminderId, medicationId, petId) => {
    setLoading(true);
    try {
      await logAdministration({
        medicationId: parseInt(medicationId),
        petId: parseInt(petId),
        reminderId: reminderId ? parseInt(reminderId) : null,
        status: 'administered',
        administeredAt: new Date().toISOString(),
        notes: ''
      });
      
      // Remove notification from display
      setNotifications(prev => 
        prev.filter(notification => notification.id !== reminderId)
      );
    } catch (error) {
      console.error('Error logging administration:', error);
      alert('Error logging medication administration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipped = async (reminderId, medicationId, petId) => {
    setLoading(true);
    try {
      await logAdministration({
        medicationId: parseInt(medicationId),
        petId: parseInt(petId),
        reminderId: reminderId ? parseInt(reminderId) : null,
        status: 'skipped',
        administeredAt: new Date().toISOString(),
        notes: 'Skipped by user'
      });
      
      // Remove notification from display
      setNotifications(prev => 
        prev.filter(notification => notification.id !== reminderId)
      );
    } catch (error) {
      console.error('Error logging skip:', error);
      alert('Error logging medication skip: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-display">
      <h3>🔔 Medication Reminders</h3>
      {notifications.map(notification => (
        <div key={notification.id} className="notification-card">
          <div className="notification-content">
            <h4>{notification.medicationName}</h4>
            <p><strong>Pet:</strong> {notification.petName}</p>
            <p><strong>Time:</strong> {notification.time}</p>
            <p><strong>Dosage:</strong> {notification.dosage}</p>
            {notification.instructions && (
              <p><strong>Instructions:</strong> {notification.instructions}</p>
            )}
          </div>
          <div className="notification-actions">
            <button
              onClick={() => handleAdministered(
                notification.id, 
                notification.medicationId, 
                notification.petId
              )}
              disabled={loading}
              className="btn-administered"
            >
              ✓ Administered
            </button>
            <button
              onClick={() => handleSkipped(
                notification.id, 
                notification.medicationId, 
                notification.petId
              )}
              disabled={loading}
              className="btn-skipped"
            >
              ✗ Skip
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        .notification-display {
          position: fixed;
          top: 80px;
          right: 20px;
          width: 320px;
          max-height: 500px;
          overflow-y: auto;
          z-index: 1000;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border: 1px solid #e0e0e0;
        }
        .notification-display h3 {
          background: #ff6b35;
          color: white;
          margin: 0;
          padding: 15px;
          border-radius: 8px 8px 0 0;
          font-size: 16px;
        }
        .notification-card {
          border-bottom: 1px solid #f0f0f0;
          padding: 15px;
        }
        .notification-card:last-child {
          border-bottom: none;
        }
        .notification-content h4 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 16px;
        }
        .notification-content p {
          margin: 6px 0;
          font-size: 14px;
          color: #666;
        }
        .notification-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .btn-administered, .btn-skipped {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        .btn-administered {
          background: #28a745;
          color: white;
        }
        .btn-administered:hover {
          background: #218838;
        }
        .btn-skipped {
          background: #6c757d;
          color: white;
        }
        .btn-skipped:hover {
          background: #5a6268;
        }
        .btn-administered:disabled, .btn-skipped:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .notification-display {
            position: fixed;
            top: 60px;
            left: 10px;
            right: 10px;
            width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationDisplay;
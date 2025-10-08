import React, { useState, useEffect } from 'react';
import { setReminders } from '../../services/medicationService';

const MedicationReminderSettings = ({ medicationId, petId, onSave, existingReminders = [] }) => {
  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    times: ['08:00'],
    notificationMethods: ['app']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingReminders.length > 0) {
      setReminderSettings({
        enabled: existingReminders.some(r => r.enabled),
        times: existingReminders.map(r => r.time),
        notificationMethods: existingReminders[0]?.notificationMethods || ['app']
      });
    }
  }, [existingReminders]);

  const addReminderTime = () => {
    setReminderSettings(prev => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const removeReminderTime = (index) => {
    setReminderSettings(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateReminderTime = (index, time) => {
    setReminderSettings(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  const toggleNotificationMethod = (method) => {
    setReminderSettings(prev => ({
      ...prev,
      notificationMethods: prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method]
    }));
  };

  const handleSave = async () => {
    if (!reminderSettings.enabled) {
      onSave && onSave();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await setReminders({
        medicationId,
        petId,
        enabled: reminderSettings.enabled,
        times: reminderSettings.times,
        notificationMethods: reminderSettings.notificationMethods
      });

      if (response.success) {
        onSave && onSave(response.reminders);
      } else {
        setError('Failed to save reminder settings');
      }
    } catch (err) {
      setError('Error saving reminder settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reminder-settings">
      <h3>Medication Reminders</h3>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={reminderSettings.enabled}
            onChange={(e) => setReminderSettings(prev => ({
              ...prev,
              enabled: e.target.checked
            }))}
          />
          Enable medication reminders
        </label>
      </div>

      {reminderSettings.enabled && (
        <>
          <div className="form-group">
            <label>Reminder Times</label>
            {reminderSettings.times.map((time, index) => (
              <div key={index} className="time-input-group">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateReminderTime(index, e.target.value)}
                />
                {reminderSettings.times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReminderTime(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addReminderTime}
              className="btn-add"
            >
              Add Another Time
            </button>
          </div>

          <div className="form-group">
            <label>Notification Methods</label>
            <div className="notification-methods">
              {['app', 'email'].map(method => (
                <label key={method} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={reminderSettings.notificationMethods.includes(method)}
                    onChange={() => toggleNotificationMethod(method)}
                  />
                  {method === 'app' ? 'App Notification' : 'Email'}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Save Reminder Settings'}
        </button>
      </div>

      <style jsx>{`
        .reminder-settings {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        .time-input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .time-input-group input[type="time"] {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .notification-methods {
          display: flex;
          gap: 15px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: normal;
        }
        .btn-add, .btn-remove {
          padding: 5px 10px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .btn-add:hover {
          background: #f0f0f0;
        }
        .btn-remove {
          background: #ff4444;
          color: white;
          border-color: #ff4444;
        }
        .btn-remove:hover {
          background: #cc3333;
        }
        .btn-primary {
          background: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-primary:hover {
          background: #0056b3;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error-message {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default MedicationReminderSettings;
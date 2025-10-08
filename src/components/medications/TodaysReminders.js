'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTodaysScheduleForPet, logAdministration } from '@/services/medicationService';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';

const TodaysReminders = ({ petId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodaysReminders = useCallback(async () => {
    try {
      setLoading(true);
      const todaysSchedule = await getTodaysScheduleForPet(petId);
      setReminders(todaysSchedule);
      setError(null);
    } catch (err) {
      console.error('Error fetching today\'s reminders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    if (petId) {
      fetchTodaysReminders();
    }
  }, [petId, fetchTodaysReminders]);

  const handleAdministered = async (reminder) => {
    try {
      await logAdministration({
        medicationId: reminder.medicationId,
        petId: reminder.petId,
        reminderId: reminder.id,
        status: 'administered',
        administeredAt: new Date().toISOString(),
        notes: 'Administered via pet medications page'
      });

      // Update the reminder status locally
      setReminders(prev => 
        prev.map(r => 
          r.id === reminder.id 
            ? { ...r, status: 'administered' }
            : r
        )
      );
    } catch (error) {
      console.error('Error logging administration:', error);
      alert('Failed to log administration. Please try again.');
    }
  };

  const handleSkipped = async (reminder) => {
    try {
      await logAdministration({
        medicationId: reminder.medicationId,
        petId: reminder.petId,
        reminderId: reminder.id,
        status: 'skipped',
        administeredAt: new Date().toISOString(),
        notes: 'Skipped via pet medications page'
      });

      // Update the reminder status locally
      setReminders(prev => 
        prev.map(r => 
          r.id === reminder.id 
            ? { ...r, status: 'skipped' }
            : r
        )
      );
    } catch (error) {
      console.error('Error logging skip:', error);
      alert('Failed to log skip. Please try again.');
    }
  };

  const getReminderStatus = (reminder) => {
    const now = new Date();
    const reminderTime = reminder.scheduledFor;
    const fiveMinutesAgo = addMinutes(now, -5);

    if (reminder.status === 'administered') {
      return { text: 'Administered', color: 'bg-green-100 text-green-800', icon: '✓' };
    } else if (reminder.status === 'skipped') {
      return { text: 'Skipped', color: 'bg-gray-100 text-gray-800', icon: '⊘' };
    } else if (isAfter(now, reminderTime)) {
      return { text: 'Overdue', color: 'bg-red-100 text-red-800', icon: '!' };
    } else if (isAfter(now, fiveMinutesAgo) && isBefore(now, addMinutes(reminderTime, 5))) {
      return { text: 'Due Now', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' };
    } else {
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: '○' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Reminders</h2>
        <div className="text-gray-500">Loading today&apos;s medication schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Reminders</h2>
        <div className="text-red-600">Error loading reminders: {error}</div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Reminders</h2>
        <div className="text-gray-500 text-center py-4">
          <div className="text-4xl mb-2">📅</div>
          <p>No medication reminders scheduled for today</p>
          <p className="text-sm mt-1">Reminders will appear here when medications have scheduled doses</p>
          <div className="text-xs mt-2 p-2 bg-gray-100 rounded">
            <strong>Debug Info:</strong> PetId: {petId}, Loading: {loading.toString()}, Error: {error || 'none'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today&apos;s Reminders</h2>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'MMMM d, yyyy')}
        </div>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => {
          const status = getReminderStatus(reminder);
          const canTakeAction = reminder.status === 'pending';

          return (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{status.icon}</div>
                <div>
                  <div className="font-medium">{reminder.medicationName}</div>
                  <div className="text-sm text-gray-600">
                    {reminder.dosage} • {format(reminder.scheduledFor, 'h:mm a')}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>

              {canTakeAction && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAdministered(reminder)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    ✓ Given
                  </button>
                  <button
                    onClick={() => handleSkipped(reminder)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    ⊘ Skip
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {reminders.filter(r => r.status === 'administered').length} administered
          </span>
          <span>
            {reminders.filter(r => r.status === 'pending' && r.isOverdue).length} overdue
          </span>
          <span>
            {reminders.filter(r => r.status === 'pending' && !r.isOverdue).length} upcoming
          </span>
        </div>
      </div>
    </div>
  );
};

export default TodaysReminders;
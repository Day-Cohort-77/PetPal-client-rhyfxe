import { get, post, put, del } from './apiService';

// Get all medications for a pet
export const getMedicationsForPet = async (petId, options = {}) => {
  console.log('getMedicationsForPet called with petId:', petId, 'type:', typeof petId, 'options:', options);
  
  if (!petId) {
    throw new Error('Pet ID is required');
  }
  
  // Convert petId to integer if it's a string number
  const numericPetId = typeof petId === 'string' ? parseInt(petId, 10) : petId;
  console.log('Converted petId to:', numericPetId, 'type:', typeof numericPetId);
  
  const params = new URLSearchParams();
  
  // Add query parameters for filtering and sorting
  if (options.isActive !== undefined && options.isActive !== null) {
    params.append('isActive', options.isActive.toString());
  }
  
  if (options.medicationName) {
    params.append('medicationName', options.medicationName);
  }
  
  if (options.sortBy) {
    params.append('sortBy', options.sortBy);
  }
  
  if (options.sortOrder) {
    params.append('sortOrder', options.sortOrder);
  }
  
  const endpoint = `/medications/pet/${numericPetId}${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('Making request to endpoint:', endpoint);
  console.log('Full URL would be:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`);
  
  try {
    const response = await get(endpoint);
    console.log('Medications response:', response);
    console.log('Response type:', typeof response, 'Array?', Array.isArray(response));
    if (Array.isArray(response)) {
      console.log('Response length:', response.length);
      if (response.length > 0) {
        console.log('First medication sample:', response[0]);
      }
    }
    return response;
  } catch (error) {
    console.error('Error fetching medications:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific error cases for better UX
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in to view medications.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Insufficient permissions to view medications.');
    } else if (error.message.includes('404')) {
      throw new Error('Pet not found or no medications available for this pet.');
    }
    
    throw error;
  }
};

// Get specific medication details
export const getMedicationById = async (id) => {
  try {
    return await get(`/medications/${id}`);
  } catch (error) {
    if (error.message.includes('403')) {
      throw new Error('Access denied. Insufficient permissions to view medication.');
    } else if (error.message.includes('404')) {
      throw new Error('Medication not found.');
    }
    throw error;
  }
};

// Add new medication (Veterinarian/Admin only)
export const createMedication = async (medicationData) => {
  try {
    return await post('/medications', medicationData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can prescribe medications.');
    }
    throw error;
  }
};

// Update medication (Veterinarian/Admin only)
export const updateMedication = async (id, medicationData) => {
  try {
    return await put(`/medications/${id}`, medicationData);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can modify medications.');
    } else if (error.message.includes('404')) {
      throw new Error('Medication not found.');
    }
    throw error;
  }
};

// Delete medication (Veterinarian/Admin only)
export const deleteMedication = async (id) => {
  try {
    return await del(`/medications/${id}`);
  } catch (error) {
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. Only veterinarians and administrators can remove medications.');
    } else if (error.message.includes('404')) {
      throw new Error('Medication not found.');
    }
    throw error;
  }
};

// Set medication reminders
export const setReminders = async (reminderData) => {
  try {
    return await post('/medications/reminders', reminderData);
  } catch (error) {
    console.error('Error setting medication reminders:', error);
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. You can only set reminders for your own pets.');
    }
    throw error;
  }
};

// Get active reminders for a user
export const getActiveReminders = async (userId) => {
  try {
    return await get(`/medications/reminders/active/${userId}`);
  } catch (error) {
    console.error('Error fetching active reminders:', error);
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    }
    throw error;
  }
};

// Log medication administration
export const logAdministration = async (logData) => {
  try {
    return await post('/api/medication-reminders/log', logData);
  } catch (error) {
    console.error('Error logging medication administration:', error);
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. You can only log medications for your own pets.');
    }
    throw error;
  }
};

// Get medication history
export const getMedicationHistory = async (petId, medicationId) => {
  try {
    return await get(`/medications/history/${petId}/${medicationId}`);
  } catch (error) {
    console.error('Error fetching medication history:', error);
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. You can only view history for your own pets.');
    }
    throw error;
  }
};

// Get active reminders for a specific pet
export const getActiveRemindersForPet = async (petId) => {
  try {
    // Use the new backend endpoint for pet-specific reminders
    const reminders = await get(`/medications/reminders/pet/${petId}`);
    
    // Transform the backend data to match our frontend expectations
    return reminders.map(reminder => ({
      id: reminder.id,
      medicationId: reminder.medicationId,
      petId: reminder.petId,
      medicationName: reminder.medicationName,
      dosage: reminder.dosage,
      time: reminder.time,
      scheduledFor: new Date(reminder.scheduledFor),
      status: reminder.status,
      isOverdue: reminder.isOverdue,
      notificationMethods: reminder.notificationMethods
    }));
  } catch (error) {
    console.error('Error fetching pet reminders:', error);
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. You can only view reminders for your own pets.');
    }
    throw error;
  }
};

// Get today's medication schedule for a pet
export const getTodaysScheduleForPet = async (petId) => {
  try {
    console.log(`[getTodaysScheduleForPet] Called with petId: ${petId}`);
    const reminders = await getActiveRemindersForPet(petId);
    console.log(`[getTodaysScheduleForPet] Got ${reminders.length} reminders:`, reminders);
    
    const now = new Date();
    const today = now.toDateString();
    console.log(`[getTodaysScheduleForPet] Filtering for today: ${today}`);
    
    // Filter for today only and sort by time
    const todaysReminders = reminders
      .filter(reminder => reminder.scheduledFor.toDateString() === today)
      .sort((a, b) => a.scheduledFor - b.scheduledFor);

    console.log(`[getTodaysScheduleForPet] Today's reminders: ${todaysReminders.length}`, todaysReminders);
    return todaysReminders;
  } catch (error) {
    console.error('Error fetching today\'s schedule:', error);
    throw error;
  }
};

// Helper function to generate reminder times from frequency
const generateReminderTimes = (frequency) => {
  // Parse common frequency patterns and generate times
  const freq = frequency.toLowerCase();
  
  if (freq.includes('once daily') || freq.includes('1x daily') || freq.includes('daily')) {
    return ['08:00'];
  } else if (freq.includes('twice daily') || freq.includes('2x daily') || freq.includes('bid')) {
    return ['08:00', '20:00'];
  } else if (freq.includes('three times') || freq.includes('3x daily') || freq.includes('tid')) {
    return ['08:00', '14:00', '20:00'];
  } else if (freq.includes('four times') || freq.includes('4x daily') || freq.includes('qid')) {
    return ['08:00', '12:00', '16:00', '20:00'];
  } else if (freq.includes('every 8 hours')) {
    return ['08:00', '16:00', '00:00'];
  } else if (freq.includes('every 6 hours')) {
    return ['06:00', '12:00', '18:00', '00:00'];
  } else if (freq.includes('every 4 hours')) {
    return ['06:00', '10:00', '14:00', '18:00', '22:00'];
  } else {
    // Default to once daily for unknown patterns
    return ['08:00'];
  }
};
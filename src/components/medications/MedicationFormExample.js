import React, { useState } from 'react';
import { MedicationReminderSettings, MedicationHistory } from '../medications';

// Example of how to integrate the reminder settings into a medication form
const MedicationFormExample = ({ medication, petId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: medication?.name || '',
    dosage: medication?.dosage || '',
    frequency: medication?.frequency || '',
    startDate: medication?.startDate || new Date().toISOString().split('T')[0],
    endDate: medication?.endDate || '',
    instructions: medication?.instructions || '',
    prescriber: medication?.prescriber || ''
  });

  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Save medication logic here
    await onSave(formData);
  };

  const handleReminderSave = (reminders) => {
    console.log('Reminders saved:', reminders);
    setShowReminderSettings(false);
  };

  return (
    <div className="medication-form-container">
      <form onSubmit={handleSubmit} className="medication-form">
        <h2>{medication ? 'Edit Medication' : 'Add New Medication'}</h2>
        
        <div className="form-group">
          <label htmlFor="name">Medication Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dosage">Dosage *</label>
          <input
            type="text"
            id="dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleInputChange}
            placeholder="e.g., 10mg, 1 tablet"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="frequency">Frequency *</label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleInputChange}
            required
          >
            <option value="">Select frequency</option>
            <option value="Once daily">Once daily</option>
            <option value="Twice daily">Twice daily</option>
            <option value="Three times daily">Three times daily</option>
            <option value="As needed">As needed</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional)</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            placeholder="e.g., Give with food, morning and evening"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prescriber">Prescriber</label>
          <input
            type="text"
            id="prescriber"
            name="prescriber"
            value={formData.prescriber}
            onChange={handleInputChange}
            placeholder="Dr. Smith, ABC Veterinary Clinic"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {medication ? 'Update Medication' : 'Add Medication'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      {/* Reminder Settings Section */}
      <div className="reminder-section">
        <button
          type="button"
          onClick={() => setShowReminderSettings(!showReminderSettings)}
          className="btn-toggle"
        >
          {showReminderSettings ? '📱 Hide' : '📱 Set Up'} Reminders
        </button>

        {showReminderSettings && (
          <MedicationReminderSettings
            medicationId={medication?.id}
            petId={petId}
            onSave={handleReminderSave}
            existingReminders={medication?.reminders || []}
          />
        )}
      </div>

      {/* History Section - Only show for existing medications */}
      {medication && (
        <div className="history-section">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="btn-toggle"
          >
            {showHistory ? '📊 Hide' : '📊 View'} Administration History
          </button>

          {showHistory && (
            <MedicationHistory
              petId={petId}
              medicationId={medication.id}
            />
          )}
        </div>
      )}

      <style jsx>{`
        .medication-form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .medication-form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          margin-bottom: 20px;
        }
        .medication-form h2 {
          margin: 0 0 25px 0;
          color: #333;
          text-align: center;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 30px;
        }
        .btn-primary {
          background: #007bff;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }
        .btn-primary:hover {
          background: #0056b3;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-secondary:hover {
          background: #5a6268;
        }
        .reminder-section,
        .history-section {
          margin-bottom: 20px;
        }
        .btn-toggle {
          width: 100%;
          padding: 15px;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          color: #495057;
          transition: background-color 0.2s;
        }
        .btn-toggle:hover {
          background: #e9ecef;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .medication-form-container {
            padding: 10px;
          }
          .medication-form {
            padding: 20px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicationFormExample;
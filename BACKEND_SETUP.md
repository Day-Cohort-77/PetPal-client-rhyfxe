# Backend Server Setup Issue

## Problem
The frontend is trying to connect to a backend API at `http://localhost:5001` but the server is not running, causing 500 Internal Server Error when trying to create medications.

## Current Configuration
- Frontend: Running on port 3001
- Expected Backend: Should run on port 5001 (configured in .env.local)
- API Endpoints Expected:
  - `POST /medications` - Create new medication
  - `GET /medications/pet/{petId}` - Get medications for a pet

## Required Backend API Structure

Based on the frontend medication service, the backend should support:

### POST /medications
**Required Fields:**
```json
{
  "petId": 1,
  "medicationName": "Heartworm Prevention",
  "dosage": "50mg",
  "dosageUnit": "mg",
  "frequency": "once_daily", 
  "startDate": "2025-09-26T00:00:00.000Z",
  "endDate": null,
  "prescribedBy": "Dr. Smith",
  "instructions": "Give with food",
  "reason": "",
  "notes": "",
  "isOngoing": true,
  "reminders": true,
  "reminderTimes": ["08:00"],
  "recordType": "MEDICATION"
}
```

**Expected Responses:**
- 200: Success with created medication object
- 400: Bad Request (validation errors)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 500: Internal Server Error

## Solutions

### Option 1: Start Existing Backend
If there's a separate backend repository:
1. Clone the backend repository
2. Install dependencies (`npm install`)
3. Start the server (`npm start` or `npm run dev`)
4. Ensure it runs on port 5001

### Option 2: Create Mock Backend
For testing purposes, create a simple Express server:

```bash
# In a separate terminal/directory
mkdir petpal-backend
cd petpal-backend
npm init -y
npm install express cors cookie-parser
# Create simple server with medication endpoints
```

### Option 3: Update Frontend for Testing
Temporarily modify the frontend to handle the missing backend gracefully with mock data.

## Immediate Action Needed
1. Identify if there's a separate backend repository
2. Start the backend server on port 5001
3. Or implement one of the solutions above
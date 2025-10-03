# AuthContext.js - Unified Authentication Guide

## Overview
The unified `AuthContext.js` provides complete authentication and authorization functionality for the PetPal application. It works seamlessly with all features including medications, appointments, pets, and user management.

## What Changed

### ✅ New Features Added
1. **Additional Role Checking Methods**
   - `isPetOwner()` - Check if user is a pet owner
   - `canEditPet(petOwnerId)` - Check edit permissions for specific pets
   - `canManageMedications()` - Check medication management permissions

2. **Improved State Management**
   - `isInitialized` - Track if auth system has completed initial setup
   - Better loading states during authentication
   - Enhanced error handling with specific error types

3. **Performance Optimizations**
   - All functions use `useCallback` to prevent unnecessary re-renders
   - Proper cleanup of effects and timers
   - Prevention of race conditions during initialization

4. **Better Documentation**
   - JSDoc comments for all functions
   - Clear parameter and return type descriptions
   - Usage examples in comments

### 🔧 Fixed Issues
1. **Missing Functions** - Added `isAdmin()` and `isVeterinarian()` that were causing errors
2. **Memory Leaks** - Proper cleanup in useEffect hooks
3. **Race Conditions** - Better handling of concurrent auth requests
4. **Error States** - Improved error messaging and handling

## Available Methods

### State Properties
```javascript
const { user, loading, error, isInitialized } = useAuth();
```

| Property | Type | Description |
|----------|------|-------------|
| `user` | Object\|null | Current authenticated user with id, email, roles, etc. |
| `loading` | boolean | True when auth operation is in progress |
| `error` | string\|null | Error message if auth operation failed |
| `isInitialized` | boolean | True when initial auth check is complete |

### Authentication Methods
```javascript
const { login, logout, updateUser, refreshAuth } = useAuth();
```

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `login` | email, password | Promise<response> | Authenticate user with credentials |
| `logout` | none | Promise<void> | End user session |
| `updateUser` | none | Promise<user\|null> | Refresh user data from backend |
| `refreshAuth` | none | Promise<user\|null> | Force check authentication status |

### Role Checking Methods
```javascript
const { hasRole, isAdmin, isVeterinarian, isPetOwner } = useAuth();
```

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `hasRole` | role (string) | boolean | Check if user has specific role |
| `isAdmin` | none | boolean | Check if user is an admin |
| `isVeterinarian` | none | boolean | Check if user is a veterinarian |
| `isPetOwner` | none | boolean | Check if user is a pet owner |

### Permission Checking Methods
```javascript
const { canEditPet, canManageMedications } = useAuth();
```

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `canEditPet` | petOwnerId | boolean | Check if user can edit a specific pet |
| `canManageMedications` | none | boolean | Check if user can manage medications |

## Usage Examples

### Basic Authentication
```javascript
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { login, loading, error } = useAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
  
  return (
    // Your login form
  );
}
```

### Role-Based UI
```javascript
function AppointmentDetails() {
  const { isAdmin, isVeterinarian, user } = useAuth();
  
  const canModify = () => {
    if (isAdmin()) return true;
    if (isVeterinarian() && appointment.veterinarianId === user.id) return true;
    if (appointment.ownerId === user.id) return true;
    return false;
  };
  
  return (
    <div>
      {canModify() && (
        <button onClick={handleEdit}>Edit</button>
      )}
    </div>
  );
}
```

### Medication Management
```javascript
function MedicationForm() {
  const { canManageMedications } = useAuth();
  
  if (!canManageMedications()) {
    return <div>Access Denied</div>;
  }
  
  return (
    // Medication form
  );
}
```

### Pet Ownership Check
```javascript
function PetProfile({ pet }) {
  const { canEditPet } = useAuth();
  
  return (
    <div>
      <h1>{pet.name}</h1>
      {canEditPet(pet.ownerId) && (
        <Link href={`/pets/${pet.id}/edit`}>Edit Pet</Link>
      )}
    </div>
  );
}
```

### Loading States
```javascript
function Dashboard() {
  const { user, loading, isInitialized } = useAuth();
  
  if (!isInitialized || loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Redirect to="/auth/login" />;
  }
  
  return (
    <div>Welcome, {user.firstName}!</div>
  );
}
```

## Role Hierarchy

### Admin
- **Full Access** - Can manage all resources
- Can edit any pet
- Can manage all medications
- Can view and modify all appointments
- Can manage users and settings

### Veterinarian
- **Professional Access** - Can manage medical information
- Can edit any pet
- Can manage all medications
- Can view and modify appointments they're assigned to
- Cannot manage user accounts

### Pet Owner (Default)
- **Personal Access** - Can manage their own pets
- Can only edit their own pets
- Cannot manage medications (view only)
- Can manage their own appointments
- Can update their own profile

## Backend Integration

The AuthContext integrates with your backend through `authService.js`:

### API Endpoints Used
- `POST /auth/login` - User authentication
- `POST /auth/logout` - End session
- `GET /auth/me` - Get current user data
- `PUT /auth/profile` - Update user profile

### Cookie-Based Authentication
The backend uses HTTP-only cookies for session management. The AuthContext:
1. Stores user data in localStorage for quick access
2. Relies on cookies for actual authentication
3. Automatically refreshes user data when needed
4. Handles session expiration gracefully

## Migration from Old Files

If you have been using `AuthContext_fake.js` or `AuthContext_old.js`:

### Option 1: Keep for Reference (Recommended)
```bash
# Rename old files to indicate they're archived
mv src/contexts/AuthContext_fake.js src/contexts/AuthContext_fake.js.backup
mv src/contexts/AuthContext_old.js src/contexts/AuthContext_old.js.backup
```

### Option 2: Delete Old Files
```bash
# Only if you're sure you don't need them
rm src/contexts/AuthContext_fake.js
rm src/contexts/AuthContext_old.js
```

## Testing

### Test with Real Backend
The unified AuthContext is designed for production use with your backend API.

### Test Authentication Flow
1. Try logging in with valid credentials
2. Check that user roles are correctly loaded
3. Verify role-based access works (admin, vet, owner)
4. Test logout and session clearing
5. Refresh the page to verify session persistence

### Debug Mode
All functions include console logging. Check your browser console to see:
- Authentication state changes
- Role checking results
- Error messages
- API call results

## Troubleshooting

### Issue: "useAuth must be used within an AuthProvider"
**Solution:** Ensure your app is wrapped with `<AuthProvider>`
```javascript
// In your layout.js or _app.js
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Issue: "isAdmin is not a function"
**Solution:** Make sure you're using the updated AuthContext.js, not the old or fake versions.

### Issue: User data not persisting after refresh
**Solution:** Check that:
1. Backend is returning proper cookies
2. Browser allows cookies from your backend domain
3. CORS is configured correctly on backend

### Issue: Role checking always returns false
**Solution:** Verify that:
1. Backend returns user data with `roles` array
2. Role names match exactly (case-sensitive)
3. User actually has roles assigned in database

## Best Practices

### 1. Always Check Loading State
```javascript
const { user, loading } = useAuth();

if (loading) return <Spinner />;
```

### 2. Use Specific Role Checks
```javascript
// Good
if (isAdmin() || isVeterinarian()) { ... }

// Avoid
if (user?.roles?.includes('Admin')) { ... }
```

### 3. Handle Errors Gracefully
```javascript
const { login, error } = useAuth();

try {
  await login(email, password);
} catch (err) {
  // Show error to user
}
```

### 4. Don't Store Sensitive Data in User Object
The user object is stored in localStorage - don't add sensitive information to it.

## File Structure

```
src/
  contexts/
    AuthContext.js              ← MAIN FILE (use this one)
    AuthContext_fake.js.backup  ← Testing version (archived)
    AuthContext_old.js.backup   ← Old version (archived)
  services/
    authService.js              ← Backend API integration
  components/
    ProtectedRoute.js           ← Uses AuthContext
    Navbar.js                   ← Uses AuthContext
```

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify backend API is running and accessible
3. Check that all role names match between frontend and backend
4. Review this guide for usage examples
5. Test with a fresh login to clear any stale session data

---

**Last Updated:** October 2, 2025
**Version:** 2.0 (Unified Production Release)

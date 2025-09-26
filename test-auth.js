// Test script to verify authentication with backend
console.log('Testing authentication...');

// Test credentials provided by backend AI
const testEmail = 'user@petpal.com';
const testPassword = 'User123!';

console.log(`Testing login with: ${testEmail}`);

// Simulate what the login form would do
fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: testEmail,
    password: testPassword,
  }),
  credentials: 'include', // Important for cookie-based auth
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', [...response.headers.entries()]);
  return response.json();
})
.then(data => {
  console.log('Login response data:', data);
})
.catch(error => {
  console.error('Login test failed:', error);
});
// Test authenticated request to get user data
console.log('Testing authenticated /auth/me endpoint...');

// First login to get the cookie
fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@petpal.com',
    password: 'User123!',
  }),
  credentials: 'include',
})
.then(response => response.json())
.then(loginData => {
  console.log('Login successful:', loginData);
  
  // Now test the /auth/me endpoint that AuthContext uses
  return fetch('http://localhost:5000/auth/me', {
    method: 'GET',
    credentials: 'include', // Include cookies
  });
})
.then(response => {
  console.log('Auth/me response status:', response.status);
  return response.json();
})
.then(userData => {
  console.log('Current user data:', userData);
  
  // Test getting user's pets
  return fetch('http://localhost:5000/user/pets', {
    method: 'GET',
    credentials: 'include',
  });
})
.then(response => {
  console.log('User pets response status:', response.status);
  return response.json();
})
.then(pets => {
  console.log('User pets:', pets);
})
.catch(error => {
  console.error('Test failed:', error);
});
// Test authenticated request with better error handling
console.log('Testing authenticated /auth/me endpoint with error handling...');

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
.then(response => {
  console.log('Login response headers:', [...response.headers.entries()]);
  return response.json();
})
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
  console.log('Auth/me response headers:', [...response.headers.entries()]);
  
  if (response.status === 401) {
    return response.text().then(text => {
      console.log('401 response body:', text);
      throw new Error(`401 Unauthorized: ${text}`);
    });
  }
  return response.json();
})
.then(userData => {
  console.log('Current user data:', userData);
})
.catch(error => {
  console.error('Test failed:', error.message);
});
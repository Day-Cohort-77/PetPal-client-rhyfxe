// Test complete authentication flow with port 5001
console.log('🔍 Testing complete authentication flow with backend on port 5001...');

const testEmail = 'user@petpal.com';
const testPassword = 'User123!';

// Step 1: Test Login
console.log('📝 Step 1: Testing login...');
fetch('http://localhost:5001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: testEmail,
    password: testPassword,
  }),
  credentials: 'include',
})
.then(response => {
  console.log('✅ Login response status:', response.status);
  if (response.status === 200) {
    console.log('🎉 Login successful!');
  }
  return response.json();
})
.then(loginData => {
  console.log('👤 Logged in user:', loginData);
  
  // Step 2: Test /auth/me (what AuthContext uses)
  console.log('\n📝 Step 2: Testing /auth/me endpoint...');
  return fetch('http://localhost:5001/auth/me', {
    method: 'GET',
    credentials: 'include',
  });
})
.then(response => {
  console.log('✅ Auth/me response status:', response.status);
  if (response.status === 200) {
    console.log('🎉 Authentication persistence working!');
    return response.json();
  } else {
    throw new Error(`Auth/me failed with status ${response.status}`);
  }
})
.then(userData => {
  console.log('👤 Current authenticated user:', userData);
  
  // Step 3: Test getting user's pets
  console.log('\n📝 Step 3: Testing user pets endpoint...');
  return fetch('http://localhost:5001/user/pets', {
    method: 'GET',
    credentials: 'include',
  });
})
.then(response => {
  console.log('✅ User pets response status:', response.status);
  if (response.status === 200) {
    console.log('🎉 User pets endpoint working!');
    return response.json();
  } else {
    throw new Error(`User pets failed with status ${response.status}`);
  }
})
.then(pets => {
  console.log('🐾 User pets:', pets);
  
  // Step 4: Test medications if pets exist
  if (pets && pets.length > 0) {
    const petId = pets[0].id;
    console.log(`\n📝 Step 4: Testing medications for pet ID ${petId}...`);
    
    return fetch(`http://localhost:5001/pets/${petId}/medications`, {
      method: 'GET',
      credentials: 'include',
    });
  } else {
    console.log('\n⚠️  No pets found, skipping medication test');
    return Promise.resolve(null);
  }
})
.then(response => {
  if (response) {
    console.log('✅ Pet medications response status:', response.status);
    if (response.status === 200) {
      console.log('🎉 Pet medications endpoint working!');
      return response.json();
    } else {
      throw new Error(`Pet medications failed with status ${response.status}`);
    }
  }
  return null;
})
.then(medications => {
  if (medications) {
    console.log('💊 Pet medications:', medications);
  }
  
  console.log('\n🎉✨ ALL AUTHENTICATION AND API TESTS PASSED! ✨🎉');
  console.log('🔗 Frontend integration with backend is successful!');
  console.log('🌟 Ready for full medication system testing!');
})
.catch(error => {
  console.error('\n❌ Test failed:', error);
  console.log('🔧 Check that backend server is running on port 5001 with proper CORS configuration');
});
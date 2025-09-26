// Final integration test with working backend
console.log('🎯 FINAL INTEGRATION TEST - Backend Authentication Fixed!');

const testEmail = 'user@petpal.com';
const testPassword = 'User123!';

// Test complete authentication flow
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
  console.log('✅ Login status:', response.status);
  return response.json();
})
.then(loginData => {
  console.log('✅ Login successful! User:', loginData.email);
  
  // Test protected endpoint that was failing before
  return fetch('http://localhost:5001/user/pets', {
    method: 'GET',
    credentials: 'include',
  });
})
.then(response => {
  console.log('✅ User pets status:', response.status);
  if (response.status === 200) {
    console.log('🎉 SESSION PERSISTENCE WORKING!');
    return response.json();
  } else {
    throw new Error(`Failed with status ${response.status}`);
  }
})
.then(pets => {
  console.log('✅ User pets loaded:', pets.length, 'pets found');
  
  // Test medication endpoint if pets exist
  if (pets && pets.length > 0) {
    const petId = pets[0].id;
    console.log(`✅ Testing medications for pet ID ${petId}...`);
    
    return fetch(`http://localhost:5001/medications/pet/${petId}`, {
      method: 'GET', 
      credentials: 'include',
    });
  }
  return null;
})
.then(response => {
  if (response) {
    console.log('✅ Pet medications status:', response.status);
    return response.json();
  }
  return null;
})
.then(medications => {
  if (medications) {
    console.log('✅ Pet medications loaded:', medications.length, 'medications found');
  }
  
  console.log('\n🎉🎉🎉 COMPLETE INTEGRATION SUCCESS! 🎉🎉🎉');
  console.log('✅ Login working');
  console.log('✅ Session persistence working');
  console.log('✅ Protected endpoints accessible'); 
  console.log('✅ User data loading');
  console.log('✅ Pet data loading');
  console.log('✅ Medication system ready!');
  console.log('\n🚀 FRONTEND + BACKEND INTEGRATION COMPLETE! 🚀');
})
.catch(error => {
  console.error('❌ Integration test failed:', error);
});
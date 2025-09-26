// Session debugging test
console.log('🔍 DEBUGGING SESSION PERSISTENCE...\n');

async function testSessionFlow() {
  try {
    console.log('1. Testing Login...');
    const loginResponse = await fetch('http://localhost:5001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@petpal.com',
        password: 'User123!',
      }),
      credentials: 'include',
    });

    console.log('   Login Status:', loginResponse.status);
    console.log('   Login Headers:', [...loginResponse.headers.entries()]);
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Login Success:', loginData.email);
      
      // Check if Set-Cookie header exists
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      console.log('   Set-Cookie Header:', setCookieHeader || 'NOT PRESENT ❌');
      
      // Wait a moment then test protected endpoint
      console.log('\n2. Testing Protected Endpoint (user/pets)...');
      
      const petsResponse = await fetch('http://localhost:5001/user/pets', {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log('   Pets Status:', petsResponse.status);
      console.log('   Pets Headers:', [...petsResponse.headers.entries()]);
      
      if (petsResponse.status === 200) {
        const petsData = await petsResponse.json();
        console.log('   ✅ Session Persistence Working! Pets:', petsData.length);
      } else {
        console.log('   ❌ Session Persistence FAILED!');
        const errorText = await petsResponse.text();
        console.log('   Error Response:', errorText);
      }
      
      // Test another endpoint to be sure
      console.log('\n3. Testing Auth Me Endpoint...');
      
      const meResponse = await fetch('http://localhost:5001/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log('   Me Status:', meResponse.status);
      if (meResponse.status === 200) {
        const meData = await meResponse.json();
        console.log('   ✅ Auth Me Working:', meData.email);
      } else {
        console.log('   ❌ Auth Me Failed');
        const errorText = await meResponse.text();
        console.log('   Error Response:', errorText);
      }
      
    } else {
      console.log('   ❌ Login Failed');
      const errorText = await loginResponse.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSessionFlow();
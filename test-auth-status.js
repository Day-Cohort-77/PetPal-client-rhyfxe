#!/usr/bin/env node

console.log('🔐 Testing Authentication Status...\n');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function testAuth() {
  try {
    console.log('1. Testing authentication endpoint...');
    const authResponse = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Auth status: ${authResponse.status}`);
    
    if (authResponse.status === 401) {
      console.log('   ❌ Not authenticated - this explains the 500 error!');
      console.log('\n📋 DIAGNOSIS: User is not logged in');
      console.log('\n🔧 SOLUTIONS:');
      console.log('   1. Log in to the application first');
      console.log('   2. Check if session cookies are being sent properly');
      console.log('   3. Verify the authentication system is working');
      
      // Test login endpoint
      console.log('\n2. Testing login endpoint availability...');
      try {
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
        });
        
        console.log(`   Login endpoint status: ${loginResponse.status}`);
        if (loginResponse.status === 400 || loginResponse.status === 401) {
          console.log('   ✅ Login endpoint is working (expected auth failure with test credentials)');
        }
        
      } catch (loginError) {
        console.log(`   ❌ Login endpoint error: ${loginError.message}`);
      }
      
    } else if (authResponse.ok) {
      const userData = await authResponse.json();
      console.log('   ✅ User is authenticated!');
      console.log('   User data:', userData);
      
      // Test medication endpoint with authentication
      console.log('\n2. Testing medications endpoint with auth...');
      const medResponse = await fetch(`${API_URL}/medications/pet/1`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Medications status: ${medResponse.status}`);
      
      if (medResponse.ok) {
        console.log('   ✅ Medications endpoint working with authentication!');
      } else if (medResponse.status === 403) {
        console.log('   ⚠️  User authenticated but lacks permissions for medications');
      }
      
    } else {
      console.log(`   ❓ Unexpected auth response: ${authResponse.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Auth test failed: ${error.message}`);
  }
}

testAuth();
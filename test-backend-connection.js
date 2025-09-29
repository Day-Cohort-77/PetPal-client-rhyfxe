#!/usr/bin/env node

console.log('🔍 Testing Backend API Connection...\n');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function testConnection() {
  console.log(`Testing connection to: ${API_URL}`);
  
  try {
    // Test basic connectivity
    console.log('\n1. Testing basic connectivity...');
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`   Response: ${data}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n📋 DIAGNOSIS: Backend server is not running!');
      console.log('\n🔧 SOLUTIONS:');
      console.log('1. Check if there\'s a separate backend repository to clone');
      console.log('2. Start the backend server on port 5001');
      console.log('3. Update the API URL in .env.local if using different port');
      console.log('\n📖 See BACKEND_SETUP.md for detailed instructions');
      
      // Test alternative ports
      console.log('\n🔍 Testing alternative ports...');
      const altPorts = [3000, 5000, 8000, 8080];
      
      for (const port of altPorts) {
        try {
          const altResponse = await fetch(`http://localhost:${port}/health`, {
            method: 'GET',
            timeout: 2000
          });
          console.log(`   Port ${port}: ${altResponse.status} (${altResponse.ok ? 'OK' : 'Error'})`);
        } catch (altError) {
          console.log(`   Port ${port}: Not available`);
        }
      }
    }
  }
  
  // Test medication endpoint specifically
  console.log('\n2. Testing medications endpoint...');
  try {
    const medResponse = await fetch(`${API_URL}/medications/pet/1`, {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log(`   Medications API Status: ${medResponse.status}`);
    if (medResponse.ok) {
      console.log('   ✅ Medications endpoint is working!');
    }
    
  } catch (medError) {
    console.log(`   ❌ Medications endpoint failed: ${medError.message}`);
  }
}

testConnection();
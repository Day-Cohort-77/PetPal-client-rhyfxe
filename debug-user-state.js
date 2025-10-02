// Debug User State - Check if user is properly set in AuthContext after login
console.log('🔍 DEBUGGING USER STATE PERSISTENCE...\n');

async function debugUserState() {
  try {
    console.log('1. Testing login flow...');
    
    // Login
    const loginResponse = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@petpal.com',
        password: 'User123!',
      }),
      credentials: 'include',
    });

    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log('   ✅ API Login successful:', loginData.email);
      console.log('   📋 Login response structure:', Object.keys(loginData));
      console.log('   👤 User data:', {
        id: loginData.id,
        email: loginData.email,
        firstName: loginData.firstName,
        lastName: loginData.lastName,
        roles: loginData.roles
      });
      
      // Check what gets stored in localStorage (if anything)
      console.log('\n2. Checking localStorage...');
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('   📁 User stored in localStorage:', parsedUser.email);
          console.log('   🔍 Stored user structure:', Object.keys(parsedUser));
        } else {
          console.log('   ❌ No user found in localStorage');
        }
      } catch (e) {
        console.log('   ❌ localStorage not available (browser context needed)');
      }
      
      // Test /auth/me endpoint to verify session
      console.log('\n3. Testing /auth/me endpoint...');
      const meResponse = await fetch('http://localhost:5000/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (meResponse.status === 200) {
        const meData = await meResponse.json();
        console.log('   ✅ /auth/me successful:', meData.email);
        console.log('   🔍 Me response structure:', Object.keys(meData));
        
        // Compare login response vs /auth/me response
        console.log('\n4. Data consistency check...');
        const fieldsMatch = loginData.id === meData.id && loginData.email === meData.email;
        console.log('   📊 Login vs Me data match:', fieldsMatch ? '✅ YES' : '❌ NO');
        
        if (!fieldsMatch) {
          console.log('   ⚠️  Data mismatch details:');
          console.log('      Login ID:', loginData.id, 'vs Me ID:', meData.id);
          console.log('      Login Email:', loginData.email, 'vs Me Email:', meData.email);
        }
        
      } else {
        console.log('   ❌ /auth/me failed with status:', meResponse.status);
      }
      
      console.log('\n5. Expected AuthContext behavior:');
      console.log('   📝 AuthContext.login() should:');
      console.log('      1. Call authService.login()');
      console.log('      2. Store user in localStorage');
      console.log('      3. Set user state in React context');
      console.log('      4. Return user data to login page');
      console.log('   📝 Navbar should show:');
      console.log('      - User dropdown with name and logout');
      console.log('      - NOT show login/register buttons');
      
    } else {
      console.log('   ❌ Login failed with status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugUserState();
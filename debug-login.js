// Debug login response
const debugLogin = async () => {
  console.log('🔍 DEBUG LOGIN RESPONSE');
  
  try {
    const loginResponse = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'user@petpal.com',
        password: 'password123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    console.log('Login headers:', [...loginResponse.headers.entries()]);
    
    // Get response as text first to see what it actually is
    const responseText = await loginResponse.text();
    console.log('Raw response:', responseText.substring(0, 500) + '...');
    
    // Check if it's JSON
    try {
      const jsonData = JSON.parse(responseText);
      console.log('✅ Valid JSON response:', jsonData);
    } catch (e) {
      console.log('❌ Response is not JSON, likely HTML redirect');
      
      // Check if we got redirected
      if (responseText.includes('<!DOCTYPE')) {
        console.log('🔄 Got HTML response - backend is redirecting instead of returning JSON');
        
        // Try to check session after the redirect
        console.log('🧪 Testing session after redirect...');
        
        const sessionCheck = await fetch('/auth/me', {
          credentials: 'include'
        });
        
        console.log('Session check status:', sessionCheck.status);
        
        if (sessionCheck.ok) {
          const user = await sessionCheck.json();
          console.log('✅ Session is valid after login!');
          console.log('User data:', user);
          
          // Test pet access
          const petsResponse = await fetch('/user/pets', {
            credentials: 'include'
          });
          
          if (petsResponse.ok) {
            const pets = await petsResponse.json();
            console.log('✅ Pet access works!');
            console.log('Your pets:', pets);
          } else {
            console.log('❌ Pet access failed:', petsResponse.status);
          }
        } else {
          console.log('❌ Session check failed');
        }
      }
    }
  } catch (error) {
    console.log('❌ Login debug error:', error);
  }
};

window.debugLogin = debugLogin;
console.log('🔍 Login debug ready! Run: debugLogin()');
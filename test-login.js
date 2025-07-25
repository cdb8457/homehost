// Simple test to debug login issue
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('User:', data.data.user);
      console.log('Tokens:', data.data.tokens);
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testLogin();
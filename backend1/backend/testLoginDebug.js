const axios = require('axios');

async function testLoginDebug() {
  const baseURL = 'http://localhost:5001/api/auth/login';

  // Test student login with correct DOB
  console.log('Testing student login with DOB: 15/05/2003');

  try {
    const response = await axios.post(baseURL, {
      role: 'student',
      username: '2315048@nec.edu.in',
      password: '15/05/2003'
    });

    console.log('✅ Login successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Login failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

testLoginDebug().catch(console.error);

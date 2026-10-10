const axios = require('axios');

async function testStaffLogin() {
  const baseURL = 'http://localhost:5001/api/auth/login';

  // Test staff login with DOB
  console.log('Testing staff login with DOB: 15/05/2003');

  try {
    const response = await axios.post(baseURL, {
      role: 'staff',
      username: 'staff@nec.edu.in', // Replace with actual staff username
      password: '15/05/2003' // Replace with actual DOB
    });

    console.log('✅ Login successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Login failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

testStaffLogin().catch(console.error);

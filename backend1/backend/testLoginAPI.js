const axios = require('axios');

// Test login API with different user types
async function testLogin() {
  const baseURL = 'http://localhost:5001/api/auth/login';

  // Test cases: [role, username, password, expectedSuccess]
  const testCases = [
    // Student with DOB password (DD/MM/YYYY) - based on actual student data
    ['student', '2315048@nec.edu.in', '15/05/2003', true],
    // Staff with DOB password
    ['staff', 'staff@nec.edu.in', '20/05/1990', true],
    // Admin with regular password
    ['admin', 'admin@nec.edu.in', 'admin123', true],
    // Invalid credentials
    ['student', 'invalid@nec.edu.in', 'wrongpass', false],
  ];

  for (const [role, username, password, shouldSucceed] of testCases) {
    try {
      console.log(`\nTesting ${role} login: ${username}`);

      const response = await axios.post(baseURL, {
        role,
        username,
        password
      });

      if (shouldSucceed) {
        if (response.data.status === 'success') {
          console.log('✅ Login successful');
          console.log('Token:', response.data.data.token.substring(0, 20) + '...');
          console.log('User:', response.data.data.user);
        } else {
          console.log('❌ Login failed unexpectedly:', response.data);
        }
      } else {
        console.log('❌ Expected failure but got success');
      }

    } catch (error) {
      if (shouldSucceed) {
        console.log('❌ Login failed:', error.response?.data || error.message);
      } else {
        if (error.response?.status === 401) {
          console.log('✅ Login correctly failed with invalid credentials');
        } else {
          console.log('❌ Unexpected error:', error.response?.data || error.message);
        }
      }
    }
  }
}

// Run the test
testLogin().catch(console.error);

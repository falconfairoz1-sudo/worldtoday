// Simple authentication test script
const axios = require('axios');

const API_BASE = 'https://worldtoday.onrender.com/api';

async function testAuth() {
  console.log('🔐 Testing WorldToday Authentication System...\n');

  // Test 1: Backend Health
  try {
    console.log('1️⃣ Testing backend health...');
    const health = await axios.get('https://worldtoday.onrender.com/health');
    console.log('✅ Backend is healthy:', health.data);
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return;
  }

  // Test 2: Register a test user
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'testpass123',
    country: 'us',
    language: 'en'
  };

  try {
    console.log('\n2️⃣ Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Registration successful:', {
      name: registerResponse.data.name,
      email: registerResponse.data.email,
      role: registerResponse.data.role,
      hasToken: !!registerResponse.data.token
    });

    const token = registerResponse.data.token;

    // Test 3: Login with the same user
    try {
      console.log('\n3️⃣ Testing user login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful:', {
        name: loginResponse.data.name,
        email: loginResponse.data.email,
        role: loginResponse.data.role,
        hasToken: !!loginResponse.data.token
      });

      // Test 4: Get user profile
      try {
        console.log('\n4️⃣ Testing profile fetch...');
        const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile fetch successful:', {
          name: profileResponse.data.name,
          email: profileResponse.data.email,
          role: profileResponse.data.role,
          country: profileResponse.data.country
        });

        // Test 5: Get bookmarks
        try {
          console.log('\n5️⃣ Testing bookmarks fetch...');
          const bookmarksResponse = await axios.get(`${API_BASE}/user/bookmarks`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Bookmarks fetch successful:', {
            bookmarksCount: bookmarksResponse.data.length
          });

          console.log('\n🎉 All authentication tests passed!');
          console.log('\n📋 Summary:');
          console.log('- Backend is running and healthy');
          console.log('- User registration works');
          console.log('- User login works');
          console.log('- JWT token authentication works');
          console.log('- Profile and bookmarks endpoints work');
          console.log('\n✅ Authentication system is fully functional!');

        } catch (error) {
          console.log('❌ Bookmarks test failed:', error.response?.data?.message || error.message);
        }
      } catch (error) {
        console.log('❌ Profile test failed:', error.response?.data?.message || error.message);
      }
    } catch (error) {
      console.log('❌ Login test failed:', error.response?.data?.message || error.message);
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testAuth().catch(console.error);
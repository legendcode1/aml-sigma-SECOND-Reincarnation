// test-auth.js
const { getAuthHeaders } = require('./auth');

async function testAuth() {
  try {
    const headers = await getAuthHeaders('https://aegisllm-backend-633765957616.asia-southeast1.run.app');
    console.log('Headers:', headers);
  } catch (error) {
    console.error('Auth error:', error);
  }
}

testAuth();
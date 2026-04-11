async function testRateLimit() {
  const url = 'http://localhost:5000/api/auth/login';
  const payload = { email: 'test@example.com', password: 'wrongpassword' };
  
  console.log('--- Starting Auth Rate Limit Test (Limit is 10) ---');
  
  for (let i = 1; i <= 15; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log(`Request ${i}: Status ${response.status} - ${data.message || 'OK'}`);
      
      if (response.status === 429) {
        console.log('SUCCESS: Rate limit reached as expected.');
        return;
      }
    } catch (error) {
      console.log(`Request ${i}: Error ${error.message}`);
    }
  }
}

testRateLimit();

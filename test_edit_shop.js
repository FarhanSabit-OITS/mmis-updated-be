const http = require('http');

// Test the edit shop endpoint
async function testEditShop() {
  const shopId = '9a1bd9c2-77d9-4d32-8ded-95ef50350b14';
  
  // First, try login
  console.log('1️⃣  Attempting to login...\n');
  
  const loginData = JSON.stringify({
    email: 'superadmin@marketmaster.com',
    password: 'superadmin123'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };
  
  return new Promise((resolve) => {
    const loginReq = http.request(loginOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Login Response:', body);
        
        try {
          const loginResponse = JSON.parse(body);
          const token = loginResponse.data?.accessToken;
          
          if (token) {
            console.log('\n✅ Got Token:', token.substring(0, 20) + '...\n');
            testUpdateShop(token, shopId);
          } else {
            console.log('\n❌ No token in response');
            console.log('Response data:', loginResponse);
            resolve();
          }
        } catch (e) {
          console.log('❌ Failed to parse login response:', e.message);
          resolve();
        }
      });
    });
    
    loginReq.on('error', (e) => {
      console.error('❌ Login error:', e.message);
      resolve();
    });
    
    loginReq.write(loginData);
    loginReq.end();
  });
}

function testUpdateShop(token, shopId) {
  console.log('2️⃣  Testing PUT /api/shops/' + shopId + '\n');
  
  const updateData = JSON.stringify({
    shopName: 'MONDAY FREDERICK - UPDATED',
    monthlyRent: '160000',
    status: 'ACTIVE',
    occupationStatus: 'OCCUPIED',
    locationDescription: 'Test location update'
  });
  
  const updateOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/shops/' + shopId,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Length': updateData.length
    }
  };
  
  const updateReq = http.request(updateOptions, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Update Response:\n');
      try {
        const response = JSON.parse(body);
        console.log(JSON.stringify(response, null, 2));
        console.log('\n✅ Test completed successfully!');
      } catch (e) {
        console.log('Response:', body);
      }
    });
  });
  
  updateReq.on('error', (e) => {
    console.error('❌ Update error:', e.message);
  });
  
  updateReq.write(updateData);
  updateReq.end();
}

// Run test
testEditShop();

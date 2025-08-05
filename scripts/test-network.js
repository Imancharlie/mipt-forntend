const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return null;
}

function testBackendConnection(ip) {
  const http = require('http');
  
  const options = {
    hostname: ip,
    port: 8000,
    path: '/api/health/',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Backend connection successful!`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   URL: http://${ip}:8000/api/`);
  });
  
  req.on('error', (err) => {
    console.log(`❌ Backend connection failed: ${err.message}`);
    console.log(`   Make sure your backend server is running on port 8000`);
  });
  
  req.on('timeout', () => {
    console.log(`⏰ Backend connection timed out`);
    console.log(`   Check if your backend server is running`);
  });
  
  req.end();
}

function testFrontendConnection(ip) {
  const http = require('http');
  
  const options = {
    hostname: ip,
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Frontend connection successful!`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   URL: http://${ip}:3000/`);
  });
  
  req.on('error', (err) => {
    console.log(`❌ Frontend connection failed: ${err.message}`);
    console.log(`   Make sure your frontend server is running on port 3000`);
  });
  
  req.on('timeout', () => {
    console.log(`⏰ Frontend connection timed out`);
    console.log(`   Check if your frontend server is running`);
  });
  
  req.end();
}

// Main execution
console.log('🌐 Network Configuration Test\n');

const ip = getLocalIPAddress();

if (ip) {
  console.log(`📱 Your computer's IP address: ${ip}`);
  console.log(`📱 Access from phone: http://${ip}:3000`);
  console.log(`🔗 Backend API: http://${ip}:8000/api/`);
  console.log('');
  
  console.log('🧪 Testing connections...\n');
  
  // Test backend connection
  console.log('Testing backend connection...');
  testBackendConnection(ip);
  
  // Wait a bit then test frontend
  setTimeout(() => {
    console.log('\nTesting frontend connection...');
    testFrontendConnection(ip);
  }, 2000);
  
} else {
  console.log('❌ Could not determine your IP address');
  console.log('   Make sure you are connected to a network');
}

console.log('\n📋 Troubleshooting Tips:');
console.log('1. Make sure both frontend and backend servers are running');
console.log('2. Check if your firewall is blocking the ports');
console.log('3. Ensure both devices are on the same network');
console.log('4. Try accessing the URLs in your phone\'s browser');
console.log('5. If using Windows, check Windows Defender Firewall settings'); 
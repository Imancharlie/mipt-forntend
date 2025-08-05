const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ipAddress = getLocalIPAddress();
console.log('\n🌐 Network Information:');
console.log('========================');
console.log(`Your computer's IP address: ${ipAddress}`);
console.log(`Frontend URL: http://${ipAddress}:3000`);
console.log(`Backend URL: http://${ipAddress}:8000`);
console.log('\n📱 Mobile Access Instructions:');
console.log('==============================');
console.log('1. Make sure your mobile device is connected to the same WiFi network');
console.log('2. Open your mobile browser and go to:');
console.log(`   http://${ipAddress}:3000`);
console.log('3. If you get a connection error, check:');
console.log('   - Firewall settings (allow port 3000)');
console.log('   - Antivirus software blocking the connection');
console.log('   - Router settings');
console.log('\n🔧 Troubleshooting:');
console.log('========================');
console.log('- If you can\'t access the app, try:');
console.log('  - Temporarily disable firewall/antivirus');
console.log('  - Check if port 3000 is open: netstat -an | findstr :3000');
console.log('  - Try accessing from another device on the same network');
console.log('\n'); 
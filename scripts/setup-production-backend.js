#!/usr/bin/env node

/**
 * Setup Production Backend Configuration
 * This script helps configure your local frontend to use the production backend
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Production Backend Configuration...\n');

// Production backend URL
const PRODUCTION_API_URL = 'https://mipt.pythonanywhere.com/api';

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

console.log('📋 Current Configuration:');
console.log(`   Production Backend: ${PRODUCTION_API_URL}`);
console.log(`   Environment File: ${fs.existsSync(envLocalPath) ? '.env.local' : '.env'}\n`);

// Create environment configuration
const envContent = `# Production Backend Configuration
# This file configures your local frontend to use the production backend
VITE_API_URL=${PRODUCTION_API_URL}
VITE_APP_TITLE=MIPT - Industrial Training Reports (Production Backend)
VITE_APP_DESCRIPTION=Industrial Practical Training Report System
VITE_APP_VERSION=1.0.0
VITE_PWA_ENABLED=true

# Backend Information:
# - Production URL: ${PRODUCTION_API_URL}
# - Local Fallback: http://127.0.0.1:8000/api (if VITE_API_URL is not set)
`;

// Try to create .env.local first, fallback to .env
let targetFile = envLocalPath;
if (!fs.existsSync(envLocalPath)) {
  targetFile = envPath;
}

try {
  fs.writeFileSync(targetFile, envContent);
  console.log(`✅ Configuration saved to: ${path.basename(targetFile)}`);
  console.log(`   Full path: ${targetFile}`);
} catch (error) {
  console.error('❌ Error creating environment file:', error.message);
  console.log('\n📝 Manual Setup Required:');
  console.log(`   1. Create a file named: ${path.basename(targetFile)}`);
  console.log(`   2. Add this content:`);
  console.log(`      VITE_API_URL=${PRODUCTION_API_URL}`);
  console.log(`   3. Restart your development server`);
  process.exit(1);
}

console.log('\n🔧 Next Steps:');
console.log('   1. Restart your development server (npm run dev)');
console.log('   2. Check the browser console for API configuration logs');
console.log('   3. Test login with your production backend credentials');
console.log('\n📊 To verify configuration:');
console.log('   - Open browser console and look for "API Client initialized with baseURL"');
console.log('   - Should show: https://mipt.pythonanywhere.com/api');
console.log('\n🔄 To switch back to local backend:');
console.log('   - Change VITE_API_URL to: http://127.0.0.1:8000/api');
console.log('   - Or delete the environment file to use defaults');

console.log('\n🎯 Configuration Complete!');


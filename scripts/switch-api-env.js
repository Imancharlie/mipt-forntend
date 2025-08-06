import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environments = {
  local: {
    VITE_API_URL: 'http://127.0.0.1:8000/api',
    VITE_APP_TITLE: 'MIPT - Industrial Training Reports (Dev)',
    VITE_APP_DESCRIPTION: 'Industrial Practical Training Report System',
    VITE_APP_VERSION: '1.0.0',
    VITE_PWA_ENABLED: 'true'
  },
  production: {
    VITE_API_URL: 'https://mipt.pythonanywhere.com/api',
    VITE_APP_TITLE: 'MIPT - Industrial Training Reports',
    VITE_APP_DESCRIPTION: 'Industrial Practical Training Report System',
    VITE_APP_VERSION: '1.0.0',
    VITE_PWA_ENABLED: 'true'
  }
};

function createEnvFile(env, config) {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(__dirname, '..', `.env.${env}`);
  fs.writeFileSync(envPath, envContent);
  
  console.log(`✅ Created .env.${env} file`);
  console.log(`📡 API URL: ${config.VITE_API_URL}`);
  console.log(`📱 App Title: ${config.VITE_APP_TITLE}`);
}

function showUsage() {
  console.log('\n🔧 API Environment Switcher');
  console.log('==========================');
  console.log('\nUsage:');
  console.log('  node scripts/switch-api-env.js local     # Switch to local development');
  console.log('  node scripts/switch-api-env.js production # Switch to production');
  console.log('  node scripts/switch-api-env.js help      # Show this help');
  
  console.log('\n📋 Environment Details:');
  console.log('  Local:      http://127.0.0.1:8000/api');
  console.log('  Production: https://mipt.pythonanywhere.com/api');
  
  console.log('\n🚀 Next Steps:');
  console.log('  1. Copy the generated .env file to .env.local');
  console.log('  2. Restart your development server');
  console.log('  3. Test the API connection');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  console.log('🔧 MIPT API Environment Switcher\n');
  
  switch (command.toLowerCase()) {
    case 'local':
      console.log('🔄 Switching to LOCAL development environment...');
      createEnvFile('local', environments.local);
      console.log('\n📝 To use this configuration:');
      console.log('  1. Copy .env.local to .env.local');
      console.log('  2. Restart your development server');
      console.log('  3. Test with: npm run dev');
      break;
      
    case 'production':
      console.log('🚀 Switching to PRODUCTION environment...');
      createEnvFile('production', environments.production);
      console.log('\n📝 To use this configuration:');
      console.log('  1. Set environment variables in Netlify Dashboard');
      console.log('  2. Or use: netlify env:set VITE_API_URL "https://mipt.pythonanywhere.com/api"');
      console.log('  3. Deploy to test the changes');
      break;
      
    case 'help':
    default:
      showUsage();
      break;
  }
  
  console.log('\n🎯 Remember:');
  console.log('  - Local: Test with your local backend');
  console.log('  - Production: Test with PythonAnywhere backend');
  console.log('  - Always test locally first!');
}

main(); 
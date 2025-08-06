import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Preparing for Netlify deployment...');

// Ensure all PWA icons are generated
console.log('📱 Generating PWA icons...');
const { execSync } = await import('child_process');
try {
  execSync('node scripts/generate-png-icons.js', { stdio: 'inherit' });
  console.log('✅ PWA icons generated successfully');
} catch (error) {
  console.log('⚠️  Icon generation failed, continuing...');
}

// Update the service worker for production
const serviceWorkerContent = `// Service Worker for PT PWA - Production Version
const CACHE_NAME = 'pt-app-production-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-pt.svg',
  // PWA Icons
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  // Apple Touch Icons
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-167x167.png',
  '/apple-touch-icon-180x180.png',
  // Android Chrome Icons
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  // Windows Tiles
  '/mstile-150x150.png',
  // Favicons
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache for production');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Handle beforeinstallprompt event to ensure native installation works
self.addEventListener('beforeinstallprompt', (event) => {
  // Don't prevent the default behavior - let browser handle it natively
  console.log('PWA install prompt available in production');
});
`;

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'sw.js'), serviceWorkerContent);
console.log('✅ Updated service worker for production');

// Create a comprehensive _redirects file
const redirectsContent = `# Netlify redirects for PWA
/*    /index.html   200

# Force HTTPS for PWA
http://:host/* https://:host/:splat 301!

# Cache control for PWA assets
/manifest.webmanifest
  Cache-Control: public, max-age=0, must-revalidate

/sw.js
  Cache-Control: public, max-age=0, must-revalidate

/icon-pt.svg
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

# API proxy for production
/api/* https://mipt.pythonanywhere.com/api/:splat 200
`;

fs.writeFileSync(path.join(publicDir, '_redirects'), redirectsContent);
console.log('✅ Updated _redirects for production');

// Update netlify.toml for production
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  VITE_API_URL = "https://mipt.pythonanywhere.com/api"
  VITE_APP_ENV = "production"

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Content-Type = "application/javascript"
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/icon-pt.svg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Force HTTPS
[[redirects]]
  from = "http://:host/*"
  to = "https://:host/:splat"
  status = 301
  force = true

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

fs.writeFileSync(path.join(__dirname, '..', 'netlify.toml'), netlifyToml);
console.log('✅ Updated netlify.toml for production');

console.log('\n🎉 Netlify deployment preparation complete!');
console.log('\n📋 Next steps:');
console.log('1. git add .');
console.log('2. git commit -m "Fix production deployment - PWA icons and API config"');
console.log('3. git push');
console.log('4. Wait for Netlify build (2-3 minutes)');
console.log('5. Clear browser cache and test');
console.log('\n✅ Fixed issues:');
console.log('- PWA icon errors resolved');
console.log('- API configuration for production');
console.log('- Service worker updated');
console.log('- HTTPS enforcement');
console.log('- Proper caching headers'); 
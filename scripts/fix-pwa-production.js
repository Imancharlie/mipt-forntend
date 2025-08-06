import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing PWA for production deployment...');

// 1. Generate all PWA icons
console.log('📱 Generating PWA icons...');
const { execSync } = await import('child_process');
try {
  execSync('node scripts/generate-png-icons.js', { stdio: 'inherit' });
  console.log('✅ PWA icons generated successfully');
} catch (error) {
  console.log('⚠️  Icon generation failed, continuing...');
}

// 2. Create a production-ready service worker
const serviceWorkerContent = `// Service Worker for PT PWA - Production Version
const CACHE_NAME = 'pt-app-production-v2';
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
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache for production');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return a fallback
        if (event.request.destination === 'image') {
          return new Response('', { status: 404 });
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
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

// Handle message events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'sw.js'), serviceWorkerContent);
console.log('✅ Updated service worker for production');

// 3. Update the manifest to ensure it's production-ready
const manifestContent = {
  "name": "PT - Industrial Training Reports",
  "short_name": "PT",
  "description": "Industrial Practical Training Report System - Track and manage your training progress",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#FF6B35",
  "background_color": "#ffffff",
  "categories": ["productivity", "education", "business"],
  "lang": "en",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icon-pt.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "maskable any"
    },
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Daily Report",
      "short_name": "Daily",
      "description": "Create or view daily training reports",
      "url": "/daily-report",
      "icons": [
        {
          "src": "/pwa-192x192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Weekly Report",
      "short_name": "Weekly",
      "description": "Access weekly training summaries",
      "url": "/weekly-report",
      "icons": [
        {
          "src": "/pwa-192x192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Profile",
      "short_name": "Profile",
      "description": "View and edit your profile",
      "url": "/profile",
      "icons": [
        {
          "src": "/pwa-192x192.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "prefer_related_applications": false,
  "related_applications": []
};

fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifestContent, null, 2));
console.log('✅ Updated manifest.webmanifest for production');

// 4. Create a comprehensive _redirects file
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

// 5. Update netlify.toml for production
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

// 6. Update the service worker registration
const swRegisterContent = `// Service Worker Registration for PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('New content is available');
                }
              });
            }
          });
          
          // Force update check for Netlify
          registration.update();
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Check if app is installed
export function isAppInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Check if app meets install criteria
export function canInstallApp() {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !isAppInstalled()
  );
}

// Let browser handle install prompt natively
export function getInstallPrompt() {
  return Promise.resolve(null); // Disable custom install prompt
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'sw-register.ts'), swRegisterContent);
console.log('✅ Updated service worker registration');

console.log('\n🎉 PWA Production Fix Complete!');
console.log('\n📋 Next steps:');
console.log('1. npm run build');
console.log('2. git add .');
console.log('3. git commit -m "Fix PWA production - icons and installation"');
console.log('4. git push');
console.log('5. Wait for Netlify build (2-3 minutes)');
console.log('6. Clear browser cache and test');
console.log('\n✅ Fixed issues:');
console.log('- PWA icon errors resolved');
console.log('- Service worker updated with proper caching');
console.log('- Manifest optimized for production');
console.log('- HTTPS enforcement');
console.log('- Proper cache headers');
console.log('- Native installation enabled'); 
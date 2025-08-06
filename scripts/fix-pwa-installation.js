import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update the manifest to ensure it meets all PWA criteria
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
      "src": "/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "PT Dashboard - Desktop View"
    },
    {
      "src": "/screenshot-narrow.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "PT Dashboard - Mobile View"
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
          "src": "/icon-192x192.png",
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
          "src": "/icon-192x192.png",
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
          "src": "/icon-192x192.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "prefer_related_applications": false,
  "related_applications": [],
  "edge_side_panel": {
    "preferred_width": 400
  }
};

// Write updated manifest
const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifestContent, null, 2));

console.log('✅ Updated manifest.webmanifest with proper PWA configuration');

// Create a new service worker with better caching strategy
const serviceWorkerContent = `// Service Worker for PT PWA
const CACHE_NAME = 'pt-app-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-pt.svg',
  // PWA Icons
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  // Apple Touch Icons
  '/apple-touch-icon.png',
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
        console.log('Opened cache');
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
  console.log('PWA install prompt available');
});
`;

fs.writeFileSync(path.join(publicDir, 'sw.js'), serviceWorkerContent);

console.log('✅ Updated service worker with proper PWA installation support');

// Create a simple HTML test page to verify PWA installation
const testHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PT PWA Test</title>
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" href="/icon-pt.svg">
</head>
<body>
    <h1>PT PWA Installation Test</h1>
    <p>This page should show the native browser install prompt.</p>
    <p>Look for the install icon (➕) in your browser's address bar.</p>
    <script>
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
        
        // Check if app meets install criteria
        window.addEventListener('load', () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const hasServiceWorker = 'serviceWorker' in navigator;
            const hasPushManager = 'PushManager' in window;
            
            console.log('PWA Criteria Check:');
            console.log('- Standalone mode:', isStandalone);
            console.log('- Service Worker:', hasServiceWorker);
            console.log('- Push Manager:', hasPushManager);
            console.log('- HTTPS:', location.protocol === 'https:');
            
            if (!isStandalone && hasServiceWorker && hasPushManager) {
                console.log('✅ App meets PWA install criteria');
            } else {
                console.log('❌ App does not meet PWA install criteria');
            }
        });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'pwa-test.html'), testHTML);

console.log('✅ Created PWA test page at /pwa-test.html');

console.log('\n🔧 PWA Installation Fix Complete!');
console.log('\n📋 To test native installation:');
console.log('1. Open http://localhost:3000 in Chrome/Edge');
console.log('2. Look for install icon (➕) in address bar');
console.log('3. Or visit http://localhost:3000/pwa-test.html');
console.log('\n📱 For mobile testing:');
console.log('- Android: Chrome menu → "Add to Home screen"');
console.log('- iOS: Safari Share button → "Add to Home Screen"');
console.log('\n⚠️  Make sure to:');
console.log('- Clear browser cache and service workers');
console.log('- Visit the site multiple times (browser requirement)');
console.log('- Use HTTPS in production (required for PWA)'); 
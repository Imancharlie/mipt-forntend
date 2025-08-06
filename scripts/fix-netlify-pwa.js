import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force update the service worker with a new version
const serviceWorkerContent = `// Service Worker for PT PWA - Netlify Version
const CACHE_NAME = 'pt-app-netlify-v1';
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
        console.log('Opened cache for Netlify');
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
  console.log('PWA install prompt available on Netlify');
});
`;

// Write the updated service worker
const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'sw.js'), serviceWorkerContent);

console.log('✅ Updated service worker for Netlify deployment');

// Create a _redirects file for Netlify to handle SPA routing
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
`;

fs.writeFileSync(path.join(publicDir, '_redirects'), redirectsContent);

console.log('✅ Created _redirects file for Netlify');

// Create a netlify.toml file for proper PWA deployment
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

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

console.log('✅ Created netlify.toml for proper PWA deployment');

// Update the manifest to ensure it's production-ready
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
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifestContent, null, 2));

console.log('✅ Updated manifest.webmanifest for Netlify');

console.log('\n🔧 Netlify PWA Fix Complete!');
console.log('\n📋 Deployment Steps:');
console.log('1. git add .');
console.log('2. git commit -m "Fix PWA for Netlify deployment"');
console.log('3. git push');
console.log('4. Wait for Netlify to rebuild');
console.log('5. Clear browser cache and test');
console.log('\n⚠️  Important:');
console.log('- Netlify will now force HTTPS (required for PWA)');
console.log('- Service worker cache will be cleared automatically');
console.log('- All PWA assets will have proper cache headers');
console.log('- SPA routing will work correctly'); 
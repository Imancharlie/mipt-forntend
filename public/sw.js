// Custom Service Worker for MiPT PWA with enhanced offline support
const CACHE_NAME = 'mipt-app-v1';
const STATIC_CACHE = 'mipt-static-v1';
const FONT_CACHE = 'mipt-fonts-v1';

// URLs to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Opened static cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
  // Don't force activation
  // self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== FONT_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Don't force client claiming
  // self.clients.claim();
});

// Fetch event with enhanced error handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;
  
  // Handle Google Fonts with fallback
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(handleFontRequest(request));
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Handle navigation requests with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Default: try network, fallback to cache
  event.respondWith(handleDefaultRequest(request));
});

// Handle font requests with graceful fallback
async function handleFontRequest(request) {
  try {
    // Try to get from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network request
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the successful response
      const cache = await caches.open(FONT_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network fails, return a fallback response
    console.warn('Font request failed, using fallback:', request.url);
    return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } });
    
  } catch (error) {
    console.warn('Font request error, using fallback:', error);
    // Return empty CSS to prevent errors
    return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } });
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
    throw new Error('API request failed');
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(JSON.stringify({ error: 'Offline mode - API unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Static asset not found');
  } catch (error) {
    // Return a fallback response
    if (request.destination === 'image') {
      return new Response('', { status: 404 });
    }
    throw error;
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
    throw new Error('Navigation request failed');
  } catch (error) {
    // Fallback to cached index.html for SPA routing
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
    
    // If no cached index, return offline page
    return new Response(
      '<html><body><h1>Offline</h1><p>Please check your internet connection and try again.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handle default requests
async function handleDefaultRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
    throw new Error('Network request failed');
  } catch (error) {
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response('Offline mode - resource unavailable', { status: 503 });
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.webp', '.woff', '.woff2'];
  return staticExtensions.some(ext => request.url.includes(ext));
}

// Handle service worker messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle beforeinstallprompt event
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('PWA install prompt available');
});

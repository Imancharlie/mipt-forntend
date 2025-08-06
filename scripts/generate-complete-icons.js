import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG content with modern PT design
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient circle -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8C42;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background circle with gradient and shadow -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGradient)" filter="url(#shadow)"/>
  
  <!-- Inner circle for depth -->
  <circle cx="256" cy="256" r="220" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4"/>
  
  <!-- PT Text with modern styling -->
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="180" font-weight="bold" text-anchor="middle" fill="white" filter="url(#shadow)">PT</text>
  
  <!-- Subtle accent elements -->
  <circle cx="256" cy="256" r="240" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
  
  <!-- Small decorative elements -->
  <circle cx="180" cy="180" r="8" fill="rgba(255,255,255,0.3)"/>
  <circle cx="332" cy="180" r="6" fill="rgba(255,255,255,0.2)"/>
  <circle cx="180" cy="332" r="6" fill="rgba(255,255,255,0.2)"/>
  <circle cx="332" cy="332" r="8" fill="rgba(255,255,255,0.3)"/>
</svg>`;

// Generate different sizes and formats
const iconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'mstile-150x150.png', size: 150 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 }
];

// Write the main SVG file
const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'icon-pt.svg'), svgContent);

console.log('✅ Generated modern icon-pt.svg with gradient and shadow effects');

// Create a comprehensive manifest with all icon sizes
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
  },
  "install_prompt": {
    "description": "Install PT for quick access to your training reports"
  }
};

// Write updated manifest
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifestContent, null, 2));

console.log('✅ Updated manifest.webmanifest with comprehensive icon list');

// Create browserconfig.xml for Windows tiles
const browserConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/mstile-150x150.png"/>
            <TileColor>#FF6B35</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

fs.writeFileSync(path.join(publicDir, 'browserconfig.xml'), browserConfigContent);

console.log('✅ Updated browserconfig.xml for Windows tiles');

console.log('\n📋 Icon sizes that need to be generated:');
iconSizes.forEach(icon => {
  console.log(`  - ${icon.name} (${icon.size}x${icon.size})`);
});

console.log('\n🎨 To generate PNG versions:');
console.log('1. Use an online SVG to PNG converter');
console.log('2. Or use ImageMagick: convert icon-pt.svg -resize 192x192 pwa-192x192.png');
console.log('3. Or use a design tool like Figma, Sketch, or Adobe Illustrator');
console.log('\n📱 This will ensure compatibility with:');
console.log('  - iOS Safari (152x152, 167x167, 180x180)');
console.log('  - Android Chrome (192x192, 512x512)');
console.log('  - Windows tiles (150x150)');
console.log('  - Favicons (16x16, 32x32)');
console.log('  - PWA standards (192x192, 512x512)'); 
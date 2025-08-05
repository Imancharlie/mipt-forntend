import fs from 'fs';
import { createCanvas } from 'canvas';

// Create a simple icon with MIPT branding
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#FF6B35';
  ctx.fillRect(0, 0, size, size);
  
  // Add some simple design elements
  ctx.fillStyle = 'white';
  ctx.font = `${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MIPT', size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
}

// Generate all required icons
const icons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'mstile-150x150.png', size: 150 }
];

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Generate each icon
icons.forEach(icon => {
  const buffer = createIcon(icon.size);
  fs.writeFileSync(`public/${icon.name}`, buffer);
  console.log(`Generated ${icon.name}`);
});

console.log('All PWA icons generated successfully!');
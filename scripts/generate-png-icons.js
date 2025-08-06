import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes to generate
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

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#FF6B35');
  gradient.addColorStop(1, '#FF8C42');
  
  // Draw background circle
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 4, 0, 2 * Math.PI);
  ctx.fill();
  
  // Add shadow effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = size * 0.1;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = size * 0.05;
  
  // Draw inner circle for depth
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - size * 0.1, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw PT text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.35}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PT', size/2, size/2 + size * 0.1);
  
  // Add decorative elements
  const dotSize = size * 0.02;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  
  // Top left dot
  ctx.beginPath();
  ctx.arc(size * 0.35, size * 0.35, dotSize, 0, 2 * Math.PI);
  ctx.fill();
  
  // Top right dot
  ctx.beginPath();
  ctx.arc(size * 0.65, size * 0.35, dotSize * 0.75, 0, 2 * Math.PI);
  ctx.fill();
  
  // Bottom left dot
  ctx.beginPath();
  ctx.arc(size * 0.35, size * 0.65, dotSize * 0.75, 0, 2 * Math.PI);
  ctx.fill();
  
  // Bottom right dot
  ctx.beginPath();
  ctx.arc(size * 0.65, size * 0.65, dotSize, 0, 2 * Math.PI);
  ctx.fill();
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const publicDir = path.join(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, filename), buffer);
  
  console.log(`✅ Generated ${filename} (${size}x${size})`);
}

// Check if canvas is available
try {
  // Generate all icons
  iconSizes.forEach(icon => {
    generateIcon(icon.size, icon.name);
  });
  
  console.log('\n🎉 All PNG icons generated successfully!');
  console.log('📱 Your PWA now has comprehensive icon support for:');
  console.log('  - iOS Safari (152x152, 167x167, 180x180)');
  console.log('  - Android Chrome (192x192, 512x512)');
  console.log('  - Windows tiles (150x150)');
  console.log('  - Favicons (16x16, 32x32)');
  console.log('  - PWA standards (192x192, 512x512)');
  console.log('  - All modern browsers and platforms');
  
} catch (error) {
  console.log('❌ Canvas not available. Please install canvas package:');
  console.log('npm install canvas');
  console.log('\n📝 Alternative: Use an online SVG to PNG converter with the icon-pt.svg file');
  console.log('📝 Or use a design tool like Figma, Sketch, or Adobe Illustrator');
} 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG content with PT text
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="#FF6B35"/>
  
  <!-- PT Text -->
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="180" font-weight="bold" text-anchor="middle" fill="white">PT</text>
  
  <!-- Optional: Add a subtle border -->
  <circle cx="256" cy="256" r="240" fill="none" stroke="white" stroke-width="8" opacity="0.1"/>
</svg>`;

// Write the SVG file
const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'icon-pt.svg'), svgContent);

console.log('✅ Generated icon-pt.svg');

// Note: To convert SVG to PNG, you would need a tool like ImageMagick or use an online converter
// For now, we'll use the SVG directly in the manifest
console.log('📝 To generate PNG versions, use an online SVG to PNG converter or ImageMagick');
console.log('📝 Recommended sizes: 192x192, 512x512, and favicon sizes'); 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes for PWA
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 150, name: 'mstile-150x150.png' }
];

// SVG template for the MIPT icon
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8C42;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
  
  <!-- Document/Report Icon -->
  <g transform="translate(${size * 0.25}, ${size * 0.2}) scale(${size * 0.0015})">
    <!-- Document base -->
    <rect x="0" y="0" width="400" height="500" rx="20" fill="white" stroke="#E5E7EB" stroke-width="8"/>
    
    <!-- Document lines -->
    <rect x="40" y="80" width="320" height="12" rx="6" fill="#6B7280"/>
    <rect x="40" y="120" width="280" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="160" width="300" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="200" width="260" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="240" width="320" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="280" width="240" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="320" width="320" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="360" width="200" height="12" rx="6" fill="#9CA3AF"/>
    
    <!-- Checkmark -->
    <circle cx="320" cy="120" r="30" fill="url(#grad2)"/>
    <path d="M310 120 L315 125 L330 110" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- MIPT Text for larger icons -->
  ${size >= 192 ? `
  <text x="${size * 0.5}" y="${size * 0.85}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">MIPT</text>
  ` : ''}
</svg>
`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
iconSizes.forEach(({ size, name }) => {
  const svg = svgTemplate(size);
  const filePath = path.join(publicDir, name);
  
  // For now, we'll create a placeholder file
  // In a real implementation, you'd use a library like sharp or canvas to convert SVG to PNG
  const placeholderContent = `# This is a placeholder for ${name}
# In production, you should generate actual PNG icons from the SVG template
# You can use tools like sharp, canvas, or online SVG to PNG converters
# Size: ${size}x${size}
# Generated from: ${svgTemplate(size)}
`;
  
  fs.writeFileSync(filePath, placeholderContent);
  console.log(`Generated placeholder for ${name} (${size}x${size})`);
});

// Create favicon.ico placeholder
const faviconPath = path.join(publicDir, 'favicon.ico');
fs.writeFileSync(faviconPath, '# Placeholder favicon.ico\n# Convert from favicon-32x32.png in production');
console.log('Generated placeholder for favicon.ico');

// Create masked-icon.svg
const maskedIconSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8C42;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="16" height="16" rx="3" fill="url(#grad1)"/>
  <g transform="translate(2, 2) scale(0.075)">
    <rect x="0" y="0" width="400" height="500" rx="20" fill="white" stroke="#E5E7EB" stroke-width="8"/>
    <rect x="40" y="80" width="320" height="12" rx="6" fill="#6B7280"/>
    <rect x="40" y="120" width="280" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="160" width="300" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="200" width="260" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="240" width="320" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="280" width="240" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="320" width="320" height="12" rx="6" fill="#9CA3AF"/>
    <rect x="40" y="360" width="200" height="12" rx="6" fill="#9CA3AF"/>
    <circle cx="320" cy="120" r="30" fill="#4F46E5"/>
    <path d="M310 120 L315 125 L330 110" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

const maskedIconPath = path.join(publicDir, 'masked-icon.svg');
fs.writeFileSync(maskedIconPath, maskedIconSvg);
console.log('Generated masked-icon.svg');

console.log('\n✅ PWA icons generated successfully!');
console.log('📝 Note: These are placeholder files. For production, convert the SVG templates to actual PNG files.');
console.log('🛠️  You can use tools like:');
console.log('   - Online SVG to PNG converters');
console.log('   - Sharp library (Node.js)');
console.log('   - Canvas API');
console.log('   - Design tools like Figma, Sketch, or Adobe Illustrator');
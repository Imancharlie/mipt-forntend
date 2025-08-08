import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

const iconDefs = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'mstile-150x150.png', size: 150 },
];

function resolveInputPath(argPath) {
  const candidates = [
    argPath,
    path.join(__dirname, '..', argPath || ''),
    path.join(__dirname, '..', '@MiPT LOGO brAIn.png'),
    path.join(publicDir, '@MiPT LOGO brAIn.png'),
    path.join(__dirname, '..', 'assets', '@MiPT LOGO brAIn.png'),
    path.join(__dirname, '..', 'src', 'assets', '@MiPT LOGO brAIn.png'),
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

async function generateAll(fromPath) {
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const img = await loadImage(fromPath);

  for (const { name, size } of iconDefs) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Transparent background; add subtle rounding background for small favicons to improve visibility
    if (size <= 32) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const r = Math.max(2, Math.floor(size * 0.15));
      ctx.moveTo(r, 0);
      ctx.arcTo(size, 0, size, size, r);
      ctx.arcTo(size, size, 0, size, r);
      ctx.arcTo(0, size, 0, 0, r);
      ctx.arcTo(0, 0, size, 0, r);
      ctx.closePath();
      ctx.fill();
    } else {
      // keep transparent, many PWAs prefer transparency
      ctx.clearRect(0, 0, size, size);
    }

    // Fit image into canvas with safe padding (maskable safe zone ~80%)
    const safe = size * 0.86; // keep margins to avoid clipping on maskable shapes
    const scale = Math.min(safe / img.width, safe / img.height);
    const drawW = Math.round(img.width * scale);
    const drawH = Math.round(img.height * scale);
    const dx = Math.round((size - drawW) / 2);
    const dy = Math.round((size - drawH) / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, drawW, drawH);

    const out = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, name), out);
    console.log(`✅ Wrote ${name} (${size}x${size})`);
  }

  console.log('\n🎉 All icons generated from source image.');
  console.log('ℹ️  Make sure manifest and index.html reference these standard filenames (already configured).');
}

const inputArg = process.argv.slice(2).join(' ').trim();
const srcPath = resolveInputPath(inputArg);
if (!srcPath) {
  console.error('❌ Could not find source image. Pass the path as an argument, e.g.:');
  console.error('   node scripts/generate-icons-from-image.js "@MiPT LOGO brAIn.png"');
  process.exit(1);
}

console.log(`🎨 Using source image: ${srcPath}`);
await generateAll(srcPath);

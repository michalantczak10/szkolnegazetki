const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'img', 'branding', 'logo-galaretkarnia.svg');
const out = path.join(root, 'favicon');

async function ensureOut() {
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
}

async function generate() {
  await ensureOut();

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'web-app-manifest-192x192.png', size: 192 },
    { name: 'web-app-manifest-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 }
  ];

  for (const s of sizes) {
    const dest = path.join(out, s.name);
    console.log(`Generating ${s.name} (${s.size}px)...`);
    await sharp(src)
      .resize(s.size, s.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(dest);
  }

  // Create favicon.ico from 16/32/48
  const icoPngs = [16, 32, 48].map(sz => path.join(out, `favicon-${sz}x${sz}.png`));
  const icoBuffers = icoPngs.map(p => fs.readFileSync(p));

  console.log('Generating favicon.ico...');
  const ico = await toIco(icoBuffers);
  fs.writeFileSync(path.join(out, 'favicon.ico'), ico);

  console.log('Favicons generated in', out);
}

generate().catch(err => {
  console.error('Failed to generate favicons:', err);
  process.exit(1);
});

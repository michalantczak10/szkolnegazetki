import { fileURLToPath } from 'url';
import { dirname, extname, join } from 'path';
import { readdir, writeFile } from 'fs/promises';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const imgDir = join(projectRoot, 'client', 'img');

const dirs = ['products', 'team', 'hero', 'branding'];

async function collectImages(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImages(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    const extension = extname(entry.name).toLowerCase();
    if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
      files.push(fullPath);
    }
  }

  return files;
}

try {
  console.log('🎨 Starting image compression with WebP generation...\n');
  let totalCompressed = 0;
  let totalWebp = 0;
  
  for (const dir of dirs) {
    const dirPath = join(imgDir, dir);
    console.log(`📁 Processing ${dir}...`);

    const files = await collectImages(dirPath);
    let compressedInDir = 0;
    let webpInDir = 0;

    for (const filePath of files) {
      const extension = extname(filePath).toLowerCase();
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      if (extension === '.jpg' || extension === '.jpeg') {
        const jpegBuffer = await sharp(filePath)
          .jpeg({ quality: 75, mozjpeg: true })
          .toBuffer();
        await writeFile(filePath, jpegBuffer);
      }

      if (extension === '.png') {
        const pngBuffer = await sharp(filePath)
          .png({ quality: 75, compressionLevel: 9, palette: true })
          .toBuffer();
        await writeFile(filePath, pngBuffer);
      }

      await sharp(filePath).webp({ quality: 75 }).toFile(webpPath);
      compressedInDir += 1;
      webpInDir += 1;
    }

    totalCompressed += compressedInDir;
    totalWebp += webpInDir;
    console.log(`   ✓ ${compressedInDir} images compressed, ${webpInDir} WebP generated`);
  }

  console.log(`\n✅ Compression completed!`);
  console.log(`📦 Total: ${totalCompressed} PNG/JPG compressed, ${totalWebp} WebP generated\n`);
} catch (error) {
  console.error('❌ Compression failed:', error.message);
  process.exit(1);
}

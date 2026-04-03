import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminWebp from 'imagemin-webp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const imgDir = join(projectRoot, 'client', 'img');

const dirs = ['products', 'team', 'hero', 'branding'];

try {
  console.log('🎨 Starting image compression with WebP generation...\n');
  let totalCompressed = 0;
  let totalWebp = 0;
  
  for (const dir of dirs) {
    const dirPath = join(imgDir, dir);
    console.log(`📁 Processing ${dir}...`);
    
    // Compress PNG/JPG
    const compressedFiles = await imagemin([`${dirPath}/**/*.{jpg,png}`], {
      destination: dirPath,
      plugins: [
        imageminPngquant({
          quality: [0.6, 0.8],
          speed: 4,
        }),
        imageminMozjpeg({
          quality: 75,
          progressive: true,
        }),
      ],
    });
    
    // Generate WebP versions
    const webpFiles = await imagemin([`${dirPath}/**/*.{jpg,png}`], {
      destination: dirPath,
      plugins: [
        imageminWebp({
          quality: 75,
        }),
      ],
    });
    
    totalCompressed += compressedFiles.length;
    totalWebp += webpFiles.length;
    console.log(`   ✓ ${compressedFiles.length} images compressed, ${webpFiles.length} WebP generated`);
  }

  console.log(`\n✅ Compression completed!`);
  console.log(`📦 Total: ${totalCompressed} PNG/JPG compressed, ${totalWebp} WebP generated\n`);
} catch (error) {
  console.error('❌ Compression failed:', error.message);
  process.exit(1);
}

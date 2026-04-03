import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const imgDir = join(projectRoot, 'client', 'img');

const dirs = ['products', 'team', 'hero', 'branding'];

try {
  console.log('🎨 Starting image compression...\n');
  let totalProcessed = 0;
  
  for (const dir of dirs) {
    const dirPath = join(imgDir, dir);
    console.log(`📁 Compressing ${dir}...`);
    
    const files = await imagemin([`${dirPath}/**/*.{jpg,png}`], {
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
    
    totalProcessed += files.length;
    console.log(`   ✓ ${files.length} images processed`);
  }

  console.log(`\n✅ Compression completed!`);
  console.log(`📦 Total: ${totalProcessed} images compressed\n`);
} catch (error) {
  console.error('❌ Compression failed:', error.message);
  process.exit(1);
}

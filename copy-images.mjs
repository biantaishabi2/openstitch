import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = '/tmp/figma-images';
const dstDir = '/home/wangbo/document/stitch/public/figma-images';

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(f => {
  const src = path.join(srcDir, f);
  const dst = path.join(dstDir, f);
  fs.copyFileSync(src, dst);
  console.log(`Copied: ${f}`);
});

console.log(`\nTotal: ${files.length} files`);

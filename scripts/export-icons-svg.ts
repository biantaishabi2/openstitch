#!/usr/bin/env tsx
/**
 * 导出 Figma 图标为 SVG
 *
 * 用法:
 *   FIGMA_TOKEN=xxx npx tsx scripts/export-icons-svg.ts <file-key> [output-dir]
 *
 * 示例:
 *   FIGMA_TOKEN=figd_xxx npx tsx scripts/export-icons-svg.ts GgNqIztxMCacqG0u4TnRtm ./icons
 */

import { exportIconsAsSVG, downloadSVGIcons, extractIcons } from '../src/figma/adapter/asset-exporter';
import { fetchFigmaFile } from '../src/figma/adapter/fetcher';
import { mkdir } from 'fs/promises';

async function main() {
  const fileKey = process.argv[2];
  const outputDir = process.argv[3] || './icons';

  if (!fileKey) {
    console.error('Usage: FIGMA_TOKEN=xxx npx tsx scripts/export-icons-svg.ts <file-key> [output-dir]');
    process.exit(1);
  }

  const figmaToken = process.env.FIGMA_TOKEN;
  if (!figmaToken) {
    console.error('Error: FIGMA_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log('Exporting icons from Figma file:', fileKey);
  console.log('Output directory:', outputDir);
  console.log('');

  try {
    // 1. 获取 Figma 文件
    console.log('1. Fetching Figma file...');
    const { figmaFile } = await fetchFigmaFile({ fileKey, figmaToken });
    console.log('   ✅ File fetched:', figmaFile.name);

    // 2. 提取图标
    console.log('\n2. Extracting icons...');
    const icons = extractIcons(figmaFile);
    console.log(`   ✅ Found ${icons.length} icons`);
    
    if (icons.length === 0) {
      console.log('   No icons to export');
      return;
    }

    icons.forEach(icon => {
      console.log(`   - ${icon.name} (${icon.id})`);
    });

    // 3. 导出 SVG URL
    console.log('\n3. Exporting SVG URLs from Figma...');
    const iconUrls = await exportIconsAsSVG(icons, { fileKey, figmaToken });
    const exportedCount = Object.keys(iconUrls).length;
    console.log(`   ✅ Exported ${exportedCount}/${icons.length} icons`);

    if (exportedCount === 0) {
      console.log('   No icons were exported');
      return;
    }

    // 4. 下载 SVG 文件
    console.log('\n4. Downloading SVG files...');
    await mkdir(outputDir, { recursive: true });
    const downloaded = await downloadSVGIcons(iconUrls, outputDir);
    console.log(`   ✅ Downloaded ${downloaded.length} SVG files`);

    // 5. 输出结果
    console.log('\n=== Export Summary ===');
    console.log(`Total icons: ${icons.length}`);
    console.log(`Exported: ${exportedCount}`);
    console.log(`Downloaded: ${downloaded.length}`);
    console.log('\nFiles:');
    downloaded.forEach(path => {
      console.log(`  - ${path}`);
    });

    // 6. 生成导入代码
    console.log('\n=== Usage in React ===');
    console.log('// Install lucide-react first:');
    console.log('// npm install lucide-react');
    console.log('');
    console.log('// Or use the SVG files directly:');
    console.log(`import Icon1 from './icons/${Object.keys(iconUrls)[0]?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.svg';`);

  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env tsx
/**
 * 导出 Figma 设计稿资产
 *
 * 用法:
 *   npx tsx scripts/export-assets.ts <figma-json-path> [output-dir]
 *
 * 示例:
 *   npx tsx scripts/export-assets.ts test-fixtures/figma-to-stitch-demo/figma.json ./assets-export
 */

import { readFileSync } from 'fs';
import {
  extractFonts,
  generateGoogleFontsLink,
  generateFontCSS,
  extractIcons,
  generateIconMapping,
} from '../src/figma/adapter/asset-exporter';

function main() {
  const jsonPath = process.argv[2];
  const outputDir = process.argv[3] || './assets-export';

  if (!jsonPath) {
    console.error('Usage: npx tsx scripts/export-assets.ts <figma-json-path> [output-dir]');
    process.exit(1);
  }

  console.log('Exporting assets from:', jsonPath);
  console.log('Output directory:', outputDir);
  console.log('');

  // 读取 Figma JSON
  const figmaFile = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  // 1. 导出字体
  console.log('=== 字体资产 ===');
  const fonts = extractFonts(figmaFile);
  
  if (fonts.length === 0) {
    console.log('No fonts found');
  } else {
    fonts.forEach(font => {
      console.log(`\n字体: ${font.family}`);
      console.log(`  字重: ${font.weights.join(', ')}`);
      console.log(`  字号: ${font.sizes.join(', ')}px`);
    });

    console.log('\n--- Google Fonts 链接 ---');
    console.log(generateGoogleFontsLink(fonts));

    console.log('\n--- CSS ---');
    console.log(generateFontCSS(fonts));
  }

  // 2. 导出图标
  console.log('\n\n=== 图标资产 ===');
  const icons = extractIcons(figmaFile);
  
  if (icons.length === 0) {
    console.log('No icons found');
  } else {
    console.log(`找到 ${icons.length} 个图标:`);
    icons.slice(0, 20).forEach(icon => {
      console.log(`  - ${icon.name} (${icon.id})`);
    });
    if (icons.length > 20) {
      console.log(`  ... 还有 ${icons.length - 20} 个`);
    }

    console.log('\n--- Lucide 图标映射 ---');
    const mapping = generateIconMapping(icons);
    console.log(JSON.stringify(mapping, null, 2));
  }

  console.log('\n\n=== 导出建议 ===');
  console.log('1. 字体: 在 HTML 中添加 Google Fonts 链接');
  console.log('2. 图标: 使用上面的 Lucide 映射替换 Figma 图标');
  console.log('   或调用 exportIconsAsSVG() 导出原始 SVG');
}

main();

#!/usr/bin/env tsx
/**
 * 下载 Figma 设计稿
 *
 * 用法:
 *   npx tsx scripts/download-figma.ts <file-key> [output-dir]
 *
 * 示例:
 *   npx tsx scripts/download-figma.ts GgNqIztxMCacqG0u4TnRtm ./test-fixtures/my-project
 */

import { downloadFigmaData } from '../src/figma/adapter';

async function main() {
  const fileKey = process.argv[2];
  const outputDir = process.argv[3] || './test-fixtures/figma-download';

  if (!fileKey) {
    console.error('Usage: npx tsx scripts/download-figma.ts <file-key> [output-dir]');
    console.error('');
    console.error('Environment variables:');
    console.error('  FIGMA_TOKEN - Figma API token (required)');
    process.exit(1);
  }

  const figmaToken = process.env.FIGMA_TOKEN;
  if (!figmaToken) {
    console.error('Error: FIGMA_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log(`Downloading Figma file: ${fileKey}`);
  console.log(`Output directory: ${outputDir}`);
  console.log('');

  try {
    const result = await downloadFigmaData({
      fileKey,
      figmaToken,
      outputDir,
      screenshotName: 'figma-design.png',
      jsonName: 'figma.json',
    });

    console.log('✅ Download complete!');
    console.log('');
    console.log('Files:');
    console.log(`  JSON: ${result.jsonPath}`);
    if (result.screenshotPath) {
      console.log(`  Screenshot: ${result.screenshotPath}`);
    }

    if (result.warnings.length > 0) {
      console.log('');
      console.log('Warnings:');
      result.warnings.forEach(w => console.log(`  - ${w}`));
    }
  } catch (error) {
    console.error('❌ Download failed:', error);
    process.exit(1);
  }
}

main();

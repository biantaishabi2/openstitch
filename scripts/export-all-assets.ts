#!/usr/bin/env tsx
/**
 * 完整导出 Figma 设计稿所有资产
 *
 * 用法:
 *   FIGMA_TOKEN=xxx npx tsx scripts/export-all-assets.ts <file-key> <output-dir>
 *
 * 示例:
 *   FIGMA_TOKEN=figd_xxx npx tsx scripts/export-all-assets.ts GgNqIztxMCacqG0u4TnRtm ./my-project
 */

import { downloadFigmaData } from '../src/figma/adapter/fetcher';
import {
  extractFonts,
  generateFontCSS,
  extractIcons,
  exportIconsAsSVG,
  downloadSVGIcons,
  generateIconMapping,
} from '../src/figma/adapter/asset-exporter';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function main() {
  const fileKey = process.argv[2];
  const outputDir = process.argv[3];

  if (!fileKey || !outputDir) {
    console.error('Usage: FIGMA_TOKEN=xxx npx tsx scripts/export-all-assets.ts <file-key> <output-dir>');
    console.error('');
    console.error('Example:');
    console.error('  FIGMA_TOKEN=figd_xxx npx tsx scripts/export-all-assets.ts GgNqIztxMCacqG0u4TnRtm ./my-project');
    process.exit(1);
  }

  const figmaToken = process.env.FIGMA_TOKEN;
  if (!figmaToken) {
    console.error('Error: FIGMA_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log('========================================');
  console.log('  Figma Asset Exporter');
  console.log('========================================');
  console.log('File Key:', fileKey);
  console.log('Output:', outputDir);
  console.log('');

  try {
    // 1. 下载 Figma JSON 和截图
    console.log('📥 Step 1: Downloading Figma data...');
    const downloadResult = await downloadFigmaData({
      fileKey,
      figmaToken,
      outputDir,
      jsonName: 'figma.json',
      screenshotName: 'figma-design.png',
    });
    console.log('   ✅ JSON:', downloadResult.jsonPath);
    if (downloadResult.screenshotPath) {
      console.log('   ✅ Screenshot:', downloadResult.screenshotPath);
    }

    const { figmaFile } = downloadResult;

    // 2. 导出字体
    console.log('\n🔤 Step 2: Extracting fonts...');
    const fonts = extractFonts(figmaFile);
    console.log(`   ✅ Found ${fonts.length} fonts`);
    fonts.forEach(f => {
      console.log(`      - ${f.family} (${f.weights.join(', ')})`);
    });

    // 保存字体 CSS
    const fontCSS = generateFontCSS(fonts);
    const fontCSSPath = join(outputDir, 'fonts.css');
    await writeFile(fontCSSPath, fontCSS);
    console.log('   ✅ Font CSS:', fontCSSPath);

    // 3. 导出图标
    console.log('\n🎨 Step 3: Extracting icons...');
    const icons = extractIcons(figmaFile);
    console.log(`   ✅ Found ${icons.length} icons`);

    // 生成 Lucide 映射
    const iconMapping = generateIconMapping(icons);
    const mappingPath = join(outputDir, 'icon-mapping.json');
    await writeFile(mappingPath, JSON.stringify(iconMapping, null, 2));
    console.log('   ✅ Icon mapping:', mappingPath);

    // 尝试导出 SVG
    const iconsDir = join(outputDir, 'icons');
    await mkdir(iconsDir, { recursive: true });

    console.log('   📤 Exporting SVG from Figma API...');
    const iconUrls = await exportIconsAsSVG(icons, { fileKey, figmaToken });
    const exportedCount = Object.keys(iconUrls).length;
    console.log(`   ✅ Got ${exportedCount} SVG URLs`);

    if (exportedCount > 0) {
      const downloaded = await downloadSVGIcons(iconUrls, iconsDir);
      console.log(`   ✅ Downloaded ${downloaded.length} SVG files`);
    }

    // 4. 生成资产清单
    console.log('\n📋 Step 4: Generating asset manifest...');
    const manifest = {
      source: {
        fileKey,
        fileName: figmaFile.name,
        lastModified: figmaFile.lastModified,
      },
      assets: {
        json: 'figma.json',
        screenshot: downloadResult.screenshotPath ? 'figma-design.png' : null,
        fonts: {
          css: 'fonts.css',
          families: fonts,
        },
        icons: {
          mapping: 'icon-mapping.json',
          svgFolder: 'icons/',
          count: exportedCount,
        },
      },
      usage: {
        html: `<!-- Add to HTML head -->\n<link rel="stylesheet" href="./fonts.css">`,
        react: `// Use Lucide icons\nimport { Gift, UserPlus, Newspaper } from 'lucide-react';`,
      },
    };

    const manifestPath = join(outputDir, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('   ✅ Manifest:', manifestPath);

    // 5. 输出总结
    console.log('\n========================================');
    console.log('  Export Complete!');
    console.log('========================================');
    console.log('');
    console.log('Directory structure:');
    console.log(`  ${outputDir}/`);
    console.log(`  ├── figma.json`);
    console.log(`  ├── figma-design.png`);
    console.log(`  ├── fonts.css`);
    console.log(`  ├── icon-mapping.json`);
    console.log(`  ├── manifest.json`);
    console.log(`  └── icons/`);
    console.log(`      └── *.svg (${exportedCount} files)`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Add fonts.css to your HTML');
    console.log('  2. Use icon-mapping.json to replace icons with Lucide');
    console.log('  3. Or use the SVG files in icons/ folder');

    if (downloadResult.warnings.length > 0) {
      console.log('\nWarnings:');
      downloadResult.warnings.forEach(w => console.log(`  ⚠️ ${w}`));
    }

  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

main();

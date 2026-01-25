import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const pages = [
  'comp-layout',
  'comp-navigation',
  'comp-data',
  'comp-forms',
  'comp-feedback',
  'comp-typography',
  'comp-extra'
];

const outputDir = '/home/wangbo/document/zcpg/docs/stitch/component-screenshots';

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  // 使用桌面端宽屏尺寸
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  for (const pageName of pages) {
    const filePath = `file:///home/wangbo/document/stitch/test-output/${pageName}.html`;
    console.log(`截图: ${pageName}`);

    await page.goto(filePath);
    await page.waitForTimeout(800); // 等待渲染

    await page.screenshot({
      path: join(outputDir, `${pageName}.png`),
      fullPage: true
    });
    console.log(`  ✓ 已保存 ${pageName}.png`);
  }

  await browser.close();
  console.log('\n所有截图完成! (1920x1080 桌面尺寸)');
}

main().catch(console.error);

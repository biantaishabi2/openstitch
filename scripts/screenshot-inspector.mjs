import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // 打开 cyberpunk 页面
  await page.goto(`file://${path.join(__dirname, '../docs/demo/cyberpunk.html')}`);
  await page.waitForTimeout(2000);

  // 点击 Inspector 按钮启用
  const inspectorBtn = page.locator('#stitch-inspector-toggle');
  await inspectorBtn.click();
  await page.waitForTimeout(500);

  // hover 到某个元素上
  const card = page.locator('[data-stitch-type="Card"]').first();
  await card.hover();
  await page.waitForTimeout(500);

  // 截图
  await page.screenshot({ path: path.join(__dirname, '../artifacts/inspector.png') });

  await browser.close();
  console.log('Inspector 截图完成');
}

main().catch(console.error);

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // 检查是否有模态框
  const modals = await page.locator('[role="dialog"], .modal, [data-modal], #modal').all();
  console.log('找到模态框数量:', modals.length);

  // 检查页面上所有可见的 dialog 元素
  const dialogs = await page.locator('dialog, [aria-modal="true"]').all();
  console.log('找到 dialog 元素:', dialogs.length);

  for (const dialog of dialogs) {
    const isVisible = await dialog.isVisible();
    const id = await dialog.getAttribute('id');
    console.log(`Dialog id="${id}", visible=${isVisible}`);
  }

  // 截图
  await page.screenshot({ path: 'artifacts/localhost-4000-debug.png', fullPage: true });
  console.log('截图保存到 artifacts/localhost-4000-debug.png');

  await browser.close();
}

main().catch(console.error);

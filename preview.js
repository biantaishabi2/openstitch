const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 加载 HTML 文件
  const html = fs.readFileSync('output/chest-hospital-home-fixed.html', 'utf-8');
  await page.setContent(html, { waitUntil: 'networkidle' });

  // 设置视口为移动端尺寸
  await page.setViewportSize({ width: 375, height: 800 });

  // 截图
  await page.screenshot({
    path: 'output/chest-hospital-home-fixed-preview.png',
    fullPage: true
  });

  console.log('✅ 截图已保存到 output/chest-hospital-home-fixed-preview.png');

  await browser.close();
})();

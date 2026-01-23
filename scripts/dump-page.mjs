import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(3000);

  // 获取页面 HTML
  const html = await page.content();

  // 查找所有 fixed 或 absolute 定位的元素（可能是模态框）
  const fixedElements = await page.evaluate(() => {
    const elements = [];
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'absolute') {
        if (el.offsetWidth > 100 && el.offsetHeight > 100) {
          elements.push({
            tag: el.tagName,
            id: el.id,
            class: el.className,
            visible: el.offsetParent !== null,
            zIndex: style.zIndex
          });
        }
      }
    });
    return elements;
  });

  console.log('Fixed/Absolute 大元素:');
  fixedElements.forEach(el => console.log(el));

  await browser.close();
}

main().catch(console.error);

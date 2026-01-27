/**
 * 胸科医院 - CSS 位置测试
 */
import { describe, it, expect } from 'vitest';
import { compile } from '../../src/lib/compiler';

describe('胸科医院 - CSS 位置测试', () => {
  it('CSS 在布局属性之前', async () => {
    const dsl1 = `[CARD: welfare]
  CSS: "rounded-none shadow-none"
  { ClassName: "bg-white p-3 text-center" }
  [TEXT: text]
    CONTENT: "福利平台"`;
    const result1 = await compile(dsl1, { context: 'test' });
    console.log('Test 1 (CSS first):', result1.ssr.html.length, 'bytes');
    console.log('Has rounded-none:', result1.ssr.html.includes('rounded-none'));
    console.log('Has shadow-none:', result1.ssr.html.includes('shadow-none'));
  });

  it('CSS 在 ATTR 之后', async () => {
    const dsl2 = `[CARD: welfare]
  ATTR: Title("福利平台")
  CSS: "rounded-none shadow-none"`;
    const result2 = await compile(dsl2, { context: 'test' });
    console.log('Test 2 (CSS after ATTR):', result2.ssr.html.length, 'bytes');
  });

  it('单行 CSS + 多行子元素', async () => {
    const dsl3 = `[CARD: welfare] CSS: "rounded-none shadow-none"
  { ClassName: "bg-white p-3" }
  [TEXT: text] CONTENT: "福利平台"`;
    const result3 = await compile(dsl3, { context: 'test' });
    console.log('Test 3 (Single line CSS + children):', result3.ssr.html.length, 'bytes');
    expect(result3.ssr.html.length).toBeGreaterThan(0);
  });
});

/**
 * 胸科医院 - DSL 语法测试
 */
import { describe, it, expect } from 'vitest';
import { compile } from '../../src/lib/compiler';

describe('胸科医院 - DSL 语法测试', () => {
  it('应该解析 CSS 属性', async () => {
    const dsl1 = '[CARD: test] CSS: \"rounded-none shadow-none\"';
    const result1 = await compile(dsl1, { context: 'test' });
    expect(result1.ssr.html.length).toBeGreaterThan(0);
    console.log('Test 1 (CSS only):', result1.ssr.html.length, 'bytes');
  });

  it('应该解析 ClassName + CSS', async () => {
    const dsl2 = '[CARD: test] { ClassName: \"bg-white p-3\" } CSS: \"rounded-none shadow-none\"';
    const result2 = await compile(dsl2, { context: 'test' });
    expect(result2.ssr.html.length).toBeGreaterThan(0);
    console.log('Test 2 (ClassName + CSS):', result2.ssr.html.length, 'bytes');
  });

  it('应该解析完整的卡片 DSL', async () => {
    const dsl = `[CARD: welfare]
  CSS: "rounded-none shadow-none border-0"
  { ClassName: "bg-white p-3 text-center" }
  [TEXT: text]
    { ClassName: "text-xs" }
    CONTENT: "福利平台"`;
    
    const result = await compile(dsl, { context: 'test' });
    expect(result.ssr.html.length).toBeGreaterThan(0);
    expect(result.ssr.html).toContain('rounded-none');
    expect(result.ssr.html).toContain('shadow-none');
    expect(result.ssr.html).toContain('福利平台');
    console.log('Test 3 (Full card):', result.ssr.html.length, 'bytes');
  });
});

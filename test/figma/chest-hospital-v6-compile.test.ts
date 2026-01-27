/**
 * 胸科医院 - v6 最终精细调整测试
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - v6 最终精细调整', () => {
  it('应该编译最终精细调整的 DSL', async () => {
    const config = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-v6.json');

    const result = await compileFromJSON(config, 'chest_hospital_home');

    console.log('\n=== v6 编译结果 ===');
    console.log('HTML 大小:', (result.ssr.html.length / 1024).toFixed(1) + 'KB');
    console.log('节点数:', result.stats.nodeCount);

    // 检查关键样式
    const countClass = (cls: string) => {
      const regex = new RegExp(cls, 'g');
      return (result.ssr.html.match(regex) || []).length;
    };

    console.log('\n--- 字体大小 ---');
    console.log('text-xs:', countClass('text-xs'));
    console.log('text-sm:', countClass('text-sm'));
    console.log('text-4xl:', countClass('text-4xl'));

    console.log('\n--- 间距 ---');
    console.log('mt-3:', countClass('mt-3'));
    console.log('mt-1:', countClass('mt-1'));
    console.log('mb-2:', countClass('mb-2'));
    console.log('p-2:', countClass('p-2'));

    console.log('\n--- 追踪 ---');
    console.log('tracking-tight:', countClass('tracking-tight'));

    // 保存 HTML
    const { writeFileSync } = await import('fs');
    writeFileSync('test-fixtures/figma-to-stitch-demo/output/chest-hospital-home-v6.html', result.ssr.html, 'utf-8');
    console.log('\n✅ 已保存到 output/chest-hospital-home-v6.html');

    expect(result.ssr.html.length).toBeGreaterThan(0);
  });

  it('对比 v5 和 v6 的样式差异', async () => {
    const configV5 = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-v5.json');
    const configV6 = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-v6.json');

    const resultV5 = await compileFromJSON(configV5, 'chest_hospital_home');
    const resultV6 = await compileFromJSON(configV6, 'chest_hospital_home');

    console.log('\n=== v5 vs v6 对比 ===');
    console.log('v5:', (resultV5.ssr.html.length / 1024).toFixed(1) + 'KB');
    console.log('v6:', (resultV6.ssr.html.length / 1024).toFixed(1) + 'KB');

    const countClass = (html: string, cls: string) => (html.match(new RegExp(cls, 'g')) || []).length;

    console.log('\n--- 间距变化 ---');
    console.log('mt-4 → mt-3:', countClass(resultV5.ssr.html, 'mt-4'), '→', countClass(resultV6.ssr.html, 'mt-3'));
    console.log('mt-2 → mt-1:', countClass(resultV5.ssr.html, 'mt-2'), '→', countClass(resultV6.ssr.html, 'mt-1'));
    console.log('mb-3 → mb-2:', countClass(resultV5.ssr.html, 'mb-3'), '→', countClass(resultV6.ssr.html, 'mb-2'));
    console.log('p-3 → p-2:', countClass(resultV5.ssr.html, 'p-3'), '→', countClass(resultV6.ssr.html, 'p-2'));

    expect(resultV6.ssr.html.length).toBeGreaterThan(0);
  });
});

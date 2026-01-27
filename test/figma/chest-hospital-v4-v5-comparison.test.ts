/**
 * 胸科医院 - v4 vs v5 对比测试
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - v4 vs v5 对比', () => {
  it('对比 v4 和 v5 的样式差异', async () => {
    const configV4 = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-final.json');
    const configV5 = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-v5.json');

    const resultV4 = await compileFromJSON(configV4, 'chest_hospital_home');
    const resultV5 = await compileFromJSON(configV5, 'chest_hospital_home');

    console.log('\n=== v4 vs v5 对比 ===');
    console.log('v4 大小:', (resultV4.ssr.html.length / 1024).toFixed(1) + 'KB');
    console.log('v5 大小:', (resultV5.ssr.html.length / 1024).toFixed(1) + 'KB');

    // 统计样式差异
    const countClass = (html: string, cls: string) => {
      const regex = new RegExp(cls, 'g');
      return (html.match(regex) || []).length;
    };

    console.log('\n--- 字体大小分布 ---');
    console.log('text-xs:', countClass(resultV4.ssr.html, 'text-xs'), '→', countClass(resultV5.ssr.html, 'text-xs'));
    console.log('text-sm:', countClass(resultV4.ssr.html, 'text-sm'), '→', countClass(resultV5.ssr.html, 'text-sm'));
    console.log('text-base:', countClass(resultV4.ssr.html, 'text-base'), '→', countClass(resultV5.ssr.html, 'text-base'));
    console.log('text-lg:', countClass(resultV4.ssr.html, 'text-lg'), '→', countClass(resultV5.ssr.html, 'text-lg'));
    console.log('text-2xl:', countClass(resultV4.ssr.html, 'text-2xl'), '→', countClass(resultV5.ssr.html, 'text-2xl'));
    console.log('text-3xl:', countClass(resultV4.ssr.html, 'text-3xl'), '→', countClass(resultV5.ssr.html, 'text-3xl'));

    console.log('\n--- 尺寸分布 ---');
    console.log('w-8:', countClass(resultV4.ssr.html, 'w-8'), '→', countClass(resultV5.ssr.html, 'w-8'));
    console.log('w-10:', countClass(resultV4.ssr.html, 'w-10'), '→', countClass(resultV5.ssr.html, 'w-10'));
    console.log('w-16:', countClass(resultV4.ssr.html, 'w-16'), '→', countClass(resultV5.ssr.html, 'w-16'));
    console.log('w-20:', countClass(resultV4.ssr.html, 'w-20'), '→', countClass(resultV5.ssr.html, 'w-20'));

    expect(resultV5.ssr.html.length).toBeGreaterThan(0);
  });
});

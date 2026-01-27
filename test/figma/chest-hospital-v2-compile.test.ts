/**
 * 胸科医院 - 修正后的 DSL 编译测试
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - v2 DSL 编译测试', () => {
  it('应该编译修正后的 DSL', async () => {
    const config = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-v2.json');

    const result = await compileFromJSON(config, 'chest_hospital_home');

    console.log('\n=== 编译结果 ===');
    console.log('HTML 大小:', (result.ssr.html.length / 1024).toFixed(1) + 'KB');
    console.log('节点数:', result.stats.nodeCount);

    // 保存 HTML
    const { writeFileSync } = await import('fs');
    writeFileSync('test-fixtures/figma-to-stitch-demo/output/chest-hospital-home-v2.html', result.ssr.html, 'utf-8');
    console.log('\n✅ 已保存到 output/chest-hospital-home-v2.html');

    expect(result.ssr.html.length).toBeGreaterThan(0);
  });
});

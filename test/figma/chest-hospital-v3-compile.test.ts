/**
 * 胸科医院 - v3 DSL 编译测试（基于截图调整）
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - v3 DSL 编译测试', () => {
  it('应该编译基于截图调整的 DSL', async () => {
    const config = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-v3.json');

    const result = await compileFromJSON(config, 'chest_hospital_home');

    console.log('\n=== v3 编译结果 ===');
    console.log('HTML 大小:', (result.ssr.html.length / 1024).toFixed(1) + 'KB');
    console.log('节点数:', result.stats.nodeCount);

    // 检查是否还有圆角和阴影
    const hasRounded = result.ssr.html.includes('rounded-');
    const hasShadow = result.ssr.html.includes('shadow-');
    console.log('包含 rounded- 类:', hasRounded);
    console.log('包含 shadow- 类:', hasShadow);

    // 保存 HTML
    const { writeFileSync } = await import('fs');
    writeFileSync('test-fixtures/figma-to-stitch-demo/output/chest-hospital-home-v3.html', result.ssr.html, 'utf-8');
    console.log('\n✅ 已保存到 output/chest-hospital-home-v3.html');

    expect(result.ssr.html.length).toBeGreaterThan(0);
  });
});

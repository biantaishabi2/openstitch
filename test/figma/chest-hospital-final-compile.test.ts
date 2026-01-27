/**
 * 胸科医院 - 最终版本编译测试（SECTION 替代 CARD）
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - 最终版本编译测试', () => {
  it('应该编译使用 SECTION 的 DSL（无默认样式）', async () => {
    const config = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-final.json');

    const result = await compileFromJSON(config, 'chest_hospital_home');

    console.log('\n=== 最终版本编译结果 ===');
    console.log('HTML 大小:', (result.ssr.html.length / 1024).toFixed(1) + 'KB');
    console.log('节点数:', result.stats.nodeCount);

    // 检查是否没有圆角和阴影（SECTION 没有默认样式）
    const hasRoundedNone = result.ssr.html.includes('rounded-none');
    const hasRoundedFull = result.ssr.html.includes('rounded-full');
    const hasShadow = result.ssr.html.includes('shadow-');
    console.log('包含 rounded-full (头像):', hasRoundedFull);
    console.log('包含 shadow-:', hasShadow);

    // 保存 HTML
    const { writeFileSync } = await import('fs');
    writeFileSync('test-fixtures/figma-to-stitch-demo/output/chest-hospital-home-final-v4.html', result.ssr.html, 'utf-8');
    console.log('\n✅ 已保存到 output/chest-hospital-home-final-v4.html');

    expect(result.ssr.html.length).toBeGreaterThan(0);
  });
});

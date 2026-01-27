/**
 * 胸科医院 - v5 样式精细调整测试
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - v5 样式精细调整', () => {
  it('应该编译精细调整后的 DSL', async () => {
    const config = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config-v5.json');

    const result = await compileFromJSON(config, 'chest_hospital_home');

    console.log('\n=== v5 编译结果 ===');
    console.log('HTML 大小:', (result.ssr.html.length / 1024).toFixed(1) + 'KB');
    console.log('节点数:', result.stats.nodeCount);

    // 检查关键样式
    const hasTextSm = result.ssr.html.includes('text-sm');
    const hasTextBase = result.ssr.html.includes('text-base');
    const hasText3xl = result.ssr.html.includes('text-3xl');
    const hasTextLg = result.ssr.html.includes('text-lg');
    const hasW20 = result.ssr.html.includes('w-20');
    console.log('包含 text-sm:', hasTextSm);
    console.log('包含 text-base:', hasTextBase);
    console.log('包含 text-3xl (步数):', hasText3xl);
    console.log('包含 text-lg (标题):', hasTextLg);
    console.log('包含 w-20 (新闻图片):', hasW20);

    // 保存 HTML
    const { writeFileSync } = await import('fs');
    writeFileSync('test-fixtures/figma-to-stitch-demo/output/chest-hospital-home-v5.html', result.ssr.html, 'utf-8');
    console.log('\n✅ 已保存到 output/chest-hospital-home-v5.html');

    expect(result.ssr.html.length).toBeGreaterThan(0);
  });
});

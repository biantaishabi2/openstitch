/**
 * 胸科医院 - 中文冒号问题测试
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - 中文冒号问题', () => {
  it('应该保留中文冒号', async () => {
    const config = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config.json');
    
    // 检查 config 里的 DSL
    const dsl = config.screens[0].dsl;
    console.log('\n=== DSL 中的活跃度 ===');
    console.log('DSL 内容:', dsl.includes('活跃度：20') ? '中文冒号 ✅' : '无此内容 ❌');
    
    // 编译
    const result = await compileFromJSON(config, 'chest_hospital_home');
    const html = result.ssr.html;
    
    console.log('\n=== HTML 中的活跃度 ===');
    console.log('包含中文冒号:', html.includes('活跃度：20') ? '中文冒号 ✅' : '无此内容 ❌');
    console.log('包含英文冒号:', html.includes('活跃度:20') ? '英文冒号 ⚠️' : '无此内容 ✅');
    
    // 字符码检查
    const match = html.match(/活跃度([^<]*)/);
    if (match) {
      const char = match[1][0];
      console.log('冒号字符码:', char.charCodeAt(0), char.charCodeAt(0) === 65306 ? '(中文) ✅' : '(英文) ❌');
    }
    
    expect(dsl.includes('活跃度：20')).toBe(true);
  });
});

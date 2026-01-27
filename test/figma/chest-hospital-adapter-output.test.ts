/**
 * 胸科医院 - Figma Adapter 完整输出测试
 */
import { describe, it } from 'vitest';
import { readFileSync } from 'fs';
import { exportFigmaToJSON, loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import type { FigmaFile } from '../../src/figma/types';

describe('胸科医院 - Figma Adapter 完整输出', () => {
  it('应该输出完整的 DSL 和 Design Tokens', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

    const config = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
      platform: 'mobile',
      screenTitle: '胸科医院首页',
    });

    console.log('\n' + '='.repeat(60));
    console.log('【步骤 2】Figma Adapter 输出');
    console.log('='.repeat(60));

    const screen = config.screens[0];

    console.log('\n--- DSL (前 3000 字符) ---');
    console.log(screen.dsl.substring(0, 3000));

    console.log('\n--- DSL 统计 ---');
    console.log('总字符数:', screen.dsl.length);
    console.log('总行数:', screen.dsl.split('\n').length);

    console.log('\n--- Design Tokens (全部) ---');
    const tokens = screen.tokens || {};
    Object.entries(tokens).forEach(([k, v]) => {
      if (k.startsWith('--') && !k.includes('font') && !k.includes('spacing') && !k.includes('radius') && !k.includes('shadow')) {
        console.log(k, ':', v);
      }
    });

    // 保存到文件
    const { writeFileSync } = await import('fs');
    writeFileSync('/home/wangbo/document/stitch/test-fixtures/figma-to-stitch-demo/stitch-config-raw.json', JSON.stringify(config, null, 2), 'utf-8');
    console.log('\n✅ 已保存到 test-fixtures/figma-to-stitch-demo/stitch-config-raw.json');
  });
});

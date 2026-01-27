/**
 * 胸科医院首页 - Figma 适配器分析测试
 */
import { describe, it } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import { compileFromJSON } from '../../src/lib/compiler';
import { exportFigmaToJSON } from '../../src/figma/adapter/json-exporter';
import type { FigmaFile } from '../../src/figma/types';

describe('胸科医院首页 - Figma 适配器分析', () => {
  it('应该提取 DSL 和 Design Tokens', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
    });

    console.log('\n' + '='.repeat(60));
    console.log('【步骤 2】结构推断结果');
    console.log('='.repeat(60));
    console.log('DSL 长度:', result.dsl.length);
    console.log('置信度:', result.structure.confidence);
    console.log('AI 调用次数:', result.structure.aiCallCount);
    console.log('警告数:', result.warnings.length);

    console.log('\n' + '='.repeat(60));
    console.log('【步骤 4】Design Tokens (颜色相关)');
    console.log('='.repeat(60));
    const colorTokens = Object.entries(result.tokens)
      .filter(([k]) => k.startsWith('--') && !k.includes('font') && !k.includes('spacing') && !k.includes('radius') && !k.includes('shadow'))
      .slice(0, 15);
    colorTokens.forEach(([k, v]) => console.log(k, ':', v));

    console.log('\n' + '='.repeat(60));
    console.log('【完整 DSL 预览】(前 3000 字符)');
    console.log('='.repeat(60));
    console.log(result.dsl.substring(0, 3000));

    console.log('\n' + '='.repeat(60));
    console.log('【完整 DSL 长度】');
    console.log('='.repeat(60));
    console.log('总字符数:', result.dsl.length);
    console.log('总行数:', result.dsl.split('\n').length);
  });

  it('应该编译并生成 HTML', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

    const config = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
      platform: 'mobile',
      screenTitle: '胸科医院首页',
    });

    const result = await compileFromJSON(config, 'screen_1');

    console.log('\n' + '='.repeat(60));
    console.log('【步骤 6】编译结果');
    console.log('='.repeat(60));
    console.log('HTML 长度:', result.ssr.html.length);
    console.log('节点数:', result.stats.nodeCount);

    // 保存 HTML 到文件
    const fs = await import('fs');
    fs.writeFileSync('/tmp/chest-hospital-initial.html', result.ssr.html, 'utf-8');
    console.log('\n已保存初始编译结果到: /tmp/chest-hospital-initial.html');
  });
});

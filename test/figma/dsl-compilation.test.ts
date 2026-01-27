/**
 * 测试 Figma Adapter 生成的 DSL 能否编译
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import { compile } from '../../src/lib/compiler';
import type { FigmaFile } from '../../src/figma/types';

describe('Figma DSL Compilation', () => {
  it('should compile Figma extracted DSL', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
    });

    console.log('\n=== DSL 长度 ===', result.dsl.length);
    console.log('=== 行数 ===', result.dsl.split('\n').length);

    // 尝试编译
    const compileResult = await compile(result.dsl, {
      tokens: result.tokens,
      ssr: { title: '胸科首页' },
    });

    console.log('\n=== 编译结果 ===');
    console.log('HTML 大小:', (compileResult.stats.htmlSize / 1024).toFixed(1) + 'KB');
    console.log('节点数:', compileResult.stats.nodeCount);

    expect(compileResult.ssr.html).toBeDefined();
    expect(compileResult.ssr.html.length).toBeGreaterThan(0);
  });
});

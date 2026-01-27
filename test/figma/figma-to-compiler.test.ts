/**
 * 完整流程测试：Figma Adapter → Compiler
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import { compile } from '../../src/lib/compiler';
import type { FigmaFile } from '../../src/figma/types';

describe('Figma to Compiler Flow', () => {
  it('should compile Figma extracted DSL with Design Tokens', async () => {
    // 1. 读取 Figma JSON
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

    // 2. Figma Adapter 提取
    const figmaResult = await convertFigmaToStitch(figmaJson, {
      context: '胸科首页',
    });

    console.log('=== Figma Adapter 输出 ===');
    console.log('DSL 长度:', figmaResult.dsl.length);
    console.log('Design Tokens 数量:', Object.keys(figmaResult.tokens).length);

    // 验证颜色被正确提取
    const primaryColor = figmaResult.tokens['--primary-color'];
    console.log('Primary Color:', primaryColor);
    expect(primaryColor).toBeTruthy();

    // 3. 编译（使用 Figma 提取的 tokens）
    const compileResult = await compile(figmaResult.dsl, {
      tokens: figmaResult.tokens,  // 直接使用 Figma 提取的 tokens
      ssr: {
        title: '胸科首页',
        lang: 'zh-CN',
      },
    });

    console.log('\n=== 编译结果 ===');
    console.log('HTML 大小:', (compileResult.stats.htmlSize / 1024).toFixed(1) + 'KB');

    // 验证编译成功
    expect(compileResult.ssr.html).toBeDefined();
    expect(compileResult.ssr.html.length).toBeGreaterThan(0);

    // 验证 Figma 颜色被正确应用
    const html = compileResult.ssr.html;
    const hasPrimaryBlue = html.includes('--primary-color') && html.includes(primaryColor!);
    console.log('包含 Figma 主色:', hasPrimaryBlue);
    expect(hasPrimaryBlue).toBe(true);
  });

  it('should use tokenOverrides to adjust colors', async () => {
    // 读取 Figma JSON
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

    // Figma Adapter 提取
    const figmaResult = await convertFigmaToStitch(figmaJson, {
      context: '胸科首页',
    });

    // 使用 tokenOverrides 调整颜色
    const compileResult = await compile(figmaResult.dsl, {
      tokens: figmaResult.tokens,
      tokenOverrides: {
        '--primary-color': '#00B5FF',  // 手动覆盖为指定的蓝色
        '--accent-color': '#FF9D00',
      },
      ssr: { title: '胸科首页' },
    });

    // 验证覆盖生效
    expect(compileResult.ssr.html).toContain('#00B5FF');
    expect(compileResult.ssr.html).toContain('#FF9D00');
  });
});

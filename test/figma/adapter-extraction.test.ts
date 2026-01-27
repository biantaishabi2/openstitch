/**
 * 测试 Figma Adapter 颜色提取
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('Figma Adapter Color Extraction', () => {
  it('should extract colors from Figma JSON', async () => {
    // 读取 Figma JSON
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

    console.log('=== Figma 文件信息 ===');
    console.log('文件名:', figmaJson.name);

    // 转换
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    console.log('\n=== DSL 片段（前 2000 字符）===');
    console.log(result.dsl.substring(0, 2000));

    console.log('\n=== DSL 中的特殊字符 ===');
    const specialChars = result.dsl.match(/[→←]/g);
    console.log('特殊字符:', specialChars ? specialChars.slice(0, 20) : '无');

    console.log('\n=== Design Tokens 颜色 ===');
    const colorTokens = Object.entries(result.tokens)
      .filter(([key]) => key.startsWith('--') && !key.includes('spacing') && !key.includes('font') && !key.includes('radius') && !key.includes('shadow'))
      .slice(0, 30);
    for (const [key, value] of colorTokens) {
      console.log(`${key}: ${value}`);
    }

    console.log('\n=== 警告 ===');
    result.warnings.forEach(w => console.log('-', w));

    // 验证结果
    expect(result.dsl).toBeDefined();
    expect(result.dsl.length).toBeGreaterThan(0);

    // 验证 DSL 语法（不包含非法字符如箭头符号）
    // 注意：> 是 CONTENT 内容中的合法字符（如 "详情 >"），不需要检查
    const invalidChars = result.dsl.match(/[→←]/g);
    expect(invalidChars, 'DSL 不应包含箭头符号').toBeFalsy();
  });
});

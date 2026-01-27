/**
 * 测试 escapeString 函数是否正确清理特殊字符
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('escapeString Function Tests', () => {
  it('should replace full-width colon in text content', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    console.log('\n=== Checking escapeString results ===');

    // 查找 "活跃度" 那一行
    const lines = result.dsl.split('\n');
    const activeLine = lines.find(l => l.includes('活跃度'));
    console.log('Line with 活跃度:');
    console.log(activeLine);

    // 检查是否还有全角冒号
    const hasFullWidthColon = result.dsl.includes('：');
    console.log('\nDSL contains full-width colon (：):', hasFullWidthColon);

    // 如果还有，查找位置
    if (hasFullWidthColon) {
      const pos = result.dsl.indexOf('：');
      console.log('Position:', pos);
      console.log('Context:', result.dsl.slice(Math.max(0, pos - 20), Math.min(result.dsl.length, pos + 20)));
    }

    expect(result.dsl.length).toBeGreaterThan(0);
  });

  it('should replace all special punctuation', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    console.log('\n=== Checking all special punctuation ===');

    const checks = [
      { char: '：', name: '全角冒号' },
      { char: '\u201C', name: '左弯引号' },
      { char: '\u201D', name: '右弯引号' },
      { char: '\u2018', name: '左单引号' },
      { char: '\u2019', name: '右单引号' },
      { char: '＜', name: '全角小于号' },
      { char: '＞', name: '全角大于号' },
      { char: '［', name: '全角左方括号' },
      { char: '］', name: '全角右方括号' },
      { char: '－', name: '全角连字符' },
    ];

    for (const check of checks) {
      const count = (result.dsl.match(new RegExp(check.char, 'g')) || []).length;
      console.log(`${check.name} (${check.char}): ${count} occurrences`);
      if (count > 0) {
        const pos = result.dsl.indexOf(check.char);
        console.log(`  First at position ${pos}`);
        console.log(`  Context: ...${result.dsl.slice(Math.max(0, pos - 10), Math.min(result.dsl.length, pos + 20))}...`);
      }
    }

    expect(result.dsl.length).toBeGreaterThan(0);
  });
});

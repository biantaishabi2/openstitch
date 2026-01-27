/**
 * Debug preprocessing and lexer errors
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import { tokenize } from '../../src/lib/compiler/logic/lexer';
import type { FigmaFile } from '../../src/figma/types';

describe('Debug Preprocessing', () => {
  it('should show preprocessing at error offset', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== DSL at Error Offsets ===');

    const errorOffsets = [2959, 4669, 4912];

    for (const offset of errorOffsets) {
      console.log(`\n--- Offset ${offset} ---`);
      console.log(`Original char: "${dsl[offset] || 'OUT OF BOUNDS'}" (code: ${dsl.charCodeAt(offset)})`);

      // 模拟预处理
      const processed = dsl
        .replace(/[：：]/g, ':')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[＜＞]/g, m => m === '＜' ? '<' : '>')
        .replace(/[［］]/g, m => m === '［' ? '[' : ']')
        .replace(/[－]/g, '-')
        .replace(/[^\x20-\x7E\n\t]/g, '?');

      console.log(`Processed char: "${processed[offset] || 'OUT OF BOUNDS'}" (code: ${processed.charCodeAt(offset)})`);

      // 显示上下文
      const contextStart = Math.max(0, offset - 20);
      const contextEnd = Math.min(processed.length, offset + 20);
      console.log(`Processed context: ...${processed.slice(contextStart, contextEnd).replace(/\n/g, '\\n').replace(/[\x00-\x1F]/g, c => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`)}...`);
    }

    // 测试 tokenize
    console.log('\n=== Tokenize Test ===');
    const { tokens, errors, processedInput } = tokenize(dsl);

    console.log(`Token count: ${tokens.length}`);
    console.log(`Error count: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nFirst 5 errors:');
      errors.slice(0, 5).forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.message} at offset ${e.offset}`);
      });
    }

    expect(dsl.length).toBeGreaterThan(0);
  });
});

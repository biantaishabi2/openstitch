/**
 * Check line 178-180
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('Check Lines 178-180', () => {
  it('should show exact content', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    const lines = result.dsl.split('\n');
    console.log('\n=== Lines 177-180 ===');
    for (let i = 177; i <= 180; i++) {
      console.log(`[${i + 1}] "${lines[i]}"`);
    }

    // 检查这些行的字符
    for (let i = 177; i <= 180; i++) {
      const line = lines[i];
      if (line.includes('CONTENT')) {
        console.log(`\nLine ${i + 1} chars:`, Array.from(line).map((c, idx) => `${idx}:${c}(${c.charCodeAt(0)})`).join(', '));
      }
    }

    expect(result.dsl.length).toBeGreaterThan(0);
  });
});

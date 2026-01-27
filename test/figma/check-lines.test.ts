/**
 * Check problematic lines
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('Check Problematic Lines', () => {
  it('should show lines 200-210', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    const lines = result.dsl.split('\n');
    console.log('\n=== Lines 200-210 ===');
    for (let i = 200; i <= 210; i++) {
      console.log(`[${i + 1}] ${lines[i]}`);
    }

    // 检查包含 CONTENT 的行
    console.log('\n=== CONTENT lines ===');
    lines.forEach((line, i) => {
      if (line.includes('CONTENT')) {
        console.log(`[${i + 1}] ${line}`);
      }
    });

    expect(result.dsl.length).toBeGreaterThan(0);
  });
});

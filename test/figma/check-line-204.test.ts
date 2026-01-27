/**
 * Check problematic line 204
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('Check Line 204', () => {
  it('should show exact line 204 content', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    const lines = result.dsl.split('\n');
    const line204 = lines[203];
    
    console.log('\n=== Line 204 exact content ===');
    console.log(`Line: "${line204}"`);
    console.log(`Length: ${line204.length}`);
    console.log(`Chars:`, Array.from(line204).map((c, i) => `${i}:${c}(${c.charCodeAt(0)})`).join(', '));

    // 检查是否是空字符串
    const match = line204.match(/CONTENT:\s*"([^"]*)"/);
    if (match) {
      const content = match[1];
      console.log(`\nString content: "${content}"`);
      console.log(`Content length: ${content.length}`);
      if (content.length === 0) {
        console.log('⚠️ Empty string detected!');
      }
    }

    expect(result.dsl.length).toBeGreaterThan(0);
  });
});

/**
 * DSL 字符分析测试
 * 分析 DSL 中的特殊字符，帮助诊断 ->-< 错误
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('DSL Character Analysis', () => {
  it('should analyze DSL for invisible Unicode characters', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== DSL Character Analysis ===');
    console.log(`DSL length: ${dsl.length} characters`);
    console.log(`DSL lines: ${dsl.split('\n').length}`);

    const charAnalysis: Record<string, number> = {};
    const problematicChars: { char: string; code: number; pos: number; context: string }[] = [];

    for (let i = 0; i < dsl.length; i++) {
      const char = dsl[i];
      const code = dsl.charCodeAt(i);

      charAnalysis[char] = (charAnalysis[char] || 0) + 1;

      if (code < 32 && code !== 10 && code !== 13 && code !== 9) {
        problematicChars.push({
          char: `<U+${code.toString(16).toUpperCase().padStart(4, '0')}>`,
          code,
          pos: i,
          context: dsl.slice(Math.max(0, i - 10), Math.min(dsl.length, i + 10)).replace(/\n/g, '\\n'),
        });
      }

      if ('→←↑↓'.includes(char)) {
        problematicChars.push({
          char: `<箭头: ${char}>`,
          code,
          pos: i,
          context: dsl.slice(Math.max(0, i - 10), Math.min(dsl.length, i + 10)).replace(/\n/g, '\\n'),
        });
      }

      if (char === '<' || char === '＞' || char === '〈' || char === '《') {
        problematicChars.push({
          char: `<小于号变体: ${char}>`,
          code,
          pos: i,
          context: dsl.slice(Math.max(0, i - 10), Math.min(dsl.length, i + 10)).replace(/\n/g, '\\n'),
        });
      }
    }

    console.log('\nCharacter frequency (top 20):');
    const sortedChars = Object.entries(charAnalysis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    for (const [char, count] of sortedChars) {
      const displayChar = char === '\n' ? '\\n' : char === '\t' ? '\\t' : char;
      console.log(`  "${displayChar}": ${count}`);
    }

    console.log('\nProblematic characters found:', problematicChars.length);

    if (problematicChars.length > 0) {
      console.log('\nProblematic positions:');
      for (const p of problematicChars.slice(0, 10)) {
        console.log(`  Pos ${p.pos}: ${p.char} (code: ${p.code})`);
        console.log(`    Context: ...${p.context}...`);
      }
    }

    expect(dsl.length).toBeGreaterThan(0);
  });

  it('should check DSL bytes directly', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== DSL Byte Analysis ===');

    const encoder = new TextEncoder();
    const bytes = encoder.encode(dsl);

    console.log(`Total bytes: ${bytes.length}`);
    console.log(`Characters: ${dsl.length}`);

    const nonAsciiIndices: number[] = [];
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] > 127) {
        nonAsciiIndices.push(i);
      }
    }

    console.log(`Non-ASCII bytes: ${nonAsciiIndices.length}`);

    if (nonAsciiIndices.length > 0) {
      console.log('\nNon-ASCII byte positions and values:');
      for (const idx of nonAsciiIndices.slice(0, 20)) {
        const byte = bytes[idx];
        const char = dsl[idx];
        console.log(`  Byte ${idx}: 0x${byte.toString(16).toUpperCase().padStart(2, '0')} = "${char}" (char code: ${dsl.charCodeAt(idx)})`);
      }
    }

    expect(dsl.length).toBeGreaterThan(0);
  });

  it('should compare expected vs actual DSL content around errors', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== DSL Error Position Analysis ===');

    const errorLineIndex = 128;
    const lines = dsl.split('\n');

    console.log(`Line 129 (0-based: ${errorLineIndex}):`);
    const errorLine = lines[errorLineIndex] || 'LINE NOT FOUND';
    console.log(`  "${errorLine}"`);
    console.log(`  Length: ${errorLine.length}`);

    console.log('\nCharacter breakdown of line 129:');
    for (let i = 0; i < Math.min(errorLine.length, 50); i++) {
      const char = errorLine[i];
      const code = errorLine.charCodeAt(i);
      const display = code < 32 ? `<U+${code.toString(16).toUpperCase().padStart(4, '0')}>` : char;
      console.log(`  [${i}] "${display}" (0x${code.toString(16).toUpperCase().padStart(4, '0')})`);
    }

    const arrowIndex = dsl.indexOf('->');
    console.log(`\nFirst "->" found at index: ${arrowIndex}`);

    if (arrowIndex >= 0) {
      const contextStart = Math.max(0, arrowIndex - 20);
      const contextEnd = Math.min(dsl.length, arrowIndex + 30);
      console.log(`Context: "${dsl.slice(contextStart, contextEnd).replace(/\n/g, '\\n')}"`);

      console.log(`Characters after "->":`);
      for (let i = 0; i < 10; i++) {
        const idx = arrowIndex + 2 + i;
        if (idx < dsl.length) {
          const char = dsl[idx];
          const code = dsl.charCodeAt(idx);
          console.log(`  [${idx}] "${char}" (0x${code.toString(16).toUpperCase().padStart(4, '0')})`);
        }
      }
    }

    expect(dsl.length).toBeGreaterThan(0);
  });
});

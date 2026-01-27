/**
 * 测试 escapeString 函数对特殊字符的处理
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('escapeString Special Characters', () => {
  it('should handle full-width colon in text content', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    console.log('\n=== Checking DSL for special characters ===');

    // 查找包含 "活跃度" 的行（包含全角冒号）
    const lines = result.dsl.split('\n');
    const activeLines = lines.filter(l => l.includes('活跃度'));

    console.log(`Found ${activeLines.length} lines with "活跃度":`);
    activeLines.forEach((l, i) => {
      console.log(`  [${i}] ${l}`);
    });

    // 检查是否有全角冒号
    const hasFullWidthColon = result.dsl.includes('：');
    console.log(`\nDSL contains full-width colon (：): ${hasFullWidthColon}`);

    // 检查是否有箭头字符
    const hasArrow = result.dsl.includes('➤') || result.dsl.includes('→') || result.dsl.includes('←');
    console.log(`DSL contains arrow characters: ${hasArrow}`);

    // 检查是否有可能导致 "->-<" 误判的字符序列
    // 0xE2 0x9E 0xA4 是 ➤ 的 UTF-8 编码
    const encoder = new TextEncoder();
    const bytes = encoder.encode(result.dsl);
    let foundArrowBytes = false;
    for (let i = 0; i < bytes.length - 2; i++) {
      if (bytes[i] === 0xE2 && bytes[i+1] === 0x9E && bytes[i+2] === 0xA4) {
        foundArrowBytes = true;
        console.log(`\nFound ➤ (U+27A4) at byte position ${i}`);
        console.log(`  Context: ...${result.dsl.slice(Math.floor(i/3)-10, Math.floor(i/3)+10)}...`);
        break;
      }
    }
    console.log(`Found ➤ UTF-8 bytes in DSL: ${foundArrowBytes}`);

    expect(result.dsl.length).toBeGreaterThan(0);
  });

  it('should verify the exact error source', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });

    console.log('\n=== Verifying compiler error source ===');

    // 使用 TextEncoder 获取字节
    const encoder = new TextEncoder();
    const bytes = encoder.encode(result.dsl);

    // 查找可能导致问题的 UTF-8 序列
    const problematicSequences = [];

    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];

      // 检测 0xE2 0x9E 0xA4 (➤)
      if (byte === 0xE2 && i + 2 < bytes.length && bytes[i+1] === 0x9E && bytes[i+2] === 0xA4) {
        problematicSequences.push({
          pos: i,
          type: '➤ (U+27A4)',
          bytes: [bytes[i], bytes[i+1], bytes[i+2]],
        });
      }

      // 检测 0xEF 0xBC 0x9A (：)
      if (byte === 0xEF && i + 2 < bytes.length && bytes[i+1] === 0xBC && bytes[i+2] === 0x9A) {
        problematicSequences.push({
          pos: i,
          type: '： (U+FF1A full-width colon)',
          bytes: [bytes[i], bytes[i+1], bytes[i+2]],
        });
      }

      // 检测 0xE2 0x80 0x9C (") 和 0xE2 0x80 0x9D (")
      if (byte === 0xE2 && i + 2 < bytes.length) {
        if ((bytes[i+1] === 0x80 && bytes[i+2] === 0x9C) || (bytes[i+1] === 0x80 && bytes[i+2] === 0x9D)) {
          problematicSequences.push({
            pos: i,
            type: 'curly quote',
            bytes: [bytes[i], bytes[i+1], bytes[i+2]],
          });
        }
      }
    }

    console.log(`Found ${problematicSequences.length} potentially problematic UTF-8 sequences:`);
    for (const seq of problematicSequences) {
      const charPos = Math.floor(seq.pos / 3);
      const char = result.dsl[charPos] || '?';
      console.log(`  ${seq.type} at byte ${seq.pos} (char ${charPos}): "${char}"`);
      console.log(`    Bytes: ${seq.bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(', ')}`);
    }

    expect(result.dsl.length).toBeGreaterThan(0);
  });
});

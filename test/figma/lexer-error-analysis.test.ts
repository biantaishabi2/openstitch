/**
 * 分析 Chevrotain Lexer 错误位置
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('Chevrotain Lexer Error Analysis', () => {
  it('should analyze byte positions where lexer fails', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== Analyzing Lexer Error Positions ===');
    console.log('DSL length:', dsl.length);

    const encoder = new TextEncoder();
    const bytes = encoder.encode(dsl);

    // 错误偏移位置（来自测试输出）
    const errorOffsets = [2959, 4669, 4672, 5034, 5037, 5617, 5646, 5673, 5741, 5752, 5783, 5794];

    console.log('\n=== Byte Analysis at Error Positions ===');

    for (const offset of errorOffsets) {
      if (offset >= bytes.length) {
        console.log(`\n⚠ Offset ${offset} is beyond DSL length (${bytes.length})`);
        continue;
      }

      console.log(`\n--- Offset ${offset} (Line ~${Math.ceil(dsl.substring(0, offset).split('\n').length)}) ---`);

      // 获取字节
      const byte = bytes[offset];
      console.log(`Byte: 0x${byte.toString(16).toUpperCase().padStart(2, '0')} (${byte})`);

      // 获取字符
      const char = dsl[offset] || '?';
      console.log(`Character: "${char}" (code: ${dsl.charCodeAt(offset)})`);

      // 检查是否是 3-byte UTF-8 序列的开始
      let byteSeqInfo = '';
      if ((byte & 0xE0) === 0xE0) {
        const seqLength = byte <= 0xEF ? 3 : 4;
        const seq = [];
        for (let i = 0; i < seqLength && offset + i < bytes.length; i++) {
          seq.push(`0x${bytes[offset + i].toString(16).toUpperCase().padStart(2, '0')}`);
        }
        byteSeqInfo = ` (3-byte UTF-8 start: ${seq.join(', ')})`;

        // 尝试解码
        try {
          const decoder = new TextDecoder('utf-8', { fatal: true });
          const decoded = decoder.decode(bytes.slice(offset, offset + seqLength));
          console.log(`  Decoded char: "${decoded}" (U+${decoded.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`);
        } catch {
          console.log(`  Failed to decode as UTF-8`);
        }
      } else if ((byte & 0xC0) === 0x80) {
        byteSeqInfo = ` (UTF-8 continuation byte)`;
      }

      console.log(`${byteSeqInfo}`);

      // 显示上下文（前后各 20 个字符）
      const contextStart = Math.max(0, offset - 20);
      const contextEnd = Math.min(dsl.length, offset + 20);
      const context = dsl.slice(contextStart, contextEnd).replace(/\n/g, '\\n');
      console.log(`Context: ...${context}...`);

      // 显示字节上下文
      const byteContextStart = Math.max(0, offset - 10);
      const byteContextEnd = Math.min(bytes.length, offset + 10);
      const byteContext = Array.from(bytes.slice(byteContextStart, byteContextEnd))
        .map(b => b < 32 ? '.' : String.fromCharCode(b))
        .join('');
      console.log(`Byte context: ...${byteContext}...`);
    }

    // 检查所有 0xE2 字节的位置
    console.log('\n=== All 0xE2 (potential 3-byte UTF-8) positions ===');
    const e2Positions: number[] = [];
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0xE2) {
        e2Positions.push(i);
      }
    }
    console.log(`Total 0xE2 bytes: ${e2Positions.length}`);

    // 显示位置和对应的字符
    for (const pos of e2Positions) {
      if (pos + 2 < bytes.length) {
        const seq = [bytes[pos], bytes[pos+1], bytes[pos+2]];
        const char = dsl[Math.floor(pos/3)] || '?';

        // 尝试解码
        try {
          const decoder = new TextDecoder('utf-8', { fatal: true });
          const decoded = decoder.decode(bytes.slice(pos, pos + 3));
          console.log(`Byte ${pos}: ${seq.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(', ')} = "${decoded}" (U+${decoded.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`);
        } catch {
          console.log(`Byte ${pos}: ${seq.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(', ')} = "${char}" (INVALID UTF-8)`);
        }
      }
    }

    expect(dsl.length).toBeGreaterThan(0);
  });

  it('should check if the error is caused by malformed UTF-8', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== Checking for Malformed UTF-8 ===');

    const encoder = new TextEncoder();
    const bytes = encoder.encode(dsl);

    // 尝试用 TextDecoder 解码整个 DSL
    try {
      const decoder = new TextDecoder('utf-8', { fatal: true });
      decoder.decode(bytes);
      console.log('✓ DSL is valid UTF-8');
    } catch (error) {
      console.log('✗ DSL contains invalid UTF-8:');
      console.log(`  ${error}`);
    }

    // 逐字节检查 UTF-8 有效性
    let invalidSequences: { pos: number; bytes: number[]; error: string }[] = [];
    let pos = 0;

    while (pos < bytes.length) {
      const byte = bytes[pos];

      if (byte < 0x80) {
        pos++;
        continue;
      }

      // 确定序列长度
      let seqLength = 0;
      let expectedContinuation = 0;

      if ((byte & 0xE0) === 0xC0) {
        seqLength = 2;
        expectedContinuation = 1;
      } else if ((byte & 0xF0) === 0xE0) {
        seqLength = 3;
        expectedContinuation = 2;
      } else if ((byte & 0xF8) === 0xF0) {
        seqLength = 4;
        expectedContinuation = 3;
      } else {
        invalidSequences.push({
          pos,
          bytes: [byte],
          error: 'Invalid start byte',
        });
        pos++;
        continue;
      }

      // 检查是否有足够的 continuation bytes
      if (pos + seqLength > bytes.length) {
        invalidSequences.push({
          pos,
          bytes: Array.from(bytes.slice(pos, bytes.length)),
          error: `Incomplete sequence (need ${seqLength} bytes, have ${bytes.length - pos})`,
        });
        break;
      }

      // 验证 continuation bytes
      let valid = true;
      for (let i = 1; i < seqLength; i++) {
        if ((bytes[pos + i] & 0xC0) !== 0x80) {
          valid = false;
          invalidSequences.push({
            pos,
            bytes: Array.from(bytes.slice(pos, pos + seqLength)),
            error: `Invalid continuation byte at position ${pos + i}`,
          });
          break;
        }
      }

      if (valid) {
        pos += seqLength;
      } else {
        pos++; // Skip just the first byte
      }
    }

    console.log(`Invalid UTF-8 sequences: ${invalidSequences.length}`);
    if (invalidSequences.length > 0) {
      console.log('\nDetails:');
      for (const seq of invalidSequences.slice(0, 10)) {
        console.log(`  Pos ${seq.pos}: ${seq.bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(', ')} - ${seq.error}`);
      }
    }

    expect(dsl.length).toBeGreaterThan(0);
  });
});

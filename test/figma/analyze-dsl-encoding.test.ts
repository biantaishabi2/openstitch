/**
 * DSL 编码问题深入分析
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('DSL Encoding Deep Analysis', () => {
  it('should find the exact byte causing ->-< error', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== Searching for ->-< Pattern ===');

    const encoder = new TextEncoder();
    const bytes = encoder.encode(dsl);

    console.log(`Total bytes: ${bytes.length}`);
    console.log(`String length: ${dsl.length}`);

    // 查找所有可能导致问题的字节序列
    // 特别关注: 0x2D (hyphen-minus), 0x3E (greater-than), 0x3C (less-than)

    const suspiciousPositions: { pos: number; byte: number; char: string; context: string }[] = [];

    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];

      // 检测可能导致 "->-<" 误判的字节
      // 0xE2, 0x86, 0x92 是 "→" (U+2192 RIGHT ARROW) 的 UTF-8 编码
      if (byte === 0xE2 && i + 2 < bytes.length) {
        if (bytes[i + 1] === 0x86 && bytes[i + 2] === 0x92) {
          const contextStart = Math.max(0, i - 10);
          const contextEnd = Math.min(bytes.length, i + 15);
          console.log(`\nFound UTF-8 "→" at byte ${i}:`);
          console.log(`  Bytes: ${bytes.slice(i, i + 3).map(b => '0x' + b.toString(16).toUpperCase()).join(', ')}`);
          console.log(`  Context bytes: ${Array.from(bytes.slice(contextStart, contextEnd)).map(b => b < 32 ? '.' : String.fromCharCode(b)).join('')}`);
          const charStart = Math.floor(contextStart / 3);
          const charEnd = Math.min(dsl.length, Math.floor(contextEnd / 3));
          console.log(`  Context string: "${dsl.slice(charStart, charEnd).replace(/\n/g, '\\n')}"`);
        }
      }

      // 检测其他可能导致问题的箭头字符
      // ← U+2190
      if (byte === 0xE2 && i + 2 < bytes.length && bytes[i + 1] === 0x86 && bytes[i + 2] === 0x90) {
        console.log(`\nFound UTF-8 "←" at byte ${i}`);
      }

      // 检测全角冒号 U+FF1A (：) - UTF-8: 0xEF 0xBC 0x9A
      if (byte === 0xEF && i + 2 < bytes.length && bytes[i + 1] === 0xBC && bytes[i + 2] === 0x9A) {
        suspiciousPositions.push({
          pos: i,
          byte,
          char: '：',
          context: dsl.slice(Math.max(0, Math.floor(i/3) - 5), Math.min(dsl.length, Math.floor(i/3) + 5)),
        });
      }

      // 检测全角小于号 U+FF1C (＜) - UTF-8: 0xEF 0xBC 0x9C
      if (byte === 0xEF && i + 2 < bytes.length && bytes[i + 1] === 0xBC && bytes[i + 2] === 0x9C) {
        suspiciousPositions.push({
          pos: i,
          byte,
          char: '＜',
          context: dsl.slice(Math.max(0, Math.floor(i/3) - 5), Math.min(dsl.length, Math.floor(i/3) + 5)),
        });
      }

      // 检测全角大于号 U+FF1E (＞) - UTF-8: 0xEF 0xBC 0x9E
      if (byte === 0xEF && i + 2 < bytes.length && bytes[i + 1] === 0xBC && bytes[i + 2] === 0x9E) {
        suspiciousPositions.push({
          pos: i,
          byte,
          char: '＞',
          context: dsl.slice(Math.max(0, Math.floor(i/3) - 5), Math.min(dsl.length, Math.floor(i/3) + 5)),
        });
      }
    }

    console.log(`\nSuspicious full-width characters found: ${suspiciousPositions.length}`);
    for (const p of suspiciousPositions.slice(0, 10)) {
      console.log(`  Byte ${p.pos}: "${p.char}" in context: ...${p.context}...`);
    }

    // 现在直接检查 offset 2959 附近的字节
    console.log('\n=== Analyzing Byte Offset 2959 ===');
    if (bytes.length > 2960) {
      console.log('Bytes around offset 2959:');
      for (let i = 2950; i < 2970 && i < bytes.length; i++) {
        const byte = bytes[i];
        const char = i < dsl.length ? dsl[i] : '?';
        console.log(`  [${i}] 0x${byte.toString(16).toUpperCase().padStart(2, '0')} = "${char}" (code: ${dsl.charCodeAt(i) || 'N/A'})`);
      }

      // 检查 offset 2959 的字符
      console.log(`\nCharacter at offset 2959:`);
      console.log(`  Char: "${dsl[2959] || 'OUT OF BOUNDS'}"`);
      console.log(`  Char code: ${dsl.charCodeAt(2959)}`);
      console.log(`  Byte: 0x${bytes[2959]?.toString(16).toUpperCase().padStart(2, '0') || 'N/A'}`);

      // 如果字节是 0xE2 (箭头开始)，检查是否是 → 字符
      if (bytes[2959] === 0xE2) {
        console.log(`\n  This is the start of a 3-byte UTF-8 sequence (0xE2)`);
        console.log(`  Full sequence: 0x${bytes[2959].toString(16)}, 0x${bytes[2960]?.toString(16)}, 0x${bytes[2961]?.toString(16)}`);
        if (bytes[2960] === 0x86 && bytes[2961] === 0x92) {
          console.log(`  This is "→" (U+2192 RIGHT ARROW)`);
        }
      }
    } else {
      console.log('DSL is shorter than 2960 bytes');
    }

    expect(dsl.length).toBeGreaterThan(0);
  });

  it('should check all multi-byte characters in DSL', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== Multi-byte Character Analysis ===');

    const encoder = new TextEncoder();
    const bytes = encoder.encode(dsl);

    // 收集所有非 ASCII 字符及其位置
    const multiByteChars: { char: string; bytePos: number; charPos: number; code: number; bytes: string }[] = [];

    let charPos = 0;
    let bytePos = 0;

    while (bytePos < bytes.length) {
      const byte = bytes[bytePos];

      if (byte < 128) {
        // ASCII 字符
        if (dsl[charPos] === '-') {
          // 记录所有连字符的位置
        }
        bytePos++;
        charPos++;
      } else {
        // 多字节字符
        const char = dsl[charPos];
        const code = dsl.charCodeAt(charPos);

        // 计算字节长度
        let byteLength = 1;
        if ((byte & 0xE0) === 0xC0) byteLength = 2;
        else if ((byte & 0xF0) === 0xE0) byteLength = 3;
        else if ((byte & 0xF8) === 0xF0) byteLength = 4;

        multiByteChars.push({
          char,
          bytePos,
          charPos,
          code,
          bytes: Array.from(bytes.slice(bytePos, bytePos + byteLength)).map(b => '0x' + b.toString(16).toUpperCase()).join(', '),
        });

        bytePos += byteLength;
        charPos++;
      }
    }

    console.log(`Found ${multiByteChars.length} multi-byte characters`);

    // 特别关注：可能导致 ->-< 误判的字符
    const arrowLike = multiByteChars.filter(c =>
      c.char === '→' || c.char === '←' || c.char === '<' || c.char === '>' || c.char === '－' || c.char === '＜' || c.char === '＞'
    );

    console.log(`Arrow-like characters: ${arrowLike.length}`);
    for (const c of arrowLike) {
      console.log(`  "${c.char}" at charPos=${c.charPos}, bytePos=${c.bytePos}, code=${c.code}, bytes=[${c.bytes}]`);
    }

    // 检查是否有连续的 "->" 模式（可能是 → 字符被错误解析）
    for (let i = 0; i < multiByteChars.length - 1; i++) {
      const current = multiByteChars[i];
      const next = multiByteChars[i + 1];

      // 检查 "→" 后跟 "-" 的模式
      if (current.char === '→' && next.char === '-') {
        console.log(`\nFound "→" followed by "-" at charPos ${current.charPos}-${next.charPos}`);
        console.log(`  This could be misinterpreted as "->"`);
      }
    }

    expect(dsl.length).toBeGreaterThan(0);
  });

  it('should simulate lexer behavior with problematic bytes', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, {
      context: '胸科医院首页',
      sessionId: 'test-session',
    });
    const dsl = result.dsl;

    console.log('\n=== Simulating Lexer Behavior ===');

    // Chevrotain 使用正则表达式进行词法分析
    // 问题可能出在：某些 UTF-8 字节序列被错误匹配

    const encoder = new TextEncoder();
    const bytes = encoder.encode(dsl);

    // 查找所有 0xE2 字节（3字节 UTF-8 序列的开始）
    const e2Positions: number[] = [];
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0xE2) {
        e2Positions.push(i);
      }
    }

    console.log(`Found ${e2Positions.length} 0xE2 bytes (potential 3-byte UTF-8 sequences)`);

    // 分析这些位置的序列
    for (const pos of e2Positions.slice(0, 20)) {
      if (pos + 2 < bytes.length) {
        const seq = bytes.slice(pos, pos + 3);
        const char = dsl[Math.floor(pos / 3)] || '?';

        // 常见 3-byte UTF-8 序列
        const knownSequences: Record<string, string> = {
          '0xE2, 0x86, 0x92': '→ (U+2192)',
          '0xE2, 0x86, 0x90': '← (U+2190)',
          '0xE2, 0x86, 0x91': '↑ (U+2191)',
          '0xE2, 0x86, 0x93': '↓ (U+2193)',
          '0xEF, 0xBC, 0x9A': '： (U+FF1A full-width colon)',
          '0xEF, 0xBC, 0x9C': '＜ (U+FF1C full-width less-than)',
          '0xEF, 0xBC, 0x9E': '＞ (U+FF1E full-width greater-than)',
          '0xEF, 0xBC, 0x8C': '， (U+FF0C full-width comma)',
          '0xEF, 0xBC, 0x9B': '； (U+FF1B full-width semicolon)',
        };

        const seqKey = seq.map(b => '0x' + b.toString(16)).join(', ');
        const known = knownSequences[seqKey];

        if (known) {
          console.log(`  Byte ${pos}: ${seqKey} = ${known} (char: "${char}")`);
        } else if (bytes[pos + 1] === 0x86 || bytes[pos + 1] === 0x80) {
          console.log(`  Byte ${pos}: ${seqKey} = UNKNOWN arrow-like (char: "${char}")`);
        }
      }
    }

    // 检查是否有 "→" 字符
    const hasRightArrow = dsl.includes('→');
    console.log(`\nDSL contains "→": ${hasRightArrow}`);

    // 如果有，统计数量
    const rightArrowCount = (dsl.match(/→/g) || []).length;
    console.log(`Number of "→": ${rightArrowCount}`);

    expect(dsl.length).toBeGreaterThan(0);
  });
});

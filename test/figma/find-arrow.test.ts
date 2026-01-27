import { describe, it } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('Find problematic character', () => {
  it('should check all character codes', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, { context: '胸科首页' });

    // 统计所有字符的 char code
    const charCodes = new Map<number, number>();
    for (const char of result.dsl) {
      const code = char.charCodeAt(0);
      charCodes.set(code, (charCodes.get(code) || 0) + 1);
    }

    // 打印可疑的字符代码
    console.log('Character codes in DSL:');
    const suspicious = [60, 62, 45, 8592, 8594, 8672, 8674]; // <, >, -, arrow chars
    for (const [code, count] of charCodes) {
      if (suspicious.includes(code) || code < 32 || code > 126) {
        const char = String.fromCharCode(code);
        console.log(`  Code ${code} (${JSON.stringify(char)}): ${count} occurrences`);
      }
    }

    // 检查是否有不可打印字符
    const hasControlChars = [...result.dsl].some(c => c.charCodeAt(0) < 32 && c.charCodeAt(0) !== 10 && c.charCodeAt(0) !== 13);
    console.log('\nHas control chars (except LF/CR):', hasControlChars);

    // 查找所有包含特殊字符的行
    const lines = result.dsl.split('\n');
    const specialLines = lines.map((l, i) => ({ line: i + 1, hasSpecial: /[^\x20-\x7E\xA0-\xFF]/.test(l) }))
      .filter(l => l.hasSpecial);
    console.log('\nLines with non-ASCII/non-printable chars:', specialLines.length);
    specialLines.slice(0, 5).forEach(l => console.log(`  Line ${l.line}:`, lines[l.line - 1].substring(0, 80)));
  });
});

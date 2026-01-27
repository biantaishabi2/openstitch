import { describe, it } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import type { FigmaFile } from '../../src/figma/types';

describe('Check DSL Characters', () => {
  it('should find all problematic IDs', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const result = await convertFigmaToStitch(figmaJson, { context: '胸科首页' });

    // 查找所有以 - 开头的 ID
    const dashIds = result.dsl.match(/\[SECTION:\s*-[^\]]+\]/g);
    console.log('IDs starting with dash:', dashIds);

    // 查找所有数字开头的 ID（应该在 sanitizeId 中被修复）
    const numericIds = result.dsl.match(/\[SECTION:\s*[0-9]/g);
    console.log('IDs starting with number:', numericIds);

    // 查看完整的第 129 行
    const lines = result.dsl.split('\n');
    console.log('\nLines 125-135:');
    for (let i = 124; i < Math.min(135, lines.length); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  });
});

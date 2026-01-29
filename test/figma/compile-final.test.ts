import { describe, it, expect } from 'vitest';
import { compile } from '../../src/lib/compiler';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('Compile Final DSL', () => {
  it('should compile final adjusted DSL', async () => {
    const config = JSON.parse(readFileSync('test-fixtures/figma-to-stitch-demo/stitch-config-final.json', 'utf-8'));
    const screen = config.screens[0];

    const result = await compile(screen.dsl, {
      tokens: screen.tokens,
      ssr: { title: '胸科医院首页', lang: 'zh-CN' },
    });

    // 保存到本地
    const outputDir = 'test-fixtures/figma-to-stitch-demo/generated';
    mkdirSync(outputDir, { recursive: true });
    
    const outputPath = join(outputDir, 'index.html');
    writeFileSync(outputPath, result.ssr.html);
    
    console.log('✅ Compiled to:', outputPath);
    console.log('HTML size:', (result.ssr.html.length / 1024).toFixed(1), 'KB');

    // 复制到 zcpg 项目
    const zcpgDir = '../zcpg/docs/stitch';
    try {
      mkdirSync(zcpgDir, { recursive: true });
      const zcpgPath = join(zcpgDir, 'chest-hospital.html');
      writeFileSync(zcpgPath, result.ssr.html);
      console.log('✅ Copied to:', zcpgPath);
    } catch (e) {
      console.log('⚠️ Could not copy to zcpg:', e);
    }

    expect(result.ssr.html).toContain('胸科');
    expect(result.ssr.html.length).toBeGreaterThan(10000);
  });
});

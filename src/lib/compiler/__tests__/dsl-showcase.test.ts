/**
 * DSL 版 Components Showcase 测试
 *
 * 编译 DSL 生成与 JSON Schema 版本相同效果的 HTML
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';

interface Screen {
  screen_id: string;
  title: string;
  dsl: string;
}

interface TestProject {
  context: string;
  platform: string;
  screens: Screen[];
}

// shadcn 默认中性色
const SHADCN_DEFAULT_TOKENS = {
  '--primary-color': '#18181b',
  '--primary': '240 5.9% 10%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '240 4.8% 95.9%',
  '--secondary-foreground': '240 5.9% 10%',
  '--accent': '240 4.8% 95.9%',
  '--accent-foreground': '240 5.9% 10%',
  '--ring': '240 5.9% 10%',
};

describe('DSL Components Showcase', () => {
  const projectPath = path.join(__dirname, '../../../../test-dsl-components-showcase.json');
  const outputDir = path.join(__dirname, '../../../../test-output');

  it('should compile DSL components showcase to HTML', async () => {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const project: TestProject = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

    console.log(`\n编译 DSL Components Showcase...\n`);

    for (const screen of project.screens) {
      console.log(`编译: ${screen.screen_id} - ${screen.title}`);

      const result = await compile(screen.dsl, {
        context: screen.title,
        ssr: { title: screen.title, lang: 'zh-CN' },
        tokenOverrides: SHADCN_DEFAULT_TOKENS,
      });

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('<!DOCTYPE html>');

      const outputPath = path.join(outputDir, `${screen.screen_id}.html`);
      fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

      console.log(`  ✓ 已保存到 ${outputPath}`);
    }

    console.log('\n=== DSL Components Showcase 编译完成 ===');
    console.log(`输出目录: ${outputDir}`);
  });
});

/**
 * 组件系统测试 - 编译 test-all-components.json
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

// shadcn 默认中性色 - 深灰色主题
const SHADCN_DEFAULT_TOKENS = {
  '--primary-color': '#18181b',  // zinc-900
  '--primary': '240 5.9% 10%',   // zinc-900 HSL
  '--primary-foreground': '0 0% 98%',
  '--secondary': '240 4.8% 95.9%',
  '--secondary-foreground': '240 5.9% 10%',
  '--accent': '240 4.8% 95.9%',
  '--accent-foreground': '240 5.9% 10%',
  '--ring': '240 5.9% 10%',
};

describe('All Components Test', () => {
  const projectPath = path.join(__dirname, '../../../../test-all-components.json');
  const outputDir = path.join(__dirname, '../../../../test-output');

  it('should compile all component test pages', async () => {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const project: TestProject = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

    console.log(`\n编译 ${project.screens.length} 个页面...\n`);

    for (const screen of project.screens) {
      console.log(`编译: ${screen.screen_id} - ${screen.title}`);

      const result = await compile(screen.dsl, {
        context: screen.title,
        ssr: { title: screen.title, lang: 'zh-CN' },
        tokenOverrides: SHADCN_DEFAULT_TOKENS,  // 使用 shadcn 默认颜色
      });

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('<!DOCTYPE html>');

      const outputPath = path.join(outputDir, `${screen.screen_id}.html`);
      fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

      console.log(`  ✓ 已保存到 ${outputPath}`);
    }

    console.log('\n=== 所有页面编译完成 ===');
    console.log(`输出目录: ${outputDir}`);
  });
});

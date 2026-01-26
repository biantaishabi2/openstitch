/**
 * 移动端组件系统测试 - 编译 test-mobile-components.json
 *
 * 测试所有移动端专属组件：
 * - MobileShell (外壳)
 * - BottomTabs (底部导航)
 * - Drawer (侧滑抽屉)
 * - Sheet (底部弹层)
 * - ActionSheet (操作菜单)
 * - Segment (分段控制器)
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';

interface Screen {
  screen_id: string;
  title: string;
  mobile_navigation: string[] | null;
  dsl: string;
}

interface TestProject {
  context: string;
  platform: string;
  screens: Screen[];
}

describe('All Mobile Components Test', () => {
  const projectPath = path.join(__dirname, '../../../../test-mobile-components.json');
  const outputDir = path.join(__dirname, '../../../../test-output');

  it('should compile all mobile component test pages', async () => {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const project: TestProject = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

    console.log(`\n编译 ${project.screens.length} 个移动端页面...\n`);

    for (const screen of project.screens) {
      console.log(`编译: ${screen.screen_id} - ${screen.title}`);

      const result = await compile(screen.dsl, {
        context: screen.title,
        platform: 'mobile',  // 强制移动端平台
        mobileNavigation: screen.mobile_navigation,
        ssr: { title: screen.title, lang: 'zh-CN' },
      });

      expect(result.ast).toBeDefined();
      expect(result.ast.platform).toBe('mobile');
      expect(result.ssr.html).toContain('<!DOCTYPE html>');

      // 验证移动端特性
      if (screen.mobile_navigation) {
        // 有 BottomTabs
        expect(result.ssr.html).toContain('data-slot="mobile-shell"');
        expect(result.ssr.html).toContain('data-slot="bottom-tabs"');
      }

      // 验证触摸反馈
      expect(result.ssr.html).toContain('active:scale-[0.97]');

      const outputPath = path.join(outputDir, `${screen.screen_id}.html`);
      fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

      console.log(`  ✓ 已保存到 ${outputPath}`);
    }

    console.log('\n=== 所有移动端页面编译完成 ===');
    console.log(`输出目录: ${outputDir}`);
  });
});

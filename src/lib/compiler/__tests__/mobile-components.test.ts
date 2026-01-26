/**
 * 移动端组件测试 - 验证 MobileShell, BottomTabs, ActionSheet
 *
 * 全链路测试：
 * - 平台锁定（mobile_navigation → platform: 'mobile'）
 * - 视觉层适配（间距收缩、行高补偿、字阶锁定）
 * - 工厂层适配（触摸反馈类、MobileShell 包裹）
 * - SSR 输出
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';

describe('Mobile Components Test', () => {
  const outputDir = path.join(__dirname, '../../../../test-output');

  it('should compile BottomTabs component', async () => {
    const dsl = `
[SECTION: mobile_demo]
  { Gap: "MD" }

  [CARD: welcome]
    ATTR: Title("欢迎使用")
    CONTENT: "这是移动端 BottomTabs 组件演示"

  [CARD: content1]
    CONTENT: "内容卡片 1"

  [CARD: content2]
    CONTENT: "内容卡片 2"

  [CARD: content3]
    CONTENT: "内容卡片 3"
`;

    const result = await compile(dsl, {
      context: '移动端演示',
      platform: 'mobile',
      mobileNavigation: ['首页', '搜索', '通知', '我的'],
      ssr: { title: '移动端 BottomTabs 演示', lang: 'zh-CN' },
    });

    expect(result.ast).toBeDefined();
    expect(result.ast.platform).toBe('mobile');
    expect(result.ast.mobileNavigation).toEqual(['首页', '搜索', '通知', '我的']);

    // 保存到文件
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'mobile-bottom-tabs.html');
    fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');
    console.log(`✓ 已保存到 ${outputPath}`);
  });

  it('should compile ActionSheet component', async () => {
    const dsl = `
[SECTION: action_demo]
  { Gap: "MD" }

  [CARD: intro]
    ATTR: Title("ActionSheet 演示")
    CONTENT: "点击下方按钮打开操作菜单"

  [BUTTON: open_sheet]
    ATTR: Variant("outline")
    CONTENT: "打开操作菜单"
`;

    const result = await compile(dsl, {
      context: 'ActionSheet 演示',
      platform: 'mobile',  // mobile 平台，无 BottomTabs，使用 Drawer
      mobileNavigation: null,
      ssr: { title: '移动端 ActionSheet 演示', lang: 'zh-CN' },
    });

    expect(result.ast).toBeDefined();
    expect(result.ast.platform).toBe('mobile'); // mobile with Drawer (no BottomTabs)

    // 保存到文件
    const outputPath = path.join(outputDir, 'mobile-action-sheet.html');
    fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');
    console.log(`✓ 已保存到 ${outputPath}`);
  });

  it('should compile MobileShell with Drawer (null navigation)', async () => {
    const dsl = `
[SECTION: drawer_demo]
  { Gap: "MD" }

  [HEADER: topbar]
    ATTR: Title("RLM 管理")

  [CARD: status]
    ATTR: Title("系统状态"), Icon("CheckCircle")
    CONTENT: "运行中"

  [CARD: recent]
    ATTR: Title("最近执行")
    [LIST: logs]
      [TEXT: l1] CONTENT: "任务 #1234 完成"
      [TEXT: l2] CONTENT: "任务 #1233 完成"
`;

    const result = await compile(dsl, {
      context: 'RLM 移动端管理工具',
      platform: 'mobile',  // mobile 平台，无 BottomTabs，使用 Drawer
      mobileNavigation: null,
      ssr: { title: 'Drawer 模式演示', lang: 'zh-CN' },
    });

    expect(result.ast).toBeDefined();

    // 保存到文件
    const outputPath = path.join(outputDir, 'mobile-drawer.html');
    fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');
    console.log(`✓ 已保存到 ${outputPath}`);
  });
});

// ============================================
// 全链路测试：平台适配完整流程
// ============================================

describe('Full Pipeline Platform Adaptation', () => {
  it('should apply mobile spacing adjustment in final HTML', async () => {
    const dsl = `
[SECTION: test]
  { Gap: "MD" }
  [CARD: c1]
    CONTENT: "测试卡片"
`;

    // Web 版本
    const webResult = await compile(dsl, {
      context: '测试',
      platform: 'web',
    });

    // Mobile 版本
    const mobileResult = await compile(dsl, {
      context: '测试',
      platform: 'mobile',
      mobileNavigation: ['首页', '我的'],
    });

    // 提取 CSS 变量中的间距值
    const webSpacingMatch = webResult.ssr.html.match(/--spacing-md:\s*(\d+)px/);
    const mobileSpacingMatch = mobileResult.ssr.html.match(/--spacing-md:\s*(\d+)px/);

    expect(webSpacingMatch).toBeTruthy();
    expect(mobileSpacingMatch).toBeTruthy();

    const webSpacing = parseInt(webSpacingMatch![1]);
    const mobileSpacing = parseInt(mobileSpacingMatch![1]);

    // 移动端间距应该是 Web 的 0.75 倍
    expect(mobileSpacing).toBe(Math.round(webSpacing * 0.75));
    console.log(`✓ 间距适配: Web ${webSpacing}px → Mobile ${mobileSpacing}px (0.75x)`);
  });

  it('should apply mobile line-height compensation in final HTML', async () => {
    const dsl = `
[SECTION: test]
  [TEXT: t1]
    CONTENT: "测试文本"
`;

    // Web 版本
    const webResult = await compile(dsl, {
      context: '测试',
      platform: 'web',
    });

    // Mobile 版本
    const mobileResult = await compile(dsl, {
      context: '测试',
      platform: 'mobile',
      mobileNavigation: ['首页'],
    });

    // 提取行高值
    const webLineHeightMatch = webResult.ssr.html.match(/--line-height-base:\s*([\d.]+)/);
    const mobileLineHeightMatch = mobileResult.ssr.html.match(/--line-height-base:\s*([\d.]+)/);

    expect(webLineHeightMatch).toBeTruthy();
    expect(mobileLineHeightMatch).toBeTruthy();

    const webLineHeight = parseFloat(webLineHeightMatch![1]);
    const mobileLineHeight = parseFloat(mobileLineHeightMatch![1]);

    // 移动端行高应该更大（1.5 → 1.6）
    expect(mobileLineHeight).toBeGreaterThan(webLineHeight);
    expect(mobileLineHeight).toBe(1.6);
    console.log(`✓ 行高补偿: Web ${webLineHeight} → Mobile ${mobileLineHeight}`);
  });

  it('should include touch feedback classes in mobile Button HTML', async () => {
    const dsl = `
[SECTION: test]
  [BUTTON: btn1]
    CONTENT: "点击我"
`;

    const mobileResult = await compile(dsl, {
      context: '测试',
      platform: 'mobile',
      mobileNavigation: ['首页'],
    });

    // HTML 中应该包含触摸反馈类
    expect(mobileResult.ssr.html).toContain('active:scale-[0.97]');
    expect(mobileResult.ssr.html).toContain('transition-transform');
    console.log('✓ 触摸反馈类已注入');
  });

  it('should NOT include touch feedback classes in web Button HTML', async () => {
    const dsl = `
[SECTION: test]
  [BUTTON: btn1]
    CONTENT: "点击我"
`;

    const webResult = await compile(dsl, {
      context: '测试',
      platform: 'web',
    });

    // Web 版本不应该有触摸反馈类
    expect(webResult.ssr.html).not.toContain('active:scale-[0.97]');
    console.log('✓ Web 版本无触摸反馈类');
  });

  it('should include MobileShell and BottomTabs in mobile HTML', async () => {
    const dsl = `
[SECTION: test]
  [CARD: c1]
    CONTENT: "内容"
`;

    const mobileResult = await compile(dsl, {
      context: '测试',
      platform: 'mobile',
      mobileNavigation: ['首页', '搜索', '我的'],
    });

    // HTML 中应该包含移动端组件
    expect(mobileResult.ssr.html).toContain('data-slot="mobile-shell"');
    expect(mobileResult.ssr.html).toContain('data-slot="bottom-tabs"');
    expect(mobileResult.ssr.html).toContain('data-slot="bottom-tabs-list"');
    console.log('✓ MobileShell + BottomTabs 已包裹');
  });
});

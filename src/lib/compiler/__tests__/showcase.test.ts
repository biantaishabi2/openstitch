/**
 * 组件 Showcase 测试
 *
 * 系统性测试所有组件的渲染能力
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';

describe('Component Showcase', () => {
  it('should compile showcase DSL without errors', async () => {
    const dslPath = path.join(__dirname, 'showcase.dsl');
    const dsl = fs.readFileSync(dslPath, 'utf-8');

    // compile() 成功时返回结果，失败时抛出 CompileError
    const result = await compile(dsl, {
      context: '组件展示页面',
      ssr: { title: 'Component Showcase', lang: 'zh-CN' },
    });

    // 编译成功 - 验证结果结构
    expect(result.ast).toBeDefined();
    expect(result.ast.children.length).toBeGreaterThan(0);
    expect(result.ssr.html).toContain('<!DOCTYPE html>');

    // 保存 HTML 用于人工检查
    const outputPath = path.join(__dirname, '../../../../showcase.html');
    fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

    console.log('\n=== Showcase HTML 已保存 ===');
    console.log(`路径: ${outputPath}`);
  });

  describe('基础组件渲染', () => {
    it('should render Text component', async () => {
      const dsl = '[TEXT: t1] CONTENT: "Hello World"';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('Hello World');
    });

    it('should render Button component with variants', async () => {
      const dsl = `
[FLEX: buttons]
  { Gap: "8px" }
  [BUTTON: b1] CONTENT: "默认"
  [BUTTON: b2] ATTR: Variant("outline") CONTENT: "轮廓"
  [BUTTON: b3] ATTR: Variant("ghost") CONTENT: "幽灵"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('默认');
      expect(result.ssr.html).toContain('轮廓');
      expect(result.ssr.html).toContain('幽灵');
      expect(result.ssr.html).toContain('data-variant="outline"');
      expect(result.ssr.html).toContain('data-variant="ghost"');
    });

    it('should render Icon component', async () => {
      const dsl = '[ICON: i1] ATTR: Icon("Home")';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      // Icon 应该渲染为 SVG
      expect(result.ssr.html).toContain('<svg');
      expect(result.ssr.html).toContain('lucide');
    });

    it('should render Badge component', async () => {
      const dsl = '[BADGE: b1] CONTENT: "标签"';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('标签');
      expect(result.ssr.html).toContain('data-slot="badge"');
    });

    it('should render Input component', async () => {
      const dsl = '[INPUT: i1] ATTR: Placeholder("请输入")';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('placeholder="请输入"');
      expect(result.ssr.html).toContain('<input');
    });

    it('should render Link component', async () => {
      const dsl = '[LINK: l1] ATTR: Href("https://example.com") CONTENT: "链接"';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('链接');
      expect(result.ssr.html).toContain('href="https://example.com"');
    });

    it('should render Image component', async () => {
      const dsl = '[IMAGE: img1] ATTR: Src("https://example.com/image.png"), Alt("示例图片")';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('<img');
      expect(result.ssr.html).toContain('src="https://example.com/image.png"');
      expect(result.ssr.html).toContain('alt="示例图片"');
    });

    it('should render Divider component', async () => {
      const dsl = '[DIVIDER: d1]';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      // Divider 映射到 Separator
      expect(result.ssr.html).toContain('data-slot="separator"');
    });

    it('should render Spacer component', async () => {
      const dsl = '[SPACER: s1] ATTR: Size("lg")';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      // Spacer 应该渲染为空白间隔元素
      expect(result.ssr.html).toBeDefined();
    });

    it('should render Code component', async () => {
      const dsl = '[CODE: c1] CONTENT: "const x = 1;"';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      // Code 组件使用语法高亮，代码会被拆分成多个 <span> 标签
      // 检查 <code> 标签存在即可
      expect(result.ssr.html).toContain('<code>');
      // 检查代码片段存在（可能被高亮拆分）
      expect(result.ssr.html).toContain('const');
    });
  });

  describe('布局组件渲染', () => {
    it('should render Grid with columns', async () => {
      const dsl = `
[GRID: g1]
  { Columns: 3, Gap: "16px" }
  [TEXT: t1] CONTENT: "1"
  [TEXT: t2] CONTENT: "2"
  [TEXT: t3] CONTENT: "3"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('grid');
      expect(result.ssr.html).toContain('grid-cols-3');
    });

    it('should render Flex with direction and gap', async () => {
      const dsl = `
[FLEX: f1]
  { Direction: "Row", Gap: "8px", Justify: "Between" }
  [TEXT: t1] CONTENT: "左"
  [TEXT: t2] CONTENT: "右"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('flex');
      expect(result.ssr.html).toContain('justify-between');
    });

    it('should render Section', async () => {
      const dsl = `
[SECTION: s1]
  [TEXT: t1] CONTENT: "Section 内容"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('<section');
      expect(result.ssr.html).toContain('Section 内容');
    });

    it('should render Container', async () => {
      const dsl = `
[CONTAINER: c1]
  [TEXT: t1] CONTENT: "容器内容"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('容器内容');
      // Container 应该有最大宽度限制
      expect(result.ssr.html).toContain('max-w');
    });
  });

  describe('复合组件渲染', () => {
    it('should render Card with title and content', async () => {
      const dsl = `
[CARD: c1]
  ATTR: Title("卡片标题"), Icon("Star")
  [TEXT: t1] CONTENT: "卡片内容"
  [BUTTON: b1] CONTENT: "操作"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('卡片标题');
      expect(result.ssr.html).toContain('卡片内容');
      expect(result.ssr.html).toContain('操作');
      expect(result.ssr.html).toContain('data-slot="card"');
    });

    it('should render Alert with title and description', async () => {
      const dsl = `
[ALERT: a1]
  [HEADING: h1] CONTENT: "警告标题"
  [TEXT: t1] CONTENT: "警告描述"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('警告标题');
      expect(result.ssr.html).toContain('警告描述');
    });

    it('should render Table with headers', async () => {
      const dsl = `
[TABLE: tb1]
  [TEXT: th1] CONTENT: "列1"
  [TEXT: th2] CONTENT: "列2"
  [TEXT: th3] CONTENT: "列3"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('<table');
      expect(result.ssr.html).toContain('<th');
      expect(result.ssr.html).toContain('列1');
      expect(result.ssr.html).toContain('列2');
      expect(result.ssr.html).toContain('列3');
    });

    it('should render List', async () => {
      const dsl = `
[LIST: l1]
  [TEXT: t1] CONTENT: "项目1"
  [TEXT: t2] CONTENT: "项目2"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('项目1');
      expect(result.ssr.html).toContain('项目2');
    });

    it('should render Modal (Dialog)', async () => {
      const dsl = `
[MODAL: m1]
  ATTR: Title("对话框标题")
  [TEXT: t1] CONTENT: "对话框内容"
  [BUTTON: b1] CONTENT: "确定"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      // Modal 映射到 Dialog
      expect(result.factory.ir.type).toBe('Dialog');
    });

    it('should render Tabs component', async () => {
      const dsl = '[TABS: tabs1]';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      // Tabs 应该渲染为带有 data-slot="tabs" 的元素
      expect(result.ssr.html).toContain('data-slot="tabs"');
      expect(result.ssr.html).toContain('data-orientation');
    });
  });

  describe('映射组件渲染', () => {
    it('should render Sidebar as Stack with dark background', async () => {
      const dsl = `
[SIDEBAR: sb1]
  [TEXT: t1] CONTENT: "侧边栏内容"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('侧边栏内容');
      expect(result.ssr.html).toContain('bg-slate-900');
      expect(result.ssr.html).toContain('flex-col');
    });

    it('should render Header as Flex with border', async () => {
      const dsl = `
[HEADER: h1]
  [TEXT: t1] CONTENT: "标题"
  [BUTTON: b1] CONTENT: "操作"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('标题');
      expect(result.ssr.html).toContain('border-b');
      expect(result.ssr.html).toContain('justify-between');
    });

    it('should render Nav as vertical Flex', async () => {
      const dsl = `
[NAV: n1]
  [TEXT: t1] CONTENT: "导航1"
  [TEXT: t2] CONTENT: "导航2"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('导航1');
      expect(result.ssr.html).toContain('导航2');
      expect(result.ssr.html).toContain('flex-col');
    });

    it('should render Heading as Text with title variant', async () => {
      const dsl = '[HEADING: h1] CONTENT: "大标题"';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('大标题');
      expect(result.ssr.html).toContain('<h2');
    });

    it('should render Form as vertical Stack', async () => {
      const dsl = `
[FORM: f1]
  [INPUT: i1] ATTR: Placeholder("用户名")
  [INPUT: i2] ATTR: Placeholder("密码")
  [BUTTON: b1] CONTENT: "提交"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('用户名');
      expect(result.ssr.html).toContain('密码');
      expect(result.ssr.html).toContain('提交');
      expect(result.ssr.html).toContain('flex-col');
    });

    it('should render Quote as styled Text', async () => {
      const dsl = '[QUOTE: q1] CONTENT: "这是引用"';
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('这是引用');
      expect(result.ssr.html).toContain('border-l-4');
      expect(result.ssr.html).toContain('italic');
    });

    it('should render Footer', async () => {
      const dsl = `
[FOOTER: f1]
  [TEXT: t1] CONTENT: "版权信息"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('版权信息');
    });
  });

  describe('组件嵌套', () => {
    it('should render nested layout correctly', async () => {
      const dsl = `
[FLEX: layout]
  { Direction: "Row", Gap: "0" }
  [SIDEBAR: sb]
    [NAV: nav]
      [TEXT: n1] CONTENT: "菜单1"
      [TEXT: n2] CONTENT: "菜单2"
  [SECTION: main]
    [HEADER: hd]
      [HEADING: title] CONTENT: "页面"
    [GRID: content]
      { Columns: 2, Gap: "16px" }
      [CARD: c1]
        ATTR: Title("卡片1")
        [TEXT: t1] CONTENT: "内容1"
      [CARD: c2]
        ATTR: Title("卡片2")
        [TEXT: t2] CONTENT: "内容2"
`;
      const result = await compile(dsl);

      expect(result.ast).toBeDefined();

      // 验证结构层级
      expect(result.ssr.html).toContain('菜单1');
      expect(result.ssr.html).toContain('菜单2');
      expect(result.ssr.html).toContain('卡片1');
      expect(result.ssr.html).toContain('卡片2');

      // 验证布局样式
      expect(result.ssr.html).toContain('bg-slate-900'); // Sidebar
      expect(result.ssr.html).toContain('grid-cols-2'); // Grid
    });
  });
});

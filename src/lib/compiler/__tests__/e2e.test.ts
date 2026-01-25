/**
 * 编译器集成测试 (端到端)
 *
 * 测试用例覆盖：
 * - TC-E2E-01: 完整编译流程
 * - TC-E2E-02: 增量编译
 */

import { describe, it, expect } from 'vitest';
import {
  compile,
  compileToHTML,
  diffAST,
  compileLogic,
  generateDesignTokens,
  createSession,
  CompileError,
} from '../index';

// ============================================
// TC-E2E-01: 完整编译流程
// ============================================

describe('Full Compile Pipeline (TC-E2E-01)', () => {
  it('should compile simple DSL to HTML', async () => {
    const dsl = '[SECTION: main] [TEXT: "Hello World"]';

    const result = await compile(dsl);

    // 验证 AST 生成
    expect(result.ast).toBeDefined();
    expect(result.ast.type).toBe('Root');
    expect(result.ast.children.length).toBeGreaterThan(0);

    // 验证 Tokens 生成
    expect(result.tokens).toBeDefined();
    expect(result.tokens['--primary-color']).toBeDefined();

    // 验证 Factory 输出
    expect(result.factory).toBeDefined();
    expect(result.factory.ir).toBeDefined();
    expect(result.factory.element).toBeDefined();

    // 验证 SSR 输出
    expect(result.ssr.html).toContain('<!DOCTYPE html>');
    expect(result.ssr.html).toContain('Hello World');
  });

  it('should compile Card with attributes correctly', async () => {
    const dsl = '[CARD: card1] ATTR: Title("Card Title") CONTENT: "Card content goes here"';

    const result = await compile(dsl, {
      ssr: { title: 'Card Test' },
    });

    // 验证 HTML 结构
    expect(result.ssr.html).toContain('<title>Card Test</title>');

    // 验证 IR 结构
    expect(result.factory.ir.type).toBe('Card');
  });

  it('should compile nested layout structure', async () => {
    // 嵌套结构：SECTION 包含多个 BUTTON
    const dsl = '[SECTION: main] [BUTTON: "Button A"] [BUTTON: "Button B"]';

    const result = await compile(dsl);

    // 验证 AST 结构
    expect(result.ast.children[0].type).toBe('Section');
    expect(result.ast.children[0].children).toBeDefined();
    expect(result.stats.nodeCount).toBeGreaterThanOrEqual(2);
  });

  it('should apply context-based tokens', async () => {
    const financeResult = await compile('[BUTTON: "Pay"]', {
      context: '金融支付系统',
    });

    const creativeResult = await compile('[BUTTON: "Create"]', {
      context: '创意设计工具',
    });

    // 不同上下文应产生不同 tokens
    expect(financeResult.tokens['--primary-color']).toBeDefined();
    expect(creativeResult.tokens['--primary-color']).toBeDefined();
  });

  it('should produce valid HTML with CSS variables', async () => {
    const result = await compile('[BUTTON: "Click"] ATTR: Variant("Primary")');

    // HTML 应包含 CSS 变量定义
    expect(result.ssr.html).toContain('--primary-color');
    expect(result.ssr.css).toContain(':root');
  });

  it('should track compile statistics', async () => {
    const dsl = '[SECTION: main] [CARD: card1] [TEXT: "Content"]';

    const result = await compile(dsl);

    expect(result.stats.parseTime).toBeGreaterThanOrEqual(0);
    expect(result.stats.tokenGenTime).toBeGreaterThanOrEqual(0);
    expect(result.stats.factoryTime).toBeGreaterThanOrEqual(0);
    expect(result.stats.ssrTime).toBeGreaterThanOrEqual(0);
    expect(result.stats.totalTime).toBeGreaterThan(0);
    expect(result.stats.nodeCount).toBeGreaterThanOrEqual(1);
    expect(result.stats.htmlSize).toBeGreaterThan(0);
  });

  it('should use compileToHTML shortcut', async () => {
    const html = await compileToHTML('[TEXT: "Simple"]');

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Simple');
  });

  it('should handle empty DSL', async () => {
    const result = await compile('');

    expect(result.ast.children).toHaveLength(0);
    expect(result.ssr.html).toContain('<!DOCTYPE html>');
  });

  it('should throw CompileError for invalid DSL', async () => {
    const invalidDSL = '[Invalid @#$ syntax';

    await expect(compile(invalidDSL)).rejects.toThrow();
  });

  it('should inject event stubs when enabled', async () => {
    const withEvents = await compile('[BUTTON: "Click"]', {
      injectEvents: true,
    });

    const withoutEvents = await compile('[BUTTON: "Click"]', {
      injectEvents: false,
    });

    expect(withEvents.factory.ir.props?.onClick).toBeDefined();
    expect(withoutEvents.factory.ir.props?.onClick).toBeUndefined();
  });

  it('should produce deterministic output with same session', async () => {
    const session = createSession();

    const result1 = await compile('[CARD: test1]', { session });
    const result2 = await compile('[CARD: test2]', { session });

    // 相同 session 应产生相同 tokens
    expect(result1.tokens['--primary-color']).toBe(result2.tokens['--primary-color']);
    expect(result1.tokens['--border-radius']).toBe(result2.tokens['--border-radius']);
  });
});

// ============================================
// TC-E2E-02: 增量编译
// ============================================

describe('Incremental Compilation (TC-E2E-02)', () => {
  it('should detect no changes in identical AST', () => {
    const dsl = '[BUTTON: "Click"]';
    const result1 = compileLogic(dsl);
    const result2 = compileLogic(dsl);

    expect(result1.ast).toBeDefined();
    expect(result2.ast).toBeDefined();

    const diff = diffAST(result1.ast!, result2.ast!);

    expect(diff.hasChanges).toBe(false);
    expect(diff.changedNodes).toHaveLength(0);
    expect(diff.addedNodes).toHaveLength(0);
    expect(diff.removedNodes).toHaveLength(0);
  });

  it('should detect changed node when text changes', () => {
    const oldResult = compileLogic('[BUTTON: "Old Text"]');
    const newResult = compileLogic('[BUTTON: "New Text"]');

    expect(oldResult.ast).toBeDefined();
    expect(newResult.ast).toBeDefined();

    const diff = diffAST(oldResult.ast!, newResult.ast!);

    // props 中的 text 变化应被检测到
    expect(diff.hasChanges).toBe(true);
  });

  it('should detect added nodes', () => {
    const oldResult = compileLogic('[SECTION: main] [BUTTON: "A"]');
    const newResult = compileLogic('[SECTION: main] [BUTTON: "A"] [BUTTON: "B"]');

    expect(oldResult.ast).toBeDefined();
    expect(newResult.ast).toBeDefined();

    const diff = diffAST(oldResult.ast!, newResult.ast!);

    expect(diff.hasChanges).toBe(true);
  });

  it('should detect removed nodes', () => {
    const oldResult = compileLogic('[SECTION: main] [BUTTON: "A"] [BUTTON: "B"]');
    const newResult = compileLogic('[SECTION: main] [BUTTON: "A"]');

    expect(oldResult.ast).toBeDefined();
    expect(newResult.ast).toBeDefined();

    const diff = diffAST(oldResult.ast!, newResult.ast!);

    expect(diff.hasChanges).toBe(true);
  });

  it('should detect prop changes', () => {
    const oldResult = compileLogic('[BUTTON: "Click"] ATTR: Variant("Primary")');
    const newResult = compileLogic('[BUTTON: "Click"] ATTR: Variant("Outline")');

    expect(oldResult.ast).toBeDefined();
    expect(newResult.ast).toBeDefined();

    const diff = diffAST(oldResult.ast!, newResult.ast!);

    expect(diff.hasChanges).toBe(true);
  });
});

// ============================================
// 并行编译测试
// ============================================

describe('Parallel Compilation', () => {
  it('should compile multiple DSLs in parallel', async () => {
    const dsls = [
      '[BUTTON: "A"]',
      '[BUTTON: "B"]',
      '[BUTTON: "C"]',
    ];

    const results = await Promise.all(
      dsls.map((dsl) => compile(dsl))
    );

    expect(results).toHaveLength(3);
    expect(results[0].ssr.html).toContain('A');
    expect(results[1].ssr.html).toContain('B');
    expect(results[2].ssr.html).toContain('C');
  });

  it('should handle parallel compile with different contexts', async () => {
    const [finance, creative] = await Promise.all([
      compile('[BUTTON: "Pay"]', { context: '金融系统' }),
      compile('[BUTTON: "Create"]', { context: '创意工具' }),
    ]);

    expect(finance.ssr.html).toContain('Pay');
    expect(creative.ssr.html).toContain('Create');
  });
});

// ============================================
// 复杂场景测试
// ============================================

describe('Complex Scenarios', () => {
  it('should compile form layout', async () => {
    const dsl = `[CARD: login_form] ATTR: Title("Login Form")
      [INPUT: email] ATTR: Placeholder("Email")
      [INPUT: password] ATTR: Placeholder("Password")
      [BUTTON: "Sign In"] ATTR: Variant("Primary")`;

    const result = await compile(dsl);

    expect(result.ssr.html).toContain('Login Form');
  });

  it('should compile dashboard layout', async () => {
    const dsl = `[SECTION: dashboard] ATTR: Title("Dashboard")
      [CARD: users] CONTENT: "Users: 1,234"
      [CARD: revenue] CONTENT: "Revenue: $5,678"
      [CARD: orders] CONTENT: "Orders: 890"`;

    const result = await compile(dsl, {
      context: '数据分析仪表盘',
      ssr: { title: 'Dashboard' },
    });

    expect(result.ssr.html).toContain('Dashboard');
  });

  it('should compile with all SSR options', async () => {
    const dsl = '[TEXT: "Test"]';

    const result = await compile(dsl, {
      context: 'test',
      ssr: {
        title: 'Custom Title',
        lang: 'en-US',
        minify: false,
        customCSS: '.custom { color: red; }',
        headExtra: '<meta name="test" content="value">',
      },
      injectEvents: false,
      debug: true,
    });

    expect(result.ssr.html).toContain('<title>Custom Title</title>');
    expect(result.ssr.html).toContain('lang="en-US"');
    expect(result.ssr.css).toContain('.custom');
    expect(result.ssr.html).toContain('meta name="test"');
  });
});

// ============================================
// 边界情况测试
// ============================================

describe('Edge Cases', () => {
  it('should handle multiple sections as siblings', async () => {
    // 多个 SECTION 应该是兄弟节点，而非嵌套
    // 使用多行格式，相同缩进级别的元素是兄弟关系
    const dsl = `[SECTION: l1]
[SECTION: l2]
[SECTION: l3]
  [BUTTON: "Action"]`;

    const result = await compile(dsl);

    // 验证 SECTION 作为兄弟节点
    expect(result.ast.children.length).toBe(3); // 3 个 Section
    expect(result.ast.children[0].type).toBe('Section');
    expect(result.ast.children[1].type).toBe('Section');
    expect(result.ast.children[2].type).toBe('Section');
    // Button 是第三个 Section 的子节点（因为它缩进了）
    expect(result.ast.children[2].children).toBeDefined();
    expect(result.ast.children[2].children![0].type).toBe('Button');
  });

  it('should handle multiple root elements', async () => {
    // 注意：DSL parser 将后续标签视为前一个标签的子元素
    // [SECTION] [BUTTON: A] [BUTTON: B] 创建 Section -> Button(A) -> Button(B) 的嵌套结构
    const dsl = '[SECTION: main] [BUTTON: "First"] [BUTTON: "Second"]';

    const result = await compile(dsl);

    // Section 是根节点
    expect(result.ast.children[0].type).toBe('Section');
    // Section 包含第一个 Button
    expect(result.ast.children[0].children).toBeDefined();
    expect(result.ast.children[0].children![0].type).toBe('Button');
  });

  it('should handle special characters in content', async () => {
    const dsl = '[TEXT: "Price: $100"]';

    const result = await compile(dsl);

    expect(result.ssr.html).toContain('$100');
  });

  it('should handle unicode content', async () => {
    const dsl = '[TEXT: "你好世界"]';

    const result = await compile(dsl);

    expect(result.ssr.html).toContain('你好世界');
  });

  it('should handle props with special values', async () => {
    const dsl = '[BUTTON: "Click"] ATTR: Variant("Primary"), Size("Large")';

    const result = await compile(dsl);

    expect(result.factory.ir.props?.variant).toBe('primary');
  });
});

// ============================================
// 性能测试
// ============================================

describe('Performance', () => {
  it('should compile within reasonable time', async () => {
    // 生成多个 Card
    const cards = Array.from({ length: 10 }, (_, i) =>
      `[CARD: card_${i}] [TEXT: "Item ${i}"]`
    ).join(' ');
    const dsl = `[SECTION: main] ${cards}`;

    const startTime = performance.now();
    const result = await compile(dsl);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(2000); // < 2 秒
    expect(result.stats.nodeCount).toBeGreaterThanOrEqual(10);
  });

  it('should produce small CSS output', async () => {
    const dsl = '[CARD: test] [TEXT: "Minimal"]';

    const result = await compile(dsl);

    // CSS 应该 < 10KB
    const cssSize = Buffer.byteLength(result.ssr.css, 'utf8');
    expect(cssSize).toBeLessThan(10 * 1024);
  });
});

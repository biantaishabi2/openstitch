/**
 * SSR 引擎测试
 *
 * 测试用例覆盖：
 * - TC-SSR-01: 脱水渲染
 * - TC-SSR-02: 样式萃取
 * - TC-SSR-03: 资源固化
 */

import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { dehydrate, dehydrateBatch, dehydrateAsync } from '../dehydrator';
import { purgeCSS, generateCSSVariables, generateInlineStyle, mergeCSS } from '../css-purger';
import { solidifyAssets, generateStandaloneHTML } from '../solidifier';
import { renderToStaticHTML, renderToHTML, renderFactoryOutput } from '../renderer';
import { generateDesignTokens } from '../../visual/synthesizer';
import { generateIR } from '../../factory/ir-generator';
import { ThemeProvider } from '../../factory/theme-provider';
import type { StitchAST } from '../../logic/ast';

// 创建测试用 tokens
function createTestTokens() {
  return generateDesignTokens({ context: 'test', sessionId: 'test' });
}

// ============================================
// TC-SSR-01: 脱水渲染
// ============================================

describe('Dehydration (TC-SSR-01)', () => {
  it('should dehydrate simple React element to HTML string', () => {
    const element = React.createElement('div', { className: 'container' }, 'Hello World');
    const result = dehydrate(element);

    expect(result.html).toBe('<div class="container">Hello World</div>');
    expect(result.renderTime).toBeGreaterThanOrEqual(0);
  });

  it('should dehydrate nested elements', () => {
    const element = React.createElement(
      'div',
      { className: 'card' },
      React.createElement('h1', null, 'Title'),
      React.createElement('p', null, 'Content')
    );
    const result = dehydrate(element);

    expect(result.html).toContain('<div class="card">');
    expect(result.html).toContain('<h1>Title</h1>');
    expect(result.html).toContain('<p>Content</p>');
  });

  it('should dehydrate with style props', () => {
    const element = React.createElement('div', {
      style: { color: 'red', fontSize: '16px' },
    });
    const result = dehydrate(element);

    expect(result.html).toContain('style=');
    expect(result.html).toContain('color:red');
    expect(result.html).toContain('font-size:16px');
  });

  it('should minify HTML when minify option is true', () => {
    const element = React.createElement(
      'div',
      null,
      React.createElement('span', null, 'A'),
      React.createElement('span', null, 'B')
    );

    const normal = dehydrate(element, { minify: false });
    const minified = dehydrate(element, { minify: true });

    // minified 应该没有多余空白
    expect(minified.html).not.toContain('> <');
    expect(minified.html).toContain('><');
  });

  it('should batch dehydrate multiple elements', () => {
    const elements = [
      React.createElement('div', null, 'A'),
      React.createElement('div', null, 'B'),
      React.createElement('div', null, 'C'),
    ];

    const results = dehydrateBatch(elements);

    expect(results).toHaveLength(3);
    expect(results[0].html).toBe('<div>A</div>');
    expect(results[1].html).toBe('<div>B</div>');
    expect(results[2].html).toBe('<div>C</div>');
  });

  it('should async dehydrate', async () => {
    const element = React.createElement('div', null, 'Async');
    const result = await dehydrateAsync(element);

    expect(result.html).toBe('<div>Async</div>');
  });

  it('should handle empty elements', () => {
    const element = React.createElement('div');
    const result = dehydrate(element);

    expect(result.html).toBe('<div></div>');
  });

  it('should handle boolean and null children', () => {
    const element = React.createElement('div', null, null, true, false, 'visible');
    const result = dehydrate(element);

    expect(result.html).toBe('<div>visible</div>');
  });
});

// ============================================
// TC-SSR-02: 样式萃取
// ============================================

describe('CSS Purging (TC-SSR-02)', () => {
  const testCSS = `
    .text-lg { font-size: 1.125rem; }
    .text-sm { font-size: 0.875rem; }
    .bg-blue-500 { background-color: #3b82f6; }
    .bg-red-500 { background-color: #ef4444; }
    .p-4 { padding: 1rem; }
    .m-2 { margin: 0.5rem; }
    .hidden { display: none; }
    .flex { display: flex; }
  `;

  it('should purge unused CSS classes', async () => {
    const html = '<div class="text-lg bg-blue-500">Hello</div>';
    const result = await purgeCSS(html, testCSS);

    expect(result.css).toContain('.text-lg');
    expect(result.css).toContain('.bg-blue-500');
    expect(result.css).not.toContain('.text-sm');
    expect(result.css).not.toContain('.bg-red-500');
    expect(result.css).not.toContain('.hidden');
  });

  it('should calculate compression ratio', async () => {
    const html = '<div class="text-lg">Small</div>';
    const result = await purgeCSS(html, testCSS);

    expect(result.originalSize).toBeGreaterThan(0);
    expect(result.purgedSize).toBeLessThan(result.originalSize);
    expect(result.compressionRatio).toBeGreaterThan(0);
    expect(result.compressionRatio).toBeLessThan(1);
  });

  it('should preserve safelist patterns', async () => {
    const html = '<div class="text-lg">Content</div>';
    const result = await purgeCSS(html, testCSS, {
      safelist: ['hidden', 'flex'],
    });

    expect(result.css).toContain('.text-lg');
    expect(result.css).toContain('.hidden');
    expect(result.css).toContain('.flex');
  });

  it('should generate CSS variables from tokens', () => {
    const tokens = {
      '--primary-color': '#3b82f6',
      '--font-size-lg': '1.125rem',
      'nonVariable': 'ignored',
    };

    const css = generateCSSVariables(tokens);

    expect(css).toContain(':root');
    expect(css).toContain('--primary-color: #3b82f6');
    expect(css).toContain('--font-size-lg: 1.125rem');
    expect(css).not.toContain('nonVariable');
  });

  it('should generate inline style tag', () => {
    const css = '.btn { color: red; }';
    const result = generateInlineStyle(css);

    expect(result).toBe('<style>.btn { color: red; }</style>');
  });

  it('should minify inline style', () => {
    const css = '.btn { color: red; margin: 0; }';
    const result = generateInlineStyle(css, true);

    expect(result).not.toContain(' { ');
    expect(result).toContain('{color:red;margin:0}');
  });

  it('should merge multiple CSS strings', () => {
    const result = mergeCSS('.a { }', undefined, '.b { }', '', '.c { }');

    expect(result).toContain('.a { }');
    expect(result).toContain('.b { }');
    expect(result).toContain('.c { }');
  });

  it('should handle empty CSS gracefully', async () => {
    const html = '<div class="unused">Content</div>';
    const result = await purgeCSS(html, '');

    expect(result.css).toBe('');
    expect(result.compressionRatio).toBe(0);
  });
});

// ============================================
// TC-SSR-03: 资源固化
// ============================================

describe('Asset Solidification (TC-SSR-03)', () => {
  it('should inline CSS from link tags', () => {
    const html = '<link rel="stylesheet" href="style.css"><div>Content</div>';
    const resources = {
      'style.css': '.btn { color: red; }',
    };

    const result = solidifyAssets(html, resources);

    expect(result.html).not.toContain('<link');
    expect(result.html).toContain('<style>.btn { color: red; }</style>');
    expect(result.inlinedCount).toBe(1);
  });

  it('should inline JavaScript from script tags', () => {
    const html = '<script src="app.js"></script>';
    const resources = {
      'app.js': 'console.log("hello");',
    };

    const result = solidifyAssets(html, resources);

    expect(result.html).not.toContain('src="app.js"');
    expect(result.html).toContain('<script>console.log("hello");</script>');
    expect(result.inlinedCount).toBe(1);
  });

  it('should inline images as base64', () => {
    const html = '<img src="logo.png" alt="Logo">';
    const resources = {
      'logo.png': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };

    const result = solidifyAssets(html, resources);

    expect(result.html).toContain('data:image/png;base64,');
    expect(result.html).not.toContain('src="logo.png"');
    expect(result.inlinedCount).toBe(1);
  });

  it('should skip already inlined images', () => {
    const html = '<img src="data:image/png;base64,abc123">';
    const resources = {};

    const result = solidifyAssets(html, resources);

    expect(result.html).toBe(html);
    expect(result.inlinedCount).toBe(0);
  });

  it('should handle missing resources gracefully', () => {
    const html = '<link rel="stylesheet" href="missing.css"><div>Content</div>';
    const resources = {};

    const result = solidifyAssets(html, resources);

    // 保留原样
    expect(result.html).toContain('href="missing.css"');
    expect(result.inlinedCount).toBe(0);
  });

  it('should inline multiple resources', () => {
    const html = `
      <link rel="stylesheet" href="a.css">
      <link rel="stylesheet" href="b.css">
      <script src="app.js"></script>
    `;
    const resources = {
      'a.css': '.a { }',
      'b.css': '.b { }',
      'app.js': 'var x = 1;',
    };

    const result = solidifyAssets(html, resources);

    expect(result.inlinedCount).toBe(3);
  });

  it('should generate standalone HTML document', () => {
    const tokens = {
      '--primary-color': '#3b82f6',
    };

    const html = generateStandaloneHTML('<div>Content</div>', {
      title: 'My App',
      lang: 'en',
      css: '.btn { color: red; }',
      tokens,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>My App</title>');
    expect(html).toContain('lang="en"');
    expect(html).toContain('--primary-color: #3b82f6');
    expect(html).toContain('.btn { color: red; }');
    expect(html).toContain('<div>Content</div>');
  });

  it('should escape HTML in title', () => {
    const html = generateStandaloneHTML('<div>X</div>', {
      title: '<script>alert(1)</script>',
    });

    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });
});

// ============================================
// SSR 引擎集成测试
// ============================================

describe('SSR Engine Integration', () => {
  it('should render complete static HTML', async () => {
    const tokens = createTestTokens();
    const element = React.createElement(
      'div',
      { className: 'container p-4' },
      React.createElement('h1', { className: 'text-lg' }, 'Hello SSR'),
      React.createElement('p', null, 'Content here')
    );

    const result = await renderToStaticHTML(element, {
      title: 'SSR Test',
      tokens,
    });

    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('<title>SSR Test</title>');
    expect(result.html).toContain('Hello SSR');
    expect(result.html).toContain('Content here');
    expect(result.body).toContain('<div class="container p-4">');
    expect(result.stats.htmlSize).toBeGreaterThan(0);
  });

  it('should apply CSS purging in full render', async () => {
    const element = React.createElement('div', { className: 'text-lg' }, 'Text');

    const fullCSS = `
      .text-lg { font-size: 1.125rem; }
      .text-sm { font-size: 0.875rem; }
      .unused { display: none; }
    `;

    const result = await renderToStaticHTML(element, { fullCSS });

    expect(result.css).toContain('.text-lg');
    expect(result.css).not.toContain('.unused');
    expect(result.stats.cssCompressionRatio).toBeGreaterThan(0);
  });

  it('should include design tokens as CSS variables', async () => {
    const tokens = {
      '--primary-color': '#ff0000',
      '--font-size-lg': '1.5rem',
    } as any;

    const element = React.createElement('div', null, 'Test');
    const result = await renderToStaticHTML(element, { tokens });

    expect(result.css).toContain('--primary-color: #ff0000');
    expect(result.css).toContain('--font-size-lg: 1.5rem');
  });

  it('should use renderToHTML for simple cases', () => {
    const element = React.createElement('div', { className: 'card' }, 'Simple');
    const html = renderToHTML(element);

    expect(html).toBe('<div class="card">Simple</div>');
  });

  it('should minify output when requested', async () => {
    const element = React.createElement(
      'div',
      null,
      React.createElement('span', null, 'A'),
      React.createElement('span', null, 'B')
    );

    const result = await renderToStaticHTML(element, { minify: true });

    expect(result.body).not.toContain('> <');
  });

  it('should track render time in stats', async () => {
    const element = React.createElement('div', null, 'Test');
    const result = await renderToStaticHTML(element);

    expect(result.stats.renderTime).toBeGreaterThanOrEqual(0);
  });
});

// ============================================
// 边界情况测试
// ============================================

describe('Edge Cases', () => {
  it('should handle empty React tree', async () => {
    const element = React.createElement(React.Fragment);
    const result = await renderToStaticHTML(element);

    expect(result.body).toBe('');
    expect(result.html).toContain('<!DOCTYPE html>');
  });

  it('should handle deeply nested elements', () => {
    let element: React.ReactNode = React.createElement('span', null, 'deep');
    for (let i = 0; i < 10; i++) {
      element = React.createElement('div', null, element);
    }

    const result = dehydrate(element as React.ReactElement);

    expect(result.html).toContain('deep');
    expect((result.html.match(/<div>/g) || []).length).toBe(10);
  });

  it('should handle special characters in content', () => {
    const element = React.createElement('div', null, '<script>alert(1)</script>');
    const result = dehydrate(element);

    // React 自动转义
    expect(result.html).not.toContain('<script>alert');
    expect(result.html).toContain('&lt;script&gt;');
  });

  it('should handle unicode content', () => {
    const element = React.createElement('div', null, '你好世界 🌍');
    const result = dehydrate(element);

    expect(result.html).toContain('你好世界');
    expect(result.html).toContain('🌍');
  });

  it('should handle large content efficiently', async () => {
    const items = Array.from({ length: 100 }, (_, i) =>
      React.createElement('li', { key: i }, `Item ${i}`)
    );
    const element = React.createElement('ul', null, ...items);

    const startTime = performance.now();
    const result = await renderToStaticHTML(element);
    const endTime = performance.now();

    expect(result.html).toContain('Item 0');
    expect(result.html).toContain('Item 99');
    expect(endTime - startTime).toBeLessThan(1000); // 应在 1 秒内完成
  });
});

// ============================================
// CSS 体积验证 (Spec 要求 < 10KB)
// ============================================

describe('CSS Size Validation (Spec Requirement)', () => {
  it('should produce CSS < 10KB after purging', async () => {
    // 模拟 Tailwind 完整 CSS (简化版，但包含足够多未使用类)
    const tailwindCSS = `
      /* 基础样式 */
      .text-xs { font-size: 0.75rem; }
      .text-sm { font-size: 0.875rem; }
      .text-base { font-size: 1rem; }
      .text-lg { font-size: 1.125rem; }
      .text-xl { font-size: 1.25rem; }
      .text-2xl { font-size: 1.5rem; }
      .text-3xl { font-size: 1.875rem; }

      /* 颜色 - 模拟大量未使用类 */
      .bg-red-50 { background: #fef2f2; }
      .bg-red-100 { background: #fee2e2; }
      .bg-red-200 { background: #fecaca; }
      .bg-red-300 { background: #fca5a5; }
      .bg-red-400 { background: #f87171; }
      .bg-red-500 { background: #ef4444; }
      .bg-blue-50 { background: #eff6ff; }
      .bg-blue-100 { background: #dbeafe; }
      .bg-blue-200 { background: #bfdbfe; }
      .bg-blue-500 { background: #3b82f6; }
      .bg-green-500 { background: #22c55e; }
      .bg-yellow-500 { background: #eab308; }

      /* 间距 */
      .p-0 { padding: 0; }
      .p-1 { padding: 0.25rem; }
      .p-2 { padding: 0.5rem; }
      .p-3 { padding: 0.75rem; }
      .p-4 { padding: 1rem; }
      .p-5 { padding: 1.25rem; }
      .p-6 { padding: 1.5rem; }
      .m-0 { margin: 0; }
      .m-1 { margin: 0.25rem; }
      .m-2 { margin: 0.5rem; }
      .m-4 { margin: 1rem; }

      /* 更多未使用类... */
      .flex { display: flex; }
      .grid { display: grid; }
      .hidden { display: none; }
      .block { display: block; }
      .inline { display: inline; }
      .w-full { width: 100%; }
      .h-full { height: 100%; }
      .rounded { border-radius: 0.25rem; }
      .rounded-md { border-radius: 0.375rem; }
      .rounded-lg { border-radius: 0.5rem; }
      .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
    `;

    // 只使用少量类
    const element = React.createElement(
      'div',
      { className: 'p-4 bg-blue-500 rounded-lg' },
      React.createElement('h1', { className: 'text-xl' }, 'Hello'),
      React.createElement('p', { className: 'text-base' }, 'World')
    );

    const result = await renderToStaticHTML(element, { fullCSS: tailwindCSS });

    // 验证 CSS < 10KB
    const cssSize = Buffer.byteLength(result.css, 'utf8');
    expect(cssSize).toBeLessThan(10 * 1024); // < 10KB

    // 验证只包含使用的类
    expect(result.css).toContain('.p-4');
    expect(result.css).toContain('.bg-blue-500');
    expect(result.css).toContain('.text-xl');
    expect(result.css).not.toContain('.bg-red-500');
    expect(result.css).not.toContain('.hidden');
  });

  it('should report compression ratio > 50%', async () => {
    const largeCSS = Array.from({ length: 100 }, (_, i) =>
      `.unused-class-${i} { color: red; padding: ${i}px; margin: ${i}px; }`
    ).join('\n');

    const html = '<div class="used-class">Content</div>';
    const result = await purgeCSS(html, largeCSS + '.used-class { color: blue; }');

    expect(result.compressionRatio).toBeGreaterThan(0.5);
  });
});

// ============================================
// 脱水模式测试 (static vs hydrate)
// ============================================

describe('Dehydration Modes', () => {
  it('should render static markup without React attributes', () => {
    const element = React.createElement('div', { id: 'app' }, 'Static');
    const result = dehydrate(element, { static: true });

    // static 模式不应包含 data-reactroot 等属性
    expect(result.html).not.toContain('data-react');
    expect(result.html).toBe('<div id="app">Static</div>');
  });

  it('should render hydratable markup with static: false', () => {
    const element = React.createElement('div', { id: 'app' }, 'Hydrate');
    const result = dehydrate(element, { static: false });

    // 水合模式的 HTML 也是有效的
    expect(result.html).toContain('<div');
    expect(result.html).toContain('Hydrate');
  });
});

// ============================================
// 不同图片 MIME 类型测试
// ============================================

describe('Image MIME Types', () => {
  it('should handle JPEG images', () => {
    const html = '<img src="photo.jpg">';
    const resources = { 'photo.jpg': 'base64data' };

    const result = solidifyAssets(html, resources);

    expect(result.html).toContain('data:image/jpeg;base64,');
  });

  it('should handle SVG images', () => {
    const html = '<img src="icon.svg">';
    const resources = { 'icon.svg': 'base64data' };

    const result = solidifyAssets(html, resources);

    expect(result.html).toContain('data:image/svg+xml;base64,');
  });

  it('should handle WebP images', () => {
    const html = '<img src="image.webp">';
    const resources = { 'image.webp': 'base64data' };

    const result = solidifyAssets(html, resources);

    expect(result.html).toContain('data:image/webp;base64,');
  });

  it('should handle GIF images', () => {
    const html = '<img src="animation.gif">';
    const resources = { 'animation.gif': 'base64data' };

    const result = solidifyAssets(html, resources);

    expect(result.html).toContain('data:image/gif;base64,');
  });

  it('should handle ICO images', () => {
    const html = '<img src="favicon.ico">';
    const resources = { 'favicon.ico': 'base64data' };

    const result = solidifyAssets(html, resources);

    expect(result.html).toContain('data:image/x-icon;base64,');
  });
});

// ============================================
// 相对路径解析测试
// ============================================

describe('URL Resolution', () => {
  it('should resolve relative paths with baseURL', () => {
    const html = '<link rel="stylesheet" href="css/style.css">';
    const resources = { 'https://example.com/css/style.css': '.btn { }' };

    const result = solidifyAssets(html, resources, {
      baseURL: 'https://example.com',
    });

    expect(result.html).toContain('<style>.btn { }</style>');
    expect(result.inlinedCount).toBe(1);
  });

  it('should handle baseURL with trailing slash', () => {
    const html = '<script src="js/app.js"></script>';
    const resources = { 'https://cdn.com/js/app.js': 'var x=1;' };

    const result = solidifyAssets(html, resources, {
      baseURL: 'https://cdn.com/',
    });

    expect(result.html).toContain('<script>var x=1;</script>');
  });

  it('should not modify absolute URLs', () => {
    const html = '<link rel="stylesheet" href="https://other.com/style.css">';
    const resources = { 'https://other.com/style.css': '.a { }' };

    const result = solidifyAssets(html, resources, {
      baseURL: 'https://example.com',
    });

    expect(result.html).toContain('<style>.a { }</style>');
  });
});

// ============================================
// renderFactoryOutput 集成测试
// ============================================

describe('Factory Output Integration', () => {
  it('should render factory output to static HTML', async () => {
    const tokens = createTestTokens();

    // 模拟组件工厂的 React 输出
    const element = React.createElement(
      ThemeProvider,
      { tokens },
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h1', null, 'Factory Output'),
        React.createElement('button', { className: 'btn' }, 'Click')
      )
    );

    const result = await renderFactoryOutput(element, tokens, {
      title: 'Factory Test',
    });

    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('Factory Output');
    expect(result.html).toContain('Click');
    expect(result.body).toContain('card p-4');
  });

  it('should include design tokens in factory output', async () => {
    const tokens = createTestTokens();
    const element = React.createElement('div', null, 'Test');

    const result = await renderFactoryOutput(element, tokens);

    // 验证 tokens 被注入为 CSS 变量
    expect(result.css).toContain('--primary-color');
    expect(result.css).toContain('--font-size');
  });
});

// ============================================
// SSR 选项测试
// ============================================

describe('SSR Options', () => {
  it('should include customCSS in output', async () => {
    const element = React.createElement('div', null, 'Test');
    const customCSS = '.custom-class { color: purple; }';

    const result = await renderToStaticHTML(element, { customCSS });

    expect(result.css).toContain('.custom-class');
    expect(result.css).toContain('color: purple');
  });

  it('should include headExtra in output', async () => {
    const element = React.createElement('div', null, 'Test');
    const headExtra = '<meta name="author" content="Stitch">';

    const result = await renderToStaticHTML(element, { headExtra });

    expect(result.html).toContain('<meta name="author" content="Stitch">');
  });

  it('should use custom title', async () => {
    const element = React.createElement('div', null, 'Test');

    const result = await renderToStaticHTML(element, {
      title: '自定义标题',
    });

    expect(result.html).toContain('<title>自定义标题</title>');
  });

  it('should use custom language', async () => {
    const element = React.createElement('div', null, 'Test');

    const result = await renderToStaticHTML(element, {
      lang: 'en-US',
    });

    expect(result.html).toContain('lang="en-US"');
  });
});

// ============================================
// CSS 萃取高级功能
// ============================================

describe('Advanced CSS Purging', () => {
  it('should preserve CSS variables when used', async () => {
    const css = `
      :root { --primary: blue; --unused-var: red; }
      .text-lg { font-size: 1.125rem; color: var(--primary); }
      .unused { display: none; }
    `;
    const html = '<div class="text-lg">Text</div>';

    const result = await purgeCSS(html, css, { variables: true });

    // CSS 变量通过 var() 引用时会被保留
    expect(result.css).toContain('.text-lg');
    expect(result.css).toContain('var(--primary)');
  });

  it('should preserve keyframes when enabled', async () => {
    const css = `
      @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      .animate-spin { animation: spin 1s linear infinite; }
      .unused { display: none; }
    `;
    const html = '<div class="animate-spin">Loading</div>';

    const result = await purgeCSS(html, css, { keyframes: true });

    expect(result.css).toContain('@keyframes spin');
    expect(result.css).toContain('.animate-spin');
  });

  it('should preserve font-face when enabled', async () => {
    const css = `
      @font-face { font-family: 'Custom'; src: url('font.woff2'); }
      .text-custom { font-family: 'Custom'; }
      .unused { display: none; }
    `;
    const html = '<div class="text-custom">Text</div>';

    const result = await purgeCSS(html, css, { fontFace: true });

    expect(result.css).toContain('@font-face');
    expect(result.css).toContain('.text-custom');
  });

  it('should use regex patterns in safelist', async () => {
    const css = `
      .hover\\:bg-blue-500:hover { background: blue; }
      .focus\\:ring:focus { box-shadow: 0 0 0 2px blue; }
      .text-lg { font-size: 1.125rem; }
    `;
    const html = '<div class="text-lg">Text</div>';

    const result = await purgeCSS(html, css, {
      safelistPatterns: [/^hover:/, /^focus:/],
    });

    expect(result.css).toContain('.text-lg');
    // safelist 应该保留 hover: 和 focus: 前缀的类
  });
});

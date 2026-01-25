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
import { renderToStaticHTML, renderToHTML } from '../renderer';
import { generateDesignTokens } from '../../visual/synthesizer';

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

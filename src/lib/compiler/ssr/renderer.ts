/**
 * SSR 引擎主入口
 *
 * 将 React 组件树转换为单文件、可离线运行的 HTML
 *
 * 处理流程：
 * 1. 脱水渲染 → React 组件树 → HTML 字符串
 * 2. 样式萃取 → 删除未使用的 CSS
 * 3. 资源固化 → 外部资源 → 内联
 */

import * as React from 'react';
import type { SSROptions, SSRResult, SSRStats } from './types';
import type { DesignTokens } from '../visual/types';
import { dehydrate } from './dehydrator';
import { purgeCSS, generateCSSVariables, mergeCSS } from './css-purger';
import { generateStandaloneHTML } from './solidifier';

/**
 * SSR 引擎默认选项
 */
const DEFAULT_OPTIONS: SSROptions = {
  minify: false,
  inlineCSS: true,
  inlineJS: false,
  inlineImages: true,
  title: 'Stitch App',
  lang: 'zh-CN',
  debug: false,
};

/**
 * Tailwind 基础 CSS (关键样式)
 *
 * 包含最常用的 Tailwind 类名，用于无 fullCSS 时的回退
 */
const TAILWIND_BASE_CSS = `
/* Tailwind 基础重置 */
*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; font-family: system-ui, -apple-system, sans-serif; }
body { margin: 0; line-height: inherit; }
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
a { color: inherit; text-decoration: inherit; }
button, input, select, textarea { font-family: inherit; font-size: 100%; margin: 0; padding: 0; }
button { background-color: transparent; background-image: none; }
img, svg, video { display: block; max-width: 100%; height: auto; }

/* 常用工具类 */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }

.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }

.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }

.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-4 { margin: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

.w-4 { width: 1rem; }
.w-full { width: 100%; }
.h-4 { height: 1rem; }
.h-9 { height: 2.25rem; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }
.max-w-sm { max-width: 24rem; }
.max-w-md { max-width: 28rem; }
.max-w-lg { max-width: 32rem; }
.max-w-xl { max-width: 36rem; }
.max-w-2xl { max-width: 42rem; }
.shrink-0 { flex-shrink: 0; }

.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }

.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-full { border-radius: 9999px; }

.border { border-width: 1px; }
.border-0 { border-width: 0; }
.border-2 { border-width: 2px; }

.shadow-xs { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }

.opacity-50 { opacity: 0.5; }
.opacity-75 { opacity: 0.75; }
.opacity-100 { opacity: 1; }

.cursor-pointer { cursor: pointer; }
.cursor-not-allowed { cursor: not-allowed; }

.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }

.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

.whitespace-nowrap { white-space: nowrap; }
.leading-none { line-height: 1; }
.outline-none { outline: 2px solid transparent; outline-offset: 2px; }

/* HSL 颜色工具类 */
.bg-background { background-color: hsl(var(--background)); }
.bg-foreground { background-color: hsl(var(--foreground)); }
.bg-card { background-color: hsl(var(--card)); }
.bg-primary { background-color: hsl(var(--primary)); }
.bg-secondary { background-color: hsl(var(--secondary)); }
.bg-muted { background-color: hsl(var(--muted)); }
.bg-accent { background-color: hsl(var(--accent)); }
.bg-destructive { background-color: hsl(var(--destructive)); }

.text-foreground { color: hsl(var(--foreground)); }
.text-muted-foreground { color: hsl(var(--muted-foreground)); }
.text-primary { color: hsl(var(--primary)); }
.text-primary-foreground { color: hsl(var(--primary-foreground)); }
.text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
.text-card-foreground { color: hsl(var(--card-foreground)); }
.text-destructive { color: hsl(var(--destructive)); }

.border-border { border-color: hsl(var(--border)); }
.border-input { border-color: hsl(var(--input)); }
.border-primary { border-color: hsl(var(--primary)); }

/* 按钮变体样式 */
[data-variant="primary"] {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
[data-variant="secondary"] {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}
[data-variant="outline"] {
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--background));
}
[data-variant="ghost"] {
  background-color: transparent;
}
[data-variant="destructive"] {
  background-color: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}
`;

/**
 * SSR 引擎：React 组件树 → 单文件 HTML
 *
 * @param reactTree React 组件树
 * @param options SSR 选项
 * @returns SSR 结果
 *
 * @example
 * ```typescript
 * const result = await renderToStaticHTML(
 *   <ThemeProvider tokens={tokens}>
 *     <Page>
 *       <Card>Hello World</Card>
 *     </Page>
 *   </ThemeProvider>,
 *   {
 *     title: '我的应用',
 *     tokens: designTokens,
 *     fullCSS: tailwindCSS
 *   }
 * );
 *
 * // result.html 是完整的单文件 HTML
 * // result.stats.cssCompressionRatio ≈ 0.99
 * ```
 */
export async function renderToStaticHTML(
  reactTree: React.ReactNode,
  options: SSROptions = {}
): Promise<SSRResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = performance.now();

  // 1. 脱水渲染
  const { html: bodyHTML, renderTime } = dehydrate(reactTree, {
    static: true,
    minify: opts.minify,
  });

  // 2. 准备 CSS
  const fullCSS = opts.fullCSS || TAILWIND_BASE_CSS;
  const customCSS = opts.customCSS || '';

  // 3. 样式萃取
  const purgeResult = await purgeCSS(bodyHTML, fullCSS, {
    variables: true,
    fontFace: true,
    keyframes: true,
  });

  // 4. 生成 CSS 变量
  const cssVariables = opts.tokens
    ? generateCSSVariables(opts.tokens)
    : '';

  // 5. 合并 CSS
  const finalCSS = mergeCSS(cssVariables, purgeResult.css, customCSS);

  // 6. 生成完整 HTML
  const html = generateStandaloneHTML(bodyHTML, {
    title: opts.title,
    lang: opts.lang,
    css: finalCSS,
    tokens: opts.tokens,
    headExtra: opts.headExtra,
  });

  const endTime = performance.now();

  // 7. 构建统计信息
  const stats: SSRStats = {
    originalCSSSize: purgeResult.originalSize,
    purgedCSSSize: purgeResult.purgedSize,
    cssCompressionRatio: purgeResult.compressionRatio,
    htmlSize: Buffer.byteLength(html, 'utf8'),
    renderTime: endTime - startTime,
  };

  return {
    html,
    body: bodyHTML,
    css: finalCSS,
    stats,
  };
}

/**
 * 快捷函数：渲染为 HTML 字符串
 *
 * 仅执行脱水渲染，不包含 CSS 萃取和资源固化
 */
export function renderToHTML(
  reactTree: React.ReactNode,
  options: { minify?: boolean } = {}
): string {
  const { html } = dehydrate(reactTree, {
    static: true,
    minify: options.minify,
  });
  return html;
}

/**
 * 从组件工厂输出渲染 SSR HTML
 *
 * 便捷函数，直接接受组件工厂的输出
 */
export async function renderFactoryOutput(
  element: React.ReactNode,
  tokens: DesignTokens,
  options: Omit<SSROptions, 'tokens'> = {}
): Promise<SSRResult> {
  return renderToStaticHTML(element, {
    ...options,
    tokens,
  });
}

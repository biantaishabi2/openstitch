/**
 * 脱水渲染器
 *
 * 将 React 组件树"拍扁"成静态 HTML 字符串
 *
 * 为什么叫"脱水"？
 * - React 组件是"活的"（有状态、有事件、有生命周期）
 * - 脱水后变成"干的" HTML 字符串（只有结构，没有行为）
 * - 就像把新鲜水果做成果干，保留形态，去除水分
 */

import * as React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';

/**
 * 脱水选项
 */
export interface DehydrateOptions {
  /** 是否生成静态标记 (不含 React 水合属性) */
  static?: boolean;
  /** 是否压缩输出 */
  minify?: boolean;
}

/**
 * 脱水结果
 */
export interface DehydrateResult {
  /** HTML 字符串 */
  html: string;
  /** 渲染耗时 (ms) */
  renderTime: number;
}

/**
 * 脱水渲染：React 组件树 → HTML 字符串
 *
 * @param reactTree React 组件树
 * @param options 脱水选项
 * @returns 脱水结果
 *
 * @example
 * ```typescript
 * const { html } = dehydrate(
 *   <ThemeProvider tokens={tokens}>
 *     <Card>
 *       <CardHeader>标题</CardHeader>
 *       <CardContent>内容</CardContent>
 *     </Card>
 *   </ThemeProvider>
 * );
 *
 * // html = '<div style="--primary-color:#3b82f6;..."><div class="card">...'
 * ```
 */
export function dehydrate(
  reactTree: React.ReactNode,
  options: DehydrateOptions = {}
): DehydrateResult {
  const { static: isStatic = true, minify = false } = options;

  const startTime = performance.now();

  // 选择渲染方法
  // - renderToStaticMarkup: 生成纯 HTML，不含 React 水合属性 (data-reactroot 等)
  // - renderToString: 生成可水合的 HTML，包含 React 属性
  let html = isStatic
    ? renderToStaticMarkup(reactTree as React.ReactElement)
    : renderToString(reactTree as React.ReactElement);

  // 压缩处理
  if (minify) {
    html = minifyHTML(html);
  }

  const endTime = performance.now();

  return {
    html,
    renderTime: endTime - startTime,
  };
}

/**
 * 简单 HTML 压缩
 *
 * 注意：这是基础压缩，生产环境建议使用 html-minifier-terser
 */
function minifyHTML(html: string): string {
  return html
    // 移除多余空白
    .replace(/\s+/g, ' ')
    // 移除标签间空白
    .replace(/>\s+</g, '><')
    // 移除注释
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/**
 * 批量脱水渲染
 *
 * 用于需要同时渲染多个组件树的场景
 */
export function dehydrateBatch(
  reactTrees: React.ReactNode[],
  options: DehydrateOptions = {}
): DehydrateResult[] {
  return reactTrees.map((tree) => dehydrate(tree, options));
}

/**
 * 异步脱水渲染
 *
 * 用于大型组件树，避免阻塞主线程
 */
export async function dehydrateAsync(
  reactTree: React.ReactNode,
  options: DehydrateOptions = {}
): Promise<DehydrateResult> {
  return new Promise((resolve) => {
    // 使用 setImmediate 或 setTimeout 让出控制权
    const timer = typeof setImmediate !== 'undefined'
      ? setImmediate
      : (fn: () => void) => setTimeout(fn, 0);

    timer(() => {
      const result = dehydrate(reactTree, options);
      resolve(result);
    });
  });
}

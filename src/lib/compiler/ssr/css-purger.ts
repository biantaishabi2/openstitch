/**
 * 样式萃取器
 *
 * 使用 PurgeCSS 删除未使用的 CSS，大幅减少产物体积
 *
 * Tailwind 完整 CSS: ~3MB
 * 萃取后: ~5-10KB (压缩率 99%+)
 */

import { PurgeCSS } from 'purgecss';
import type { PurgeCSSOptions } from './types';

/**
 * 萃取结果
 */
export interface PurgeResult {
  /** 萃取后的 CSS */
  css: string;
  /** 原始大小 (bytes) */
  originalSize: number;
  /** 萃取后大小 (bytes) */
  purgedSize: number;
  /** 压缩率 (0-1) */
  compressionRatio: number;
  /** 处理耗时 (ms) */
  processTime: number;
}

/**
 * 默认安全列表
 *
 * 这些类名/模式会被保留，即使在 HTML 中未直接使用
 */
const DEFAULT_SAFELIST = [
  // 动态状态类
  /^hover:/,
  /^focus:/,
  /^active:/,
  /^disabled:/,
  /^group-hover:/,
  /^dark:/,

  // 响应式断点
  /^sm:/,
  /^md:/,
  /^lg:/,
  /^xl:/,
  /^2xl:/,

  // 动画相关
  /^animate-/,
  /^transition-/,

  // CSS 变量
  /^--/,
];

/**
 * 样式萃取：删除未使用的 CSS
 *
 * @param html HTML 内容
 * @param fullCSS 完整 CSS 内容
 * @param options 萃取选项
 * @returns 萃取结果
 *
 * @example
 * ```typescript
 * const result = await purgeCSS(
 *   '<div class="text-lg bg-blue-500">Hello</div>',
 *   tailwindFullCSS
 * );
 *
 * // result.css 只包含 text-lg 和 bg-blue-500 的样式
 * // result.compressionRatio ≈ 0.99
 * ```
 */
export async function purgeCSS(
  html: string,
  fullCSS: string,
  options: PurgeCSSOptions = {}
): Promise<PurgeResult> {
  const startTime = performance.now();
  const originalSize = Buffer.byteLength(fullCSS, 'utf8');

  const {
    safelist = [],
    safelistPatterns = [],
    fontFace = true,
    keyframes = true,
    variables = true,
  } = options;

  // 合并安全列表
  const mergedSafelist = [
    ...safelist,
    ...DEFAULT_SAFELIST,
    ...safelistPatterns,
  ];

  try {
    const purgeCSSResult = await new PurgeCSS().purge({
      content: [{ raw: html, extension: 'html' }],
      css: [{ raw: fullCSS }],
      safelist: {
        standard: mergedSafelist.filter((item): item is string => typeof item === 'string'),
        deep: mergedSafelist.filter((item): item is RegExp => item instanceof RegExp),
        greedy: [],
      },
      fontFace,
      keyframes,
      variables,
    });

    const purgedCSS = purgeCSSResult[0]?.css || '';
    const purgedSize = Buffer.byteLength(purgedCSS, 'utf8');

    const endTime = performance.now();

    return {
      css: purgedCSS,
      originalSize,
      purgedSize,
      compressionRatio: originalSize > 0 ? 1 - purgedSize / originalSize : 0,
      processTime: endTime - startTime,
    };
  } catch (error) {
    // PurgeCSS 失败时返回原始 CSS
    console.warn('[SSR] PurgeCSS failed, returning original CSS:', error);

    const endTime = performance.now();

    return {
      css: fullCSS,
      originalSize,
      purgedSize: originalSize,
      compressionRatio: 0,
      processTime: endTime - startTime,
    };
  }
}

/**
 * 生成关键 CSS (内联样式)
 *
 * 将萃取后的 CSS 包装成 <style> 标签
 */
export function generateInlineStyle(css: string, minify = false): string {
  let processedCSS = css;

  if (minify) {
    processedCSS = minifyCSS(css);
  }

  return `<style>${processedCSS}</style>`;
}

/**
 * 简单 CSS 压缩
 */
function minifyCSS(css: string): string {
  return css
    // 移除注释
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // 移除多余空白
    .replace(/\s+/g, ' ')
    // 移除规则间空白
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    // 移除最后一个分号
    .replace(/;}/g, '}')
    .trim();
}

/**
 * 从 Design Tokens 生成 CSS 变量
 */
export function generateCSSVariables(
  tokens: Record<string, string>,
  selector = ':root'
): string {
  const variables = Object.entries(tokens)
    .filter(([key]) => key.startsWith('--'))
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ');

  return `${selector} {\n  ${variables}\n}`;
}

/**
 * 合并多个 CSS 字符串
 */
export function mergeCSS(...cssStrings: (string | undefined)[]): string {
  return cssStrings.filter(Boolean).join('\n');
}

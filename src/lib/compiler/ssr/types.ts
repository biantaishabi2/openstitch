/**
 * SSR 引擎类型定义
 */

import type { DesignTokens } from '../visual/types';

/**
 * SSR 渲染选项
 */
export interface SSROptions {
  /** 是否压缩 HTML */
  minify?: boolean;
  /** 是否内联 CSS */
  inlineCSS?: boolean;
  /** 是否内联 JS */
  inlineJS?: boolean;
  /** 是否内联图片 (base64) */
  inlineImages?: boolean;
  /** 自定义 CSS 内容 */
  customCSS?: string;
  /** Tailwind 完整 CSS (用于 PurgeCSS) */
  fullCSS?: string;
  /** 页面标题 */
  title?: string;
  /** 页面语言 */
  lang?: string;
  /** 额外的 head 内容 */
  headExtra?: string;
  /** 额外的 body 属性 */
  bodyAttrs?: Record<string, string>;
  /** Design Tokens */
  tokens?: DesignTokens;
  /** 调试模式 */
  debug?: boolean;
}

/**
 * SSR 渲染结果
 */
export interface SSRResult {
  /** 完整 HTML 文档 */
  html: string;
  /** 仅 body 内容 */
  body: string;
  /** 萃取后的关键 CSS */
  css: string;
  /** 统计信息 */
  stats: SSRStats;
}

/**
 * SSR 统计信息
 */
export interface SSRStats {
  /** 原始 CSS 大小 (bytes) */
  originalCSSSize: number;
  /** 萃取后 CSS 大小 (bytes) */
  purgedCSSSize: number;
  /** CSS 压缩率 */
  cssCompressionRatio: number;
  /** HTML 大小 (bytes) */
  htmlSize: number;
  /** 渲染耗时 (ms) */
  renderTime: number;
}

/**
 * 代码生成器类型
 */
export type CodeGenTarget = 'react' | 'html' | 'heex';

/**
 * 代码生成器选项
 */
export interface CodeGenOptions {
  /** 目标格式 */
  target: CodeGenTarget;
  /** 是否格式化输出 */
  pretty?: boolean;
  /** 缩进字符 */
  indent?: string;
}

/**
 * 资源固化选项
 */
export interface SolidifyOptions {
  /** 是否内联 CSS */
  inlineCSS?: boolean;
  /** 是否内联 JS */
  inlineJS?: boolean;
  /** 是否内联图片 */
  inlineImages?: boolean;
  /** 图片最大大小 (bytes)，超过则不内联 */
  maxImageSize?: number;
  /** 基础 URL (用于解析相对路径) */
  baseURL?: string;
}

/**
 * CSS 萃取选项
 */
export interface PurgeCSSOptions {
  /** 要保留的类名模式 */
  safelist?: (string | RegExp)[];
  /** 要保留的选择器 */
  safelistPatterns?: RegExp[];
  /** 是否保留字体相关样式 */
  fontFace?: boolean;
  /** 是否保留 keyframes */
  keyframes?: boolean;
  /** 是否保留 CSS 变量 */
  variables?: boolean;
}

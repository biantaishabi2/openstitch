/**
 * Stitch SSR 引擎
 *
 * 职责：React 组件树 → 单文件 HTML
 * 三大核心功能：脱水渲染 / 样式萃取 / 资源固化
 */

import type { DesignTokens } from '../middle/synthesizer';

// ============================================
// 类型定义
// ============================================

export interface SSRInput {
  html: string;           // renderToString 的输出
  tokens: DesignTokens;   // Design Tokens
  title?: string;         // 页面标题
  meta?: {
    description?: string;
    viewport?: string;
  };
}

export interface SSROutput {
  html: string;           // 完整的单文件 HTML
  css: string;            // 萃取的 CSS
  size: number;           // HTML 文件大小（bytes）
}

// ============================================
// Design Tokens → CSS 变量
// ============================================

function tokensToCSSVariables(tokens: DesignTokens): string {
  return `
  /* 空间尺度 */
  --base-unit: ${tokens.spacing.baseUnit};
  --spacing-xs: ${tokens.spacing.xs};
  --spacing-sm: ${tokens.spacing.sm};
  --spacing-md: ${tokens.spacing.md};
  --spacing-lg: ${tokens.spacing.lg};
  --spacing-xl: ${tokens.spacing.xl};
  --gap-card: ${tokens.spacing.gapCard};
  --padding-card: ${tokens.spacing.paddingCard};
  --padding-section: ${tokens.spacing.paddingSection};
  --line-height-body: ${tokens.spacing.lineHeightBody};

  /* 字体排版 */
  --font-scale: ${tokens.typography.scale};
  --font-size-xs: ${tokens.typography.sizeXs};
  --font-size-sm: ${tokens.typography.sizeSm};
  --font-size-base: ${tokens.typography.sizeBase};
  --font-size-lg: ${tokens.typography.sizeLg};
  --font-size-xl: ${tokens.typography.sizeXl};
  --font-size-2xl: ${tokens.typography.size2xl};
  --font-size-3xl: ${tokens.typography.size3xl};
  --font-weight-normal: ${tokens.typography.weightNormal};
  --font-weight-medium: ${tokens.typography.weightMedium};
  --font-weight-semibold: ${tokens.typography.weightSemibold};
  --font-weight-bold: ${tokens.typography.weightBold};

  /* 形状与阴影 */
  --radius-sm: ${tokens.shape.radiusSm};
  --radius-md: ${tokens.shape.radiusMd};
  --radius-lg: ${tokens.shape.radiusLg};
  --radius-full: ${tokens.shape.radiusFull};
  --shadow-sm: ${tokens.shape.shadowSm};
  --shadow-md: ${tokens.shape.shadowMd};
  --shadow-lg: ${tokens.shape.shadowLg};

  /* 颜色 */
  --color-primary: ${tokens.colors.primary};
  --color-primary-light: ${tokens.colors.primaryLight};
  --color-primary-dark: ${tokens.colors.primaryDark};
  --color-secondary: ${tokens.colors.secondary};
  --color-background: ${tokens.colors.background};
  --color-surface: ${tokens.colors.surface};
  --color-text: ${tokens.colors.text};
  --color-text-muted: ${tokens.colors.textMuted};
  --color-border: ${tokens.colors.border};
  --color-success: ${tokens.colors.success};
  --color-warning: ${tokens.colors.warning};
  --color-error: ${tokens.colors.error};
  `.trim();
}

// ============================================
// 基础样式（可被 PurgeCSS 萃取）
// ============================================

function getBaseStyles(): string {
  return `
/* Stitch Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--font-size-base);
  line-height: var(--line-height-body);
  color: var(--color-text);
  background-color: var(--color-background);
}

.stitch-root {
  min-height: 100vh;
}

.stitch-section {
  padding: var(--padding-section);
}

.stitch-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--padding-card);
}

.stitch-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.stitch-card-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.stitch-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stitch-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.stitch-text {
  color: var(--color-text);
  line-height: var(--line-height-body);
}

/* Utility Classes */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.gap-1 { gap: var(--spacing-xs); }
.gap-2 { gap: var(--spacing-sm); }
.gap-3 { gap: var(--spacing-md); }
.gap-4 { gap: var(--spacing-lg); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }
.bg-transparent { background-color: transparent; }
.border { border: 1px solid var(--color-border); }
.border-current { border-color: currentColor; }
  `.trim();
}

// ============================================
// 主入口：生成单文件 HTML
// ============================================

/**
 * 将 React HTML 字符串打包为单文件 HTML
 *
 * 核心功能：
 * 1. 内联 CSS（Design Tokens + 基础样式）
 * 2. 零外部依赖
 * 3. 可离线运行
 */
export function generateStaticHTML(input: SSRInput): SSROutput {
  const {
    html,
    tokens,
    title = 'Stitch Page',
    meta = {},
  } = input;

  const {
    description = 'Generated by Stitch UI Compiler',
    viewport = 'width=device-width, initial-scale=1.0',
  } = meta;

  // 生成 CSS
  const css = `
:root {
${tokensToCSSVariables(tokens)}
}

${getBaseStyles()}
  `.trim();

  // 组装完整 HTML
  const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="${viewport}">
  <meta name="description" content="${description}">
  <title>${title}</title>
  <style>
${css}
  </style>
</head>
<body>
  <div id="root">${html}</div>
</body>
</html>`;

  return {
    html: fullHTML,
    css,
    size: new TextEncoder().encode(fullHTML).length,
  };
}

// ============================================
// 辅助函数：计算 CSS 大小
// ============================================

export function getCSSSize(css: string): number {
  return new TextEncoder().encode(css).length;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

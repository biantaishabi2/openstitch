/**
 * 资源固化器
 *
 * 将外部依赖的资源内联到 HTML 中，生成单文件、零依赖的产物
 *
 * 原始引用方式 → 固化后
 * <link href="style.css"> → <style>...</style>
 * <script src="app.js"> → <script>...</script>
 * <img src="logo.png"> → <img src="data:image/png;base64,...">
 */

import type { SolidifyOptions } from './types';

/**
 * 固化结果
 */
export interface SolidifyResult {
  /** 固化后的 HTML */
  html: string;
  /** 内联的资源数量 */
  inlinedCount: number;
  /** 处理耗时 (ms) */
  processTime: number;
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: Required<SolidifyOptions> = {
  inlineCSS: true,
  inlineJS: true,
  inlineImages: true,
  maxImageSize: 50 * 1024, // 50KB
  baseURL: '',
};

/**
 * 资源固化：外部资源 → 内联
 *
 * 注意：此函数设计用于构建时，需要文件系统访问
 * 在纯客户端环境下，资源内容需要预先提供
 *
 * @param html HTML 内容
 * @param resources 资源映射 { path: content }
 * @param options 固化选项
 * @returns 固化结果
 *
 * @example
 * ```typescript
 * const result = solidifyAssets(
 *   '<link href="style.css"><img src="logo.png">',
 *   {
 *     'style.css': '.btn { color: red; }',
 *     'logo.png': 'data:image/png;base64,iVBOR...'
 *   }
 * );
 * ```
 */
export function solidifyAssets(
  html: string,
  resources: Record<string, string>,
  options: SolidifyOptions = {}
): SolidifyResult {
  const startTime = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result = html;
  let inlinedCount = 0;

  // 1. 内联 CSS (<link rel="stylesheet">)
  if (opts.inlineCSS) {
    result = result.replace(
      /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
      (match, href) => {
        const cssContent = resources[href] || resources[resolveURL(href, opts.baseURL)];
        if (cssContent) {
          inlinedCount++;
          return `<style>${cssContent}</style>`;
        }
        return match; // 保留原样
      }
    );

    // 处理 href 在 rel 之前的情况
    result = result.replace(
      /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*\/?>/gi,
      (match, href) => {
        const cssContent = resources[href] || resources[resolveURL(href, opts.baseURL)];
        if (cssContent) {
          inlinedCount++;
          return `<style>${cssContent}</style>`;
        }
        return match;
      }
    );
  }

  // 2. 内联 JS (<script src="...">)
  if (opts.inlineJS) {
    result = result.replace(
      /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
      (match, src) => {
        const jsContent = resources[src] || resources[resolveURL(src, opts.baseURL)];
        if (jsContent) {
          inlinedCount++;
          return `<script>${jsContent}</script>`;
        }
        return match;
      }
    );
  }

  // 3. 内联图片 (<img src="...">)
  if (opts.inlineImages) {
    result = result.replace(
      /<img\s+([^>]*)src=["']([^"']+)["']([^>]*)>/gi,
      (match, before, src, after) => {
        // 跳过已经是 data URL 的图片
        if (src.startsWith('data:')) {
          return match;
        }

        const imageData = resources[src] || resources[resolveURL(src, opts.baseURL)];
        if (imageData) {
          // 检查是否已经是 base64
          const dataURL = imageData.startsWith('data:')
            ? imageData
            : toDataURL(src, imageData);

          inlinedCount++;
          return `<img ${before}src="${dataURL}"${after}>`;
        }
        return match;
      }
    );
  }

  const endTime = performance.now();

  return {
    html: result,
    inlinedCount,
    processTime: endTime - startTime,
  };
}

/**
 * 解析相对 URL
 */
function resolveURL(path: string, baseURL: string): string {
  if (!baseURL || path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }

  // 简单的路径拼接
  const base = baseURL.endsWith('/') ? baseURL : baseURL + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return base + cleanPath;
}

/**
 * 将二进制内容转换为 data URL
 */
function toDataURL(filename: string, content: string): string {
  const mimeType = getMimeType(filename);
  // 假设 content 已经是 base64 编码
  return `data:${mimeType};base64,${content}`;
}

/**
 * 根据文件扩展名获取 MIME 类型
 */
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // 图片
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',

    // 字体
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
    eot: 'application/vnd.ms-fontobject',

    // 其他
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * 生成完整的单文件 HTML
 *
 * 将所有资源内联，生成可离线运行的 HTML
 */
export function generateStandaloneHTML(
  bodyHTML: string,
  options: {
    title?: string;
    lang?: string;
    css?: string;
    js?: string;
    tokens?: Record<string, string>;
    headExtra?: string;
  } = {}
): string {
  const {
    title = 'Stitch App',
    lang = 'zh-CN',
    css = '',
    js = '',
    tokens = {},
    headExtra = '',
  } = options;

  // 生成 CSS 变量
  const cssVariables = Object.entries(tokens)
    .filter(([key]) => key.startsWith('--'))
    .map(([key, value]) => `${key}: ${value};`)
    .join('');

  const rootStyles = cssVariables ? `:root { ${cssVariables} }` : '';

  // Tailwind CDN 配置
  const tailwindConfig = `
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
            popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
            primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
            secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
            muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
            accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
            destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
          },
        },
      },
    }
  </script>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  ${tailwindConfig}
  <style>
    :root {
      ${cssVariables}
    }
    * { border-color: hsl(var(--border)); }
    body { font-family: system-ui, -apple-system, sans-serif; }
${css}
  </style>
${headExtra}
</head>
<body>
${bodyHTML}
${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
}

/**
 * HTML 转义
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

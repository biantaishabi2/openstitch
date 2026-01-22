/**
 * Stitch 导出模块（客户端）
 *
 * 支持在浏览器中导出 HTML 和图片
 * 支持多主题配置
 */

'use client';

import type { ExportOptions, ThemeConfig, ThemeName } from './types';

/**
 * 预定义主题
 */
const themes: Record<ThemeName, ThemeConfig> = {
  // 默认主题（黑白灰）
  default: {
    primary: '240 5.9% 10%',
    primaryForeground: '0 0% 98%',
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    cardForeground: '240 10% 3.9%',
    secondary: '240 4.8% 95.9%',
    secondaryForeground: '240 5.9% 10%',
    muted: '240 4.8% 95.9%',
    mutedForeground: '240 3.8% 46.1%',
    accent: '240 4.8% 95.9%',
    accentForeground: '240 5.9% 10%',
    border: '240 5.9% 90%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '0 0% 98%',
  },

  // 蓝色主题
  blue: {
    primary: '221 83% 53%',
    primaryForeground: '210 40% 98%',
    background: '210 40% 98%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    cardForeground: '222 47% 11%',
    secondary: '210 40% 96%',
    secondaryForeground: '222 47% 11%',
    muted: '210 40% 96%',
    mutedForeground: '215 16% 47%',
    accent: '210 40% 96%',
    accentForeground: '222 47% 11%',
    border: '214 32% 91%',
    destructive: '0 84% 60%',
    destructiveForeground: '210 40% 98%',
  },

  // 绿色主题
  green: {
    primary: '142 76% 36%',
    primaryForeground: '355 100% 97%',
    background: '138 76% 97%',
    foreground: '150 40% 10%',
    card: '0 0% 100%',
    cardForeground: '150 40% 10%',
    secondary: '140 30% 94%',
    secondaryForeground: '150 40% 10%',
    muted: '140 30% 94%',
    mutedForeground: '150 20% 40%',
    accent: '140 30% 94%',
    accentForeground: '150 40% 10%',
    border: '140 20% 88%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 98%',
  },

  // 紫色主题
  purple: {
    primary: '263 70% 50%',
    primaryForeground: '210 20% 98%',
    background: '270 50% 98%',
    foreground: '270 50% 10%',
    card: '0 0% 100%',
    cardForeground: '270 50% 10%',
    secondary: '270 30% 94%',
    secondaryForeground: '270 50% 10%',
    muted: '270 30% 94%',
    mutedForeground: '270 20% 45%',
    accent: '270 30% 94%',
    accentForeground: '270 50% 10%',
    border: '270 20% 88%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 98%',
  },

  // 橙色主题
  orange: {
    primary: '25 95% 53%',
    primaryForeground: '60 9% 98%',
    background: '30 50% 98%',
    foreground: '20 14% 10%',
    card: '0 0% 100%',
    cardForeground: '20 14% 10%',
    secondary: '30 30% 94%',
    secondaryForeground: '20 14% 10%',
    muted: '30 30% 94%',
    mutedForeground: '25 20% 45%',
    accent: '30 30% 94%',
    accentForeground: '20 14% 10%',
    border: '30 20% 88%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 98%',
  },

  // 玫瑰色主题
  rose: {
    primary: '346 77% 50%',
    primaryForeground: '355 100% 97%',
    background: '350 50% 98%',
    foreground: '340 20% 10%',
    card: '0 0% 100%',
    cardForeground: '340 20% 10%',
    secondary: '350 30% 94%',
    secondaryForeground: '340 20% 10%',
    muted: '350 30% 94%',
    mutedForeground: '340 15% 45%',
    accent: '350 30% 94%',
    accentForeground: '340 20% 10%',
    border: '350 20% 88%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 98%',
  },

  // 暗色主题
  dark: {
    primary: '210 40% 98%',
    primaryForeground: '222 47% 11%',
    background: '224 71% 4%',
    foreground: '213 31% 91%',
    card: '224 71% 8%',
    cardForeground: '213 31% 91%',
    secondary: '222 47% 15%',
    secondaryForeground: '210 40% 98%',
    muted: '223 47% 15%',
    mutedForeground: '215 20% 65%',
    accent: '216 34% 17%',
    accentForeground: '210 40% 98%',
    border: '216 34% 17%',
    destructive: '0 63% 31%',
    destructiveForeground: '210 40% 98%',
  },
};

/**
 * 获取主题配置
 */
function getThemeConfig(
  themeName: ThemeName = 'default',
  customTheme?: Partial<ThemeConfig>
): ThemeConfig {
  const baseTheme = themes[themeName];
  if (customTheme) {
    return { ...baseTheme, ...customTheme };
  }
  return baseTheme;
}

/**
 * 生成完整 HTML 文档（包含 Tailwind CDN）
 */
function wrapWithHTMLDocument(
  htmlContent: string,
  options: ExportOptions = {}
): string {
  const { theme = 'default', customTheme } = options;
  const themeConfig = getThemeConfig(theme, customTheme);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stitch Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* 主题样式变量 */
    :root {
      --background: ${themeConfig.background};
      --foreground: ${themeConfig.foreground};
      --card: ${themeConfig.card};
      --card-foreground: ${themeConfig.cardForeground};
      --popover: ${themeConfig.card};
      --popover-foreground: ${themeConfig.cardForeground};
      --primary: ${themeConfig.primary};
      --primary-foreground: ${themeConfig.primaryForeground};
      --secondary: ${themeConfig.secondary};
      --secondary-foreground: ${themeConfig.secondaryForeground};
      --muted: ${themeConfig.muted};
      --muted-foreground: ${themeConfig.mutedForeground};
      --accent: ${themeConfig.accent};
      --accent-foreground: ${themeConfig.accentForeground};
      --destructive: ${themeConfig.destructive};
      --destructive-foreground: ${themeConfig.destructiveForeground};
      --border: ${themeConfig.border};
      --input: ${themeConfig.border};
      --ring: ${themeConfig.primary};
      --radius: 0.5rem;
    }

    * {
      border-color: hsl(var(--border));
    }

    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
  <script>
    // Tailwind 配置
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
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
        },
      },
    }
  </script>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

/**
 * 导出可用主题列表
 */
export const availableThemes: ThemeName[] = ['default', 'blue', 'green', 'purple', 'orange', 'rose', 'dark'];

/**
 * 从 DOM 元素导出 HTML
 * 在客户端使用，直接获取渲染后的 DOM
 *
 * @param element - 要导出的 DOM 元素
 * @param options - 导出选项
 * @param options.theme - 主题名称: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'dark'
 * @param options.customTheme - 自定义主题配置
 * @param options.minify - 是否压缩 HTML
 */
export function exportToHTML(
  element: HTMLElement,
  options: ExportOptions = {}
): string {
  const { minify = false } = options;

  // 获取元素的 outerHTML
  const htmlContent = element.outerHTML;

  // 包装成完整文档（传入主题配置）
  let fullHTML = wrapWithHTMLDocument(htmlContent, options);

  if (minify) {
    // 简单压缩：去除多余空白
    fullHTML = fullHTML.replace(/\s+/g, ' ').replace(/>\s+</g, '><');
  }

  return fullHTML;
}

/**
 * 仅导出 HTML 片段（不包含 head/body）
 */
export function exportToHTMLFragment(element: HTMLElement): string {
  return element.outerHTML;
}

/**
 * 导出为图片
 */
export async function exportToImage(
  element: HTMLElement,
  options: {
    format?: 'png' | 'jpeg';
    quality?: number;
    scale?: number;
    backgroundColor?: string;
  } = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = 1,
    scale = 2,
    backgroundColor = '#ffffff',
  } = options;

  // 动态导入 html2canvas
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS: true,
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

/**
 * 导出为图片并下载
 */
export async function downloadAsImage(
  element: HTMLElement,
  filename: string = 'stitch-export.png',
  options: Parameters<typeof exportToImage>[1] = {}
): Promise<void> {
  const blob = await exportToImage(element, options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * 导出 HTML 并下载
 */
export function downloadAsHTML(
  element: HTMLElement,
  filename: string = 'stitch-export.html',
  options: ExportOptions = {}
): void {
  const html = exportToHTML(element, options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

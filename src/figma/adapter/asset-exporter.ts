/**
 * Figma 资产导出器
 *
 * 导出字体、图标、图片等资产
 */

import type { FigmaFile, FigmaNode } from '../types';

export interface FontInfo {
  family: string;
  weights: number[];
  sizes: number[];
}

export interface IconInfo {
  id: string;
  name: string;
  path: string;
  node: FigmaNode;
}

export interface AssetExportOptions {
  fileKey: string;
  figmaToken: string;
  outputDir: string;
  apiBaseUrl?: string;
}

export interface AssetExportResult {
  fonts: FontInfo[];
  icons: IconInfo[];
  exportedIcons: string[];
  warnings: string[];
}

/**
 * 提取设计稿中使用的所有字体
 */
export function extractFonts(figmaFile: FigmaFile): FontInfo[] {
  const fontMap = new Map<string, { weights: Set<number>; sizes: Set<number> }>();

  function traverse(node: FigmaNode) {
    if (node.type === 'TEXT' && node.style?.fontFamily) {
      const family = node.style.fontFamily;
      const weight = node.style.fontWeight || 400;
      const size = node.style.fontSize || 16;

      if (!fontMap.has(family)) {
        fontMap.set(family, { weights: new Set(), sizes: new Set() });
      }
      const info = fontMap.get(family)!;
      info.weights.add(weight);
      info.sizes.add(size);
    }

    node.children?.forEach(traverse);
  }

  traverse(figmaFile.document);

  return Array.from(fontMap.entries()).map(([family, info]) => ({
    family,
    weights: Array.from(info.weights).sort((a, b) => a - b),
    sizes: Array.from(info.sizes).sort((a, b) => a - b),
  }));
}

/**
 * 生成 Google Fonts 链接
 */
export function generateGoogleFontsLink(fonts: FontInfo[]): string {
  if (fonts.length === 0) return '';

  const families = fonts.map(font => {
    const weights = font.weights.join(',');
    return `${font.family.replace(/ /g, '+')}:wght@${weights}`;
  });

  return `https://fonts.googleapis.com/css2?family=${families.join('&family=')}&display=swap`;
}

/**
 * 生成字体 CSS
 */
export function generateFontCSS(fonts: FontInfo[]): string {
  const lines: string[] = [];

  fonts.forEach(font => {
    lines.push(`/* ${font.family} */`);
    lines.push(`@import url('${generateGoogleFontsLink([font])}');`);
    lines.push('');
  });

  // 生成字体回退
  lines.push(':root {');
  fonts.forEach(font => {
    const cssName = font.family.toLowerCase().replace(/ /g, '-');
    lines.push(`  --font-${cssName}: '${font.family}', sans-serif;`);
  });
  lines.push('}');

  return lines.join('\n');
}

/**
 * 提取图标节点
 */
export function extractIcons(figmaFile: FigmaFile): IconInfo[] {
  const icons: IconInfo[] = [];

  function traverse(node: FigmaNode, path = '') {
    const currentPath = path + '/' + node.name;

    // 识别图标：矢量类型或名字包含 icon
    const isIcon =
      node.type === 'VECTOR' ||
      node.type === 'BOOLEAN_OPERATION' ||
      node.type === 'STAR' ||
      node.type === 'ELLIPSE' ||
      node.type === 'REGULAR_POLYGON' ||
      /icon|图标|logo/i.test(node.name || '');

    if (isIcon && node.absoluteBoundingBox) {
      // 只收集合适大小的图标（排除装饰性大图形）
      const { width = 0, height = 0 } = node.absoluteBoundingBox;
      const isReasonableSize = width <= 100 && height <= 100 && width >= 8 && height >= 8;

      if (isReasonableSize) {
        icons.push({
          id: node.id,
          name: node.name || 'icon',
          path: currentPath,
          node,
        });
      }
    }

    node.children?.forEach(child => traverse(child, currentPath));
  }

  traverse(figmaFile.document);

  // 去重：同名图标只保留一个
  const seen = new Set<string>();
  return icons.filter(icon => {
    if (seen.has(icon.name)) return false;
    seen.add(icon.name);
    return true;
  });
}

/**
 * 通过 Figma API 导出图标为 SVG
 */
export async function exportIconsAsSVG(
  icons: IconInfo[],
  options: Pick<AssetExportOptions, 'fileKey' | 'figmaToken' | 'apiBaseUrl'>
): Promise<{ [iconName: string]: string }> {
  const { fileKey, figmaToken, apiBaseUrl = 'https://api.figma.com/v1' } = options;
  const results: { [iconName: string]: string } = {};

  if (icons.length === 0) return results;

  // Figma API 限制：每次最多 80 个节点
  const batchSize = 80;
  const batches: IconInfo[][] = [];
  for (let i = 0; i < icons.length; i += batchSize) {
    batches.push(icons.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const ids = batch.map(i => i.id).join(',');
    const url = `${apiBaseUrl}/images/${fileKey}?ids=${ids}&format=svg&scale=1`;

    try {
      const response = await fetch(url, {
        headers: { 'X-Figma-Token': figmaToken },
      });

      if (!response.ok) {
        console.warn(`Failed to export icons: ${response.status}`);
        continue;
      }

      const data = (await response.json()) as {
        images?: Record<string, string | null>;
      };

      for (const icon of batch) {
        const svgUrl = data.images?.[icon.id];
        if (svgUrl) {
          results[icon.name] = svgUrl;
        }
      }
    } catch (error) {
      console.warn(`Error exporting icons batch: ${error}`);
    }
  }

  return results;
}

/**
 * 下载 SVG 图标
 */
export async function downloadSVGIcons(
  iconUrls: { [name: string]: string },
  outputDir: string
): Promise<string[]> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const downloaded: string[] = [];

  for (const [name, url] of Object.entries(iconUrls)) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const svgContent = await response.text();
      const fileName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '.svg';
      const filePath = path.join(outputDir, fileName);

      await fs.writeFile(filePath, svgContent);
      downloaded.push(filePath);
    } catch (error) {
      console.warn(`Failed to download icon ${name}: ${error}`);
    }
  }

  return downloaded;
}

/**
 * 生成图标映射表（用于替换为 Lucide 图标）
 */
export function generateIconMapping(icons: IconInfo[]): { [figmaName: string]: string } {
  const mapping: { [figmaName: string]: string } = {};

  // 更全面的图标映射表
  const lucideMappings: { [pattern: string]: string } = {
    // 功能图标
    '福利': 'gift',
    '会员': 'user-plus',
    '用户注册': 'user-plus',
    '用户': 'user',
    '注册': 'user-plus',
    '新闻动态': 'newspaper',
    '新闻': 'newspaper',
    '动态': 'activity',
    '员工帮扶': 'heart-handshake',
    '帮扶': 'heart-handshake',
    '困难': 'help-circle',
    '组织机构': 'building-2',
    '组织': 'building-2',
    '机构': 'building',
    '职代会': 'users',
    '职工之家': 'home',
    '职工': 'users',
    '之家': 'home',
    '个人中心': 'circle-user',
    '个人': 'user',
    '中心': 'circle-user',
    '胸科闲余': 'coffee',
    '闲余': 'coffee',
    
    // 状态图标
    '活跃': 'flame',
    '步数': 'footprints',
    '步': 'footprints',
    
    // 内容图标
    '新闻政策': 'file-text',
    '政策': 'file-text',
    '文件': 'file',
    '劳模风采': 'award',
    '劳模': 'award',
    '风采': 'star',
    '退休感言': 'message-square',
    '退休': 'log-out',
    '感言': 'message-square',
    '线上活动': 'wifi',
    '线上': 'wifi',
    '兴趣小组': 'smile',
    '兴趣': 'smile',
    '小组': 'users',
    '活动': 'calendar',
    
    // UI 图标
    '返回': 'arrow-left',
    '更多': 'more-horizontal',
    '设置': 'settings',
    '搜索': 'search',
    '通知': 'bell',
    '消息': 'message-circle',
    'wifi': 'wifi',
    'cellular': 'signal',
    '电池': 'battery',
  };

  for (const icon of icons) {
    const name = icon.name.toLowerCase();
    let matched = false;

    // 尝试匹配关键词（优先匹配更长的关键词）
    const sortedPatterns = Object.entries(lucideMappings).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [pattern, lucideName] of sortedPatterns) {
      if (name.includes(pattern.toLowerCase())) {
        mapping[icon.name] = lucideName;
        matched = true;
        break;
      }
    }

    // 默认映射
    if (!matched) {
      mapping[icon.name] = 'circle';
    }
  }

  return mapping;
}

/**
 * 完整的资产导出流程
 */
export async function exportAssets(
  figmaFile: FigmaFile,
  options: AssetExportOptions
): Promise<AssetExportResult> {
  const warnings: string[] = [];

  // 1. 提取字体
  const fonts = extractFonts(figmaFile);

  // 2. 提取图标
  const icons = extractIcons(figmaFile);

  // 3. 尝试导出 SVG 图标
  let exportedIcons: string[] = [];
  try {
    const iconUrls = await exportIconsAsSVG(icons, options);
    const fs = await import('fs/promises');
    const path = await import('path');
    const iconsDir = path.join(options.outputDir, 'icons');
    await fs.mkdir(iconsDir, { recursive: true });
    exportedIcons = await downloadSVGIcons(iconUrls, iconsDir);
  } catch (error) {
    warnings.push(`Icon export failed: ${error}`);
  }

  return {
    fonts,
    icons,
    exportedIcons,
    warnings,
  };
}

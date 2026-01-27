/**
 * Figma 适配器实现
 *
 * 将 Figma JSON 转换为 Stitch 编译器可用的格式：
 * - Visual Inferrer → Design Tokens
 * - Structure Inferrer → DSL
 */

import type { FigmaFile, FigmaNode } from '../types';
import {
  inferVisuals,
  extractValidNodes,
  type VisualInferenceResult,
} from '../inferrers/visual-inferrer';
import {
  inferStructure,
  type StructureInferenceResult,
} from '../inferrers/structure-inferrer';
import {
  resolveAssetsViaFigma,
  type AssetResolver,
  type AssetResolverOptions,
} from '../assets';
import type { DesignTokens } from '../../lib/compiler/visual/types';

// === 类型定义 ===

export interface FigmaToStitchResult {
  /** 生成的 DSL */
  dsl: string;
  /** 编译后的 Design Tokens (Record<string, string> 格式) */
  tokens: Record<string, string>;
  /** 原始视觉推断结果 */
  visuals: VisualInferenceResult;
  /** 结构推断结果 */
  structure: StructureInferenceResult;
  /** 转换统计信息 */
  stats: ConversionStats;
  /** 警告信息 */
  warnings: string[];
}

export interface ConversionStats {
  /** 总节点数 */
  totalNodes: number;
  /** 有效节点数 */
  validNodes: number;
  /** 推断耗时 (ms) */
  inferenceTime: number;
  /** AI 调用次数 */
  aiCallCount: number;
  /** 平均置信度 */
  avgConfidence: number;
}

export interface FigmaAdapterOptions {
  /** AI 推断函数 (可选，用于处理模糊元素) */
  aiInfer?: (prompt: string) => Promise<string>;
  /** 资产解析函数 (可选，用于导出图片/图标) */
  assetResolver?: AssetResolver;
  /** 资产解析参数 (fileKey + token 等) */
  assetOptions?: AssetResolverOptions;
  /** 上下文描述 (用于场景检测) */
  context?: string;
  /** 是否使用默认值填充缺失的 tokens */
  useDefaults?: boolean;
  /** Session ID (用于确定性输出) */
  sessionId?: string;
}

// === 主转换函数 ===

/**
 * 将 Figma JSON 转换为 Stitch 编译器可用的格式
 *
 * @param figmaFile Figma API 响应
 * @param options 转换选项
 * @returns 转换结果
 *
 * @example
 * ```typescript
 * import { convertFigmaToStitch } from './figma/adapter';
 * import { compile } from './lib/compiler';
 *
 * // 从 Figma 转换
 * const figmaResult = await convertFigmaToStitch(figmaJson, {
 *   context: '产品卡片列表',
 *   aiInfer: async (prompt) => callClaudeAPI(prompt),
 * });
 *
 * // 使用 Stitch 编译器
 * const html = await compile(figmaResult.dsl, {
 *   session: createSession(),
 *   ssr: { title: 'My App' },
 * });
 * ```
 */
export async function convertFigmaToStitch(
  figmaFile: FigmaFile,
  options: FigmaAdapterOptions = {}
): Promise<FigmaToStitchResult> {
  const startTime = performance.now();

  const {
    aiInfer,
    assetResolver,
    assetOptions,
    context = '',
    useDefaults = true,
    sessionId = generateSessionId(),
  } = options;

  const warnings: string[] = [];

  // 1. 提取有效节点
  const allNodes = extractAllNodes(figmaFile.document);
  const validNodes = extractValidNodes(figmaFile.document);

  // 1.5 解析资产 URL（可选）
  let assetUrls: Map<string, string> | undefined;
  const shouldResolveAssets = Boolean(
    (assetResolver && assetOptions) ||
      (assetOptions?.fileKey && assetOptions?.figmaToken)
  );
  if (shouldResolveAssets) {
    const resolver = assetResolver || resolveAssetsViaFigma;
    try {
      const assetResult = await resolver(validNodes, assetOptions as AssetResolverOptions);
      assetUrls = assetResult.byNodeId;
      warnings.push(...assetResult.warnings);
    } catch {
      warnings.push('Asset resolution failed. Continuing without exported assets.');
    }
  } else if (assetResolver && !assetOptions) {
    warnings.push('assetResolver provided without assetOptions. Skipping asset resolution.');
  }

  // 2. 结构推断（优先产出可编译 DSL）
  const structure = await inferStructure(validNodes, aiInfer, assetUrls);

  // 3. 视觉推断 (需要传入节点数组)
  const visuals = inferVisuals(validNodes);

  // 4. 转换为 Design Tokens（可被 DSL 局部覆盖）
  const tokens = convertVisualResultToTokens(visuals, {
    context,
    sessionId,
    useDefaults,
  });

  // 5. 合并警告
  warnings.push(...structure.warnings);

  if (visuals.sources.colors === 'defaults') {
    warnings.push('No colors found in design. Using default color palette.');
  }
  if (visuals.sources.typography === 'defaults') {
    warnings.push('No typography found in design. Using default type scale.');
  }

  const inferenceTime = performance.now() - startTime;

  // 6. 统计信息
  const stats: ConversionStats = {
    totalNodes: allNodes.length,
    validNodes: validNodes.length,
    inferenceTime,
    aiCallCount: structure.aiCallCount,
    avgConfidence: structure.confidence,
  };

  return {
    dsl: structure.dsl,
    tokens,
    visuals,
    structure,
    stats,
    warnings,
  };
}

// === Token 转换 ===

interface TokenConversionOptions {
  context?: string;
  sessionId?: string;
  useDefaults?: boolean;
}

/**
 * 将 VisualInferenceResult 转换为编译后的 Design Tokens (Record<string, string> 格式)
 */
export function convertVisualResultToTokens(
  visuals: VisualInferenceResult,
  options: TokenConversionOptions = {}
): Record<string, string> {
  const {
    context = '',
    sessionId = generateSessionId(),
    useDefaults = true,
  } = options;

  // 从 visuals.tokens 中提取各部分
  const { colors, colorScales, typography, spacing, shapes } = visuals.tokens;
  const primaryScale = colorScales.primary;

  // 颜色 Tokens
  const colorTokens = {
    '--primary-color': colors.primary,
    '--primary-50': primaryScale[50] || lighten(colors.primary, 0.95),
    '--primary-100': primaryScale[100] || lighten(colors.primary, 0.9),
    '--primary-200': primaryScale[200] || lighten(colors.primary, 0.8),
    '--primary-300': primaryScale[300] || lighten(colors.primary, 0.6),
    '--primary-400': primaryScale[400] || lighten(colors.primary, 0.4),
    '--primary-500': primaryScale[500] || colors.primary,
    '--primary-600': primaryScale[600] || darken(colors.primary, 0.1),
    '--primary-700': primaryScale[700] || darken(colors.primary, 0.2),
    '--primary-800': primaryScale[800] || darken(colors.primary, 0.3),
    '--primary-900': primaryScale[900] || darken(colors.primary, 0.4),
    '--secondary-color': colors.secondary || '#6b7280',
    '--accent-color': colors.accent || colors.primary,
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--muted': colors.muted || '#f3f4f6',
    '--muted-foreground': colorScales.neutral[500] || '#6b7280',
    '--border': colors.border || '#e5e7eb',
  };

  // 字体排版 Tokens
  const typographyTokens = {
    '--font-scale': typography.scale.toString(),
    '--font-size-xs': typography.fontSizes.xs,
    '--font-size-sm': typography.fontSizes.sm,
    '--font-size-base': typography.fontSizes.base,
    '--font-size-lg': typography.fontSizes.lg,
    '--font-size-xl': typography.fontSizes.xl,
    '--font-size-2xl': typography.fontSizes['2xl'],
    '--font-size-3xl': typography.fontSizes['3xl'],
    '--font-weight-normal': typography.fontWeights.normal.toString(),
    '--font-weight-medium': typography.fontWeights.medium.toString(),
    '--font-weight-semibold': typography.fontWeights.semibold.toString(),
    '--font-weight-bold': typography.fontWeights.bold.toString(),
  };

  // 空间尺度 Tokens
  const spacingTokens = {
    '--base-unit': `${spacing.baseUnit}px`,
    '--spacing-xs': spacing.values.xs,
    '--spacing-sm': spacing.values.sm,
    '--spacing-md': spacing.values.md,
    '--spacing-lg': spacing.values.lg,
    '--spacing-xl': spacing.values.xl,
    '--gap-card': spacing.values.lg,
    '--padding-card': spacing.values.md,
    '--padding-section': spacing.values.xl,
    '--line-height-body': '1.5',
  };

  // 形状边框 Tokens
  const shapeTokens = {
    '--radius-sm': shapes.radius.sm,
    '--radius-md': shapes.radius.md,
    '--radius-lg': shapes.radius.lg,
    '--radius-full': shapes.radius.full,
    '--shadow-sm': shapes.shadow.sm,
    '--shadow-md': shapes.shadow.md,
    '--shadow-lg': shapes.shadow.lg,
  };

  // 装饰纹理 Tokens (使用默认值)
  const ornamentTokens = {
    '--pattern-dots': 'radial-gradient(circle, currentColor 1px, transparent 1px)',
    '--pattern-dots-size': '16px 16px',
    '--pattern-grid': 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
    '--pattern-grid-size': '20px 20px',
    '--gradient-fade': 'linear-gradient(to bottom, transparent, var(--background))',
    '--noise-opacity': '0.02',
  };

  return {
    ...colorTokens,
    ...typographyTokens,
    ...spacingTokens,
    ...shapeTokens,
    ...ornamentTokens,
  };
}

// === 工具函数 ===

/**
 * 提取所有节点（不过滤）
 */
function extractAllNodes(node: FigmaNode): FigmaNode[] {
  const nodes: FigmaNode[] = [node];

  if (node.children) {
    for (const child of node.children) {
      nodes.push(...extractAllNodes(child));
    }
  }

  return nodes;
}

/**
 * 生成 Session ID
 */
function generateSessionId(): string {
  return `figma_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 字符串哈希
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * 颜色变亮
 */
function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);

  return rgbToHex(r, g, b);
}

/**
 * 颜色变暗
 */
function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.round(rgb.r * (1 - amount));
  const g = Math.round(rgb.g * (1 - amount));
  const b = Math.round(rgb.b * (1 - amount));

  return rgbToHex(r, g, b);
}

/**
 * Hex 转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB 转 Hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.min(255, Math.max(0, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

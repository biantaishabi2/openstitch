/**
 * 视觉推断器 - 主入口
 * 整合颜色、字体、间距、形状推断器
 */

import type {
  FigmaNode,
  DesignTokens,
  VisualInferenceResult,
  InferenceSource,
} from '../types';
import { inferColors, DEFAULT_COLORS } from './color-inferrer';
import { inferTypography, DEFAULT_TYPOGRAPHY } from './typography-inferrer';
import { inferSpacing, DEFAULT_SPACING } from './spacing-inferrer';
import { inferShapes, DEFAULT_SHAPES } from './shape-inferrer';

// === 默认 Design Tokens ===

export const DEFAULT_TOKENS: DesignTokens = {
  colors: DEFAULT_COLORS,
  colorScales: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: DEFAULT_TYPOGRAPHY,
  spacing: DEFAULT_SPACING,
  shapes: DEFAULT_SHAPES,
};

// === 主推断函数 ===

/**
 * 从 Figma 节点推断所有视觉信息
 *
 * @param nodes - Figma 节点数组
 * @returns 推断结果，包含 DesignTokens、置信度和警告
 */
export function inferVisuals(nodes: FigmaNode[]): VisualInferenceResult {
  const allWarnings: string[] = [];

  // 1. 推断颜色
  const colorResult = inferColors(nodes);
  allWarnings.push(...colorResult.warnings);

  // 2. 推断字体
  const typographyResult = inferTypography(nodes);
  allWarnings.push(...typographyResult.warnings);

  // 3. 推断间距
  const spacingResult = inferSpacing(nodes);
  allWarnings.push(...spacingResult.warnings);

  // 4. 推断形状
  const shapeResult = inferShapes(nodes);
  allWarnings.push(...shapeResult.warnings);

  // 5. 组装 DesignTokens
  const tokens: DesignTokens = {
    colors: colorResult.colors,
    colorScales: colorResult.colorScales,
    typography: typographyResult.typography,
    spacing: spacingResult.spacing,
    shapes: shapeResult.shapes,
  };

  // 6. 计算整体置信度
  const overallConfidence = calculateOverallConfidence(
    colorResult.confidence,
    typographyResult.confidence,
    spacingResult.confidence,
    shapeResult.confidence
  );

  // 7. 生成总结性警告
  if (overallConfidence < 0.6) {
    allWarnings.unshift(
      'Low overall confidence in visual inference. Consider defining Local Styles, Text Styles, and using Auto Layout in Figma.'
    );
  }

  return {
    tokens,
    confidence: overallConfidence,
    sources: {
      colors: colorResult.source,
      typography: typographyResult.source,
      spacing: spacingResult.source,
      shapes: shapeResult.source,
    },
    warnings: allWarnings,
  };
}

/**
 * 计算整体置信度
 * 加权平均：颜色 25%，字体 25%，间距 30%，形状 20%
 */
function calculateOverallConfidence(
  colorConfidence: number,
  typographyConfidence: number,
  spacingConfidence: number,
  shapeConfidence: number
): number {
  return (
    colorConfidence * 0.25 +
    typographyConfidence * 0.25 +
    spacingConfidence * 0.3 +
    shapeConfidence * 0.2
  );
}

// === 节点提取工具 ===

/**
 * 从 Figma 文件中提取有效节点
 * 过滤掉 DOCUMENT、CANVAS 等容器节点
 */
export function extractValidNodes(document: FigmaNode): FigmaNode[] {
  const nodes: FigmaNode[] = [];

  function traverse(node: FigmaNode) {
    // 跳过不可见节点
    if (node.visible === false) return;

    // 跳过文档和画布层
    if (node.type === 'DOCUMENT' || node.type === 'CANVAS') {
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
      return;
    }

    // 收集有效节点
    nodes.push(node);

    // 继续遍历子节点
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(document);
  return nodes;
}

// === 导出子模块 ===

export { inferColors, DEFAULT_COLORS } from './color-inferrer';
export { inferTypography, DEFAULT_TYPOGRAPHY } from './typography-inferrer';
export { inferSpacing, DEFAULT_SPACING } from './spacing-inferrer';
export { inferShapes, DEFAULT_SHAPES } from './shape-inferrer';

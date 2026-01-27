/**
 * 颜色推断器
 * 从 Figma 节点中提取、聚类、分配颜色角色
 */

import type {
  FigmaNode,
  FigmaColor,
  ColorSample,
  ColorCluster,
  ColorAssignment,
  ColorScale,
} from '../types';
import {
  figmaColorToHex,
  figmaColorToLab,
  hexToLab,
  deltaE,
  isChromatic,
  averageLab,
  generateColorScale,
  type LAB,
} from '../utils/color';

// === 颜色采集 ===

/**
 * 遍历节点树，采集所有颜色样本
 */
export function collectColors(nodes: FigmaNode[]): ColorSample[] {
  const samples: ColorSample[] = [];
  const colorCounts = new Map<string, ColorSample>();

  function traverse(node: FigmaNode) {
    // 跳过不可见节点
    if (node.visible === false) return;

    // 采集填充色
    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.visible !== false && fill.type === 'SOLID' && fill.color) {
          addSample(fill.color, 'fill', node.id);
        }
      }
    }

    // 采集描边色
    if (node.strokes) {
      for (const stroke of node.strokes) {
        if (stroke.visible !== false && stroke.type === 'SOLID' && stroke.color) {
          addSample(stroke.color, 'stroke', node.id);
        }
      }
    }

    // 采集阴影色
    if (node.effects) {
      for (const effect of node.effects) {
        if (
          effect.visible !== false &&
          (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') &&
          effect.color
        ) {
          addSample(effect.color, 'shadow', node.id);
        }
      }
    }

    // 文本颜色（从 fills 中获取）
    if (node.type === 'TEXT' && node.fills) {
      for (const fill of node.fills) {
        if (fill.visible !== false && fill.type === 'SOLID' && fill.color) {
          addSample(fill.color, 'text', node.id);
        }
      }
    }

    // 递归处理子节点
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  function addSample(
    color: FigmaColor,
    source: ColorSample['source'],
    nodeId: string
  ) {
    // 忽略完全透明的颜色
    if (color.a < 0.01) return;

    const hex = figmaColorToHex(color);
    const existing = colorCounts.get(hex);

    if (existing) {
      existing.frequency += 1;
    } else {
      const rgb = {
        r: Math.round(color.r * 255),
        g: Math.round(color.g * 255),
        b: Math.round(color.b * 255),
      };
      colorCounts.set(hex, {
        hex,
        rgb,
        lab: figmaColorToLab(color),
        source,
        nodeId,
        frequency: 1,
      });
    }
  }

  // 遍历所有节点
  for (const node of nodes) {
    traverse(node);
  }

  // 转换为数组
  for (const sample of colorCounts.values()) {
    samples.push(sample);
  }

  return samples;
}

// === 颜色聚类 ===

/**
 * 对颜色样本进行聚类
 * 使用 LAB 色彩空间的 ΔE 作为距离度量
 */
export function clusterColors(
  samples: ColorSample[],
  threshold = 3  // ΔE < 3 认为是同一颜色
): ColorCluster[] {
  if (samples.length === 0) return [];

  const clusters: ColorCluster[] = [];
  const assigned = new Set<string>();

  // 按频率排序，优先处理高频颜色
  const sorted = [...samples].sort((a, b) => b.frequency - a.frequency);

  for (const sample of sorted) {
    if (assigned.has(sample.hex)) continue;

    // 找出所有与当前颜色相近的样本
    const neighbors = sorted.filter(
      (s) => !assigned.has(s.hex) && deltaE(sample.lab, s.lab) < threshold
    );

    if (neighbors.length > 0) {
      // 按频率排序，取最常用的作为代表
      neighbors.sort((a, b) => b.frequency - a.frequency);

      const memberLabs = neighbors.map((n) => n.lab);

      clusters.push({
        representative: neighbors[0].hex,
        members: neighbors.map((n) => n.hex),
        totalFrequency: neighbors.reduce((sum, n) => sum + n.frequency, 0),
        avgLab: averageLab(memberLabs),
      });

      // 标记为已分配
      for (const neighbor of neighbors) {
        assigned.add(neighbor.hex);
      }
    }
  }

  // 按总频率排序
  return clusters.sort((a, b) => b.totalFrequency - a.totalFrequency);
}

// === 颜色角色分配 ===

/**
 * 将聚类后的颜色分配到语义角色
 */
export function assignColorRoles(clusters: ColorCluster[]): ColorAssignment {
  // 分类：彩色 vs 中性色
  const chromatic = clusters.filter((c) => isChromatic(c.avgLab));
  const neutral = clusters.filter((c) => !isChromatic(c.avgLab));

  // 中性色按明度排序（L 从暗到亮）
  neutral.sort((a, b) => a.avgLab[0] - b.avgLab[0]);

  // 彩色按频率已经排好序

  return {
    // 彩色：使用最多的 → primary
    primary: chromatic[0]?.representative || DEFAULT_COLORS.primary,
    secondary: chromatic[1]?.representative || DEFAULT_COLORS.secondary,
    accent: chromatic[2]?.representative || DEFAULT_COLORS.accent,

    // 中性色：最亮的 → background，最暗的 → foreground
    background:
      findBrightestNeutral(neutral) || DEFAULT_COLORS.background,
    foreground:
      findDarkestNeutral(neutral) || DEFAULT_COLORS.foreground,
    muted:
      findMutedNeutral(neutral) || DEFAULT_COLORS.muted,
    border:
      findBorderNeutral(neutral) || DEFAULT_COLORS.border,
  };
}

/**
 * 从中性色中找出最亮的（作为 background）
 */
function findBrightestNeutral(neutrals: ColorCluster[]): string | null {
  // L > 90 的最亮色
  const bright = neutrals.filter((n) => n.avgLab[0] > 90);
  if (bright.length > 0) {
    // 取最亮的
    bright.sort((a, b) => b.avgLab[0] - a.avgLab[0]);
    return bright[0].representative;
  }
  // 没有很亮的，取最亮的那个
  if (neutrals.length > 0) {
    const sorted = [...neutrals].sort((a, b) => b.avgLab[0] - a.avgLab[0]);
    return sorted[0].representative;
  }
  return null;
}

/**
 * 从中性色中找出最暗的（作为 foreground）
 */
function findDarkestNeutral(neutrals: ColorCluster[]): string | null {
  // L < 30 的最暗色
  const dark = neutrals.filter((n) => n.avgLab[0] < 30);
  if (dark.length > 0) {
    // 取最暗的
    dark.sort((a, b) => a.avgLab[0] - b.avgLab[0]);
    return dark[0].representative;
  }
  // 没有很暗的，取最暗的那个
  if (neutrals.length > 0) {
    const sorted = [...neutrals].sort((a, b) => a.avgLab[0] - b.avgLab[0]);
    return sorted[0].representative;
  }
  return null;
}

/**
 * 从中性色中找出 muted 色（L 约 90-96）
 */
function findMutedNeutral(neutrals: ColorCluster[]): string | null {
  const muted = neutrals.filter(
    (n) => n.avgLab[0] >= 85 && n.avgLab[0] <= 96
  );
  if (muted.length > 0) {
    // 取频率最高的
    muted.sort((a, b) => b.totalFrequency - a.totalFrequency);
    return muted[0].representative;
  }
  return null;
}

/**
 * 从中性色中找出 border 色（L 约 80-92）
 */
function findBorderNeutral(neutrals: ColorCluster[]): string | null {
  const border = neutrals.filter(
    (n) => n.avgLab[0] >= 75 && n.avgLab[0] <= 92
  );
  if (border.length > 0) {
    // 取频率最高的
    border.sort((a, b) => b.totalFrequency - a.totalFrequency);
    return border[0].representative;
  }
  return null;
}

// === 色阶生成 ===

/**
 * 为主要颜色生成完整色阶
 */
export function generateColorScales(
  colors: ColorAssignment
): { primary: ColorScale; neutral: ColorScale } {
  const primaryScale = generateColorScale(colors.primary);
  const neutralScale = generateColorScale(colors.foreground);

  return {
    primary: {
      50: primaryScale['50'],
      100: primaryScale['100'],
      200: primaryScale['200'],
      300: primaryScale['300'],
      400: primaryScale['400'],
      500: primaryScale['500'],
      600: primaryScale['600'],
      700: primaryScale['700'],
      800: primaryScale['800'],
      900: primaryScale['900'],
    },
    neutral: {
      50: neutralScale['50'],
      100: neutralScale['100'],
      200: neutralScale['200'],
      300: neutralScale['300'],
      400: neutralScale['400'],
      500: neutralScale['500'],
      600: neutralScale['600'],
      700: neutralScale['700'],
      800: neutralScale['800'],
      900: neutralScale['900'],
    },
  };
}

// === 默认颜色 ===

export const DEFAULT_COLORS: ColorAssignment = {
  primary: '#3b82f6',    // Blue 500
  secondary: '#6b7280',  // Gray 500
  accent: '#f59e0b',     // Amber 500
  background: '#ffffff',
  foreground: '#1f2937', // Gray 800
  muted: '#f3f4f6',      // Gray 100
  border: '#e5e7eb',     // Gray 200
};

// === 主推断函数 ===

export interface ColorInferenceResult {
  colors: ColorAssignment;
  colorScales: { primary: ColorScale; neutral: ColorScale };
  source: 'styles' | 'sampled' | 'default';
  confidence: number;
  clusters: ColorCluster[];
  warnings: string[];
}

/**
 * 从 Figma 节点推断颜色
 */
export function inferColors(nodes: FigmaNode[]): ColorInferenceResult {
  const warnings: string[] = [];

  // 1. 采集颜色
  const samples = collectColors(nodes);

  if (samples.length === 0) {
    return {
      colors: DEFAULT_COLORS,
      colorScales: generateColorScales(DEFAULT_COLORS),
      source: 'default',
      confidence: 0.5,
      clusters: [],
      warnings: ['No colors found in design, using defaults'],
    };
  }

  // 2. 聚类
  const clusters = clusterColors(samples);

  if (clusters.length < 3) {
    warnings.push(
      `Only ${clusters.length} distinct color clusters found, some colors may use defaults`
    );
  }

  // 3. 分配角色
  const colors = assignColorRoles(clusters);

  // 4. 生成色阶
  const colorScales = generateColorScales(colors);

  // 5. 计算置信度
  // 基于聚类数量和频率分布
  const confidence = calculateConfidence(clusters);

  if (confidence < 0.7) {
    warnings.push('Low confidence in color inference, consider defining Color Styles in Figma');
  }

  return {
    colors,
    colorScales,
    source: 'sampled',
    confidence,
    clusters,
    warnings,
  };
}

/**
 * 计算颜色推断的置信度
 */
function calculateConfidence(clusters: ColorCluster[]): number {
  // 基础分数
  let score = 0.5;

  // 聚类数量加分
  if (clusters.length >= 3) score += 0.1;
  if (clusters.length >= 5) score += 0.1;
  if (clusters.length >= 8) score += 0.1;

  // 有彩色和中性色分离加分
  const chromatic = clusters.filter((c) => isChromatic(c.avgLab));
  const neutral = clusters.filter((c) => !isChromatic(c.avgLab));
  if (chromatic.length >= 1 && neutral.length >= 2) score += 0.1;

  // 主色频率占比加分
  if (clusters.length > 0) {
    const totalFreq = clusters.reduce((sum, c) => sum + c.totalFrequency, 0);
    const topFreq = clusters[0].totalFrequency;
    if (topFreq / totalFreq > 0.2) score += 0.1;
  }

  return Math.min(score, 1.0);
}

/**
 * 形状推断器
 * 从 Figma 节点中提取、聚类、标准化圆角和阴影信息
 */

import type { FigmaNode, FigmaEffect, FigmaColor, ShapeTokens } from '../types';
import { figmaColorToHex } from '../utils/color';

// === 类型定义 ===

export interface RadiusSample {
  value: number;
  nodeId: string;
  frequency: number;
}

export interface ShadowSample {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  nodeId: string;
  frequency: number;
}

// === 常量 ===

/**
 * 标准圆角序列
 */
const STANDARD_RADII = [0, 2, 4, 6, 8, 12, 16, 20, 24, 9999];

// === 圆角采集 ===

/**
 * 遍历节点树，采集所有圆角样本
 */
export function collectRadii(nodes: FigmaNode[]): RadiusSample[] {
  const samples: RadiusSample[] = [];
  const valueMap = new Map<number, RadiusSample>();

  function traverse(node: FigmaNode) {
    if (node.visible === false) return;

    // 统一圆角
    if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
      addSample(node.cornerRadius, node.id);
    }
    // 分别的圆角
    else if (node.rectangleCornerRadii) {
      for (const radius of node.rectangleCornerRadii) {
        if (radius > 0) {
          addSample(radius, node.id);
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

  function addSample(value: number, nodeId: string) {
    // 忽略 0 和负值，但允许大圆角（如 9999px 的胶囊按钮）
    if (value <= 0) return;

    // 对于超大值（胶囊按钮），统一为 9999
    const rounded = value >= 100 ? 9999 : Math.round(value);
    const existing = valueMap.get(rounded);

    if (existing) {
      existing.frequency += 1;
    } else {
      valueMap.set(rounded, {
        value: rounded,
        nodeId,
        frequency: 1,
      });
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return Array.from(valueMap.values());
}

// === 阴影采集 ===

/**
 * 遍历节点树，采集所有阴影样本
 */
export function collectShadows(nodes: FigmaNode[]): ShadowSample[] {
  const samples: ShadowSample[] = [];
  const shadowMap = new Map<string, ShadowSample>();

  function traverse(node: FigmaNode) {
    if (node.visible === false) return;

    if (node.effects) {
      for (const effect of node.effects) {
        if (
          effect.visible !== false &&
          (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') &&
          effect.color
        ) {
          addShadow(effect, node.id);
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

  function addShadow(effect: FigmaEffect, nodeId: string) {
    const offsetX = effect.offset?.x || 0;
    const offsetY = effect.offset?.y || 0;
    const blur = effect.radius || 0;
    const spread = effect.spread || 0;
    const color = effect.color
      ? figmaColorToHex(effect.color)
      : 'rgba(0,0,0,0.1)';
    const opacity = effect.color?.a || 0.1;

    // 用 blur 值作为 key（因为 blur 是阴影的主要区分特征）
    const key = `${blur}-${offsetY}`;
    const existing = shadowMap.get(key);

    if (existing) {
      existing.frequency += 1;
    } else {
      shadowMap.set(key, {
        offsetX,
        offsetY,
        blur,
        spread,
        color,
        opacity,
        nodeId,
        frequency: 1,
      });
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return Array.from(shadowMap.values());
}

// === 圆角聚类 ===

/**
 * 对圆角值进行聚类
 */
export function clusterRadii(
  samples: RadiusSample[],
  tolerance = 2
): Map<number, number> {
  const clusters = new Map<number, number>(); // 标准值 → 总频率

  for (const sample of samples) {
    const standard = mapToStandardRadius(sample.value);
    const existing = clusters.get(standard) || 0;
    clusters.set(standard, existing + sample.frequency);
  }

  return clusters;
}

/**
 * 映射到标准圆角
 */
function mapToStandardRadius(value: number): number {
  // 处理 full 圆角（通常用于圆形或胶囊按钮）
  if (value >= 50) return 9999;

  return STANDARD_RADII.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

// === 阴影分级 ===

/**
 * 按 blur 值对阴影进行分级
 */
export function categorizeShadows(
  samples: ShadowSample[]
): Map<string, ShadowSample> {
  const categories = new Map<string, ShadowSample>();

  // 按 blur 值排序
  const sorted = [...samples].sort((a, b) => a.blur - b.blur);

  for (const shadow of sorted) {
    let category: string;

    if (shadow.blur <= 2) {
      category = 'none'; // 几乎没有模糊
    } else if (shadow.blur <= 6) {
      category = 'sm';
    } else if (shadow.blur <= 12) {
      category = 'md';
    } else if (shadow.blur <= 20) {
      category = 'lg';
    } else {
      category = 'xl';
    }

    // 只保留每个类别中频率最高的
    const existing = categories.get(category);
    if (!existing || shadow.frequency > existing.frequency) {
      categories.set(category, shadow);
    }
  }

  return categories;
}

/**
 * 将阴影样本转换为 CSS 字符串
 */
function shadowToCSS(shadow: ShadowSample | undefined): string {
  if (!shadow) return 'none';

  const { offsetX, offsetY, blur, spread, color, opacity } = shadow;

  // 将 hex 颜色转换为带透明度的 rgba
  // 简化处理：假设 color 是 hex，我们用 opacity 作为透明度
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(${r},${g},${b},${opacity.toFixed(2)})`;
}

// === 默认值 ===

export const DEFAULT_SHAPES: ShapeTokens = {
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadow: {
    none: 'none',
    sm: '0px 1px 2px 0px rgba(0,0,0,0.05)',
    md: '0px 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0px 10px 15px -3px rgba(0,0,0,0.1)',
    xl: '0px 20px 25px -5px rgba(0,0,0,0.1)',
  },
};

// === 主推断函数 ===

export interface ShapeInferenceResult {
  shapes: ShapeTokens;
  source: 'styles' | 'sampled' | 'default';
  confidence: number;
  detectedRadii: number[];
  detectedShadows: string[];
  warnings: string[];
}

/**
 * 从 Figma 节点推断形状信息
 */
export function inferShapes(nodes: FigmaNode[]): ShapeInferenceResult {
  const warnings: string[] = [];

  // 1. 采集圆角
  const radiusSamples = collectRadii(nodes);
  const radiusClusters = clusterRadii(radiusSamples);
  const radii = [...radiusClusters.keys()].sort((a, b) => a - b);

  // 2. 采集阴影
  const shadowSamples = collectShadows(nodes);
  const shadowCategories = categorizeShadows(shadowSamples);

  // 3. 生成圆角 tokens
  const radiusTokens = generateRadiusTokens(radii);

  // 4. 生成阴影 tokens
  const shadowTokens = generateShadowTokens(shadowCategories);

  // 5. 判断来源
  const hasRadii = radiusSamples.length > 0;
  const hasShadows = shadowSamples.length > 0;
  const source = hasRadii || hasShadows ? 'sampled' : 'default';

  if (!hasRadii) {
    warnings.push('No rounded corners found, using default radius values');
  }
  if (!hasShadows) {
    warnings.push('No shadows found, using default shadow values');
  }

  // 6. 计算置信度
  const confidence = calculateShapeConfidence(radii.length, shadowSamples.length);

  return {
    shapes: {
      radius: radiusTokens,
      shadow: shadowTokens,
    },
    source,
    confidence,
    detectedRadii: radii,
    detectedShadows: [...shadowCategories.keys()],
    warnings,
  };
}

/**
 * 生成圆角 tokens
 */
function generateRadiusTokens(
  radii: number[]
): ShapeTokens['radius'] {
  // 过滤掉 0 和 9999
  const filtered = radii.filter((r) => r > 0 && r < 9999);

  if (filtered.length === 0) {
    return DEFAULT_SHAPES.radius;
  }

  // 排序
  filtered.sort((a, b) => a - b);

  // 选择代表值
  const none = '0px';
  const full = '9999px';

  let sm: string, md: string, lg: string, xl: string;

  if (filtered.length >= 4) {
    sm = `${filtered[0]}px`;
    md = `${filtered[Math.floor(filtered.length * 0.33)]}px`;
    lg = `${filtered[Math.floor(filtered.length * 0.66)]}px`;
    xl = `${filtered[filtered.length - 1]}px`;
  } else if (filtered.length === 3) {
    sm = `${filtered[0]}px`;
    md = `${filtered[1]}px`;
    lg = `${filtered[2]}px`;
    xl = `${Math.min(filtered[2] + 4, 20)}px`;
  } else if (filtered.length === 2) {
    sm = `${filtered[0]}px`;
    md = `${filtered[1]}px`;
    lg = `${Math.min(filtered[1] + 4, 16)}px`;
    xl = `${Math.min(filtered[1] + 8, 20)}px`;
  } else {
    sm = `${filtered[0]}px`;
    md = `${Math.min(filtered[0] + 4, 8)}px`;
    lg = `${Math.min(filtered[0] + 8, 12)}px`;
    xl = `${Math.min(filtered[0] + 12, 16)}px`;
  }

  return { none, sm, md, lg, xl, full };
}

/**
 * 生成阴影 tokens
 */
function generateShadowTokens(
  categories: Map<string, ShadowSample>
): ShapeTokens['shadow'] {
  return {
    none: 'none',
    sm: categories.has('sm')
      ? shadowToCSS(categories.get('sm'))
      : DEFAULT_SHAPES.shadow.sm,
    md: categories.has('md')
      ? shadowToCSS(categories.get('md'))
      : DEFAULT_SHAPES.shadow.md,
    lg: categories.has('lg')
      ? shadowToCSS(categories.get('lg'))
      : DEFAULT_SHAPES.shadow.lg,
    xl: categories.has('xl')
      ? shadowToCSS(categories.get('xl'))
      : DEFAULT_SHAPES.shadow.xl,
  };
}

/**
 * 计算形状推断置信度
 */
function calculateShapeConfidence(
  radiusCount: number,
  shadowCount: number
): number {
  let score = 0.5;

  // 圆角数量加分
  if (radiusCount >= 2) score += 0.1;
  if (radiusCount >= 4) score += 0.1;

  // 阴影数量加分
  if (shadowCount >= 1) score += 0.1;
  if (shadowCount >= 3) score += 0.1;

  // 两者都有加分
  if (radiusCount > 0 && shadowCount > 0) score += 0.1;

  return Math.min(score, 1.0);
}

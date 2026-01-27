/**
 * 间距推断器
 * 从 Figma 节点中提取、聚类、标准化间距信息
 */

import type { FigmaNode, SpacingTokens } from '../types';

// === 类型定义 ===

export interface SpacingSample {
  value: number;
  type: 'padding' | 'gap' | 'margin';
  nodeId: string;
  frequency: number;
}

// === 常量 ===

/**
 * 标准间距序列（基于 4px 栅格）
 */
const STANDARD_SPACINGS_4 = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];

/**
 * 标准间距序列（基于 8px 栅格）
 */
const STANDARD_SPACINGS_8 = [0, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128];

// === 间距采集 ===

/**
 * 遍历节点树，采集所有间距样本
 */
export function collectSpacings(nodes: FigmaNode[]): SpacingSample[] {
  const samples: SpacingSample[] = [];
  const valueMap = new Map<string, SpacingSample>();

  function traverse(node: FigmaNode) {
    if (node.visible === false) return;

    // 从 Auto Layout 属性提取
    if (node.paddingLeft !== undefined && node.paddingLeft > 0) {
      addSample(node.paddingLeft, 'padding', node.id);
    }
    if (node.paddingRight !== undefined && node.paddingRight > 0) {
      addSample(node.paddingRight, 'padding', node.id);
    }
    if (node.paddingTop !== undefined && node.paddingTop > 0) {
      addSample(node.paddingTop, 'padding', node.id);
    }
    if (node.paddingBottom !== undefined && node.paddingBottom > 0) {
      addSample(node.paddingBottom, 'padding', node.id);
    }
    if (node.itemSpacing !== undefined && node.itemSpacing > 0) {
      addSample(node.itemSpacing, 'gap', node.id);
    }

    // 递归处理子节点
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  function addSample(
    value: number,
    type: SpacingSample['type'],
    nodeId: string
  ) {
    // 忽略 0 和异常值
    if (value <= 0 || value > 200) return;

    const key = `${value}-${type}`;
    const existing = valueMap.get(key);

    if (existing) {
      existing.frequency += 1;
    } else {
      valueMap.set(key, {
        value,
        type,
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

// === 栅格检测 ===

/**
 * 检测栅格基数（4px 或 8px）
 */
export function detectGridUnit(values: number[]): number {
  if (values.length === 0) return 4;

  // 四舍五入到整数
  const rounded = values.map((v) => Math.round(v));

  // 检查能被 8 整除的比例
  const divisibleBy8 = rounded.filter((v) => v % 8 === 0).length;
  const divisibleBy4 = rounded.filter((v) => v % 4 === 0).length;

  // 如果大部分能被 8 整除，使用 8px 栅格
  if (divisibleBy8 / rounded.length >= 0.7) {
    return 8;
  }

  // 否则使用 4px 栅格
  return 4;
}

/**
 * 对齐到栅格
 */
function alignToGrid(value: number, gridUnit: number): number {
  return Math.round(value / gridUnit) * gridUnit;
}

/**
 * 映射到标准间距
 */
function mapToStandardSpacing(value: number, gridUnit: number): number {
  const standards = gridUnit === 8 ? STANDARD_SPACINGS_8 : STANDARD_SPACINGS_4;
  return standards.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

// === 间距聚类 ===

/**
 * 对间距值进行聚类
 */
export function clusterSpacings(
  samples: SpacingSample[],
  gridUnit: number
): Map<number, number> {
  const clusters = new Map<number, number>(); // 标准值 → 总频率

  for (const sample of samples) {
    const aligned = alignToGrid(sample.value, gridUnit);
    const standard = mapToStandardSpacing(aligned, gridUnit);
    const existing = clusters.get(standard) || 0;
    clusters.set(standard, existing + sample.frequency);
  }

  return clusters;
}

// === 默认值 ===

export const DEFAULT_SPACING: SpacingTokens = {
  baseUnit: 4,
  values: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
};

// === 主推断函数 ===

export interface SpacingInferenceResult {
  spacing: SpacingTokens;
  source: 'autolayout' | 'sampled' | 'default';
  confidence: number;
  detectedValues: number[];
  gridUnit: number;
  warnings: string[];
}

/**
 * 从 Figma 节点推断间距信息
 */
export function inferSpacing(nodes: FigmaNode[]): SpacingInferenceResult {
  const warnings: string[] = [];

  // 1. 采集间距
  const samples = collectSpacings(nodes);

  if (samples.length === 0) {
    return {
      spacing: DEFAULT_SPACING,
      source: 'default',
      confidence: 0.5,
      detectedValues: [],
      gridUnit: 4,
      warnings: ['No spacing information found in design, using defaults'],
    };
  }

  // 2. 检测是否使用了 Auto Layout
  const hasAutoLayout = samples.some((s) => s.type === 'gap');
  const source = hasAutoLayout ? 'autolayout' : 'sampled';

  if (!hasAutoLayout) {
    warnings.push('No Auto Layout detected, spacing inferred from padding only');
  }

  // 3. 检测栅格基数
  const values = samples.map((s) => s.value);
  const gridUnit = detectGridUnit(values);

  // 4. 聚类
  const clusters = clusterSpacings(samples, gridUnit);

  // 5. 排序并选择代表值
  const sortedValues = [...clusters.keys()].sort((a, b) => a - b);

  if (sortedValues.length < 3) {
    warnings.push(
      `Only ${sortedValues.length} distinct spacing values found, spacing scale may be incomplete`
    );
  }

  // 6. 生成间距 tokens
  const spacing = generateSpacingTokens(sortedValues, gridUnit);

  // 7. 计算置信度
  const confidence = calculateSpacingConfidence(
    sortedValues.length,
    samples.length,
    hasAutoLayout
  );

  if (confidence < 0.7) {
    warnings.push(
      'Low confidence in spacing inference, consider using Auto Layout in Figma'
    );
  }

  return {
    spacing,
    source,
    confidence,
    detectedValues: sortedValues,
    gridUnit,
    warnings,
  };
}

/**
 * 生成间距 tokens
 */
function generateSpacingTokens(
  sortedValues: number[],
  gridUnit: number
): SpacingTokens {
  // 如果检测到的值太少，使用默认序列补充
  const defaults =
    gridUnit === 8
      ? [8, 16, 24, 32, 48, 64]
      : [4, 8, 16, 24, 32, 48];

  // 选择 6 个代表值
  let selected: number[];

  if (sortedValues.length >= 6) {
    // 等距选取
    selected = selectRepresentativeValues(sortedValues, 6);
  } else {
    // 不足 6 个，用检测到的值 + 默认值补充
    selected = [...sortedValues];
    for (const def of defaults) {
      if (!selected.includes(def) && selected.length < 6) {
        selected.push(def);
      }
    }
    selected.sort((a, b) => a - b);
    selected = selected.slice(0, 6);
  }

  // 确保有 6 个值
  while (selected.length < 6) {
    selected.push(defaults[selected.length]);
  }

  return {
    baseUnit: gridUnit,
    values: {
      xs: `${selected[0]}px`,
      sm: `${selected[1]}px`,
      md: `${selected[2]}px`,
      lg: `${selected[3]}px`,
      xl: `${selected[4]}px`,
      '2xl': `${selected[5]}px`,
    },
  };
}

/**
 * 从数组中等距选取指定数量的值
 */
function selectRepresentativeValues(
  values: number[],
  count: number
): number[] {
  if (values.length <= count) return values;

  const result: number[] = [];
  const step = (values.length - 1) / (count - 1);

  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step);
    result.push(values[index]);
  }

  return result;
}

/**
 * 计算间距推断置信度
 */
function calculateSpacingConfidence(
  distinctValues: number,
  totalSamples: number,
  hasAutoLayout: boolean
): number {
  let score = 0.5;

  // Auto Layout 加分
  if (hasAutoLayout) score += 0.2;

  // 值的数量加分
  if (distinctValues >= 3) score += 0.1;
  if (distinctValues >= 5) score += 0.1;

  // 样本数量加分
  if (totalSamples >= 10) score += 0.1;

  return Math.min(score, 1.0);
}

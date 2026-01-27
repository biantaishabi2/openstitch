/**
 * 字体推断器
 * 从 Figma 节点中提取、聚类、标准化字体信息
 */

import type { FigmaNode, TypographyTokens, TypeScale } from '../types';

// === 类型定义 ===

export interface FontSizeSample {
  size: number;
  weight: number;
  lineHeight: number;
  fontFamily: string;
  nodeId: string;
  frequency: number;
}

export interface FontWeightSample {
  weight: number;
  nodeId: string;
  frequency: number;
}

// === 常量 ===

/**
 * 标准字阶比率
 */
export const SCALE_RATIOS: Record<TypeScale, number> = {
  'minor-second': 1.067,
  'major-second': 1.125,
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'golden-ratio': 1.618,
};

/**
 * 标准字号序列
 */
const STANDARD_FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];

/**
 * 标准字重
 */
const STANDARD_FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

// === 字号采集 ===

/**
 * 遍历节点树，采集所有字号样本
 */
export function collectFontSizes(nodes: FigmaNode[]): FontSizeSample[] {
  const samples: FontSizeSample[] = [];
  const sampleMap = new Map<string, FontSizeSample>();

  function traverse(node: FigmaNode) {
    if (node.visible === false) return;

    if (node.type === 'TEXT' && node.style) {
      const { fontSize, fontWeight, lineHeightPx, fontFamily } = node.style;
      if (fontSize) {
        const key = `${fontSize}-${fontWeight || 400}`;
        const existing = sampleMap.get(key);

        if (existing) {
          existing.frequency += 1;
        } else {
          sampleMap.set(key, {
            size: fontSize,
            weight: fontWeight || 400,
            lineHeight: lineHeightPx || fontSize * 1.5,
            fontFamily: fontFamily || 'Inter',
            nodeId: node.id,
            frequency: 1,
          });
        }
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return Array.from(sampleMap.values());
}

/**
 * 采集字重
 */
export function collectFontWeights(nodes: FigmaNode[]): FontWeightSample[] {
  const samples: FontWeightSample[] = [];
  const weightMap = new Map<number, FontWeightSample>();

  function traverse(node: FigmaNode) {
    if (node.visible === false) return;

    if (node.type === 'TEXT' && node.style?.fontWeight) {
      const weight = node.style.fontWeight;
      const existing = weightMap.get(weight);

      if (existing) {
        existing.frequency += 1;
      } else {
        weightMap.set(weight, {
          weight,
          nodeId: node.id,
          frequency: 1,
        });
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return Array.from(weightMap.values());
}

// === 字号聚类 ===

/**
 * 对字号进行聚类
 * 合并 ±2px 范围内的字号
 */
export function clusterFontSizes(
  samples: FontSizeSample[],
  tolerance = 2
): Map<number, number> {
  const clusters = new Map<number, number>(); // 代表值 → 总频率

  if (samples.length === 0) return clusters;

  // 按字号排序
  const sorted = [...samples].sort((a, b) => a.size - b.size);

  let clusterStart = sorted[0].size;
  let clusterFreq = 0;
  let clusterSamples: FontSizeSample[] = [];

  for (const sample of sorted) {
    if (sample.size - clusterStart <= tolerance) {
      // 属于当前聚类
      clusterFreq += sample.frequency;
      clusterSamples.push(sample);
    } else {
      // 保存当前聚类
      if (clusterSamples.length > 0) {
        // 取频率最高的作为代表
        const representative = getMostFrequent(clusterSamples);
        const normalized = normalizeToGrid(representative, 2);
        clusters.set(normalized, clusterFreq);
      }

      // 开始新聚类
      clusterStart = sample.size;
      clusterFreq = sample.frequency;
      clusterSamples = [sample];
    }
  }

  // 保存最后一个聚类
  if (clusterSamples.length > 0) {
    const representative = getMostFrequent(clusterSamples);
    const normalized = normalizeToGrid(representative, 2);
    clusters.set(normalized, clusterFreq);
  }

  return clusters;
}

/**
 * 获取频率最高的字号
 */
function getMostFrequent(samples: FontSizeSample[]): number {
  let maxFreq = 0;
  let result = samples[0].size;

  for (const sample of samples) {
    if (sample.frequency > maxFreq) {
      maxFreq = sample.frequency;
      result = sample.size;
    }
  }

  return result;
}

/**
 * 对齐到栅格
 */
function normalizeToGrid(value: number, grid: number): number {
  return Math.round(value / grid) * grid;
}

// === 字阶比率检测 ===

/**
 * 检测字阶比率
 */
export function detectTypeScale(fontSizes: number[]): TypeScale {
  // 去重并排序
  const sorted = [...new Set(fontSizes)].sort((a, b) => a - b);

  if (sorted.length < 2) return 'major-second';

  // 计算相邻字号的比率
  const ratios: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    ratios.push(sorted[i] / sorted[i - 1]);
  }

  // 计算平均比率
  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

  // 匹配最接近的标准比率
  let closestScale: TypeScale = 'major-second';
  let minDiff = Infinity;

  for (const [scale, ratio] of Object.entries(SCALE_RATIOS)) {
    const diff = Math.abs(avgRatio - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closestScale = scale as TypeScale;
    }
  }

  return closestScale;
}

// === 标准化 ===

/**
 * 将字号映射到标准序列
 */
function mapToStandardSize(size: number): number {
  return STANDARD_FONT_SIZES.reduce((prev, curr) =>
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  );
}

/**
 * 将字重映射到标准值
 */
function mapToStandardWeight(weight: number): number {
  return STANDARD_FONT_WEIGHTS.reduce((prev, curr) =>
    Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
  );
}

/**
 * 推断字重 tokens
 */
function inferFontWeights(
  samples: FontWeightSample[]
): TypographyTokens['fontWeights'] {
  if (samples.length === 0) {
    return DEFAULT_TYPOGRAPHY.fontWeights;
  }

  // 按频率排序
  const sorted = [...samples].sort((a, b) => b.frequency - a.frequency);

  // 找出使用的字重
  const weights = sorted.map((s) => mapToStandardWeight(s.weight));
  const uniqueWeights = [...new Set(weights)].sort((a, b) => a - b);

  return {
    normal: uniqueWeights.find((w) => w === 400) || 400,
    medium: uniqueWeights.find((w) => w === 500) || 500,
    semibold: uniqueWeights.find((w) => w === 600) || 600,
    bold: uniqueWeights.find((w) => w >= 700) || 700,
  };
}

// === 默认值 ===

export const DEFAULT_TYPOGRAPHY: TypographyTokens = {
  scale: 'major-second',
  baseSize: 16,
  fontSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// === 主推断函数 ===

export interface TypographyInferenceResult {
  typography: TypographyTokens;
  source: 'styles' | 'sampled' | 'default';
  confidence: number;
  detectedSizes: number[];
  warnings: string[];
}

/**
 * 从 Figma 节点推断字体信息
 */
export function inferTypography(nodes: FigmaNode[]): TypographyInferenceResult {
  const warnings: string[] = [];

  // 1. 采集字号
  const fontSizeSamples = collectFontSizes(nodes);

  if (fontSizeSamples.length === 0) {
    return {
      typography: DEFAULT_TYPOGRAPHY,
      source: 'default',
      confidence: 0.5,
      detectedSizes: [],
      warnings: ['No text nodes found in design, using default typography'],
    };
  }

  // 2. 聚类字号
  const clusters = clusterFontSizes(fontSizeSamples);
  const sizes = [...clusters.keys()].sort((a, b) => a - b);

  if (sizes.length < 3) {
    warnings.push(
      `Only ${sizes.length} distinct font sizes found, typography scale may be incomplete`
    );
  }

  // 3. 检测字阶
  const scale = detectTypeScale(sizes);

  // 4. 找到 base 字号（使用最多的）
  let baseSize = 16;
  let maxFreq = 0;
  for (const [size, freq] of clusters) {
    if (freq > maxFreq) {
      maxFreq = freq;
      baseSize = size;
    }
  }
  baseSize = mapToStandardSize(baseSize);

  // 5. 生成字号序列
  const ratio = SCALE_RATIOS[scale];
  const fontSizes = {
    xs: `${mapToStandardSize(baseSize / Math.pow(ratio, 2))}px`,
    sm: `${mapToStandardSize(baseSize / ratio)}px`,
    base: `${baseSize}px`,
    lg: `${mapToStandardSize(baseSize * ratio)}px`,
    xl: `${mapToStandardSize(baseSize * Math.pow(ratio, 2))}px`,
    '2xl': `${mapToStandardSize(baseSize * Math.pow(ratio, 3))}px`,
    '3xl': `${mapToStandardSize(baseSize * Math.pow(ratio, 4))}px`,
  };

  // 6. 推断字重
  const fontWeightSamples = collectFontWeights(nodes);
  const fontWeights = inferFontWeights(fontWeightSamples);

  // 7. 推断行高
  const lineHeights = inferLineHeights(fontSizeSamples);

  // 8. 计算置信度
  const confidence = calculateTypographyConfidence(sizes.length, fontSizeSamples.length);

  if (confidence < 0.7) {
    warnings.push(
      'Low confidence in typography inference, consider defining Text Styles in Figma'
    );
  }

  return {
    typography: {
      scale,
      baseSize,
      fontSizes,
      fontWeights,
      lineHeights,
    },
    source: 'sampled',
    confidence,
    detectedSizes: sizes,
    warnings,
  };
}

/**
 * 推断行高
 */
function inferLineHeights(
  samples: FontSizeSample[]
): TypographyTokens['lineHeights'] {
  if (samples.length === 0) {
    return DEFAULT_TYPOGRAPHY.lineHeights;
  }

  // 计算行高比率（lineHeight / fontSize）
  const ratios: number[] = [];
  for (const sample of samples) {
    if (sample.lineHeight > 0) {
      ratios.push(sample.lineHeight / sample.size);
    }
  }

  if (ratios.length === 0) {
    return DEFAULT_TYPOGRAPHY.lineHeights;
  }

  // 排序
  ratios.sort((a, b) => a - b);

  // 分位数
  const tight = ratios[Math.floor(ratios.length * 0.2)] || 1.25;
  const normal = ratios[Math.floor(ratios.length * 0.5)] || 1.5;
  const relaxed = ratios[Math.floor(ratios.length * 0.8)] || 1.75;

  return {
    tight: tight.toFixed(2),
    normal: normal.toFixed(2),
    relaxed: relaxed.toFixed(2),
  };
}

/**
 * 计算字体推断置信度
 */
function calculateTypographyConfidence(
  distinctSizes: number,
  totalSamples: number
): number {
  let score = 0.5;

  // 字号数量加分
  if (distinctSizes >= 3) score += 0.1;
  if (distinctSizes >= 5) score += 0.1;
  if (distinctSizes >= 7) score += 0.1;

  // 样本数量加分
  if (totalSamples >= 10) score += 0.1;
  if (totalSamples >= 20) score += 0.1;

  return Math.min(score, 1.0);
}

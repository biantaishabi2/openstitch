# Figma Frontend 架构设计

## 概述

Figma Frontend 是 Stitch 编译器的扩展前端，将 Figma 设计稿（包括不规范的文件）编译为工程级代码。

**核心挑战**：现实中的 Figma 文件往往不规范——没有 Local Styles、图层命名混乱、布局靠手拖。我们需要从这些"脏数据"中提取可用的视觉和结构信息。

**解决思路**：两路并行推断，各自容错，汇合出货。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Figma Frontend                                   │
│                                                                          │
│  Figma File（可能不规范）                                                │
│      │                                                                   │
│      ├─────────────────────────────────────────────┐                    │
│      ▼                                             ▼                    │
│  ┌─────────────────────────┐         ┌─────────────────────────┐        │
│  │   视觉推断器             │         │   结构推断器             │        │
│  │   (Visual Inferrer)     │         │   (Structure Inferrer)  │        │
│  │                         │         │                         │        │
│  │   Styles → 统计 → 规范化 │  并行   │   规则 → 启发式 → AI     │        │
│  │   三层容错              │  ════   │   三层容错              │        │
│  └───────────┬─────────────┘         └───────────┬─────────────┘        │
│              │                                   │                      │
│              ▼                                   ▼                      │
│        Design Tokens                        推断的 DSL                  │
│        (规范化后)                            (带置信度)                  │
│              │                                   │                      │
└──────────────┼───────────────────────────────────┼──────────────────────┘
               │                                   │
               │                                   ▼
               │                        ┌─────────────────────┐
               │                        │ 现有逻辑引擎         │
               │                        │ (100% 复用)         │
               │                        └──────────┬──────────┘
               │                                   │
               └───────────────┬───────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ 现有组件工厂 + SSR   │
                    │ (100% 复用)         │
                    └──────────┬──────────┘
                               ▼
                         工程级代码
```

---

## 第一部分：视觉推断器 (Visual Inferrer)

### 1.1 问题：蹩脚设计师的 Figma 文件

理想情况 vs 现实情况：

| 类别 | 理想做法 | 蹩脚做法 | 后果 |
|------|----------|----------|------|
| 颜色 | 用 Local Styles 定义色板 | 颜色直接写死在图层 | #2563eb、#2564eb、#2562ea 三个版本 |
| 字体 | 用 Text Styles 定义规范 | 每次手动输入字号 | 15px、17px、19px 随意用 |
| 间距 | 用 Auto Layout | 手动拖拽定位 | 7px、9px、11px 乱七八糟 |
| 阴影 | 用 Effect Styles | 每次手动加阴影 | blur 4px、5px、6px 各不相同 |
| 圆角 | 统一圆角值 | 随意设置 | 5px、6px、7px、8px 混用 |
| 组件 | 用 Component 复用 | 复制粘贴 | 20 个"按钮"，每个略有差异 |

### 1.2 解决方案：三层容错架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  视觉推断器：三层容错                                                    │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  第一层：Local Styles 提取                                         │  │
│  │                                                                    │  │
│  │  条件：Figma 文件定义了 Local Styles                               │  │
│  │  动作：直接提取，作为 Tokens 来源                                   │  │
│  │  置信度：1.0（最可信）                                              │  │
│  │                                                                    │  │
│  │  提取内容：                                                        │  │
│  │  - Color Styles → ColorTokens                                     │  │
│  │  - Text Styles → TypographyTokens                                 │  │
│  │  - Effect Styles → ShapeTokens (shadows)                          │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼ 如果没有 Styles 或 Styles 不完整     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  第二层：统计 + 聚类                                               │  │
│  │                                                                    │  │
│  │  条件：没有 Local Styles，或 Styles 不完整                         │  │
│  │  动作：从图层属性采样，统计分析，聚类合并                           │  │
│  │  置信度：0.8（较可信）                                              │  │
│  │                                                                    │  │
│  │  算法：                                                            │  │
│  │  1. 遍历所有可见图层，采集颜色/字号/间距/圆角/阴影                  │  │
│  │  2. 聚类合并相近值（ΔE < 3 的颜色、±2px 的尺寸）                   │  │
│  │  3. 按使用频率排序                                                 │  │
│  │  4. 最高频 → primary，次高频 → secondary                          │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼ 如果值太杂乱无规律                   │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  第三层：强制规范化 + 默认值                                       │  │
│  │                                                                    │  │
│  │  条件：采样值太分散，无法形成有效聚类                               │  │
│  │  动作：强制对齐到标准栅格，使用默认 Tokens                          │  │
│  │  置信度：0.5（需人工复核）                                          │  │
│  │                                                                    │  │
│  │  规范化规则：                                                      │  │
│  │  - 字号对齐：15px → 14px, 17px → 16px, 19px → 20px                │  │
│  │  - 间距对齐：7px → 8px, 11px → 12px (4px 栅格)                     │  │
│  │  - 圆角对齐：5px → 4px, 7px → 8px                                  │  │
│  │  - 颜色：取最常用的，其余丢弃                                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  输出：DesignTokens + 置信度 + 警告列表                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 颜色推断算法

#### 1.3.1 颜色采集

```typescript
interface ColorSample {
  hex: string;           // #2563eb
  lab: [number, number, number];  // LAB 色彩空间
  source: 'fill' | 'stroke' | 'text' | 'shadow';
  nodeId: string;
  frequency: number;     // 使用次数
}

function collectColors(nodes: FigmaNode[]): ColorSample[] {
  const samples: ColorSample[] = [];

  for (const node of nodes) {
    // 跳过不可见图层
    if (node.visible === false) continue;

    // 提取填充色
    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.visible !== false && fill.type === 'SOLID') {
          samples.push({
            hex: rgbToHex(fill.color),
            lab: rgbToLab(fill.color),
            source: 'fill',
            nodeId: node.id,
            frequency: 1,
          });
        }
      }
    }

    // 类似处理 strokes、text colors、shadow colors...
  }

  return samples;
}
```

#### 1.3.2 颜色聚类

```typescript
interface ColorCluster {
  representative: string;  // 代表色（使用最多的）
  members: string[];       // 聚类成员
  totalFrequency: number;  // 总使用次数
  avgLab: [number, number, number];
}

function clusterColors(samples: ColorSample[]): ColorCluster[] {
  // 使用 DBSCAN 或简单的层次聚类
  // 距离度量：CIE76 色差 ΔE

  const clusters: ColorCluster[] = [];
  const visited = new Set<string>();

  for (const sample of samples) {
    if (visited.has(sample.hex)) continue;

    // 找出所有相近颜色（ΔE < 3）
    const neighbors = samples.filter(s =>
      deltaE(sample.lab, s.lab) < 3
    );

    if (neighbors.length > 0) {
      // 按频率排序，取最常用的作为代表
      neighbors.sort((a, b) => b.frequency - a.frequency);

      clusters.push({
        representative: neighbors[0].hex,
        members: neighbors.map(n => n.hex),
        totalFrequency: neighbors.reduce((sum, n) => sum + n.frequency, 0),
        avgLab: averageLab(neighbors),
      });

      neighbors.forEach(n => visited.add(n.hex));
    }
  }

  // 按总频率排序
  return clusters.sort((a, b) => b.totalFrequency - a.totalFrequency);
}

// CIE76 色差公式
function deltaE(lab1: number[], lab2: number[]): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}
```

#### 1.3.3 颜色角色分配

```typescript
interface ColorAssignment {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

function assignColorRoles(clusters: ColorCluster[]): ColorAssignment {
  // 分类：彩色 vs 中性色
  const chromatic = clusters.filter(c => isChromatic(c.avgLab));  // 饱和度 > 10
  const neutral = clusters.filter(c => !isChromatic(c.avgLab));   // 灰色系

  // 彩色排序：按频率
  // 中性色排序：按明度
  neutral.sort((a, b) => a.avgLab[0] - b.avgLab[0]);  // L 从暗到亮

  return {
    // 彩色：使用最多的 → primary
    primary: chromatic[0]?.representative || '#3b82f6',
    secondary: chromatic[1]?.representative || '#6b7280',
    accent: chromatic[2]?.representative || '#f59e0b',

    // 中性色：最亮的 → background，最暗的 → foreground
    background: neutral[neutral.length - 1]?.representative || '#ffffff',
    foreground: neutral[0]?.representative || '#1f2937',
    muted: neutral[Math.floor(neutral.length * 0.8)]?.representative || '#f3f4f6',
    border: neutral[Math.floor(neutral.length * 0.6)]?.representative || '#e5e7eb',
  };
}

function isChromatic(lab: number[]): boolean {
  // a* 和 b* 的绝对值都小于 10 认为是中性色
  return Math.abs(lab[1]) > 10 || Math.abs(lab[2]) > 10;
}
```

#### 1.3.4 色阶生成

```typescript
interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // 基准色
  600: string;
  700: string;
  800: string;
  900: string;
}

function generateColorScale(baseColor: string): ColorScale {
  const hsl = hexToHSL(baseColor);

  // 保持色相和饱和度，只调整明度
  return {
    50:  hslToHex({ h: hsl.h, s: Math.max(hsl.s - 30, 10), l: 97 }),
    100: hslToHex({ h: hsl.h, s: Math.max(hsl.s - 20, 15), l: 94 }),
    200: hslToHex({ h: hsl.h, s: Math.max(hsl.s - 10, 20), l: 86 }),
    300: hslToHex({ h: hsl.h, s: hsl.s, l: 74 }),
    400: hslToHex({ h: hsl.h, s: hsl.s, l: 60 }),
    500: baseColor,  // 基准色
    600: hslToHex({ h: hsl.h, s: Math.min(hsl.s + 5, 100), l: Math.max(hsl.l - 10, 20) }),
    700: hslToHex({ h: hsl.h, s: Math.min(hsl.s + 10, 100), l: Math.max(hsl.l - 20, 15) }),
    800: hslToHex({ h: hsl.h, s: Math.min(hsl.s + 15, 100), l: Math.max(hsl.l - 30, 10) }),
    900: hslToHex({ h: hsl.h, s: Math.min(hsl.s + 20, 100), l: Math.max(hsl.l - 40, 5) }),
  };
}
```

### 1.4 字体推断算法

#### 1.4.1 字号采集与聚类

```typescript
interface FontSizeSample {
  size: number;
  weight: number;
  nodeId: string;
  frequency: number;
}

function clusterFontSizes(samples: FontSizeSample[]): Map<number, number> {
  // 聚类规则：±2px 算同一档
  const clusters = new Map<number, number>();  // 代表值 → 总频率

  // 按字号排序
  const sorted = [...samples].sort((a, b) => a.size - b.size);

  let clusterStart = sorted[0]?.size || 16;
  let clusterFreq = 0;

  for (const sample of sorted) {
    if (sample.size - clusterStart <= 2) {
      // 属于当前聚类
      clusterFreq += sample.frequency;
    } else {
      // 保存当前聚类，开始新聚类
      const representative = normalizeToGrid(clusterStart, 2);  // 对齐到 2px
      clusters.set(representative, clusterFreq);

      clusterStart = sample.size;
      clusterFreq = sample.frequency;
    }
  }

  // 保存最后一个聚类
  if (clusterFreq > 0) {
    clusters.set(normalizeToGrid(clusterStart, 2), clusterFreq);
  }

  return clusters;
}
```

#### 1.4.2 字阶比率检测

```typescript
type TypeScale = 'minor-second' | 'major-second' | 'minor-third' |
                 'major-third' | 'perfect-fourth' | 'golden-ratio';

const SCALE_RATIOS: Record<TypeScale, number> = {
  'minor-second': 1.067,
  'major-second': 1.125,
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'golden-ratio': 1.618,
};

function detectTypeScale(fontSizes: number[]): TypeScale {
  // 按大小排序
  const sorted = [...new Set(fontSizes)].sort((a, b) => a - b);

  if (sorted.length < 2) return 'major-second';  // 默认

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
```

#### 1.4.3 标准化字号序列

```typescript
interface TypographyTokens {
  scale: TypeScale;
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
}

function normalizeTypography(samples: FontSizeSample[]): TypographyTokens {
  const clusters = clusterFontSizes(samples);
  const sizes = [...clusters.keys()].sort((a, b) => a - b);
  const scale = detectTypeScale(sizes);

  // 标准字号序列
  const STANDARD_SIZES = [12, 14, 16, 18, 20, 24, 30, 36, 48];

  // 将检测到的字号映射到标准序列
  function mapToStandard(size: number): number {
    return STANDARD_SIZES.reduce((prev, curr) =>
      Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
    );
  }

  // 找到 base（使用最多的字号，通常是正文）
  const baseSize = [...clusters.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 16;

  const normalizedBase = mapToStandard(baseSize);

  return {
    scale,
    fontSizes: {
      xs: '12px',
      sm: '14px',
      base: `${normalizedBase}px`,
      lg: `${mapToStandard(normalizedBase * SCALE_RATIOS[scale])}px`,
      xl: `${mapToStandard(normalizedBase * Math.pow(SCALE_RATIOS[scale], 2))}px`,
      '2xl': `${mapToStandard(normalizedBase * Math.pow(SCALE_RATIOS[scale], 3))}px`,
      '3xl': `${mapToStandard(normalizedBase * Math.pow(SCALE_RATIOS[scale], 4))}px`,
    },
  };
}
```

### 1.5 间距推断算法

#### 1.5.1 间距采集

```typescript
interface SpacingSample {
  value: number;
  type: 'padding' | 'gap' | 'margin';
  nodeId: string;
  frequency: number;
}

function collectSpacings(nodes: FigmaNode[]): SpacingSample[] {
  const samples: SpacingSample[] = [];

  for (const node of nodes) {
    if (node.visible === false) continue;

    // 从 Auto Layout 提取
    if (node.paddingLeft) samples.push({ value: node.paddingLeft, type: 'padding', nodeId: node.id, frequency: 1 });
    if (node.paddingRight) samples.push({ value: node.paddingRight, type: 'padding', nodeId: node.id, frequency: 1 });
    if (node.paddingTop) samples.push({ value: node.paddingTop, type: 'padding', nodeId: node.id, frequency: 1 });
    if (node.paddingBottom) samples.push({ value: node.paddingBottom, type: 'padding', nodeId: node.id, frequency: 1 });
    if (node.itemSpacing) samples.push({ value: node.itemSpacing, type: 'gap', nodeId: node.id, frequency: 1 });
  }

  return samples;
}
```

#### 1.5.2 栅格检测与对齐

```typescript
interface SpacingTokens {
  baseUnit: number;  // 4 或 8
  values: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

function inferSpacing(samples: SpacingSample[]): SpacingTokens {
  const values = samples.map(s => s.value);

  // 检测栅格基数
  const baseUnit = detectGridUnit(values);

  // 对齐到栅格
  const aligned = values.map(v => Math.round(v / baseUnit) * baseUnit);

  // 去重并排序
  const unique = [...new Set(aligned)].sort((a, b) => a - b);

  // 选择 5 个代表值
  return {
    baseUnit,
    values: {
      xs: `${unique[0] || baseUnit}px`,
      sm: `${unique[1] || baseUnit * 2}px`,
      md: `${unique[2] || baseUnit * 4}px`,
      lg: `${unique[3] || baseUnit * 6}px`,
      xl: `${unique[4] || baseUnit * 8}px`,
    },
  };
}

function detectGridUnit(values: number[]): number {
  // 计算所有值的最大公约数
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const rounded = values.map(v => Math.round(v));
  const result = rounded.reduce((acc, val) => gcd(acc, val), rounded[0] || 4);

  // 常见栅格：4px 或 8px
  if (result >= 4 && result <= 8) return result;
  if (result > 8 && result % 8 === 0) return 8;
  if (result > 4 && result % 4 === 0) return 4;
  return 4;  // 默认
}
```

### 1.6 阴影与圆角推断

```typescript
interface ShapeSample {
  radius: number;
  shadow?: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  nodeId: string;
}

function inferShape(samples: ShapeSample[]): ShapeTokens {
  // 圆角聚类
  const radii = samples.map(s => s.radius).filter(r => r > 0);
  const clusteredRadii = clusterValues(radii, 2);  // ±2px 聚类
  const sortedRadii = [...clusteredRadii].sort((a, b) => a - b);

  // 阴影分级（按 blur 值）
  const shadows = samples.map(s => s.shadow).filter(Boolean);
  const shadowsByBlur = new Map<string, typeof shadows[0]>();

  for (const shadow of shadows) {
    if (shadow.blur <= 4) shadowsByBlur.set('sm', shadow);
    else if (shadow.blur <= 10) shadowsByBlur.set('md', shadow);
    else shadowsByBlur.set('lg', shadow);
  }

  return {
    radius: {
      sm: `${sortedRadii[0] || 4}px`,
      md: `${sortedRadii[Math.floor(sortedRadii.length / 2)] || 8}px`,
      lg: `${sortedRadii[sortedRadii.length - 1] || 12}px`,
      full: '9999px',
    },
    shadow: {
      sm: shadowToCSS(shadowsByBlur.get('sm')) || '0 1px 2px rgba(0,0,0,0.05)',
      md: shadowToCSS(shadowsByBlur.get('md')) || '0 4px 6px rgba(0,0,0,0.1)',
      lg: shadowToCSS(shadowsByBlur.get('lg')) || '0 10px 15px rgba(0,0,0,0.1)',
    },
  };
}
```

### 1.7 视觉推断器完整流程

```typescript
interface VisualInferenceResult {
  tokens: DesignTokens;
  confidence: number;           // 0-1
  sources: {
    colors: 'styles' | 'sampled' | 'default';
    typography: 'styles' | 'sampled' | 'default';
    spacing: 'autolayout' | 'sampled' | 'default';
    shapes: 'styles' | 'sampled' | 'default';
  };
  warnings: string[];
}

async function inferVisuals(
  fileId: string,
  nodes: FigmaNode[],
  styles: FigmaStyles | null
): Promise<VisualInferenceResult> {
  const warnings: string[] = [];
  let overallConfidence = 1.0;

  // === 颜色 ===
  let colors: ColorAssignment;
  let colorSource: 'styles' | 'sampled' | 'default';

  if (styles?.colors && Object.keys(styles.colors).length >= 3) {
    // 第一层：从 Styles 提取
    colors = extractColorsFromStyles(styles.colors);
    colorSource = 'styles';
  } else {
    // 第二层：统计采样
    const samples = collectColors(nodes);
    const clusters = clusterColors(samples);

    if (clusters.length >= 3) {
      colors = assignColorRoles(clusters);
      colorSource = 'sampled';
      overallConfidence *= 0.8;
      warnings.push('Colors inferred from layer sampling, not Local Styles');
    } else {
      // 第三层：使用默认
      colors = DEFAULT_COLORS;
      colorSource = 'default';
      overallConfidence *= 0.5;
      warnings.push('Using default colors - insufficient color information in design');
    }
  }

  // === 排版 ===
  let typography: TypographyTokens;
  let typographySource: 'styles' | 'sampled' | 'default';

  if (styles?.text && Object.keys(styles.text).length >= 3) {
    typography = extractTypographyFromStyles(styles.text);
    typographySource = 'styles';
  } else {
    const samples = collectFontSizes(nodes);
    if (samples.length >= 5) {
      typography = normalizeTypography(samples);
      typographySource = 'sampled';
      overallConfidence *= 0.8;
      warnings.push('Typography inferred from text layers, not Text Styles');
    } else {
      typography = DEFAULT_TYPOGRAPHY;
      typographySource = 'default';
      overallConfidence *= 0.5;
      warnings.push('Using default typography - insufficient text information');
    }
  }

  // === 间距 ===
  let spacing: SpacingTokens;
  let spacingSource: 'autolayout' | 'sampled' | 'default';

  const spacingSamples = collectSpacings(nodes);
  if (spacingSamples.length >= 5) {
    spacing = inferSpacing(spacingSamples);
    spacingSource = spacingSamples.some(s => s.type === 'gap') ? 'autolayout' : 'sampled';
    if (spacingSource === 'sampled') {
      overallConfidence *= 0.8;
      warnings.push('Spacing inferred from measurements, not Auto Layout');
    }
  } else {
    spacing = DEFAULT_SPACING;
    spacingSource = 'default';
    overallConfidence *= 0.5;
    warnings.push('Using default spacing - insufficient layout information');
  }

  // === 形状 ===
  let shapes: ShapeTokens;
  let shapesSource: 'styles' | 'sampled' | 'default';

  if (styles?.effects && Object.keys(styles.effects).length >= 1) {
    shapes = extractShapesFromStyles(styles.effects, nodes);
    shapesSource = 'styles';
  } else {
    const samples = collectShapes(nodes);
    if (samples.length >= 3) {
      shapes = inferShape(samples);
      shapesSource = 'sampled';
      overallConfidence *= 0.9;
    } else {
      shapes = DEFAULT_SHAPES;
      shapesSource = 'default';
      overallConfidence *= 0.7;
    }
  }

  // 组装 DesignTokens
  const tokens = assembleDesignTokens(colors, typography, spacing, shapes);

  return {
    tokens,
    confidence: overallConfidence,
    sources: {
      colors: colorSource,
      typography: typographySource,
      spacing: spacingSource,
      shapes: shapesSource,
    },
    warnings,
  };
}
```

---

## 第二部分：结构推断器 (Structure Inferrer)

### 2.1 问题：混乱的图层结构

| 理想结构 | 蹩脚结构 |
|----------|----------|
| `Button/Primary/Large` | `Rectangle 243` |
| `Card/ProductCard` | `Frame 1847` |
| `Header/Navigation` | `Group 12` |
| 清晰的 Auto Layout 嵌套 | 绝对定位乱七八糟 |

### 2.2 解决方案：三层推断架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  结构推断器：三层推断                                                    │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  第一层：规则引擎 (Rule Engine)                                    │  │
│  │                                                                    │  │
│  │  条件：节点有明确的类型标识（Component 实例、命名规范）              │  │
│  │  置信度：0.95+                                                     │  │
│  │                                                                    │  │
│  │  规则：                                                            │  │
│  │  - Component Instance "Button/*" → Button                         │  │
│  │  - TEXT + fontSize >= 24 → Heading                                │  │
│  │  - FRAME + layoutMode="VERTICAL" → Section                        │  │
│  │  - 名称含 "card/Card" → Card                                      │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │ 未匹配的节点                        │
│                                   ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  第二层：启发式引擎 (Heuristic Engine)                             │  │
│  │                                                                    │  │
│  │  条件：无明确标识，但有可识别的视觉特征                             │  │
│  │  置信度：0.6-0.9                                                   │  │
│  │                                                                    │  │
│  │  启发式规则：                                                      │  │
│  │  - 圆角矩形 + 居中文本 + 固定尺寸 → Button (0.85)                  │  │
│  │  - 圆角 + 阴影 + padding + 多子节点 → Card (0.9)                   │  │
│  │  - 矩形 + 边框 + 单行文本 → Input (0.8)                            │  │
│  │  - 等宽列 + 重复行结构 → Table (0.7)                               │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │ 仍有歧义的节点                      │
│                                   ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  第三层：AI 引擎 (AI Engine)                                       │  │
│  │                                                                    │  │
│  │  条件：规则和启发式都无法确定                                       │  │
│  │  置信度：取决于 AI 输出                                            │  │
│  │                                                                    │  │
│  │  输入：节点截图 + 元数据                                           │  │
│  │  模型：Gemini / Claude 多模态                                      │  │
│  │  输出：组件类型 + DSL 片段                                         │  │
│  │                                                                    │  │
│  │  降级：AI 不可用时 → div + 绝对定位                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  输出：DSL + 置信度 + 节点映射                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 规则引擎

```typescript
interface RuleMatch {
  componentType: string;
  confidence: number;
  rule: string;
}

const COMPONENT_RULES: Array<{
  name: string;
  match: (node: FigmaNode) => boolean;
  componentType: string;
  confidence: number;
}> = [
  // Component 实例规则
  {
    name: 'component-button',
    match: (node) => node.type === 'INSTANCE' && /button/i.test(node.name),
    componentType: 'Button',
    confidence: 0.98,
  },
  {
    name: 'component-card',
    match: (node) => node.type === 'INSTANCE' && /card/i.test(node.name),
    componentType: 'Card',
    confidence: 0.98,
  },
  {
    name: 'component-input',
    match: (node) => node.type === 'INSTANCE' && /input|field|textfield/i.test(node.name),
    componentType: 'Input',
    confidence: 0.98,
  },

  // 类型规则
  {
    name: 'text-heading',
    match: (node) => node.type === 'TEXT' && (node.style?.fontSize || 0) >= 24,
    componentType: 'Heading',
    confidence: 0.95,
  },
  {
    name: 'text-paragraph',
    match: (node) => node.type === 'TEXT' && (node.style?.fontSize || 0) < 24,
    componentType: 'Text',
    confidence: 0.95,
  },
  {
    name: 'image-rectangle',
    match: (node) => node.type === 'RECTANGLE' && hasImageFill(node),
    componentType: 'Image',
    confidence: 0.95,
  },
  {
    name: 'icon-vector',
    match: (node) => node.type === 'VECTOR' && isIconSize(node),
    componentType: 'Icon',
    confidence: 0.9,
  },

  // 布局规则
  {
    name: 'layout-section',
    match: (node) => node.type === 'FRAME' && node.layoutMode === 'VERTICAL',
    componentType: 'Section',
    confidence: 0.85,
  },
  {
    name: 'layout-row',
    match: (node) => node.type === 'FRAME' && node.layoutMode === 'HORIZONTAL',
    componentType: 'Row',
    confidence: 0.85,
  },
];

function applyRules(node: FigmaNode): RuleMatch | null {
  for (const rule of COMPONENT_RULES) {
    if (rule.match(node)) {
      return {
        componentType: rule.componentType,
        confidence: rule.confidence,
        rule: rule.name,
      };
    }
  }
  return null;
}
```

### 2.4 启发式引擎

```typescript
interface HeuristicMatch {
  componentType: string;
  confidence: number;
  features: string[];
}

function applyHeuristics(node: FigmaNode): HeuristicMatch | null {
  const features: string[] = [];
  let scores: Record<string, number> = {};

  // 收集特征
  if (hasRoundedCorners(node)) features.push('rounded');
  if (hasShadow(node)) features.push('shadow');
  if (hasBorder(node)) features.push('border');
  if (hasCenteredText(node)) features.push('centered-text');
  if (hasFixedSize(node)) features.push('fixed-size');
  if (hasPadding(node)) features.push('padding');
  if (hasMultipleChildren(node)) features.push('multi-children');

  // Button 特征：圆角 + 居中文本 + 固定尺寸
  if (features.includes('rounded') &&
      features.includes('centered-text') &&
      features.includes('fixed-size')) {
    scores['Button'] = (scores['Button'] || 0) + 0.85;
  }

  // Card 特征：圆角 + 阴影 + padding + 多子节点
  if (features.includes('rounded') &&
      features.includes('shadow') &&
      features.includes('padding') &&
      features.includes('multi-children')) {
    scores['Card'] = (scores['Card'] || 0) + 0.9;
  }

  // Input 特征：矩形 + 边框 + 单子节点（文本）
  if (features.includes('border') &&
      !features.includes('multi-children')) {
    scores['Input'] = (scores['Input'] || 0) + 0.8;
  }

  // 选择得分最高的
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  if (best && best[1] >= 0.6) {
    return {
      componentType: best[0],
      confidence: best[1],
      features,
    };
  }

  return null;
}

// 特征检测函数
function hasRoundedCorners(node: FigmaNode): boolean {
  return (node.cornerRadius || 0) >= 4 ||
         (node.rectangleCornerRadii?.some(r => r >= 4) || false);
}

function hasShadow(node: FigmaNode): boolean {
  return node.effects?.some(e => e.type === 'DROP_SHADOW' && e.visible !== false) || false;
}

function hasCenteredText(node: FigmaNode): boolean {
  if (node.type !== 'FRAME' || !node.children) return false;
  const textChild = node.children.find(c => c.type === 'TEXT');
  return textChild?.style?.textAlignHorizontal === 'CENTER';
}

function hasFixedSize(node: FigmaNode): boolean {
  const { width, height } = node.absoluteBoundingBox || { width: 0, height: 0 };
  // 按钮通常宽度 60-300，高度 30-60
  return width >= 60 && width <= 300 && height >= 30 && height <= 60;
}

function hasMultipleChildren(node: FigmaNode): boolean {
  return (node.children?.length || 0) >= 2;
}
```

### 2.5 AI 引擎

```typescript
interface AIInferenceResult {
  componentType: string;
  confidence: number;
  dsl: string;
  reasoning: string;
}

async function inferWithAI(
  node: FigmaNode,
  screenshot: Buffer
): Promise<AIInferenceResult | null> {
  const prompt = `
你是一个 UI 组件识别专家。请分析这个截图并识别它是什么 UI 组件。

节点信息：
- 名称：${node.name}
- 类型：${node.type}
- 尺寸：${node.absoluteBoundingBox.width}x${node.absoluteBoundingBox.height}
- 子节点数量：${node.children?.length || 0}

请返回 JSON 格式：
{
  "componentType": "Button|Card|Input|Table|Modal|...",
  "confidence": 0.0-1.0,
  "dsl": "[ComponentType: id] ... [/ComponentType]",
  "reasoning": "判断依据"
}
`;

  try {
    const response = await aiClient.generateContent({
      model: 'gemini-pro-vision',
      contents: [
        { role: 'user', parts: [{ text: prompt }, { image: screenshot }] }
      ],
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.warn('AI inference failed:', error);
    return null;
  }
}
```

### 2.6 布局推断

```typescript
interface LayoutInfo {
  type: 'flex' | 'grid' | 'absolute';
  direction?: 'row' | 'column';
  gap?: string;
  align?: string;
  justify?: string;
}

function inferLayout(node: FigmaNode): LayoutInfo {
  // 优先使用 Auto Layout 信息
  if (node.layoutMode === 'HORIZONTAL') {
    return {
      type: 'flex',
      direction: 'row',
      gap: `${node.itemSpacing || 0}px`,
      align: mapCounterAxisAlign(node.counterAxisAlignItems),
      justify: mapPrimaryAxisAlign(node.primaryAxisAlignItems),
    };
  }

  if (node.layoutMode === 'VERTICAL') {
    return {
      type: 'flex',
      direction: 'column',
      gap: `${node.itemSpacing || 0}px`,
      align: mapCounterAxisAlign(node.counterAxisAlignItems),
    };
  }

  // 没有 Auto Layout，从位置关系推断
  if (!node.children || node.children.length < 2) {
    return { type: 'absolute' };
  }

  return inferLayoutFromPositions(node.children);
}

function inferLayoutFromPositions(children: FigmaNode[]): LayoutInfo {
  // 检查是否水平排列
  const sortedByX = [...children].sort((a, b) => a.absoluteBoundingBox.x - b.absoluteBoundingBox.x);
  const horizontalGaps = calculateGaps(sortedByX, 'x');

  if (isConsistentGaps(horizontalGaps)) {
    return {
      type: 'flex',
      direction: 'row',
      gap: `${average(horizontalGaps)}px`,
    };
  }

  // 检查是否垂直排列
  const sortedByY = [...children].sort((a, b) => a.absoluteBoundingBox.y - b.absoluteBoundingBox.y);
  const verticalGaps = calculateGaps(sortedByY, 'y');

  if (isConsistentGaps(verticalGaps)) {
    return {
      type: 'flex',
      direction: 'column',
      gap: `${average(verticalGaps)}px`,
    };
  }

  // 检查是否网格排列
  if (isGridPattern(children)) {
    return { type: 'grid' };
  }

  // 降级为绝对定位
  return { type: 'absolute' };
}

function isConsistentGaps(gaps: number[]): boolean {
  if (gaps.length === 0) return false;
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  // 允许 20% 的误差
  return gaps.every(g => Math.abs(g - avg) / avg < 0.2);
}
```

### 2.7 DSL 生成

```typescript
interface DSLGeneratorResult {
  dsl: string;
  nodeMapping: Map<string, string>;  // Figma nodeId → DSL path
}

function generateDSL(
  node: FigmaNode,
  inference: ComponentInference,
  depth = 0
): DSLGeneratorResult {
  const indent = '  '.repeat(depth);
  const nodeMapping = new Map<string, string>();

  const id = sanitizeId(node.name || node.id);
  const path = `/${inference.componentType}:${id}`;
  nodeMapping.set(node.id, path);

  let dsl = `${indent}[${inference.componentType}: ${id}]\n`;

  // 添加属性
  const attrs = generateAttrs(node, inference);
  if (attrs.length > 0) {
    dsl += `${indent}  ATTR: ${attrs.join(', ')}\n`;
  }

  // 添加布局属性
  const layout = inferLayout(node);
  if (layout.type !== 'absolute') {
    dsl += `${indent}  { Layout: "${layout.type}", Direction: "${layout.direction || 'column'}"`;
    if (layout.gap) dsl += `, Gap: "${layout.gap}"`;
    dsl += ` }\n`;
  }

  // 递归处理子节点
  if (node.children) {
    for (const child of node.children) {
      if (child.visible === false) continue;

      const childInference = inferComponent(child);
      const childResult = generateDSL(child, childInference, depth + 1);
      dsl += childResult.dsl;

      for (const [k, v] of childResult.nodeMapping) {
        nodeMapping.set(k, `${path}${v}`);
      }
    }
  }

  dsl += `${indent}[/${inference.componentType}]\n`;

  return { dsl, nodeMapping };
}

function generateAttrs(node: FigmaNode, inference: ComponentInference): string[] {
  const attrs: string[] = [];

  switch (inference.componentType) {
    case 'Button':
      const buttonText = getTextContent(node);
      if (buttonText) attrs.push(`Text("${escape(buttonText)}")`);
      break;

    case 'Heading':
    case 'Text':
      const text = getTextContent(node);
      if (text) attrs.push(`Content("${escape(text)}")`);
      break;

    case 'Image':
      attrs.push(`Src("${node.id}")`);  // 后续替换为实际 URL
      break;

    case 'Input':
      const placeholder = getPlaceholderText(node);
      if (placeholder) attrs.push(`Placeholder("${escape(placeholder)}")`);
      break;
  }

  return attrs;
}
```

---

## 第三部分：整体流程

### 3.1 主入口

```typescript
interface FigmaCompileResult {
  // 编译结果
  html: string;
  css: string;

  // 推断信息
  visual: {
    tokens: DesignTokens;
    confidence: number;
    sources: Record<string, string>;
    warnings: string[];
  };
  structure: {
    dsl: string;
    confidence: number;
    nodeMapping: Map<string, string>;
    warnings: string[];
  };

  // 元信息
  meta: {
    fileId: string;
    fileName: string;
    processingTime: number;
  };
}

async function compileFromFigma(
  fileId: string,
  options: FigmaCompileOptions = {}
): Promise<FigmaCompileResult> {
  const startTime = performance.now();

  // 1. 获取 Figma 文件
  const { file, styles } = await fetchFigmaFile(fileId, options.accessToken);

  // 2. 过滤有效节点
  const validNodes = filterValidNodes(file.document);

  // 3. 两路并行
  const [visualResult, structureResult] = await Promise.all([
    inferVisuals(fileId, validNodes, styles),
    inferStructure(validNodes, options),
  ]);

  // 4. 进入现有编译器
  const compileResult = await compile(structureResult.dsl, {
    tokens: visualResult.tokens,
    ssr: { title: file.name },
  });

  return {
    html: compileResult.ssr.html,
    css: compileResult.ssr.css,
    visual: visualResult,
    structure: structureResult,
    meta: {
      fileId,
      fileName: file.name,
      processingTime: performance.now() - startTime,
    },
  };
}
```

### 3.2 置信度与警告

```typescript
interface ConfidenceReport {
  overall: number;
  visual: number;
  structure: number;
  breakdown: {
    colors: { confidence: number; source: string };
    typography: { confidence: number; source: string };
    spacing: { confidence: number; source: string };
    components: { confidence: number; method: string }[];
  };
  warnings: string[];
  recommendations: string[];
}

function generateConfidenceReport(
  visualResult: VisualInferenceResult,
  structureResult: StructureInferenceResult
): ConfidenceReport {
  const overall = visualResult.confidence * 0.4 + structureResult.confidence * 0.6;

  const recommendations: string[] = [];

  if (visualResult.sources.colors !== 'styles') {
    recommendations.push('建议在 Figma 中定义 Color Styles 以提高颜色准确性');
  }
  if (visualResult.sources.typography !== 'styles') {
    recommendations.push('建议在 Figma 中定义 Text Styles 以统一排版');
  }
  if (structureResult.aiCallCount > 5) {
    recommendations.push('建议规范 Figma 组件命名以减少 AI 推断依赖');
  }

  return {
    overall,
    visual: visualResult.confidence,
    structure: structureResult.confidence,
    breakdown: {
      colors: { confidence: getSourceConfidence(visualResult.sources.colors), source: visualResult.sources.colors },
      typography: { confidence: getSourceConfidence(visualResult.sources.typography), source: visualResult.sources.typography },
      spacing: { confidence: getSourceConfidence(visualResult.sources.spacing), source: visualResult.sources.spacing },
      components: structureResult.componentConfidences,
    },
    warnings: [...visualResult.warnings, ...structureResult.warnings],
    recommendations,
  };
}
```

---

## 第四部分：默认值与降级

### 4.1 默认 Design Tokens

```typescript
const DEFAULT_COLORS: ColorAssignment = {
  primary: '#3b82f6',      // Blue 500
  secondary: '#6b7280',    // Gray 500
  accent: '#f59e0b',       // Amber 500
  background: '#ffffff',
  foreground: '#1f2937',   // Gray 800
  muted: '#f3f4f6',        // Gray 100
  border: '#e5e7eb',       // Gray 200
};

const DEFAULT_TYPOGRAPHY: TypographyTokens = {
  scale: 'major-second',
  fontSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
};

const DEFAULT_SPACING: SpacingTokens = {
  baseUnit: 4,
  values: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

const DEFAULT_SHAPES: ShapeTokens = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
};
```

### 4.2 降级策略

| 场景 | 降级方案 | 输出 |
|------|----------|------|
| 无 Color Styles | 采样 + 聚类 → 使用默认 | ColorTokens + warning |
| 无 Text Styles | 采样 + 推断 → 使用默认 | TypographyTokens + warning |
| 无 Auto Layout | 位置推断 → 绝对定位 | Layout + warning |
| 组件无法识别 | AI 推断 → div 降级 | DSL + warning |
| AI 服务不可用 | div + 绝对定位 | DSL + error |

---

## 章节索引

| 章节 | 内容 |
|------|------|
| 概述 | 整体架构和核心挑战 |
| 第一部分：视觉推断器 | 三层容错、颜色/字体/间距推断算法 |
| 第二部分：结构推断器 | 三层推断、规则/启发式/AI 引擎 |
| 第三部分：整体流程 | 主入口、置信度报告 |
| 第四部分：默认值与降级 | 默认 Tokens、降级策略 |

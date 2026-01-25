# Figma 视觉属性提取清单

> 本文档定义 Figma API 可提取的视觉属性、对应的 Token 生成规则，以及与现有 `DesignTokens` 格式的映射关系。

---

## 概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Figma 视觉属性提取                               │
│                                                                          │
│  Figma File                                                              │
│      │                                                                   │
│      ├─────────────────┬─────────────────┬─────────────────┐            │
│      ▼                 ▼                 ▼                 ▼            │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐           │
│  │ 色彩系统 │     │ 排版系统 │     │ 空间系统 │     │ 效果系统 │           │
│  │ Colors  │     │ Typo    │     │ Spacing │     │ Effects │           │
│  └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘           │
│       │               │               │               │                 │
│       ▼               ▼               ▼               ▼                 │
│  ColorTokens    TypographyTokens  SpacingTokens   ShapeTokens          │
│                                                   OrnamentTokens        │
│       │               │               │               │                 │
│       └───────────────┴───────────────┴───────────────┘                 │
│                               │                                          │
│                               ▼                                          │
│                        DesignTokens                                      │
│                    (与现有格式 100% 兼容)                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 一、色彩系统 (Color System)

### 1.1 Figma API 字段

| 来源 | API 路径 | 字段类型 | 说明 |
|------|----------|----------|------|
| **Local Styles** | `GET /v1/files/:key/styles` | `StyleType.FILL` | Figma 预定义的颜色样式 |
| **图层填充** | `node.fills[]` | `Paint[]` | 图层的填充色数组 |
| **图层描边** | `node.strokes[]` | `Paint[]` | 图层的描边色数组 |
| **文本颜色** | `node.fills[]` (TEXT 节点) | `Paint[]` | 文本图层的颜色 |
| **阴影颜色** | `node.effects[].color` | `Color` | 阴影效果的颜色 |

### 1.2 Paint 对象结构

```typescript
interface FigmaPaint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  visible?: boolean;          // 是否可见
  opacity?: number;           // 透明度 0-1
  color?: {                   // SOLID 类型
    r: number;                // 0-1
    g: number;                // 0-1
    b: number;                // 0-1
    a?: number;               // 0-1
  };
  gradientHandlePositions?: Vector[];  // 渐变控制点
  gradientStops?: ColorStop[];         // 渐变色标
}
```

### 1.3 提取规则

```typescript
// 1. 优先从 Local Styles 提取（已命名的颜色）
const localColorStyles = await figmaApi.getLocalStyles(fileId, 'FILL');

// 2. 从图层提取（遍历所有可见节点）
function extractColorsFromNode(node: FigmaNode): Color[] {
  const colors: Color[] = [];

  // 只处理可见图层
  if (node.visible === false) return colors;

  // 提取填充色
  if (node.fills) {
    node.fills
      .filter(fill => fill.visible !== false && fill.type === 'SOLID')
      .forEach(fill => colors.push(fill.color));
  }

  // 提取描边色
  if (node.strokes) {
    node.strokes
      .filter(stroke => stroke.visible !== false && stroke.type === 'SOLID')
      .forEach(stroke => colors.push(stroke.color));
  }

  return colors;
}
```

### 1.4 Token 生成规则

```typescript
interface ColorExtractionResult {
  // 主色系（从使用频率最高或命名为 primary 的颜色推断）
  primary: ColorScale;
  // 次要色系
  secondary: ColorScale;
  // 强调色
  accent: string;
  // 背景/前景
  background: string;
  foreground: string;
  // 中性色
  muted: string;
  mutedForeground: string;
  border: string;
}

interface ColorScale {
  50: string;   // 最浅
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // 基准色
  600: string;
  700: string;
  800: string;
  900: string;  // 最深
}

// 生成色阶的算法
function generateColorScale(baseColor: string): ColorScale {
  const hsl = hexToHSL(baseColor);
  return {
    50:  hslToHex({ ...hsl, l: 97 }),
    100: hslToHex({ ...hsl, l: 94 }),
    200: hslToHex({ ...hsl, l: 86 }),
    300: hslToHex({ ...hsl, l: 74 }),
    400: hslToHex({ ...hsl, l: 60 }),
    500: hslToHex(hsl),                    // 基准
    600: hslToHex({ ...hsl, l: hsl.l - 10 }),
    700: hslToHex({ ...hsl, l: hsl.l - 20 }),
    800: hslToHex({ ...hsl, l: hsl.l - 30 }),
    900: hslToHex({ ...hsl, l: hsl.l - 40 }),
  };
}
```

### 1.5 映射到 DesignTokens

| Figma 提取值 | DesignTokens 字段 | 转换规则 |
|--------------|-------------------|----------|
| `primary-500` 或使用最多的蓝/紫色 | `--primary-color` | 直接映射 |
| 色阶计算结果 | `--primary-50` ~ `--primary-900` | 明度递增 |
| 灰色系主色 | `--secondary-color` | 直接映射 |
| 高饱和度单一色 | `--accent-color` | 直接映射 |
| 最浅背景色 | `--background` | `#ffffff` 或提取值 |
| 最深文本色 | `--foreground` | `#000000` 或提取值 |
| 浅灰背景 | `--muted` | 约 `hsl(0, 0%, 96%)` |
| 中灰文本 | `--muted-foreground` | 约 `hsl(0, 0%, 45%)` |
| 边框灰色 | `--border` | 约 `hsl(0, 0%, 90%)` |

---

## 二、排版系统 (Typography System)

### 2.1 Figma API 字段

| 来源 | API 路径 | 字段 | 说明 |
|------|----------|------|------|
| **Text Styles** | `GET /v1/files/:key/styles` | `StyleType.TEXT` | 预定义的文本样式 |
| **TEXT 节点** | `node.style` | `TypeStyle` | 文本图层的排版属性 |

### 2.2 TypeStyle 对象结构

```typescript
interface FigmaTypeStyle {
  fontFamily: string;           // "Inter", "Roboto"
  fontPostScriptName?: string;  // "Inter-Bold"
  fontSize: number;             // 像素值，如 16
  fontWeight: number;           // 100-900
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing: number;        // 字间距（像素或百分比）
  lineHeightPx?: number;        // 行高（像素）
  lineHeightPercent?: number;   // 行高（百分比）
  lineHeightPercentFontSize?: number;  // 相对字号的行高
  lineHeightUnit: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
}
```

### 2.3 提取规则

```typescript
// 1. 从 Text Styles 提取（优先）
const textStyles = await figmaApi.getLocalStyles(fileId, 'TEXT');

// 2. 从 TEXT 节点提取
function extractTypographyFromNode(node: FigmaNode): TypographyInfo | null {
  if (node.type !== 'TEXT') return null;
  if (node.visible === false) return null;

  const style = node.style;
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: calculateLineHeight(style),
    letterSpacing: style.letterSpacing,
  };
}

// 行高计算
function calculateLineHeight(style: TypeStyle): number {
  if (style.lineHeightUnit === 'PIXELS') {
    return style.lineHeightPx / style.fontSize;  // 转为比例
  }
  if (style.lineHeightUnit === 'FONT_SIZE_%') {
    return style.lineHeightPercentFontSize / 100;
  }
  return 1.5;  // 默认
}
```

### 2.4 Token 生成规则

```typescript
interface TypographyExtractionResult {
  // 字阶序列
  fontSizes: {
    xs: string;    // 12px
    sm: string;    // 14px
    base: string;  // 16px
    lg: string;    // 18px
    xl: string;    // 20px
    '2xl': string; // 24px
    '3xl': string; // 30px
  };
  // 字重
  fontWeights: {
    normal: number;    // 400
    medium: number;    // 500
    semibold: number;  // 600
    bold: number;      // 700
  };
  // 字阶比率（自动检测）
  scale: TypeScale;
}

// 检测字阶比率
function detectTypeScale(fontSizes: number[]): TypeScale {
  const sorted = [...fontSizes].sort((a, b) => a - b);
  const ratios: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    ratios.push(sorted[i] / sorted[i - 1]);
  }

  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

  // 匹配最接近的标准比率
  const SCALES: Record<TypeScale, number> = {
    'minor-second': 1.067,
    'major-second': 1.125,
    'minor-third': 1.2,
    'major-third': 1.25,
    'perfect-fourth': 1.333,
    'golden-ratio': 1.618,
  };

  let closest: TypeScale = 'major-second';
  let minDiff = Infinity;

  for (const [scale, ratio] of Object.entries(SCALES)) {
    const diff = Math.abs(avgRatio - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = scale as TypeScale;
    }
  }

  return closest;
}

// 标准化字号（对齐到 4px 栅格）
function normalizeToGrid(fontSize: number, gridUnit = 4): number {
  return Math.round(fontSize / gridUnit) * gridUnit;
}
```

### 2.5 映射到 DesignTokens

| Figma 提取值 | DesignTokens 字段 | 转换规则 |
|--------------|-------------------|----------|
| 检测到的字阶比率 | `--font-scale` | `1.125` / `1.2` 等 |
| 最小字号 | `--font-size-xs` | 对齐到 `12px` |
| 次小字号 | `--font-size-sm` | 对齐到 `14px` |
| 基准字号 | `--font-size-base` | 对齐到 `16px` |
| 大字号 | `--font-size-lg` | 对齐到 `18px` |
| 超大字号 | `--font-size-xl` | 对齐到 `20px` |
| 标题字号 | `--font-size-2xl` / `--font-size-3xl` | 按比率计算 |
| 常规字重 | `--font-weight-normal` | `400` |
| 中等字重 | `--font-weight-medium` | `500` |
| 半粗字重 | `--font-weight-semibold` | `600` |
| 粗体字重 | `--font-weight-bold` | `700` |

---

## 三、空间系统 (Spacing System)

### 3.1 Figma API 字段

| 来源 | API 路径 | 字段 | 说明 |
|------|----------|------|------|
| **Auto Layout** | `node.paddingLeft/Right/Top/Bottom` | `number` | 内边距 |
| **Auto Layout** | `node.itemSpacing` | `number` | 子元素间距 |
| **Frame 尺寸** | `node.absoluteBoundingBox` | `Rectangle` | 绝对位置和尺寸 |
| **约束** | `node.constraints` | `Constraints` | 布局约束规则 |

### 3.2 相关对象结构

```typescript
interface FigmaFrameNode {
  // Auto Layout 属性
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';

  // 间距
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;

  // 尺寸
  absoluteBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // 圆角
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];  // 四个角独立
}
```

### 3.3 提取规则

```typescript
// 收集所有间距值
function extractSpacingFromNodes(nodes: FigmaNode[]): number[] {
  const spacings = new Set<number>();

  for (const node of nodes) {
    if (node.visible === false) continue;

    // 提取 padding
    if (node.paddingLeft) spacings.add(node.paddingLeft);
    if (node.paddingRight) spacings.add(node.paddingRight);
    if (node.paddingTop) spacings.add(node.paddingTop);
    if (node.paddingBottom) spacings.add(node.paddingBottom);

    // 提取 gap
    if (node.itemSpacing) spacings.add(node.itemSpacing);
  }

  return [...spacings].sort((a, b) => a - b);
}

// 检测栅格基数
function detectGridUnit(spacings: number[]): number {
  // 找出所有间距的最大公约数
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  return spacings.reduce((acc, val) => gcd(acc, val), spacings[0]);
}

// 检测间距密度
function detectSpacingDensity(avgPadding: number): SpacingDensity {
  if (avgPadding <= 8) return 'compact';
  if (avgPadding <= 16) return 'normal';
  return 'spacious';
}
```

### 3.4 Token 生成规则

```typescript
interface SpacingExtractionResult {
  // 基础单位
  baseUnit: number;  // 4 或 8
  // 间距序列
  spacings: {
    xs: string;   // 4px
    sm: string;   // 8px
    md: string;   // 16px
    lg: string;   // 24px
    xl: string;   // 32px
  };
  // Card 专用
  cardGap: string;
  cardPadding: string;
  sectionPadding: string;
  // 行高
  lineHeightBody: number;
}

// 标准化间距序列
function generateSpacingTokens(baseUnit: number): SpacingExtractionResult['spacings'] {
  return {
    xs: `${baseUnit}px`,
    sm: `${baseUnit * 2}px`,
    md: `${baseUnit * 4}px`,
    lg: `${baseUnit * 6}px`,
    xl: `${baseUnit * 8}px`,
  };
}
```

### 3.5 映射到 DesignTokens

| Figma 提取值 | DesignTokens 字段 | 转换规则 |
|--------------|-------------------|----------|
| 检测到的栅格基数 | `--base-unit` | `4px` 或 `8px` |
| baseUnit × 1 | `--spacing-xs` | `4px` |
| baseUnit × 2 | `--spacing-sm` | `8px` |
| baseUnit × 4 | `--spacing-md` | `16px` |
| baseUnit × 6 | `--spacing-lg` | `24px` |
| baseUnit × 8 | `--spacing-xl` | `32px` |
| Card 容器的 itemSpacing | `--gap-card` | `16px` |
| Card 容器的 padding | `--padding-card` | `24px` |
| Section 容器的 padding | `--padding-section` | `32px` |
| 检测到的平均行高 | `--line-height-body` | `1.5` |

---

## 四、形状系统 (Shape System)

### 4.1 Figma API 字段

| 来源 | API 路径 | 字段 | 说明 |
|------|----------|------|------|
| **圆角** | `node.cornerRadius` | `number` | 统一圆角 |
| **独立圆角** | `node.rectangleCornerRadii` | `[tl, tr, br, bl]` | 四角独立 |
| **描边** | `node.strokeWeight` | `number` | 描边宽度 |
| **描边对齐** | `node.strokeAlign` | `'INSIDE' \| 'OUTSIDE' \| 'CENTER'` | 描边位置 |

### 4.2 提取规则

```typescript
// 收集所有圆角值
function extractRadiusFromNodes(nodes: FigmaNode[]): number[] {
  const radii = new Set<number>();

  for (const node of nodes) {
    if (node.visible === false) continue;

    if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
      radii.add(node.cornerRadius);
    }

    if (node.rectangleCornerRadii) {
      node.rectangleCornerRadii
        .filter(r => r > 0)
        .forEach(r => radii.add(r));
    }
  }

  return [...radii].sort((a, b) => a - b);
}

// 检测形状风格
function detectShapeStyle(radii: number[]): ShapeStyle {
  const maxRadius = Math.max(...radii);
  const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;

  if (avgRadius === 0) return 'sharp';
  if (avgRadius <= 4) return 'rounded';
  if (avgRadius <= 12) return 'soft';
  if (maxRadius >= 9999) return 'pill';  // 全圆角
  return 'rounded';
}
```

### 4.3 Token 生成规则

```typescript
interface ShapeExtractionResult {
  // 圆角序列
  radii: {
    sm: string;    // 4px
    md: string;    // 8px
    lg: string;    // 12px
    full: string;  // 9999px
  };
  // 阴影（从 Effects 提取）
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// 标准化圆角
function normalizeRadii(radii: number[]): ShapeExtractionResult['radii'] {
  const sorted = [...radii].filter(r => r < 9999).sort((a, b) => a - b);

  return {
    sm: `${sorted[0] || 4}px`,
    md: `${sorted[Math.floor(sorted.length / 2)] || 8}px`,
    lg: `${sorted[sorted.length - 1] || 12}px`,
    full: '9999px',
  };
}
```

### 4.4 映射到 DesignTokens

| Figma 提取值 | DesignTokens 字段 | 转换规则 |
|--------------|-------------------|----------|
| 最小圆角 | `--radius-sm` | 标准化到 `4px` |
| 中等圆角 | `--radius-md` | 标准化到 `8px` |
| 最大圆角 | `--radius-lg` | 标准化到 `12px` / `16px` |
| 全圆角 | `--radius-full` | `9999px` |
| 小阴影 | `--shadow-sm` | 见阴影提取 |
| 中阴影 | `--shadow-md` | 见阴影提取 |
| 大阴影 | `--shadow-lg` | 见阴影提取 |

---

## 五、效果系统 (Effects System)

### 5.1 Figma API 字段

| 来源 | API 路径 | 字段 | 说明 |
|------|----------|------|------|
| **Effect Styles** | `GET /v1/files/:key/styles` | `StyleType.EFFECT` | 预定义效果样式 |
| **图层效果** | `node.effects[]` | `Effect[]` | 图层的效果数组 |

### 5.2 Effect 对象结构

```typescript
interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius: number;           // 模糊半径
  color?: Color;            // 阴影颜色（含透明度）
  blendMode?: BlendMode;
  offset?: {                // 阴影偏移
    x: number;
    y: number;
  };
  spread?: number;          // 扩散半径
}
```

### 5.3 提取规则

```typescript
// 提取阴影效果
function extractShadowsFromNodes(nodes: FigmaNode[]): ShadowInfo[] {
  const shadows: ShadowInfo[] = [];

  for (const node of nodes) {
    if (node.visible === false) continue;
    if (!node.effects) continue;

    node.effects
      .filter(e => e.visible !== false && e.type === 'DROP_SHADOW')
      .forEach(effect => {
        shadows.push({
          offsetX: effect.offset?.x || 0,
          offsetY: effect.offset?.y || 0,
          blur: effect.radius,
          spread: effect.spread || 0,
          color: rgbaToString(effect.color),
        });
      });
  }

  return shadows;
}

// 阴影转 CSS
function shadowToCSS(shadow: ShadowInfo): string {
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}
```

### 5.4 Token 生成规则

```typescript
interface EffectExtractionResult {
  shadows: {
    sm: string;   // 轻微阴影
    md: string;   // 标准卡片阴影
    lg: string;   // 浮动元素阴影
  };
  blurs: {
    backdrop: string;  // 背景模糊
  };
}

// 分类阴影（按模糊半径）
function classifyShadows(shadows: ShadowInfo[]): EffectExtractionResult['shadows'] {
  const sorted = [...shadows].sort((a, b) => a.blur - b.blur);

  const small = sorted.find(s => s.blur <= 4) || { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' };
  const medium = sorted.find(s => s.blur > 4 && s.blur <= 10) || { offsetX: 0, offsetY: 2, blur: 8, spread: 0, color: 'rgba(0,0,0,0.1)' };
  const large = sorted.find(s => s.blur > 10) || { offsetX: 0, offsetY: 4, blur: 16, spread: 0, color: 'rgba(0,0,0,0.15)' };

  return {
    sm: shadowToCSS(small),
    md: shadowToCSS(medium),
    lg: shadowToCSS(large),
  };
}
```

### 5.5 映射到 DesignTokens

| Figma 提取值 | DesignTokens 字段 | 转换规则 |
|--------------|-------------------|----------|
| 小模糊阴影 (blur ≤ 4) | `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| 中模糊阴影 (4 < blur ≤ 10) | `--shadow-md` | `0 2px 8px rgba(0,0,0,0.1)` |
| 大模糊阴影 (blur > 10) | `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.15)` |

---

## 六、渐变与装饰 (Gradients & Ornaments)

### 6.1 Figma API 字段

| 来源 | API 路径 | 字段 | 说明 |
|------|----------|------|------|
| **渐变填充** | `node.fills[].type === 'GRADIENT_*'` | `Paint` | 渐变填充 |
| **渐变控制点** | `fill.gradientHandlePositions` | `Vector[]` | 起止点位置 |
| **渐变色标** | `fill.gradientStops` | `ColorStop[]` | 颜色节点 |

### 6.2 渐变对象结构

```typescript
interface GradientPaint {
  type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND';
  gradientHandlePositions: [
    { x: number; y: number },  // 起点
    { x: number; y: number },  // 终点
    { x: number; y: number },  // 宽度控制点
  ];
  gradientStops: Array<{
    color: Color;
    position: number;  // 0-1
  }>;
}
```

### 6.3 提取规则

```typescript
// 提取渐变
function extractGradientsFromNodes(nodes: FigmaNode[]): GradientInfo[] {
  const gradients: GradientInfo[] = [];

  for (const node of nodes) {
    if (node.visible === false) continue;
    if (!node.fills) continue;

    node.fills
      .filter(f => f.visible !== false && f.type.startsWith('GRADIENT'))
      .forEach(fill => {
        gradients.push({
          type: fill.type,
          angle: calculateGradientAngle(fill.gradientHandlePositions),
          stops: fill.gradientStops.map(stop => ({
            color: rgbaToString(stop.color),
            position: stop.position,
          })),
        });
      });
  }

  return gradients;
}

// 计算渐变角度
function calculateGradientAngle(handles: Vector[]): number {
  const [start, end] = handles;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

// 渐变转 CSS
function gradientToCSS(gradient: GradientInfo): string {
  const stops = gradient.stops
    .map(s => `${s.color} ${s.position * 100}%`)
    .join(', ');

  if (gradient.type === 'GRADIENT_LINEAR') {
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  }
  if (gradient.type === 'GRADIENT_RADIAL') {
    return `radial-gradient(circle, ${stops})`;
  }
  return '';
}
```

### 6.4 映射到 DesignTokens

| Figma 提取值 | DesignTokens 字段 | 说明 |
|--------------|-------------------|------|
| 渐变定义 | `--gradient-fade` | 常用于遮罩 |
| 点状图案 | `--pattern-dots` | 如背景装饰 |
| 网格图案 | `--pattern-grid` | 如背景装饰 |
| 噪点透明度 | `--noise-opacity` | 质感叠加 |

---

## 七、资源资产 (Assets)

### 7.1 Figma API 导出接口

```typescript
// 导出节点为图片
GET /v1/images/:file_key?ids=:node_ids&format=svg|png|jpg|pdf&scale=1|2|3|4

// 返回值
{
  "images": {
    "node_id_1": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/...",
    "node_id_2": "https://..."
  }
}
```

### 7.2 资产分类与处理

```typescript
interface AssetExtractionResult {
  icons: IconAsset[];
  images: ImageAsset[];
}

interface IconAsset {
  id: string;
  name: string;           // 清理后的命名：icon-user
  svg: string;            // 内联 SVG
  viewBox: string;        // "0 0 24 24"
}

interface ImageAsset {
  id: string;
  name: string;
  format: 'png' | 'jpg' | 'webp';
  urls: {
    '1x': string;
    '2x': string;
  };
  base64?: string;        // 可选：内联 Base64
}

// 识别图标（启发式规则）
function isIconNode(node: FigmaNode): boolean {
  // 命名规则
  if (/^icon[-_]/i.test(node.name)) return true;
  if (/[-_]icon$/i.test(node.name)) return true;

  // 尺寸规则（图标通常 16-48px）
  const { width, height } = node.absoluteBoundingBox;
  if (width >= 16 && width <= 48 && height >= 16 && height <= 48) {
    // 且为矢量组
    if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
      return true;
    }
  }

  return false;
}

// 清理 SVG
function cleanSVG(rawSVG: string): string {
  return rawSVG
    .replace(/id="[^"]*"/g, '')           // 移除 ID
    .replace(/class="[^"]*"/g, '')        // 移除 class
    .replace(/data-[^=]*="[^"]*"/g, '')   // 移除 data 属性
    .replace(/<!--[\s\S]*?-->/g, '')      // 移除注释
    .replace(/\s+/g, ' ')                 // 压缩空白
    .trim();
}
```

---

## 八、状态变体 (State Variants)

### 8.1 Figma 组件变体结构

```typescript
// 组件集（Component Set）包含多个变体
interface ComponentSet {
  name: string;
  children: ComponentVariant[];
}

interface ComponentVariant {
  name: string;  // "State=Default, Size=Medium"
  // 解析变体属性
  variantProperties: Record<string, string>;
}

// 解析变体名称
function parseVariantName(name: string): Record<string, string> {
  // "State=Hover, Size=Large" → { State: "Hover", Size: "Large" }
  const props: Record<string, string> = {};
  name.split(',').forEach(pair => {
    const [key, value] = pair.split('=').map(s => s.trim());
    if (key && value) props[key] = value;
  });
  return props;
}
```

### 8.2 状态提取规则

```typescript
interface StateExtractionResult {
  default: StyleSnapshot;
  hover?: StyleDelta;
  active?: StyleDelta;
  focus?: StyleDelta;
  disabled?: StyleDelta;
}

interface StyleSnapshot {
  fill: string;
  stroke: string;
  opacity: number;
  // ...其他属性
}

interface StyleDelta {
  // 只记录与 default 的差异
  fill?: string;
  stroke?: string;
  opacity?: number;
}

// 提取状态差异
function extractStateDeltas(variants: ComponentVariant[]): StateExtractionResult {
  const defaultVariant = variants.find(v =>
    v.variantProperties.State === 'Default' || !v.variantProperties.State
  );

  const hoverVariant = variants.find(v =>
    v.variantProperties.State === 'Hover'
  );

  // ...类似提取其他状态

  return {
    default: extractStyleSnapshot(defaultVariant),
    hover: hoverVariant ? computeDelta(defaultVariant, hoverVariant) : undefined,
    // ...
  };
}
```

### 8.3 映射到交互 Token

| 状态变体 | 生成的 Token | 示例值 |
|----------|--------------|--------|
| Hover 背景色变化 | `--color-primary-hover` | `#1d4ed8` (比 500 深) |
| Active 背景色变化 | `--color-primary-active` | `#1e40af` (比 hover 更深) |
| Disabled 透明度 | `--opacity-disabled` | `0.5` |
| Focus 外发光 | `--ring-focus` | `0 0 0 3px rgba(59,130,246,0.5)` |

---

## 九、提取流程总结

### 9.1 完整提取流程

```typescript
async function extractFigmaVisuals(fileId: string): Promise<DesignTokens> {
  // 1. 获取文件结构和样式
  const [file, styles] = await Promise.all([
    figmaApi.getFile(fileId),
    figmaApi.getLocalStyles(fileId),
  ]);

  // 2. 过滤有效节点（可见、非辅助）
  const validNodes = filterValidNodes(file.document);

  // 3. 并行提取各系统
  const [colors, typography, spacing, shapes, effects, assets] = await Promise.all([
    extractColors(validNodes, styles.colors),
    extractTypography(validNodes, styles.text),
    extractSpacing(validNodes),
    extractShapes(validNodes),
    extractEffects(validNodes, styles.effects),
    extractAssets(validNodes),
  ]);

  // 4. 生成 DesignTokens
  return {
    // 色彩
    '--primary-color': colors.primary[500],
    '--primary-50': colors.primary[50],
    // ... 其他 primary 色阶
    '--secondary-color': colors.secondary[500],
    '--accent-color': colors.accent,
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--border': colors.border,

    // 排版
    '--font-scale': typography.scale,
    '--font-size-xs': typography.fontSizes.xs,
    // ... 其他字号
    '--font-weight-normal': String(typography.fontWeights.normal),
    // ... 其他字重

    // 空间
    '--base-unit': spacing.baseUnit + 'px',
    '--spacing-xs': spacing.spacings.xs,
    // ... 其他间距
    '--gap-card': spacing.cardGap,
    '--padding-card': spacing.cardPadding,
    '--padding-section': spacing.sectionPadding,
    '--line-height-body': String(spacing.lineHeightBody),

    // 形状
    '--radius-sm': shapes.radii.sm,
    '--radius-md': shapes.radii.md,
    '--radius-lg': shapes.radii.lg,
    '--radius-full': shapes.radii.full,
    '--shadow-sm': effects.shadows.sm,
    '--shadow-md': effects.shadows.md,
    '--shadow-lg': effects.shadows.lg,

    // 装饰（如有）
    '--pattern-dots': 'radial-gradient(...)',
    '--pattern-dots-size': '20px',
    '--pattern-grid': 'linear-gradient(...)',
    '--pattern-grid-size': '40px',
    '--gradient-fade': effects.gradients[0] || 'none',
    '--noise-opacity': '0.03',

    // 元数据
    _meta: {
      context: 'figma-extracted',
      sessionId: fileId,
      seed: 0,
      generatedAt: new Date().toISOString(),
    },
  };
}
```

### 9.2 节点过滤规则

```typescript
function filterValidNodes(root: FigmaNode): FigmaNode[] {
  const valid: FigmaNode[] = [];

  function traverse(node: FigmaNode) {
    // 跳过不可见图层
    if (node.visible === false) return;

    // 跳过锁定图层
    if (node.locked === true) return;

    // 跳过辅助标注图层（命名规则）
    if (/^(guide|annotation|redline|spec|measure)/i.test(node.name)) return;

    // 跳过隐藏页面
    if (node.type === 'PAGE' && node.name.startsWith('_')) return;

    valid.push(node);

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(root);
  return valid;
}
```

---

## 十、与现有系统集成

### 10.1 替换视觉引擎

```typescript
// 原有流程（context 语义生成）
const tokens = generateDesignTokens({ context: '企业后台' });

// Figma 流程（精确提取）
const tokens = await extractFigmaVisuals('figma_file_id');

// 两者输出格式完全兼容，后续流程不变
const result = await compile(dsl, { tokens });
```

### 10.2 混合模式（Figma + 补全）

```typescript
// Figma 提取（可能不完整）
const figmaTokens = await extractFigmaVisuals(fileId);

// 用默认值补全缺失 Token
const finalTokens = {
  ...generateDesignTokens({ context: 'default' }),  // 默认底
  ...figmaTokens,                                    // Figma 覆盖
};
```

---

## 附录 A：Figma API 认证

```typescript
// Personal Access Token
const headers = {
  'X-FIGMA-TOKEN': process.env.FIGMA_ACCESS_TOKEN,
};

// 获取文件
const file = await fetch(
  `https://api.figma.com/v1/files/${fileId}`,
  { headers }
).then(r => r.json());

// 获取样式
const styles = await fetch(
  `https://api.figma.com/v1/files/${fileId}/styles`,
  { headers }
).then(r => r.json());

// 导出图片
const images = await fetch(
  `https://api.figma.com/v1/images/${fileId}?ids=${nodeIds.join(',')}&format=svg`,
  { headers }
).then(r => r.json());
```

---

## 附录 B：常见问题处理

| 问题 | 处理策略 |
|------|----------|
| 颜色命名不规范 | 按使用频率排序，最高频作为 primary |
| 没有定义 Text Styles | 从 TEXT 节点统计字号分布 |
| 间距不对齐栅格 | 自动 round 到最近的 4px 倍数 |
| 圆角值过多 | 取 min/median/max 作为 sm/md/lg |
| 阴影定义缺失 | 使用默认阴影值 |
| 渐变过于复杂 | 只提取前 2 个色标简化 |

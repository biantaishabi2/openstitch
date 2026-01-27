/**
 * Figma API 类型定义
 * 基于 Figma REST API 响应格式
 */

// === 基础类型 ===

export interface FigmaColor {
  r: number;  // 0-1
  g: number;  // 0-1
  b: number;  // 0-1
  a: number;  // 0-1
}

export interface FigmaVector {
  x: number;
  y: number;
}

export interface FigmaRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// === Paint 类型 ===

export type PaintType = 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE';

export interface GradientStop {
  position: number;  // 0-1
  color: FigmaColor;
}

export interface FigmaPaint {
  type: PaintType;
  visible?: boolean;
  opacity?: number;
  blendMode?: string;
  // Solid
  color?: FigmaColor;
  // Gradient
  gradientHandlePositions?: FigmaVector[];
  gradientStops?: GradientStop[];
  // Image
  scaleMode?: string;
  imageRef?: string;
}

// === Effect 类型 ===

export type EffectType = 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';

export interface FigmaEffect {
  type: EffectType;
  visible?: boolean;
  color?: FigmaColor;
  blendMode?: string;
  offset?: FigmaVector;
  radius?: number;
  spread?: number;
}

// === Typography 类型 ===

export interface FigmaTypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontWeight: number;
  fontSize: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
}

// === Node 类型 ===

export type NodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'REGULAR_POLYGON'
  | 'RECTANGLE'
  | 'TEXT'
  | 'SLICE'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE';

export interface FigmaNode {
  id: string;
  name: string;
  type: NodeType;
  visible?: boolean;

  // 边界
  absoluteBoundingBox?: FigmaRectangle;
  absoluteRenderBounds?: FigmaRectangle;

  // 视觉属性
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  effects?: FigmaEffect[];
  opacity?: number;
  blendMode?: string;

  // 圆角
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];

  // 布局
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;

  // 文本
  characters?: string;
  style?: FigmaTypeStyle;
  characterStyleOverrides?: number[];
  styleOverrideTable?: Record<number, Partial<FigmaTypeStyle>>;

  // 子节点
  children?: FigmaNode[];

  // Component
  componentId?: string;

  // 裁剪
  clipsContent?: boolean;

  // 背景色 (Canvas)
  backgroundColor?: FigmaColor;
}

// === File 响应 ===

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
  version: string;
  document: FigmaNode;
  styles?: Record<string, FigmaStyleMeta>;
  components?: Record<string, FigmaComponentMeta>;
  componentSets?: Record<string, FigmaComponentSetMeta>;
}

export interface FigmaStyleMeta {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description?: string;
}

export interface FigmaComponentMeta {
  key: string;
  name: string;
  description?: string;
}

export interface FigmaComponentSetMeta {
  key: string;
  name: string;
  description?: string;
}

// === 推断结果类型 ===

export interface ColorSample {
  hex: string;
  rgb: { r: number; g: number; b: number };
  lab: [number, number, number];
  source: 'fill' | 'stroke' | 'text' | 'shadow';
  nodeId: string;
  frequency: number;
}

export interface ColorCluster {
  representative: string;
  members: string[];
  totalFrequency: number;
  avgLab: [number, number, number];
}

export interface ColorAssignment {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export type TypeScale =
  | 'minor-second'
  | 'major-second'
  | 'minor-third'
  | 'major-third'
  | 'perfect-fourth'
  | 'golden-ratio';

export interface TypographyTokens {
  scale: TypeScale;
  baseSize: number;
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface SpacingTokens {
  baseUnit: number;
  values: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

export interface ShapeTokens {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface DesignTokens {
  colors: ColorAssignment;
  colorScales: {
    primary: ColorScale;
    neutral: ColorScale;
  };
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shapes: ShapeTokens;
}

export type InferenceSource = 'styles' | 'sampled' | 'default';

export interface VisualInferenceResult {
  tokens: DesignTokens;
  confidence: number;
  sources: {
    colors: InferenceSource;
    typography: InferenceSource;
    spacing: InferenceSource | 'autolayout';
    shapes: InferenceSource;
  };
  warnings: string[];
}

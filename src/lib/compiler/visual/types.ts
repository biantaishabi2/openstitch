/**
 * 视觉引擎类型定义
 */

// ============================================
// Design Tokens 类型
// ============================================

/** 空间尺度 Tokens */
export interface SpacingTokens {
  '--base-unit': string;
  '--spacing-xs': string;
  '--spacing-sm': string;
  '--spacing-md': string;
  '--spacing-lg': string;
  '--spacing-xl': string;
  '--gap-card': string;
  '--padding-card': string;
  '--padding-section': string;
  '--line-height-body': string;
}

/** 字体排版 Tokens */
export interface TypographyTokens {
  '--font-scale': string;
  '--font-size-xs': string;
  '--font-size-sm': string;
  '--font-size-base': string;
  '--font-size-lg': string;
  '--font-size-xl': string;
  '--font-size-2xl': string;
  '--font-size-3xl': string;
  '--font-weight-normal': string;
  '--font-weight-medium': string;
  '--font-weight-semibold': string;
  '--font-weight-bold': string;
}

/** 形状边框 Tokens */
export interface ShapeTokens {
  '--radius-sm': string;
  '--radius-md': string;
  '--radius-lg': string;
  '--radius-full': string;
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
}

/** 装饰纹理 Tokens */
export interface OrnamentTokens {
  '--pattern-dots': string;
  '--pattern-dots-size': string;
  '--pattern-grid': string;
  '--pattern-grid-size': string;
  '--gradient-fade': string;
  '--noise-opacity': string;
}

/** 语义颜色 Tokens */
export interface ColorTokens {
  '--primary-color': string;
  '--primary-50': string;
  '--primary-100': string;
  '--primary-200': string;
  '--primary-300': string;
  '--primary-400': string;
  '--primary-500': string;
  '--primary-600': string;
  '--primary-700': string;
  '--primary-800': string;
  '--primary-900': string;
  '--secondary-color': string;
  '--accent-color': string;
  '--background': string;
  '--foreground': string;
  '--muted': string;
  '--muted-foreground': string;
  '--border': string;
}

/** 完整的 Design Tokens */
export interface DesignTokens extends
  SpacingTokens,
  TypographyTokens,
  ShapeTokens,
  OrnamentTokens,
  ColorTokens {
  // 元数据
  _meta?: {
    context: string;
    sessionId: string;
    seed: number;
    generatedAt: string;
  };
}

// ============================================
// 场景预设类型
// ============================================

/** 场景风格 */
export type SceneStyle =
  | 'technical'    // 技术/架构
  | 'finance'      // 金融/财务
  | 'medical'      // 医疗/健康
  | 'education'    // 教育/儿童
  | 'creative'     // 创意/营销
  | 'enterprise'   // 企业应用
  | 'default';     // 默认

/** 空间密度 */
export type SpacingDensity = 'compact' | 'normal' | 'spacious';

/** 字阶比率 */
export type TypeScale = 'minor-second' | 'major-second' | 'minor-third' | 'major-third' | 'perfect-fourth' | 'golden-ratio';

/** 形状风格 */
export type ShapeStyle = 'sharp' | 'rounded' | 'soft' | 'pill';

/** 装饰强度 */
export type OrnamentLevel = 'none' | 'subtle' | 'moderate' | 'rich';

// ============================================
// Session State 类型
// ============================================

/** Session 状态 */
export interface SessionState {
  sessionId: string;
  context: string;
  seed: number;
  tokens?: DesignTokens;
  createdAt: string;
  updatedAt: string;
}

/** 合成器选项 */
export interface SynthesizerOptions {
  context: string;
  sessionId?: string;
  seed?: number;
  overrides?: Partial<DesignTokens>;
  /** 平台类型 - 影响间距、字阶、行高等参数 */
  platform?: 'web' | 'mobile';
}

/** 设计审查警告 */
export interface AuditWarning {
  type: 'contrast' | 'perceptual' | 'accessibility' | 'rhythm' | 'spacing';
  message: string;
  severity: 'info' | 'warning' | 'error';
  suggestion?: string;
}

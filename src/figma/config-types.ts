/**
 * Stitch JSON 配置类型定义
 *
 * 用于将 Figma 提取结果导出为可编辑的 JSON 配置
 * 支持：DSL 定义、Design Tokens、覆盖规则
 */

/** 元信息 */
export interface StitchConfigMeta {
  /** 页面/应用上下文 */
  context: string;
  /** 平台：web | mobile */
  platform: 'web' | 'mobile';
  /** 配置版本 */
  version?: string;
  /** 生成时间 */
  generatedAt?: string;
  /** Figma 文件名 */
  figmaFile?: string;
  /** Session ID */
  sessionId?: string;
}

/** 单个屏幕配置 */
export interface StitchScreen {
  /** 屏幕 ID */
  id: string;
  /** 屏幕标题 */
  title: string;
  /** DSL 定义 */
  dsl: string;
  /** Design Tokens（可选，用于覆盖自动生成的 tokens） */
  tokens?: Record<string, string>;
  /** Token 覆盖（更声明式的覆盖方式） */
  overrides?: TokenOverrides;
  /** 描述 */
  description?: string;
}

/** Token 覆盖配置 */
export interface TokenOverrides {
  /** 颜色覆盖（支持任意 token 键名） */
  colors?: Record<string, string>;
  /** 字体排版覆盖（支持任意 token 键名） */
  typography?: Record<string, string>;
  /** 间距覆盖（支持任意 token 键名） */
  spacing?: Record<string, string>;
  /** 圆角覆盖（支持任意 token 键名） */
  radius?: Record<string, string>;
}

/** 完整的 Stitch 配置 */
export interface StitchConfig {
  /** 元信息 */
  meta: StitchConfigMeta;
  /** 屏幕列表 */
  screens: StitchScreen[];
}

/** FigmaToStitch 导出的完整结果（包含中间状态） */
export interface FigmaToStitchResult {
  /** DSL 定义 */
  dsl: string;
  /** Design Tokens（编译格式） */
  tokens: Record<string, string>;
  /** 原始视觉推断结果 */
  visuals: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
      border: string;
    };
    colorScales: Record<string, Record<number, string>>;
    typography: {
      scale: string;
      fontSizes: Record<string, string>;
      fontWeights: Record<string, number>;
    };
    spacing: {
      baseUnit: number;
      values: Record<string, string>;
    };
    shapes: {
      radius: Record<string, string>;
      shadow: Record<string, string>;
    };
  };
  /** 结构推断统计 */
  structure: {
    nodeCount: number;
    confidence: number;
    aiCallCount: number;
  };
  /** 警告信息 */
  warnings: string[];
}

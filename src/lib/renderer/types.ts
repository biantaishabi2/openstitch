/**
 * Stitch 渲染引擎类型定义
 */

// UI节点基础结构
export interface UINode {
  // 组件类型，如 "Card", "Grid", "Button"
  type: string;

  // 组件属性
  props?: Record<string, any>;

  // 插槽（用于布局组件）
  slots?: Record<string, UINode>;

  // 子节点（用于普通容器）
  children?: UINode[] | UINode | string;

  // 可选ID，用于DOM映射
  id?: string;
}

// 渲染器配置
export interface RendererConfig {
  // 是否启用严格模式（遇到未知组件报错）
  strict?: boolean;

  // 自定义组件映射（可扩展）
  customComponents?: ComponentMap;

  // 是否添加 data-* 属性用于调试
  debug?: boolean;
}

// 组件映射表类型
export type ComponentMap = Record<string, React.ComponentType<any>>;

// 渲染上下文（用于传递全局状态）
export interface RenderContext {
  // 当前渲染深度
  depth: number;

  // 父节点类型
  parentType?: string;

  // 配置
  config: RendererConfig;
}

// 预定义主题名称
export type ThemeName = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'dark';

// 主题配置
export interface ThemeConfig {
  // 主色调 (HSL 格式，不带 hsl() 包装)
  primary: string;
  primaryForeground: string;
  // 背景色
  background: string;
  foreground: string;
  // 卡片颜色
  card: string;
  cardForeground: string;
  // 次要颜色
  secondary: string;
  secondaryForeground: string;
  // 静音颜色
  muted: string;
  mutedForeground: string;
  // 强调色
  accent: string;
  accentForeground: string;
  // 边框
  border: string;
  // 危险色
  destructive: string;
  destructiveForeground: string;
}

// 导出相关类型
export interface ExportOptions {
  // 是否内联CSS
  inlineStyles?: boolean;

  // 是否压缩HTML
  minify?: boolean;

  // 自定义CSS文件路径
  cssPath?: string;

  // 主题名称
  theme?: ThemeName;

  // 自定义主题配置（优先级高于 theme）
  customTheme?: Partial<ThemeConfig>;
}

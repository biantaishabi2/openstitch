/**
 * Stitch Override System - 覆盖机制（动态覆盖）
 *
 * AI 可以在 JSON Schema 中使用 style 属性覆盖主题预设
 * 局部覆盖优先于主题预设，主题预设优先于默认 Tokens
 */

import { ThemePreset, themePresets, matchTheme } from './presets';
import { colors, spacing, borderRadius, shadows, fontFamily } from './tokens';

// ============================================
// 样式覆盖类型
// ============================================

export interface StyleOverride {
  // 颜色覆盖
  background?: string;
  color?: string;
  borderColor?: string;

  // 间距覆盖
  padding?: string | number;
  margin?: string | number;
  gap?: string | number;

  // 尺寸覆盖
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;

  // 边框覆盖
  borderRadius?: string;
  borderWidth?: string | number;

  // 阴影覆盖
  shadow?: string;
  boxShadow?: string;

  // 字体覆盖
  fontSize?: string | number;
  fontWeight?: string | number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // 布局覆盖
  display?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;

  // 其他
  opacity?: number;
  cursor?: string;

  // 允许任意 CSS 属性
  [key: string]: unknown;
}

// ============================================
// 组件 Schema 中的样式定义
// ============================================

export interface ComponentStyle {
  // 主题名称 - 如果指定，使用该主题
  theme?: string;

  // 语义化样式 - 映射到 Token
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // 直接覆盖 - 最高优先级
  override?: StyleOverride;
}

// ============================================
// 解析颜色值 - 支持 Token 引用
// ============================================

export function resolveColor(value: string): string {
  // 如果是 Token 引用格式：blue-500, neutral-200
  const tokenMatch = value.match(/^(\w+)-(\d+)$/);
  if (tokenMatch) {
    const [, colorName, shade] = tokenMatch;
    const colorScale = colors[colorName as keyof typeof colors];
    if (colorScale && typeof colorScale === 'object') {
      return colorScale[shade as keyof typeof colorScale] || value;
    }
  }

  // 如果是语义色：primary, success, error
  // 这需要结合当前主题来解析，先返回原值
  return value;
}

// ============================================
// 解析间距值 - 支持 Token 引用
// ============================================

export function resolveSpacing(value: string | number): string {
  if (typeof value === 'number') {
    // 数字直接转为像素
    return `${value}px`;
  }

  // 如果是 Token 引用格式：xs, sm, md, lg
  const spacingMap: Record<string, string> = {
    xs: spacing[2],
    sm: spacing[4],
    md: spacing[6],
    lg: spacing[8],
    xl: spacing[12],
    '2xl': spacing[16],
  };

  if (spacingMap[value]) {
    return spacingMap[value];
  }

  // 如果是数字字符串，当作 Tailwind 的间距级别
  const numValue = parseInt(value, 10);
  if (!isNaN(numValue) && spacing[numValue as keyof typeof spacing]) {
    return spacing[numValue as keyof typeof spacing];
  }

  return value;
}

// ============================================
// 解析圆角值 - 支持 Token 引用
// ============================================

export function resolveBorderRadius(value: string): string {
  if (borderRadius[value as keyof typeof borderRadius]) {
    return borderRadius[value as keyof typeof borderRadius];
  }
  return value;
}

// ============================================
// 解析阴影值 - 支持 Token 引用
// ============================================

export function resolveShadow(value: string): string {
  if (shadows[value as keyof typeof shadows]) {
    return shadows[value as keyof typeof shadows];
  }
  return value;
}

// ============================================
// 解析字体值 - 支持 Token 引用
// ============================================

export function resolveFontFamily(value: string): string {
  if (fontFamily[value as keyof typeof fontFamily]) {
    return fontFamily[value as keyof typeof fontFamily];
  }
  return value;
}

// ============================================
// 合并样式 - 主题 + 覆盖
// ============================================

export interface ResolvedStyle {
  // CSS 变量形式，用于组件
  cssVars: Record<string, string>;
  // 内联样式，用于直接覆盖
  inlineStyle: React.CSSProperties;
  // 主题对象
  theme: ThemePreset;
}

export function resolveStyle(
  componentStyle?: ComponentStyle,
  context?: string
): ResolvedStyle {
  // 1. 确定主题
  let theme: ThemePreset;

  if (componentStyle?.theme && themePresets[componentStyle.theme]) {
    // 优先使用指定的主题
    theme = themePresets[componentStyle.theme];
  } else if (context) {
    // 根据上下文自动匹配
    theme = matchTheme(context);
  } else {
    // 默认 tech 主题
    theme = themePresets.tech;
  }

  // 2. 生成 CSS 变量
  const cssVars: Record<string, string> = {
    '--primary': theme.colors.primary,
    '--primary-foreground': theme.colors.primaryForeground,
    '--secondary': theme.colors.secondary,
    '--secondary-foreground': theme.colors.secondaryForeground,
    '--background': theme.colors.background,
    '--foreground': theme.colors.foreground,
    '--card': theme.colors.card,
    '--card-foreground': theme.colors.cardForeground,
    '--muted': theme.colors.muted,
    '--muted-foreground': theme.colors.mutedForeground,
    '--accent': theme.colors.accent,
    '--accent-foreground': theme.colors.accentForeground,
    '--border': theme.colors.border,
    '--ring': theme.colors.ring,
    '--radius': theme.style.borderRadius,
  };

  // 3. 处理覆盖
  const inlineStyle: React.CSSProperties = {};

  if (componentStyle?.override) {
    const override = componentStyle.override;

    if (override.background) {
      inlineStyle.background = resolveColor(override.background);
    }
    if (override.color) {
      inlineStyle.color = resolveColor(override.color);
    }
    if (override.borderColor) {
      inlineStyle.borderColor = resolveColor(override.borderColor);
    }
    if (override.padding !== undefined) {
      inlineStyle.padding = resolveSpacing(override.padding);
    }
    if (override.margin !== undefined) {
      inlineStyle.margin = resolveSpacing(override.margin);
    }
    if (override.gap !== undefined) {
      inlineStyle.gap = resolveSpacing(override.gap);
    }
    if (override.borderRadius) {
      inlineStyle.borderRadius = resolveBorderRadius(override.borderRadius);
    }
    if (override.shadow || override.boxShadow) {
      inlineStyle.boxShadow = resolveShadow(override.shadow || override.boxShadow as string);
    }
    if (override.fontSize !== undefined) {
      inlineStyle.fontSize = typeof override.fontSize === 'number'
        ? `${override.fontSize}px`
        : override.fontSize;
    }
    if (override.fontWeight !== undefined) {
      inlineStyle.fontWeight = override.fontWeight as React.CSSProperties['fontWeight'];
    }
    if (override.fontFamily) {
      inlineStyle.fontFamily = resolveFontFamily(override.fontFamily);
    }
    if (override.width !== undefined) {
      inlineStyle.width = typeof override.width === 'number' ? `${override.width}px` : override.width;
    }
    if (override.height !== undefined) {
      inlineStyle.height = typeof override.height === 'number' ? `${override.height}px` : override.height;
    }
    if (override.textAlign) {
      inlineStyle.textAlign = override.textAlign;
    }
    if (override.opacity !== undefined) {
      inlineStyle.opacity = override.opacity;
    }
  }

  return {
    cssVars,
    inlineStyle,
    theme,
  };
}

// ============================================
// 生成 CSS 变量字符串 - 用于导出 HTML
// ============================================

export function generateCSSVars(theme: ThemePreset): string {
  return `
:root {
  --primary: ${theme.colors.primary};
  --primary-foreground: ${theme.colors.primaryForeground};
  --secondary: ${theme.colors.secondary};
  --secondary-foreground: ${theme.colors.secondaryForeground};
  --background: ${theme.colors.background};
  --foreground: ${theme.colors.foreground};
  --card: ${theme.colors.card};
  --card-foreground: ${theme.colors.cardForeground};
  --muted: ${theme.colors.muted};
  --muted-foreground: ${theme.colors.mutedForeground};
  --accent: ${theme.colors.accent};
  --accent-foreground: ${theme.colors.accentForeground};
  --border: ${theme.colors.border};
  --ring: ${theme.colors.ring};
  --radius: ${theme.style.borderRadius};

  --success: ${theme.colors.success};
  --warning: ${theme.colors.warning};
  --error: ${theme.colors.error};
  --info: ${theme.colors.info};
}
`.trim();
}

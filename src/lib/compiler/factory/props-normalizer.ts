/**
 * Props 归一化器
 *
 * 将 AST 的语义化 props 转换为 React 组件可用的格式
 */

import type { BaseProps } from '../logic/ast';
import type { DesignTokens } from '../visual/types';
import type { NormalizedProps } from './types';

/**
 * 尺寸映射表
 */
const SIZE_CLASS_MAP: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

/**
 * 间距映射表
 */
const SPACING_MAP: Record<string, string> = {
  compact: '--spacing-sm',
  normal: '--spacing-md',
  spacious: '--spacing-lg',
};

/**
 * 对齐映射表
 */
const ALIGN_CLASS_MAP: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Justify 映射表
 */
const JUSTIFY_CLASS_MAP: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

/**
 * 归一化单个 prop 值
 */
function normalizeSize(
  size: string,
  tokens: DesignTokens
): Partial<NormalizedProps> {
  const className = SIZE_CLASS_MAP[size];
  const tokenKey = `--font-size-${size}` as keyof DesignTokens;
  const fontSize = tokens[tokenKey] as string | undefined;

  return {
    className,
    style: fontSize ? { fontSize } : undefined,
  };
}

function normalizeSpacing(
  spacing: string,
  tokens: DesignTokens
): Partial<NormalizedProps> {
  const tokenKey = SPACING_MAP[spacing] as keyof DesignTokens;
  const gap = tokens[tokenKey] as string | undefined;

  return {
    style: gap ? { gap } : undefined,
  };
}

function normalizeAlign(align: string): Partial<NormalizedProps> {
  return {
    className: ALIGN_CLASS_MAP[align],
  };
}

function normalizeJustify(justify: string): Partial<NormalizedProps> {
  return {
    className: JUSTIFY_CLASS_MAP[justify],
  };
}

/**
 * 合并 className
 */
function mergeClassNames(...classNames: (string | undefined)[]): string | undefined {
  const filtered = classNames.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * 合并 style
 */
function mergeStyles(
  ...styles: (Record<string, string> | undefined)[]
): Record<string, string> | undefined {
  const merged: Record<string, string> = {};
  let hasStyles = false;

  for (const style of styles) {
    if (style) {
      Object.assign(merged, style);
      hasStyles = true;
    }
  }

  return hasStyles ? merged : undefined;
}

/**
 * 归一化 Props
 *
 * 将 AST 的语义化 props 转换为 React 组件可用的格式
 *
 * @param props AST props
 * @param tokens Design Tokens
 * @returns 归一化后的 props
 */
export function normalizeProps(
  props: BaseProps,
  tokens: DesignTokens
): NormalizedProps {
  const result: NormalizedProps = {};
  const classNames: (string | undefined)[] = [];
  const styles: (Record<string, string> | undefined)[] = [];

  // 遍历所有 props
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    switch (key) {
      case 'size': {
        const normalized = normalizeSize(value as string, tokens);
        classNames.push(normalized.className);
        styles.push(normalized.style);
        break;
      }

      case 'spacing': {
        const normalized = normalizeSpacing(value as string, tokens);
        styles.push(normalized.style);
        break;
      }

      case 'align': {
        const normalized = normalizeAlign(value as string);
        classNames.push(normalized.className);
        break;
      }

      case 'justify': {
        const normalized = normalizeJustify(value as string);
        classNames.push(normalized.className);
        break;
      }

      case 'gutter': {
        // gutter 直接作为 gap 样式
        styles.push({ gap: value as string });
        break;
      }

      case 'padding': {
        styles.push({ padding: value as string });
        break;
      }

      case 'margin': {
        styles.push({ margin: value as string });
        break;
      }

      case 'width': {
        styles.push({ width: value as string });
        break;
      }

      case 'height': {
        styles.push({ height: value as string });
        break;
      }

      case 'gap': {
        styles.push({ gap: value as string });
        break;
      }

      case 'direction': {
        // Flex/Stack 方向
        result.direction = value;
        break;
      }

      // 直接透传的 props
      case 'variant':
      case 'title':
      case 'content':
      case 'text':
      case 'label':
      case 'placeholder':
      case 'icon':
      case 'iconPosition':
      case 'disabled':
      case 'loading':
      case 'onClick':
        result[key] = value;
        break;

      default:
        // 其他 props 直接透传
        result[key] = value;
    }
  }

  // 合并 className 和 style
  const mergedClassName = mergeClassNames(...classNames);
  const mergedStyle = mergeStyles(...styles);

  if (mergedClassName) {
    result.className = mergedClassName;
  }

  if (mergedStyle) {
    result.style = mergedStyle;
  }

  return result;
}

/**
 * 应用 Design Tokens 到 style
 *
 * 将 tokens 中的变量注入到组件的 style 中
 */
export function applyTokensToStyle(
  tokens: DesignTokens
): Record<string, string> {
  const style: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('--') && typeof value === 'string') {
      style[key] = value;
    }
  }

  return style;
}

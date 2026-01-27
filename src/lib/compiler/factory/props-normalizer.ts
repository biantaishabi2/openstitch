/**
 * Props 归一化器
 *
 * 将 AST 的语义化 props 转换为 React 组件可用的格式
 * 支持样式透传通道 (Style Passthrough Channel)
 */

import { twMerge } from 'tailwind-merge';
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
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
  '8xl': 'text-8xl',
  '9xl': 'text-9xl',
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
 * Gap token 映射表
 * DSL 中使用语义化名称，转换为 CSS 变量
 */
const GAP_TOKEN_MAP: Record<string, string> = {
  NONE: '0',
  XS: '--spacing-xs',
  SM: '--spacing-sm',
  MD: '--spacing-md',
  LG: '--spacing-lg',
  XL: '--spacing-xl',
  none: '0',
  xs: '--spacing-xs',
  sm: '--spacing-sm',
  md: '--spacing-md',
  lg: '--spacing-lg',
  xl: '--spacing-xl',
};

/**
 * Gap 语义化名称到数字的映射（用于 Grid/Columns 组件）
 */
const GAP_TO_NUMBER_MAP: Record<string, number> = {
  NONE: 0,
  XS: 1,
  SM: 2,
  MD: 4,
  LG: 6,
  XL: 8,
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
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
 * Variant 映射表
 * DSL 使用语义化名称，映射到 shadcn 组件的实际 variant
 */
const VARIANT_MAP: Record<string, string> = {
  primary: 'default',    // DSL "primary" → shadcn "default"（主要按钮样式）
  // 其他 variant 保持原值
};

/**
 * MaxWidth 映射表
 * DSL 语义化名称 → Tailwind max-width 类
 */
const MAX_WIDTH_MAP: Record<string, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
  screen: 'max-w-screen',
};

const BOOLEAN_PROP_KEYS = new Set([
  'checked',
  'defaultchecked',
  'disabled',
  'loading',
  'fullheight',
  'fullwidth',
  'centered',
  'wrap',
  'rounded',
  'divided',
  'collapsible',
  'vertical',
  'defaultopen',
]);

const NUMERIC_PROP_KEYS = new Set([
  'gap',
  'columns',
  'currentstep',
  'max',
  'step',
  'value',
  'padding',
  'size',
]);

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
 * 支持样式透传通道 (Style Passthrough Channel)
 *
 * 样式优先级（从低到高）：
 * 1. Visual Engine (design tokens)
 * 2. Component Factory 默认映射
 * 3. DSL CSS: 字段 (customClassName) - 最高优先级
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

  // 提取 customClassName（用于最后合并）
  let customClassName: string | undefined;

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
        // gutter 和 gap 一样处理，使用 token 名转换
        const gutterValue = value as string;
        const tokenKey = GAP_TOKEN_MAP[gutterValue] as keyof DesignTokens;
        if (tokenKey && tokens[tokenKey]) {
          styles.push({ gap: tokens[tokenKey] as string });
        } else {
          styles.push({ gap: gutterValue });
        }
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

      case 'maxWidth':
      case 'maxwidth': {
        // MaxWidth 使用语义化名称（xs, sm, md, lg, xl），转换为 Tailwind 类
        const maxWidthValue = value as string;
        const maxWidthClass = MAX_WIDTH_MAP[maxWidthValue];
        if (maxWidthClass) {
          classNames.push(maxWidthClass);
        } else {
          // 如果不是预定义值，直接作为 CSS 值
          styles.push({ maxWidth: maxWidthValue });
        }
        // 已处理，不再作为prop传递
        continue;
      }

      case 'gap': {
        // Gap 处理优先级：
        // 1. 语义化名称 (XS, SM, MD...) → 转为数字，供 Grid/Columns 等组件使用
        // 2. 数字字符串 → 直接转为数字
        // 3. CSS 值 (如 "16px") → 作为 style
        const gapValue = value as string;

        // 优先检查是否是语义化名称
        if (GAP_TO_NUMBER_MAP[gapValue] !== undefined) {
          result.gap = GAP_TO_NUMBER_MAP[gapValue];
        } else {
          // 尝试转换为数字
          const numericGap = Number(gapValue);
          if (!isNaN(numericGap)) {
            result.gap = numericGap;
          } else {
            // 否则作为 CSS 值处理
            styles.push({ gap: gapValue });
          }
        }
        break;
      }

      case 'columns': {
        // Grid 的 columns prop，需要转换为数字
        const colValue = value as string;
        const numericCols = Number(colValue);
        if (!isNaN(numericCols)) {
          result.columns = numericCols;
        }
        break;
      }

      case 'direction': {
        // Flex/Stack 方向
        result.direction = value;
        break;
      }

      // 样式透传通道：保存 customClassName，最后用 twMerge 合并
      case 'customClassName': {
        customClassName = value as string;
        break;
      }

      // variant 需要映射
      case 'variant': {
        const variantValue = value as string;
        // 如果有映射则使用映射值，否则保持原值
        result[key] = VARIANT_MAP[variantValue] || variantValue;
        break;
      }

      // 直接透传的 props
      case 'title':
      case 'content':
      case 'text':
      case 'label':
      case 'placeholder':
        result[key] = value;
        break;

      case 'icon':
        // Icon 组件需要 name prop，其他组件需要 icon prop
        // 同时设置两者，让组件自己选择使用
        result['name'] = value;
        result[key] = value;
        break;
      case 'iconPosition':
      case 'disabled':
      case 'loading':
      case 'onClick':
        result[key] = value;
        break;

      default: {
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          const keyLower = key.toLowerCase();
          if (BOOLEAN_PROP_KEYS.has(keyLower)) {
            if (lower === 'true') {
              result[key] = true;
              break;
            }
            if (lower === 'false') {
              result[key] = false;
              break;
            }
          }
          if (NUMERIC_PROP_KEYS.has(keyLower)) {
            const numberValue = Number(value);
            if (!Number.isNaN(numberValue)) {
              result[key] = numberValue;
              break;
            }
          }
        }
        // 其他 props 直接透传
        result[key] = value;
        break;
      }
    }
  }

  // 合并 className 和 style
  const mergedClassName = mergeClassNames(...classNames);
  const mergedStyle = mergeStyles(...styles);

  // 使用 twMerge 智能合并 className
  // customClassName 优先级最高，会覆盖冲突的标准类
  if (mergedClassName || customClassName) {
    result.className = twMerge(mergedClassName, customClassName);
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

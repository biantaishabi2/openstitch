/**
 * AST 类型 → component-map 组件映射
 *
 * 将 AST 的 ComponentType 映射到 renderer/component-map 中的组件名称
 */

import type { ComponentType } from '../logic/ast';

/**
 * AST type → component-map key 映射表
 *
 * 大多数类型直接映射，少数需要名称转换
 */
export const TYPE_MAP: Record<ComponentType, string> = {
  // 根节点
  Root: 'Page',

  // 布局组件 - 直接映射
  Section: 'Section',
  Container: 'Container',
  Grid: 'Grid',
  Flex: 'Flex',
  Stack: 'Stack',
  Columns: 'Columns',
  Split: 'Split',
  Rows: 'Rows',
  Center: 'Center',
  Page: 'Page',
  Hero: 'Hero',
  Spacer: 'Spacer',

  // 导航组件
  Header: 'Flex',     // Header → Flex (with special props)
  Footer: 'Flex',     // Footer → Flex (with special props)
  Sidebar: 'Stack',   // Sidebar → Stack (with special props)
  Nav: 'Flex',        // Nav → Flex (with special props)
  Tabs: 'Tabs',
  Breadcrumb: 'Breadcrumb',
  Stepper: 'Stepper',

  // 数据展示 - 直接映射
  Card: 'Card',
  Table: 'Table',
  List: 'List',
  Timeline: 'Timeline',
  Accordion: 'Accordion',
  Statistic: 'Statistic',
  StatisticCard: 'StatisticCard',
  Avatar: 'Avatar',
  Text: 'Text',
  Image: 'Image',
  Icon: 'Icon',
  Badge: 'Badge',
  Code: 'CodeBlock',  // 名称映射
  Quote: 'Text',      // Quote → Text (with blockquote style)
  Heading: 'Text',    // Heading → Text (with title variant)

  // 表单组件
  Button: 'Button',
  Input: 'Input',
  Label: 'Label',
  Checkbox: 'Checkbox',
  Switch: 'Switch',
  Slider: 'Slider',
  Radio: 'RadioGroup',  // 名称映射
  Select: 'Select',
  Form: 'Stack',      // Form → Stack (direction="col")

  // 反馈组件
  Alert: 'Alert',
  Modal: 'Dialog',    // 名称映射
  Progress: 'Progress',
  Tooltip: 'Tooltip',
  Skeleton: 'Skeleton',
  EmptyState: 'EmptyState',

  // 其他
  Link: 'Link',
  Divider: 'Separator',  // 名称映射
};

/**
 * 需要特殊 props 处理的类型
 */
export const SPECIAL_TYPE_PROPS: Record<string, Record<string, unknown>> = {
  // ========== 映射组件的特殊 props ==========

  // Heading 使用 Text 的 title variant
  Heading: { variant: 'title', as: 'h2' },

  // Quote 使用 Text 的 blockquote
  Quote: { as: 'blockquote', className: 'border-l-4 border-muted pl-4 italic' },

  // Form 使用 Stack 的 column 方向
  Form: { direction: 'col', gap: 4 },

  // Sidebar 使用 Stack 的 column 方向，带深色背景
  Sidebar: {
    direction: 'col',
    className: 'w-64 min-h-screen bg-slate-900 text-white p-4 shrink-0',
  },

  // Header/Footer 使用 Flex 的特定样式
  Header: {
    justify: 'between',
    align: 'center',
    className: 'h-14 bg-white border-b border-gray-200 px-6 mb-6',
  },
  Footer: { justify: 'between', align: 'center', className: 'py-4 mt-auto' },

  // Nav 使用 Flex 的垂直布局
  Nav: { direction: 'col', gap: 1, className: 'w-full' },

  // Section 禁用自动 grid 布局，让内部组件控制布局
  Section: { layout: 'none', className: '!p-0 flex-1 flex flex-col' },

  // ========== 布局组件默认 props ==========

  // Stack 默认垂直方向
  Stack: { direction: 'col' },

  // Center 居中对齐
  Center: {
    className: 'flex items-center justify-center',
  },

  // Rows 垂直排列
  Rows: { direction: 'col' },

  // Hero 主视觉区域
  Hero: {
    className: 'min-h-[50vh] flex flex-col items-center justify-center text-center p-8',
  },

  // Page 页面容器
  Page: {
    className: 'min-h-screen bg-background',
  },
};

/**
 * 获取映射后的组件类型
 */
export function getMappedType(astType: ComponentType): string {
  return TYPE_MAP[astType] || astType;
}

/**
 * 获取特殊类型的附加 props
 */
export function getSpecialProps(astType: ComponentType): Record<string, unknown> {
  return SPECIAL_TYPE_PROPS[astType] || {};
}

/**
 * 复合组件列表（需要插槽分发）
 */
export const COMPOSITE_COMPONENTS = new Set([
  'Card',
  'Alert',
  'Dialog',
  'Tabs',
  'Table',
  'Accordion',
  'Timeline',
  'Breadcrumb',
  'Stepper',
  'Tooltip',
]);

/**
 * 判断是否为复合组件
 */
export function isCompositeComponent(type: string): boolean {
  return COMPOSITE_COMPONENTS.has(type);
}

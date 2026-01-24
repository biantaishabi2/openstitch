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
  // 根节点 - 不渲染为组件
  Root: 'Page',

  // 布局组件 - 直接映射
  Section: 'Section',
  Container: 'Container',
  Grid: 'Grid',
  Flex: 'Flex',
  Spacer: 'Spacer',

  // 内容组件 - 直接映射
  Card: 'Card',
  Text: 'Text',
  Image: 'Image',
  Icon: 'Icon',
  Badge: 'Badge',
  Link: 'Link',

  // 交互组件 - 直接映射
  Button: 'Button',
  Input: 'Input',

  // 数据展示 - 直接映射
  Table: 'Table',
  List: 'List',
  Tabs: 'Tabs',

  // 反馈组件 - 直接映射
  Alert: 'Alert',

  // 名称映射（AST type 与 component-map key 不同）
  Modal: 'Dialog',
  Divider: 'Separator',
  Code: 'CodeBlock',

  // 缺失组件（用现有组件组合实现）
  Form: 'Stack',      // Form → Stack (direction="column")
  Header: 'Flex',     // Header → Flex
  Footer: 'Flex',     // Footer → Flex
  Sidebar: 'Stack',   // Sidebar → Stack (direction="column")
  Nav: 'Flex',        // Nav → Flex
  Heading: 'Text',    // Heading → Text (variant="title")
  Quote: 'Text',      // Quote → Text (as="blockquote")
};

/**
 * 需要特殊 props 处理的类型
 */
export const SPECIAL_TYPE_PROPS: Record<string, Record<string, unknown>> = {
  // Heading 使用 Text 的 title variant
  Heading: { variant: 'title', as: 'h2' },

  // Quote 使用 Text 的 blockquote
  Quote: { as: 'blockquote', className: 'border-l-4 border-muted pl-4 italic' },

  // Form 使用 Stack 的 column 方向
  Form: { direction: 'column', gap: 4 },

  // Sidebar 使用 Stack 的 column 方向
  Sidebar: { direction: 'column', className: 'w-64' },

  // Header/Footer 使用 Flex 的特定样式
  Header: { justify: 'between', align: 'center', className: 'py-4' },
  Footer: { justify: 'between', align: 'center', className: 'py-4 mt-auto' },

  // Nav 使用 Flex 的特定样式
  Nav: { gap: 2, align: 'center' },
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
]);

/**
 * 判断是否为复合组件
 */
export function isCompositeComponent(type: string): boolean {
  return COMPOSITE_COMPONENTS.has(type);
}

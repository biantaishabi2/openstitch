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
 * 需要特殊 props 处理的类型（从配置读取）
 */
import {
  getSpecialProps as getSpecialPropsFromConfig,
  isCompositeComponent as isCompositeFromConfig,
} from '../config';

/**
 * 获取映射后的组件类型
 */
export function getMappedType(astType: ComponentType): string {
  return TYPE_MAP[astType] || astType;
}

/**
 * 获取特殊类型的附加 props（从配置读取）
 */
export function getSpecialProps(astType: ComponentType): Record<string, unknown> {
  return getSpecialPropsFromConfig(astType);
}

/**
 * 判断是否为复合组件（从配置读取）
 */
export function isCompositeComponent(type: string): boolean {
  return isCompositeFromConfig(type);
}

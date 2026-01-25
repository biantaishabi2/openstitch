/**
 * SlottedCard - Card 组件的插槽包装器
 *
 * 将 slots.header / slots.content / slots.footer 正确分发到
 * CardHeader / CardContent / CardFooter 子组件
 */

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';

/**
 * 将 icon 字符串转换为 Lucide 图标组件
 */
function renderIcon(icon: React.ReactNode | string | undefined): React.ReactNode {
  if (!icon) return null;

  // 如果已经是 ReactNode，直接返回
  if (React.isValidElement(icon)) return icon;

  // 如果是字符串，尝试从 Lucide 图标中找到对应的组件
  if (typeof icon === 'string') {
    // 将 kebab-case 转换为 PascalCase (e.g., "user-plus" -> "UserPlus")
    const pascalCase = icon
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    // 尝试获取图标组件
    const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[pascalCase];

    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }

    // 如果找不到，返回 null（不显示无效图标名）
    return null;
  }

  return null;
}

export interface SlottedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 插槽内容 */
  slots?: {
    header?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    content?: React.ReactNode;
    footer?: React.ReactNode;
  };
  /** 便捷属性: 标题 */
  title?: string;
  /** 便捷属性: 描述 */
  description?: string;
  /** 便捷属性: 内容 */
  content?: string;
  /** 图标 (字符串如 "users" 或 ReactNode) */
  icon?: React.ReactNode | string;
  /** 变体 */
  variant?: 'default' | 'outline';
}

export const SlottedCard: React.FC<SlottedCardProps> = ({
  slots,
  title,
  description,
  content,
  icon,
  variant,
  children,
  ...props
}) => {
  // 判断是否有 header 区域内容
  const hasHeader = !!(
    slots?.header ||
    slots?.title ||
    slots?.description ||
    title ||
    description ||
    icon
  );

  // 判断是否有 content 区域内容
  const hasContent = !!(slots?.content || content || children);

  // 判断是否有 footer 区域内容
  const hasFooter = !!slots?.footer;

  return (
    <Card {...props}>
      {hasHeader && (
        <CardHeader>
          {/* 如果有 slots.header，直接渲染 */}
          {slots?.header}

          {/* 标题: 支持 slots.title 或 title 字符串 */}
          {(slots?.title || title || icon) && (
            <CardTitle className="flex items-center gap-2">
              {renderIcon(icon)}
              {slots?.title ?? title}
            </CardTitle>
          )}

          {/* 描述: 支持 slots.description 或 description 字符串 */}
          {(slots?.description || description) && (
            <CardDescription>
              {slots?.description ?? description}
            </CardDescription>
          )}
        </CardHeader>
      )}

      {hasContent && (
        <CardContent>
          {slots?.content ?? content ?? children}
        </CardContent>
      )}

      {hasFooter && <CardFooter>{slots?.footer}</CardFooter>}
    </Card>
  );
};

export default SlottedCard;

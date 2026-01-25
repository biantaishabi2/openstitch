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
  /** 图标 */
  icon?: React.ReactNode;
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
              {icon}
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

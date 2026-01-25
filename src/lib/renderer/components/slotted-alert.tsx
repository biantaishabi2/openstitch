/**
 * SlottedAlert - Alert 组件的插槽包装器
 *
 * 将 slots.title / slots.description 正确分发到
 * AlertTitle / AlertDescription 子组件
 */

import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface SlottedAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 插槽内容 */
  slots?: {
    title?: React.ReactNode;
    description?: React.ReactNode;
  };
  /** 便捷属性: 标题 */
  title?: string;
  /** 便捷属性: 描述 */
  description?: string;
  /** 变体 */
  variant?: 'default' | 'destructive';
  /** 图标 */
  icon?: React.ReactNode;
}

export const SlottedAlert: React.FC<SlottedAlertProps> = ({
  slots,
  title,
  description,
  variant,
  icon,
  children,
  ...props
}) => {
  // 判断是否有标题
  const hasTitle = !!(slots?.title || title);

  // 判断是否有描述
  const hasDescription = !!(slots?.description || description || children);

  return (
    <Alert variant={variant} {...props}>
      {icon}

      {hasTitle && <AlertTitle>{slots?.title ?? title}</AlertTitle>}

      {hasDescription && (
        <AlertDescription>
          {slots?.description ?? description ?? children}
        </AlertDescription>
      )}
    </Alert>
  );
};

export default SlottedAlert;

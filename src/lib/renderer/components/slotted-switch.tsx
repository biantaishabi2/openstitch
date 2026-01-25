/**
 * SlottedSwitch - Switch 组件的包装器
 *
 * 支持直接通过 label prop 添加标签
 */

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SlottedSwitchProps {
  /** 标签文本 */
  label?: string;
  /** Switch ID */
  id?: string;
  /** 是否选中 */
  checked?: boolean;
  /** 默认选中状态 */
  defaultChecked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 值变化回调 */
  onCheckedChange?: (checked: boolean) => void;
  /** 自定义类名 */
  className?: string;
}

export const SlottedSwitch: React.FC<SlottedSwitchProps> = ({
  label,
  id,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  className,
}) => {
  // 生成唯一 ID（如果未提供）
  const switchId = id || React.useId();

  if (label) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Switch
          id={switchId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
        />
        <Label
          htmlFor={switchId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            disabled && 'cursor-not-allowed opacity-70'
          )}
        >
          {label}
        </Label>
      </div>
    );
  }

  return (
    <Switch
      id={switchId}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className={className}
    />
  );
};

export default SlottedSwitch;

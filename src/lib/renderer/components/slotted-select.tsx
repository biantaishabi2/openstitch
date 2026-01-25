/**
 * SlottedSelect - Select 组件的插槽包装器
 *
 * 支持两种使用方式：
 * 1. 通过 options prop 快速创建选项
 * 2. 通过 slots 完全自定义
 */

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SlottedSelectProps {
  /** 插槽内容 */
  slots?: {
    trigger?: React.ReactNode;
    content?: React.ReactNode;
  };
  /** 占位符文本 */
  placeholder?: string;
  /** 选项列表（简单模式） */
  options?: (SelectOption | string)[];
  /** 分组选项列表 */
  groups?: SelectOptionGroup[];
  /** 当前值 */
  value?: string;
  /** 默认值 */
  defaultValue?: string;
  /** 值变化回调 */
  onValueChange?: (value: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'default';
  /** 自定义类名 */
  className?: string;
  /** label 文本 */
  label?: string;
  /** 子节点（用于从 DSL 传递选项） */
  children?: React.ReactNode;
}

/**
 * 从 React children 中提取文本内容作为选项
 */
function extractOptionsFromChildren(children: React.ReactNode): SelectOption[] {
  const options: SelectOption[] = [];

  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      // 纯文本直接作为选项
      options.push({ value: child, label: child });
    } else if (React.isValidElement(child)) {
      // React 元素：尝试从 children prop 或 content prop 提取文本
      const props = child.props as { children?: React.ReactNode; content?: string };
      if (typeof props.children === 'string') {
        options.push({ value: props.children, label: props.children });
      } else if (typeof props.content === 'string') {
        options.push({ value: props.content, label: props.content });
      }
    }
  });

  return options;
}

export const SlottedSelect: React.FC<SlottedSelectProps> = ({
  slots,
  placeholder = '请选择...',
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  disabled,
  size,
  className,
  label,
  children,
}) => {
  // 规范化选项（支持字符串简写 + 从 children 提取）
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    // 优先使用 options prop
    if (options && options.length > 0) {
      return options.map((opt) =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt
      );
    }

    // 从 children 提取选项
    if (children) {
      return extractOptionsFromChildren(children);
    }

    return [];
  }, [options, children]);

  // 渲染选项
  const renderOptions = () => {
    // 如果有 slots.content，直接使用
    if (slots?.content) {
      return slots.content;
    }

    // 渲染分组选项
    if (groups && groups.length > 0) {
      return groups.map((group, groupIndex) => (
        <SelectGroup key={groupIndex}>
          <SelectLabel>{group.label}</SelectLabel>
          {group.options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      ));
    }

    // 渲染普通选项
    return normalizedOptions.map((opt) => (
      <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
        {opt.label}
      </SelectItem>
    ));
  };

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      {/* Trigger */}
      {slots?.trigger || (
        <SelectTrigger className={className} size={size}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      )}

      {/* Content */}
      <SelectContent>{renderOptions()}</SelectContent>
    </Select>
  );
};

export default SlottedSelect;

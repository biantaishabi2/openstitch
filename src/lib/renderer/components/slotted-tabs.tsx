'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TabItem {
  value: string;
  title: string;
  content: React.ReactNode;
}

interface SlottedTabsProps {
  /** 预定义的 tabs 数组 */
  tabs?: TabItem[];
  /** 子元素 - 支持从 Card 等组件提取 tab 信息 */
  children?: React.ReactNode;
  /** 默认选中的 tab value */
  defaultValue?: string;
  /** 当前选中的 tab value */
  value?: string;
  /** tab 变化回调 */
  onValueChange?: (value: string) => void;
  /** 样式类名 */
  className?: string;
  /** ID */
  id?: string;
}

/**
 * 从子元素中提取 tab 信息
 * 支持 Card 等组件，使用 title 作为 tab 标题
 */
function extractTabsFromChildren(children: React.ReactNode): TabItem[] {
  const tabs: TabItem[] = [];

  React.Children.forEach(children, (child, index) => {
    if (!React.isValidElement(child)) return;

    const childProps = child.props as Record<string, unknown>;
    // 使用 title 属性作为 tab 标题
    const title = (childProps.title as string) || `Tab ${index + 1}`;
    const value = `tab-${index}`;

    tabs.push({
      value,
      title,
      content: child,
    });
  });

  return tabs;
}

/**
 * SlottedTabs - 支持从 DSL 子元素自动构建 Tabs 结构
 *
 * 用法:
 * 1. 直接传入 tabs prop
 * 2. 使用 Card 等子组件，自动提取 title 作为 tab 标题
 */
export const SlottedTabs: React.FC<SlottedTabsProps> = ({
  tabs,
  children,
  defaultValue,
  value,
  onValueChange,
  className,
  id,
}) => {
  // 从 props 或 children 获取 tabs
  const normalizedTabs = React.useMemo(() => {
    if (tabs && tabs.length > 0) {
      return tabs;
    }
    if (children) {
      return extractTabsFromChildren(children);
    }
    return [];
  }, [tabs, children]);

  // 默认选中第一个 tab
  const defaultTab = defaultValue || normalizedTabs[0]?.value || 'tab-0';

  return (
    <Tabs
      id={id}
      className={className}
      defaultValue={defaultTab}
      value={value}
      onValueChange={onValueChange}
    >
      <TabsList>
        {normalizedTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {normalizedTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

/**
 * Stitch 渲染器
 * 将 JSON Schema 转换为 React 组件树
 */

import * as React from 'react';
import { componentMap, getComponent, hasComponent } from './component-map';
import type { UINode, RendererConfig, RenderContext } from './types';
import * as LucideIcons from 'lucide-react';

// 默认配置
const defaultConfig: RendererConfig = {
  strict: false,
  debug: false,
  customComponents: {},
};

// 图标尺寸映射
const iconSizeMap: Record<string, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

/**
 * 需要将 icon 字符串转换为 React 元素的组件列表
 * 这些组件的 icon prop 期望接收 React.ReactNode
 */
const COMPONENTS_WITH_ICON_ELEMENT = new Set([
  'TimelineItem',
  'Alert',
  'SlottedAlert',
  'StatisticCard',
  'BottomTabsTrigger',  // 移动端底部导航项
  'Card',               // Card 组件的 icon 在 CardTitle 中渲染
  'SlottedCard',        // SlottedCard 也需要 icon
]);

/**
 * 将图标名称字符串转换为 Lucide 图标组件
 * @param iconName 图标名称（如 "Box", "Zap", "Users"）
 * @param size 图标尺寸
 * @returns React 元素或 null
 */
function createIconElement(iconName: string, size: string = 'md'): React.ReactNode {
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<any>>)[iconName];
  if (!IconComponent) {
    console.warn(`[Stitch] Icon "${iconName}" not found in lucide-react`);
    return null;
  }
  return React.createElement(IconComponent, {
    className: iconSizeMap[size] || iconSizeMap.md,
  });
}

// 自闭合组件列表 - 这些组件不能有 children
const SELF_CLOSING_TYPES = new Set([
  'Input',
  'Checkbox',
  'Switch',
  'Slider',
  'Progress',
  'Separator',
  'Skeleton',
  'Image',
  'AvatarImage',
]);

/**
 * 渲染单个节点
 */
function renderNode(
  node: UINode | string | null | undefined,
  context: RenderContext
): React.ReactNode {
  // 1. 处理空值
  if (node === null || node === undefined) {
    return null;
  }

  // 2. 处理文本节点
  if (typeof node === 'string') {
    return node;
  }

  // 3. 查找组件
  const { type, props = {}, slots, children, id } = node;

  // 优先从自定义组件中查找，然后从默认映射表查找
  const Component =
    context.config.customComponents?.[type] || getComponent(type);

  if (!Component) {
    if (context.config.strict) {
      throw new Error(`Unknown component type: "${type}"`);
    }
    console.warn(`[Stitch] Unknown component: "${type}"`);
    return null;
  }

  // 4. 创建新的上下文
  const childContextBase: RenderContext = {
    ...context,
    depth: context.depth + 1,
    parentType: type,
  };

  // 5. 处理插槽（slots）
  let renderedSlots: Record<string, React.ReactNode> | undefined;
  if (slots && typeof slots === 'object') {
    renderedSlots = {};
    for (const [slotName, slotNode] of Object.entries(slots)) {
      const slotPath = context.path
        ? `${context.path}.slots.${slotName}`
        : `slots.${slotName}`;

      // 处理 slot 为数组的情况（无包装组件时）
      if (Array.isArray(slotNode)) {
        renderedSlots[slotName] = slotNode.map((child, index) => {
          const childPath = `${slotPath}.${index}`;
          return renderNode(child, {
            ...childContextBase,
            path: childPath,
          });
        });
      } else {
        renderedSlots[slotName] = renderNode(slotNode, {
          ...childContextBase,
          path: slotPath,
        });
      }
    }
  }

  // 6. 处理子节点（children）
  let renderedChildren: React.ReactNode = null;
  if (children !== undefined) {
    if (Array.isArray(children)) {
      // 数组：递归渲染每个子节点
      renderedChildren = children.map((child, index) => {
        const childPath = context.path
          ? `${context.path}.children.${index}`
          : `children.${index}`;
        const rendered = renderNode(child, {
          ...childContextBase,
          path: childPath,
        });
        // 为每个子节点添加 key
        if (React.isValidElement(rendered)) {
          return React.cloneElement(rendered, { key: index });
        }
        return <React.Fragment key={index}>{rendered}</React.Fragment>;
      });
    } else if (typeof children === 'object') {
      // 单个对象节点
      const childPath = context.path ? `${context.path}.children` : 'children';
      renderedChildren = renderNode(children as UINode, {
        ...childContextBase,
        path: childPath,
      });
    } else {
      // 字符串或其他
      renderedChildren = children;
    }
  }

  // 7. 构建最终的 props
  const finalProps: Record<string, any> = {
    ...props,
  };

  // 处理 icon prop
  // - 对于 Icon 组件：删除 icon prop（只需要 name prop）
  // - 对于需要 icon 元素的组件（如 TimelineItem）：将 icon 字符串转换为实际的 Icon 组件
  // - 对于其他组件：删除 icon prop 避免被传递给 DOM
  if (typeof finalProps.icon === 'string' && finalProps.icon) {
    if (type === 'Icon') {
      // Icon 组件使用 name prop，删除多余的 icon prop 避免被传递给 SVG
      delete finalProps.icon;
    } else if (COMPONENTS_WITH_ICON_ELEMENT.has(type)) {
      // 特定组件：将图标名称转换为实际的 Icon 元素
      finalProps.icon = createIconElement(finalProps.icon);
    } else {
      // 其他组件：删除 icon prop，避免被传递给 DOM 导致 [object Object]
      delete finalProps.icon;
    }
  }

  // 支持 id 属性用于锚点链接
  if (id) {
    finalProps.id = id;
  }

  // 如果有插槽，传递给组件
  if (renderedSlots) {
    finalProps.slots = renderedSlots;
  }

  // 调试模式：添加 data-* 属性
  if (context.config.debug) {
    finalProps['data-stitch-type'] = type;
    finalProps['data-stitch-depth'] = context.depth;
    if (context.path) {
      finalProps['data-stitch-path'] = context.path;
    }
    if (id) {
      finalProps['data-stitch-id'] = id;
    }
    if (props && Object.keys(props).length > 0) {
      try {
        finalProps['data-stitch-props'] = JSON.stringify(props);
      } catch {
        // ignore serialization issues
      }
    }
  }

  // 8. 返回渲染后的组件
  // 自闭合组件不能有 children
  if (SELF_CLOSING_TYPES.has(type)) {
    return React.createElement(Component, finalProps);
  }

  return React.createElement(Component, finalProps, renderedChildren);
}

/**
 * 渲染整个 Schema
 */
export function render(
  schema: UINode,
  config: RendererConfig = {}
): React.ReactNode {
  const mergedConfig = { ...defaultConfig, ...config };

  const context: RenderContext = {
    depth: 0,
    config: mergedConfig,
  };

  return renderNode(schema, context);
}

/**
 * StitchRenderer 组件
 * 用于在 React 组件中直接使用
 */
interface StitchRendererProps {
  schema: UINode;
  config?: RendererConfig;
  className?: string;
}

export const StitchRenderer: React.FC<StitchRendererProps> = ({
  schema,
  config = {},
  className,
}) => {
  const rendered = render(schema, config);

  if (className) {
    return <div className={className}>{rendered}</div>;
  }

  return <>{rendered}</>;
};

/**
 * useStitchRenderer Hook
 * 用于动态渲染 Schema
 */
export function useStitchRenderer(
  schema: UINode | null,
  config: RendererConfig = {}
): React.ReactNode {
  return React.useMemo(() => {
    if (!schema) return null;
    return render(schema, config);
  }, [schema, config]);
}

// 导出类型和工具函数
export { hasComponent, getComponent };
export type { UINode, RendererConfig, RenderContext };

/**
 * Stitch 渲染器
 * 将 JSON Schema 转换为 React 组件树
 */

import * as React from 'react';
import { componentMap, getComponent, hasComponent } from './component-map';
import type { UINode, RendererConfig, RenderContext } from './types';

// 默认配置
const defaultConfig: RendererConfig = {
  strict: false,
  debug: false,
  customComponents: {},
};

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
  'Avatar',
  'AvatarImage',
  'AvatarFallback',
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
      renderedSlots[slotName] = renderNode(slotNode, {
        ...childContextBase,
        path: slotPath,
      });
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

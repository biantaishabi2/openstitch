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
  const childContext: RenderContext = {
    ...context,
    depth: context.depth + 1,
    parentType: type,
  };

  // 5. 处理插槽（slots）
  let renderedSlots: Record<string, React.ReactNode> | undefined;
  if (slots && typeof slots === 'object') {
    renderedSlots = {};
    for (const [slotName, slotNode] of Object.entries(slots)) {
      renderedSlots[slotName] = renderNode(slotNode, childContext);
    }
  }

  // 6. 处理子节点（children）
  let renderedChildren: React.ReactNode = null;
  if (children !== undefined) {
    if (Array.isArray(children)) {
      // 数组：递归渲染每个子节点
      renderedChildren = children.map((child, index) => {
        const rendered = renderNode(child, childContext);
        // 为每个子节点添加 key
        if (React.isValidElement(rendered)) {
          return React.cloneElement(rendered, { key: index });
        }
        return <React.Fragment key={index}>{rendered}</React.Fragment>;
      });
    } else if (typeof children === 'object') {
      // 单个对象节点
      renderedChildren = renderNode(children as UINode, childContext);
    } else {
      // 字符串或其他
      renderedChildren = children;
    }
  }

  // 7. 构建最终的 props
  const finalProps: Record<string, any> = {
    ...props,
  };

  // 如果有插槽，传递给组件
  if (renderedSlots) {
    finalProps.slots = renderedSlots;
  }

  // 调试模式：添加 data-* 属性
  if (context.config.debug) {
    finalProps['data-stitch-type'] = type;
    finalProps['data-stitch-depth'] = context.depth;
    if (id) {
      finalProps['data-stitch-id'] = id;
    }
  }

  // 8. 返回渲染后的组件
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

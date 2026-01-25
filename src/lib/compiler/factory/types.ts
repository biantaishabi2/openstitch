/**
 * 组件工厂类型定义
 *
 * IR (Intermediate Representation) 类型
 * 复用现有 renderer 的 UINode 类型
 */

import type { UINode } from '../../../renderer/types';
import type { ASTNode, StitchAST } from '../logic/ast';
import type { DesignTokens } from '../visual/types';

// 重新导出 UINode 作为 IR
export type { UINode } from '../../../renderer/types';

/**
 * 组件工厂输入
 */
export interface FactoryInput {
  /** AST 根节点 */
  ast: StitchAST;
  /** Design Tokens */
  tokens: DesignTokens;
  /** 可选配置 */
  options?: FactoryOptions;
}

/**
 * 工厂配置选项
 */
export interface FactoryOptions {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 是否注入事件桩函数 */
  injectEvents?: boolean;
  /** 自定义事件处理器 */
  eventHandlers?: Record<string, EventHandler>;
}

/**
 * 事件处理器类型
 */
export type EventHandler = (id: string, ...args: unknown[]) => void;

/**
 * 事件桩函数配置
 */
export interface EventStubConfig {
  [eventName: string]: (id: string) => (...args: unknown[]) => void;
}

/**
 * 插槽分发规则
 */
export interface SlotRule {
  /** 插槽名称列表 */
  slots: string[];
  /** 分发函数：根据子节点决定放入哪个插槽 */
  distribute: (child: ASTNode) => string;
  /** 插槽对应的组件类型 */
  render: Record<string, string>;
  /** 是否需要特殊处理 */
  special?: boolean;
}

/**
 * Props 归一化器
 */
export type PropsNormalizer = (
  value: unknown,
  tokens: DesignTokens
) => Record<string, unknown>;

/**
 * 归一化后的 Props
 */
export interface NormalizedProps {
  className?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * 插槽分发结果
 */
export interface SlotDistribution {
  [slotName: string]: ASTNode[];
}

/**
 * Adapter V1 类型定义
 * 增强版 Figma 适配器，支持智能节点过滤和布局推断
 */

import type { FigmaNode, FigmaFile } from '../types';

export interface AdapterV1Options {
  /** 上下文描述 */
  context?: string;
  /** 是否过滤装饰节点 */
  filterDecorations?: boolean;
  /** 是否推断布局属性 */
  inferLayout?: boolean;
  /** 是否智能识别卡片 */
  smartCardDetection?: boolean;
  /** 是否简化图标嵌套 */
  flattenIcons?: boolean;
}

export interface LayoutClasses {
  /** Tailwind 宽度类名 */
  width?: string;
  /** Tailwind 高度类名 */
  height?: string;
  /** Tailwind 间距类名 */
  spacing?: string[];
  /** Tailwind 布局类名 (flex/grid) */
  layout?: string[];
  /** Tailwind 背景类名 */
  background?: string;
  /** Tailwind 边框圆角类名 */
  borderRadius?: string;
  /** 其他类名 */
  others?: string[];
}

export interface ProcessedNode {
  /** 原始节点 */
  original: FigmaNode;
  /** 语义化名称 */
  semanticName: string;
  /** 推断的组件类型 */
  componentType: string;
  /** 推断的 Tailwind 类名 */
  classNames: LayoutClasses;
  /** 是否被过滤 */
  filtered: boolean;
  /** 过滤原因 */
  filterReason?: string;
  /** 处理后的子节点 */
  children: ProcessedNode[];
}

export interface AdapterV1Result {
  /** 处理后的节点树 */
  processedTree: ProcessedNode[];
  /** 生成的 DSL */
  dsl: string;
  /** Design Tokens */
  tokens: Record<string, string>;
  /** 统计信息 */
  stats: {
    totalNodes: number;
    filteredNodes: number;
    inferredLayouts: number;
    detectedCards: number;
  };
  /** 处理日志 */
  logs: string[];
}

/** 装饰节点检测配置 */
export interface DecorationDetectionConfig {
  /** 白色背景阈值 */
  whiteThreshold: number;
  /** 最小透明度 */
  minOpacity: number;
  /** 最大面积比例（相对于父节点） */
  maxAreaRatio: number;
}

/** 卡片检测配置 */
export interface CardDetectionConfig {
  /** 最小宽度 */
  minWidth: number;
  /** 最大宽度 */
  maxWidth: number;
  /** 最小高度 */
  minHeight: number;
  /** 最大高度 */
  maxHeight: number;
  /** 必须包含的子节点类型 */
  requiredChildren: string[];
}

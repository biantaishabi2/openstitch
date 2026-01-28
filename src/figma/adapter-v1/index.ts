/**
 * Adapter V1 - 增强版 Figma 适配器
 * 
 * 主要改进：
 * 1. 智能过滤装饰节点（白色背景、小装饰等）
 * 2. 基于位置推断布局属性（Tailwind ClassName）
 * 3. 智能识别卡片结构
 * 4. 语义化命名推断
 */

import type { FigmaFile, FigmaNode } from '../types';
import type { 
  AdapterV1Options, 
  AdapterV1Result, 
  ProcessedNode 
} from './types';
import { 
  isDecorationNode, 
  inferLayoutClasses, 
  inferSemanticName 
} from './node-processor';
import { generateDSL, generateSimpleDSL } from './dsl-generator';
import { extractValidNodes } from '../inferrers/visual-inferrer';
import { inferVisuals } from '../inferrers/visual-inferrer';

/** 默认选项 */
const DEFAULT_OPTIONS: AdapterV1Options = {
  context: '',
  filterDecorations: true,
  inferLayout: true,
  smartCardDetection: true,
  flattenIcons: true,
};

/**
 * 处理单个节点
 */
function processNode(
  node: FigmaNode,
  parent: FigmaNode | null,
  siblings: FigmaNode[],
  options: AdapterV1Options,
  logs: string[]
): ProcessedNode {
  const processed: ProcessedNode = {
    original: node,
    semanticName: inferSemanticName(node, options.context),
    componentType: inferComponentType(node),
    classNames: {},
    filtered: false,
    children: [],
  };
  
  // 1. 检查是否是装饰节点
  if (options.filterDecorations) {
    if (isDecorationNode(node, parent)) {
      processed.filtered = true;
      processed.filterReason = 'decoration node (white background or small element)';
      logs.push(`[FILTER] ${node.name} (${node.type}): decoration`);
    }
  }
  
  // 2. 推断布局属性
  if (options.inferLayout && !processed.filtered) {
    processed.classNames = inferLayoutClasses(node, parent, siblings);
    const classStr = Object.values(processed.classNames)
      .flat()
      .filter(Boolean)
      .join(' ');
    if (classStr) {
      logs.push(`[LAYOUT] ${node.name}: ${classStr.substring(0, 60)}...`);
    }
  }
  
  // 3. 智能卡片检测
  if (options.smartCardDetection && !processed.filtered) {
    if (isCardPattern(node)) {
      processed.componentType = 'Card';
      logs.push(`[DETECT] ${node.name}: detected as Card`);
    }
  }
  
  // 4. 处理子节点
  const children = node.children || [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const siblingSiblings = children.filter((_, idx) => idx !== i);
    const processedChild = processNode(child, node, siblingSiblings, options, logs);
    processed.children.push(processedChild);
  }
  
  return processed;
}

/**
 * 推断组件类型
 */
function inferComponentType(node: FigmaNode): string {
  // 基于类型的基础映射
  const typeMap: Record<string, string> = {
    'TEXT': 'Text',
    'RECTANGLE': 'Container',
    'ELLIPSE': 'Container',
    'VECTOR': 'Icon',
    'IMAGE': 'Image',
    'FRAME': 'Frame',
    'GROUP': 'Group',
    'INSTANCE': 'Container',
    'COMPONENT': 'Container',
  };
  
  const baseType = typeMap[node.type] || 'Container';
  
  // 基于命名增强识别
  const name = node.name?.toLowerCase() || '';
  if (name.includes('button') || name.includes('btn')) return 'Button';
  if (name.includes('card')) return 'Card';
  if (name.includes('input') || name.includes('field')) return 'Input';
  if (name.includes('icon') || name.includes('logo')) return 'Icon';
  if (name.includes('header') || name.includes('title')) return 'Heading';
  if (name.includes('image') || name.includes('img') || name.includes('pic')) return 'Image';
  
  return baseType;
}

/**
 * 检测卡片模式
 */
function isCardPattern(node: FigmaNode): boolean {
  const box = node.absoluteBoundingBox;
  if (!box) return false;
  
  // 尺寸检查
  const isCardSize = box.width >= 80 && box.width <= 200 && 
                     box.height >= 60 && box.height <= 200;
  
  if (!isCardSize) return false;
  
  const children = node.children || [];
  
  // 检查是否包含文本
  const hasText = children.some(c => c.type === 'TEXT');
  
  // 检查是否包含图标或图片
  const hasIconOrImage = children.some(c => 
    c.type === 'FRAME' || c.type === 'VECTOR' || c.type === 'IMAGE' || c.type === 'INSTANCE'
  );
  
  // 检查是否有背景（矩形填充）
  const hasBackground = children.some(c => {
    if (c.type !== 'RECTANGLE') return false;
    const fills = c.fills || [];
    return fills.length > 0 && fills[0].type === 'SOLID';
  });
  
  return hasText && hasIconOrImage && hasBackground;
}

/**
 * 主转换函数
 */
export async function convertFigmaToStitchV1(
  figmaFile: FigmaFile,
  options: AdapterV1Options = {}
): Promise<AdapterV1Result> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const logs: string[] = [];
  
  logs.push(`[START] Adapter V1 processing: ${figmaFile.name}`);
  logs.push(`[OPTIONS] filterDecorations=${opts.filterDecorations}, inferLayout=${opts.inferLayout}`);
  
  // 1. 提取有效节点（只处理 FRAME）
  const validNodes = extractValidNodes(figmaFile.document);
  logs.push(`[NODES] Extracted ${validNodes.length} valid nodes`);
  
  // 2. 找到根节点（CANVAS 下的 FRAME）
  const rootFrames = validNodes.filter(n => {
    // 根节点是没有父节点在 validNodes 中的节点
    const parentIds = new Set(validNodes.flatMap(n => n.children?.map(c => c.id) || []));
    return !parentIds.has(n.id);
  });
  logs.push(`[ROOTS] Found ${rootFrames.length} root frames`);
  
  // 3. 处理节点树
  const processedTree: ProcessedNode[] = [];
  for (const root of rootFrames) {
    const processed = processNode(root, null, [], opts, logs);
    processedTree.push(processed);
  }
  
  // 4. 生成 DSL
  const dsl = generateDSL(processedTree);
  logs.push(`[DSL] Generated ${dsl.split('\n').length} lines`);
  
  // 5. 提取 Design Tokens
  const visuals = inferVisuals(validNodes);
  const tokens: Record<string, string> = {};
  
  // 转换颜色 tokens
  if (visuals.tokens.colors) {
    tokens['--primary-color'] = visuals.tokens.colors.primary;
    tokens['--secondary-color'] = visuals.tokens.colors.secondary || '#6b7280';
    tokens['--accent-color'] = visuals.tokens.colors.accent || visuals.tokens.colors.primary;
    tokens['--background'] = visuals.tokens.colors.background;
    tokens['--foreground'] = visuals.tokens.colors.foreground;
    tokens['--muted'] = visuals.tokens.colors.muted || '#f3f4f6';
    tokens['--border'] = visuals.tokens.colors.border || '#e5e7eb';
  }
  
  // 6. 统计
  let filteredCount = 0;
  let inferredLayoutCount = 0;
  let detectedCardCount = 0;
  
  function countStats(node: ProcessedNode) {
    if (node.filtered) filteredCount++;
    if (Object.keys(node.classNames).length > 0) inferredLayoutCount++;
    if (node.componentType === 'Card') detectedCardCount++;
    for (const child of node.children) {
      countStats(child);
    }
  }
  
  for (const root of processedTree) {
    countStats(root);
  }
  
  logs.push(`[STATS] filtered=${filteredCount}, layouts=${inferredLayoutCount}, cards=${detectedCardCount}`);
  logs.push('[DONE] Adapter V1 processing complete');
  
  return {
    processedTree,
    dsl,
    tokens,
    stats: {
      totalNodes: validNodes.length,
      filteredNodes: filteredCount,
      inferredLayouts: inferredLayoutCount,
      detectedCards: detectedCardCount,
    },
    logs,
  };
}

// 导出子模块
export * from './types';
export * from './node-processor';
export * from './dsl-generator';

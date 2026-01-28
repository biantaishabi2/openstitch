/**
 * Adapter V1 - 主入口
 */

import type { FigmaFile, FigmaNode } from '../types';
import type { AdapterV1Options, AdapterV1Result, ProcessedNode } from './types';
import { processNode } from './processor';
import { detectPattern } from './pattern';
import { generateDSL } from './dsl';

/**
 * 提取有效节点（只处理 FRAME）
 */
function extractRootNodes(document: FigmaNode): FigmaNode[] {
  const roots: FigmaNode[] = [];

  function traverse(node: FigmaNode) {
    // 在 CANVAS 层提取 FRAME 节点（设计稿主容器）
    if (node.type === 'CANVAS' && node.children) {
      for (const child of node.children) {
        if (child.type === 'FRAME') {
          // 这个 FRAME 是设计稿主容器，处理它的子节点
          roots.push(child);
        }
      }
      return;
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(document);
  return roots;
}

/**
 * 提取设计稿中的主要节点（卡片、区块等）
 */
function extractDesignNodes(rootFrame: FigmaNode): FigmaNode[] {
  const nodes: FigmaNode[] = [];
  
  for (const child of rootFrame.children || []) {
    // 跳过不可见节点
    if (child.visible === false) continue;
    
    // 跳过参考图片（独立的大尺寸 RECTANGLE）
    if (child.type === 'RECTANGLE' && child.fills?.some(f => f.type === 'IMAGE')) {
      const box = child.absoluteBoundingBox;
      if (box && box.width > 300 && box.height > 600) {
        continue; // 可能是参考截图
      }
    }
    
    nodes.push(child);
  }
  
  return nodes;
}

/**
 * 提取 Design Tokens
 */
function extractTokens(nodes: ProcessedNode[]): Record<string, string> {
  const colors = new Set<string>();
  const fontSizes = new Set<number>();

  function collect(node: ProcessedNode) {
    if (node.visual.backgroundColor) {
      colors.add(node.visual.backgroundColor);
    }
    if (node.visual.textColor) {
      colors.add(node.visual.textColor);
    }
    if (node.visual.fontSize) {
      fontSizes.add(node.visual.fontSize);
    }

    for (const child of node.children) {
      collect(child);
    }
  }

  for (const node of nodes) {
    collect(node);
  }

  // 简单映射到 tokens
  const colorArray = [...colors];
  const tokens: Record<string, string> = {};

  // 找主色（使用最多的非黑白灰颜色）
  const nonNeutralColors = colorArray.filter(c => !isNeutralColor(c));
  if (nonNeutralColors.length > 0) {
    tokens['--primary-color'] = nonNeutralColors[0];
  }

  // 背景色（最浅的）
  const bgColor = colorArray.find(c => isLightColor(c));
  if (bgColor) {
    tokens['--background'] = bgColor;
  }

  // 文字色（最深的）
  const textColor = colorArray.find(c => isDarkColor(c));
  if (textColor) {
    tokens['--foreground'] = textColor;
  }

  return tokens;
}

/**
 * 判断是否中性色
 */
function isNeutralColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { r, g, b } = rgb;
  return Math.abs(r - g) < 10 && Math.abs(g - b) < 10;
}

/**
 * 判断是否浅色
 */
function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 240;
}

/**
 * 判断是否深色
 */
function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 50;
}

/**
 * Hex 转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * 主转换函数
 */
export function convertFigmaToStitchV1(
  figmaFile: FigmaFile,
  options: AdapterV1Options = {}
): AdapterV1Result {
  // 1. 提取根节点
  const rootFrames = extractRootNodes(figmaFile.document);

  // 2. 提取设计节点并处理
  const processedNodes: ProcessedNode[] = [];
  let filteredCount = 0;
  let cardCount = 0;

  for (const root of rootFrames) {
    const designNodes = extractDesignNodes(root);
    
    for (const node of designNodes) {
      const processed = processNode(node, root);
      if (processed) {
        processedNodes.push(processed);
        
        // 统计
        function countStats(node: ProcessedNode) {
          if (node.filtered) filteredCount++;
          if (node.componentType === 'Card') cardCount++;
          for (const child of node.children) {
            countStats(child);
          }
        }
        countStats(processed);
      }
    }
  }

  // 3. 检测结构模式
  const pattern = detectPattern(processedNodes);

  // 4. 生成 DSL
  const dsl = generateDSL(processedNodes, pattern);

  // 5. 提取 tokens
  const tokens = extractTokens(processedNodes);

  return {
    dsl,
    tokens,
    rootNodes: processedNodes,
    stats: {
      total: processedNodes.length,
      filtered: filteredCount,
      cards: cardCount,
    },
  };
}

// 导出子模块
export * from './types';
export * from './processor';
export * from './pattern';
export * from './dsl';

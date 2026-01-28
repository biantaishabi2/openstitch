/**
 * 节点处理器
 * 负责装饰节点过滤、布局推断、智能命名
 */

import type { FigmaNode } from '../types';
import type { 
  ProcessedNode, 
  LayoutClasses, 
  DecorationDetectionConfig,
  AdapterV1Options 
} from './types';

/** 默认装饰节点检测配置 */
const DEFAULT_DECORATION_CONFIG: DecorationDetectionConfig = {
  whiteThreshold: 0.97,
  minOpacity: 0.5,
  maxAreaRatio: 0.95,
};

/**
 * 判断节点是否是装饰节点
 */
export function isDecorationNode(
  node: FigmaNode, 
  parent: FigmaNode | null,
  config: DecorationDetectionConfig = DEFAULT_DECORATION_CONFIG
): boolean {
  // 1. 无填充的矩形
  if (node.type === 'RECTANGLE') {
    const fills = node.fills || [];
    
    // 无填充或透明填充
    if (fills.length === 0) return true;
    
    const fill = fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const { r, g, b, a = 1 } = fill.color;
      
      // 纯白/纯灰背景（可能是装饰背景）
      const isWhiteOrGray = r > config.whiteThreshold && 
                           g > config.whiteThreshold && 
                           b > config.whiteThreshold;
      
      // 检查是否是父节点的背景
      if (isWhiteOrGray && parent) {
        const parentBox = parent.absoluteBoundingBox;
        const nodeBox = node.absoluteBoundingBox;
        
        if (parentBox && nodeBox) {
          const nodeArea = nodeBox.width * nodeBox.height;
          const parentArea = parentBox.width * parentBox.height;
          const areaRatio = nodeArea / parentArea;
          
          // 大面积白色矩形，可能是背景装饰
          if (areaRatio > 0.8 && areaRatio <= config.maxAreaRatio) {
            return true;
          }
        }
      }
      
      // 极低透明度的填充
      if (a < 0.1) return true;
    }
  }
  
  // 2. 极小的装饰元素（如分割线、小点）
  if (node.type === 'RECTANGLE' || node.type === 'VECTOR') {
    const box = node.absoluteBoundingBox;
    if (box && (box.width < 2 || box.height < 2)) {
      return true;
    }
  }
  
  // 3. 纯容器 GROUP 只有一个子节点（可扁平化）
  if (node.type === 'GROUP' && node.children?.length === 1) {
    const child = node.children[0];
    // 如果子节点和父节点大小相近，可能是冗余包装
    const parentBox = node.absoluteBoundingBox;
    const childBox = child.absoluteBoundingBox;
    if (parentBox && childBox) {
      const sizeSimilar = Math.abs(parentBox.width - childBox.width) < 5 &&
                         Math.abs(parentBox.height - childBox.height) < 5;
      if (sizeSimilar) return true;
    }
  }
  
  return false;
}

/**
 * 推断布局类名
 */
export function inferLayoutClasses(
  node: FigmaNode, 
  parent: FigmaNode | null,
  siblings: FigmaNode[] = []
): LayoutClasses {
  const classes: LayoutClasses = {
    spacing: [],
    layout: [],
    others: [],
  };
  
  const box = node.absoluteBoundingBox;
  const parentBox = parent?.absoluteBoundingBox;
  
  if (!box) return classes;
  
  // 1. 推断宽度
  if (parentBox) {
    const widthRatio = box.width / parentBox.width;
    if (widthRatio >= 0.95) {
      classes.width = 'w-full';
    } else if (widthRatio >= 0.7) {
      classes.width = 'w-3/4';
    } else if (widthRatio >= 0.5) {
      classes.width = 'w-1/2';
    } else if (widthRatio >= 0.33) {
      classes.width = 'w-1/3';
    }
  }
  
  // 2. 推断高度
  if (box.height > 0) {
    if (box.height <= 32) {
      classes.height = 'h-8';
    } else if (box.height <= 40) {
      classes.height = 'h-10';
    } else if (box.height <= 48) {
      classes.height = 'h-12';
    } else if (box.height <= 64) {
      classes.height = 'h-16';
    } else if (box.height <= 96) {
      classes.height = 'h-24';
    } else if (box.height <= 192) {
      classes.height = 'h-48';
    }
  }
  
  // 3. 推断布局模式
  if (node.layoutMode === 'HORIZONTAL') {
    classes.layout?.push('flex', 'flex-row');
    // 推断间距
    const gap = inferGap(node);
    if (gap > 0) {
      classes.spacing?.push(`gap-${Math.min(Math.round(gap / 4), 8)}`);
    }
  } else if (node.layoutMode === 'VERTICAL') {
    classes.layout?.push('flex', 'flex-col');
    const gap = inferGap(node);
    if (gap > 0) {
      classes.spacing?.push(`gap-${Math.min(Math.round(gap / 4), 8)}`);
    }
  } else if (node.type === 'FRAME' || node.type === 'GROUP') {
    // 无 AutoLayout，尝试基于位置推断
    const inferredLayout = inferLayoutFromPositions(node);
    if (inferredLayout) {
      classes.layout?.push(...inferredLayout);
    }
  }
  
  // 4. 推断背景
  const bg = inferBackground(node);
  if (bg) {
    classes.background = bg;
  }
  
  // 5. 推断圆角
  if (node.cornerRadius && node.cornerRadius > 0) {
    if (node.cornerRadius >= 999) {
      classes.borderRadius = 'rounded-full';
    } else if (node.cornerRadius >= 12) {
      classes.borderRadius = 'rounded-xl';
    } else if (node.cornerRadius >= 8) {
      classes.borderRadius = 'rounded-lg';
    } else if (node.cornerRadius >= 4) {
      classes.borderRadius = 'rounded';
    } else {
      classes.borderRadius = 'rounded-sm';
    }
  }
  
  // 6. 推断外边距（基于与父容器的距离）
  if (parentBox && box) {
    const marginTop = Math.round((box.y - parentBox.y) / 4) * 4;
    if (marginTop > 0 && marginTop <= 48) {
      classes.spacing?.push(`mt-${marginTop}`);
    }
  }
  
  return classes;
}

/**
 * 推断节点间距
 */
function inferGap(node: FigmaNode): number {
  const children = node.children || [];
  if (children.length < 2) return 0;
  
  const gaps: number[] = [];
  const isHorizontal = node.layoutMode === 'HORIZONTAL';
  
  for (let i = 1; i < children.length; i++) {
    const prev = children[i - 1].absoluteBoundingBox;
    const curr = children[i].absoluteBoundingBox;
    
    if (prev && curr) {
      if (isHorizontal) {
        gaps.push(curr.x - (prev.x + prev.width));
      } else {
        gaps.push(curr.y - (prev.y + prev.height));
      }
    }
  }
  
  if (gaps.length === 0) return 0;
  
  // 使用中位数作为间距
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

/**
 * 基于子节点位置推断布局
 */
function inferLayoutFromPositions(node: FigmaNode): string[] | null {
  const children = node.children || [];
  if (children.length < 2) return null;
  
  const boxes = children
    .map(c => c.absoluteBoundingBox)
    .filter((b): b is NonNullable<typeof b> => b !== undefined);
  
  if (boxes.length < 2) return null;
  
  // 检查是否是水平排列
  const yPositions = boxes.map(b => b.y);
  const yVariance = Math.max(...yPositions) - Math.min(...yPositions);
  const avgHeight = boxes.reduce((sum, b) => sum + b.height, 0) / boxes.length;
  
  // 如果 Y 坐标差异很小，可能是水平布局
  if (yVariance < avgHeight * 0.5) {
    return ['flex', 'flex-row', 'items-center'];
  }
  
  // 检查是否是垂直排列
  const xPositions = boxes.map(b => b.x);
  const xVariance = Math.max(...xPositions) - Math.min(...xPositions);
  const avgWidth = boxes.reduce((sum, b) => sum + b.width, 0) / boxes.length;
  
  if (xVariance < avgWidth * 0.5) {
    return ['flex', 'flex-col'];
  }
  
  // 检查是否是网格布局
  if (children.length >= 4) {
    return ['grid'];
  }
  
  return null;
}

/**
 * 推断背景类名
 */
function inferBackground(node: FigmaNode): string | null {
  const fills = node.fills || [];
  if (fills.length === 0) return null;
  
  const fill = fills[0];
  if (fill.type !== 'SOLID' || !fill.color) return null;
  
  const { r, g, b, a = 1 } = fill.color;
  
  // 透明
  if (a < 0.1) return null;
  
  // 白色
  if (r > 0.99 && g > 0.99 && b > 0.99) {
    return 'bg-white';
  }
  
  // 灰色系
  const isGray = Math.abs(r - g) < 0.05 && Math.abs(g - b) < 0.05;
  if (isGray) {
    if (r < 0.1) return 'bg-black';
    if (r < 0.3) return 'bg-gray-800';
    if (r < 0.5) return 'bg-gray-600';
    if (r < 0.7) return 'bg-gray-400';
    if (r < 0.9) return 'bg-gray-200';
    return 'bg-gray-100';
  }
  
  // 彩色背景（使用近似色）
  // 这里简化处理，实际应该映射到设计系统的颜色
  return null;
}

/**
 * 推断语义化名称
 */
export function inferSemanticName(node: FigmaNode, context?: string): string {
  const originalName = node.name || '';
  
  // 1. 如果已经有语义化名称，直接使用
  const semanticPatterns = [
    /^(header|footer|nav|sidebar|content|main)$/i,
    /^(card|button|input|modal|dialog)$/i,
    /^(banner|hero|section|article)$/i,
  ];
  
  for (const pattern of semanticPatterns) {
    if (pattern.test(originalName)) {
      return sanitizeName(originalName);
    }
  }
  
  // 2. 基于文本内容命名
  if (node.type === 'TEXT' && node.characters) {
    return sanitizeName(node.characters);
  }
  
  // 3. 基于子节点文本命名
  const textChild = node.children?.find(c => c.type === 'TEXT');
  if (textChild?.characters) {
    return sanitizeName(textChild.characters);
  }
  
  // 4. 基于类型和上下文命名
  if (node.type === 'FRAME' || node.type === 'GROUP') {
    // 检查是否是卡片
    if (isLikelyCard(node)) {
      const textContent = extractTextContent(node);
      return `card_${sanitizeName(textContent || 'item')}`;
    }
    
    // 检查是否是图标容器
    if (isIconContainer(node)) {
      return `icon_${sanitizeName(originalName || 'default')}`;
    }
  }
  
  // 5. 回退到原始名称
  return sanitizeName(originalName || `node_${node.id.slice(-4)}`);
}

/**
 * 判断是否是卡片
 */
function isLikelyCard(node: FigmaNode): boolean {
  const box = node.absoluteBoundingBox;
  if (!box) return false;
  
  // 卡片尺寸范围
  const isCardSize = box.width >= 80 && box.width <= 200 && 
                     box.height >= 60 && box.height <= 200;
  
  const children = node.children || [];
  const hasText = children.some(c => c.type === 'TEXT');
  const hasIcon = children.some(c => 
    c.type === 'FRAME' || c.type === 'VECTOR' || c.type === 'INSTANCE'
  );
  
  return isCardSize && hasText && hasIcon;
}

/**
 * 判断是否是图标容器
 */
function isIconContainer(node: FigmaNode): boolean {
  const box = node.absoluteBoundingBox;
  if (!box) return false;
  
  // 图标尺寸范围
  const isIconSize = box.width <= 48 && box.height <= 48;
  
  const children = node.children || [];
  const hasVectors = children.some(c => c.type === 'VECTOR');
  
  return isIconSize && hasVectors;
}

/**
 * 提取文本内容
 */
function extractTextContent(node: FigmaNode): string | null {
  if (node.type === 'TEXT' && node.characters) {
    return node.characters;
  }
  
  for (const child of node.children || []) {
    const text = extractTextContent(child);
    if (text) return text;
  }
  
  return null;
}

/**
 * 清理名称
 */
function sanitizeName(name: string): string {
  return name
    .replace(/[^\w\u4e00-\u9fa5]/g, '_')  // 保留中文和字母数字
    .replace(/_+/g, '_')  // 合并多个下划线
    .replace(/^_+|_+$/g, '')  // 移除首尾下划线
    .substring(0, 30);  // 限制长度
}

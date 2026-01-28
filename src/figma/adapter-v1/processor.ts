/**
 * 节点处理器 - 提取视觉细节、识别内容、过滤装饰
 */

import type { FigmaNode } from '../types';
import type { VisualDetails, ContentAssets, ProcessedNode } from './types';

/**
 * 提取视觉细节
 */
export function extractVisual(node: FigmaNode): VisualDetails {
  const box = node.absoluteBoundingBox;
  
  const visual: VisualDetails = {
    width: box?.width || 0,
    height: box?.height || 0,
    x: box?.x || 0,
    y: box?.y || 0,
  };

  // 背景色
  const fills = node.fills || [];
  const solidFill = fills.find(f => f.type === 'SOLID' && f.visible !== false);
  if (solidFill?.color) {
    const { r, g, b, a = 1 } = solidFill.color;
    if (a > 0.1) {
      visual.backgroundColor = rgbToHex(r, g, b);
    }
  }

  // 圆角
  if (node.cornerRadius && node.cornerRadius > 0 && node.cornerRadius < 999) {
    visual.borderRadius = Math.round(node.cornerRadius);
  }

  // 阴影
  const effects = node.effects || [];
  const dropShadow = effects.find(e => 
    e.type === 'DROP_SHADOW' && e.visible !== false
  );
  if (dropShadow) {
    visual.shadow = {
      color: dropShadow.color 
        ? rgbaToString(dropShadow.color) 
        : 'rgba(0,0,0,0.1)',
      blur: Math.round(dropShadow.radius || 0),
      x: Math.round(dropShadow.offset?.x || 0),
      y: Math.round(dropShadow.offset?.y || 0),
    };
  }

  // 文字样式
  if (node.type === 'TEXT' && node.style) {
    visual.fontSize = Math.round(node.style.fontSize || 14);
    visual.fontWeight = node.style.fontWeight || 400;
    
    // 文字颜色
    const textFill = fills.find(f => f.type === 'SOLID');
    if (textFill?.color) {
      const { r, g, b } = textFill.color;
      visual.textColor = rgbToHex(r, g, b);
    }
  }

  return visual;
}

/**
 * 识别内容资产
 */
export function extractContent(node: FigmaNode): ContentAssets {
  const content: ContentAssets = {};
  const children = node.children || [];

  // 找文字
  const textNode = children.find(c => c.type === 'TEXT');
  if (textNode?.characters) {
    content.text = textNode.characters;
  }
  // 当前节点就是文字
  if (node.type === 'TEXT' && node.characters) {
    content.text = node.characters;
  }

  // 找图片
  const imageNode = children.find(c => 
    c.fills?.some(f => f.type === 'IMAGE')
  );
  if (imageNode) {
    const imageFill = imageNode.fills?.find(f => f.type === 'IMAGE');
    if (imageFill?.imageRef) {
      content.imageRef = imageFill.imageRef;
    }
  }

  // 找图标 (小尺寸的 Vector 或 FRAME)
  const iconNode = children.find(c => {
    if (c.type === 'VECTOR') return true;
    const box = c.absoluteBoundingBox;
    if (box && box.width <= 48 && box.height <= 48) {
      return c.children?.some(child => child.type === 'VECTOR');
    }
    return false;
  });
  content.hasIcon = !!iconNode;

  return content;
}

/**
 * 判断是否是装饰节点
 */
export function isDecoration(node: FigmaNode, parent?: FigmaNode): boolean {
  // 1. 面积极小
  const box = node.absoluteBoundingBox;
  if (box && (box.width < 3 || box.height < 3)) {
    return true;
  }

  // 2. GROUP 和 FRAME 没有 fills 是正常的，不因此过滤
  if (node.type === 'GROUP' || node.type === 'FRAME') {
    // 但如果是卡片的白色背景装饰，需要特殊处理
    // 这里不处理，留给子节点的 RECTANGLE 处理
    return false;
  }

  // 3. 完全透明（只对非容器节点）
  const fills = node.fills || [];
  if (fills.length === 0) {
    // 没有填充的 VECTOR 或其他节点，可能是装饰
    if (node.type === 'VECTOR' || node.type === 'ELLIPSE') {
      return false; // 保留，可能是图标
    }
    return true;
  }
  
  const visibleFill = fills.find(f => f.visible !== false);
  if (!visibleFill) return true;
  if (visibleFill.color && (visibleFill.color.a || 1) < 0.05) {
    return true;
  }

  // 4. 是卡片的白色背景装饰（RECTANGLE）
  if (node.type === 'RECTANGLE' && parent && visibleFill.type === 'SOLID') {
    const { r, g, b } = visibleFill.color || {};
    if (r && g && b && r > 0.97 && g > 0.97 && b > 0.97) {
      // 面积接近父节点
      const parentBox = parent.absoluteBoundingBox;
      if (box && parentBox) {
        const areaRatio = (box.width * box.height) / (parentBox.width * parentBox.height);
        if (areaRatio > 0.85) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * 判断是否是卡片
 */
export function isCard(node: FigmaNode): boolean {
  const box = node.absoluteBoundingBox;
  if (!box) return false;

  // 尺寸范围（功能入口卡片通常是正方形或接近正方形）
  const isCardSize = box.width >= 60 && box.width <= 200 &&
                     box.height >= 60 && box.height <= 200;
  if (!isCardSize) return false;

  const children = node.children || [];
  
  // 有文字
  const hasText = children.some(c => c.type === 'TEXT');
  
  // 有图标或图片（FRAME 包含 Vector，或有 IMAGE fill）
  const hasIconOrImage = children.some(c => {
    // 直接是 Vector
    if (c.type === 'VECTOR') return true;
    // 有图片填充
    if (c.fills?.some(f => f.type === 'IMAGE')) return true;
    // 是 FRAME 且包含 Vector（图标容器）
    if (c.type === 'FRAME' || c.type === 'GROUP') {
      return c.children?.some(child => 
        child.type === 'VECTOR' || 
        child.type === 'IMAGE' ||
        child.fills?.some(f => f.type === 'IMAGE')
      );
    }
    return false;
  });

  // 卡片通常有背景矩形
  const hasBackground = children.some(c => 
    c.type === 'RECTANGLE' && 
    c.fills?.some(f => f.type === 'SOLID')
  );

  return hasText && hasIconOrImage && hasBackground;
}

/**
 * 处理节点
 */
export function processNode(
  node: FigmaNode, 
  parent?: FigmaNode
): ProcessedNode | null {
  // 过滤装饰节点
  if (isDecoration(node, parent)) {
    return null;
  }

  const visual = extractVisual(node);
  const content = extractContent(node);

  // 确定组件类型
  let componentType: ProcessedNode['componentType'] = 'Unknown';
  
  if (node.type === 'TEXT') {
    componentType = 'Text';
  } else if (content.imageRef) {
    componentType = 'Image';
  } else if (isCard(node)) {
    componentType = 'Card';
  } else if (content.hasIcon && !content.text) {
    componentType = 'Icon';
  } else if (node.children && node.children.length > 0) {
    componentType = 'Section';
  }

  // 处理子节点
  const children: ProcessedNode[] = [];
  for (const child of node.children || []) {
    const processed = processNode(child, node);
    if (processed) {
      children.push(processed);
    }
  }

  return {
    id: node.id,
    name: sanitizeName(node.name || 'unnamed'),
    type: node.type,
    componentType,
    visual,
    content,
    children,
  };
}

/**
 * 清理名称
 */
function sanitizeName(name: string): string {
  return name
    .replace(/[^\w\u4e00-\u9fa5]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30) || 'unnamed';
}

/**
 * RGB 转 Hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * RGBA 转字符串
 */
function rgbaToString(color: { r: number; g: number; b: number; a?: number }): string {
  const { r, g, b, a = 1 } = color;
  if (a === 1) {
    return rgbToHex(r, g, b);
  }
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

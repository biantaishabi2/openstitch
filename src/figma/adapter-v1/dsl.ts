/**
 * DSL 生成器
 */

import type { ProcessedNode, VisualDetails, StructurePattern } from './types';

/**
 * 生成 DSL
 */
export function generateDSL(
  nodes: ProcessedNode[], 
  pattern: StructurePattern,
  depth: number = 0
): string {
  const lines: string[] = [];
  const indent = '  '.repeat(depth);

  // 如果是网格布局，添加容器
  if (pattern.type === 'grid' && depth === 0) {
    lines.push(`${indent}[SECTION: grid_container]`);
    lines.push(`${indent}  { ClassName: "grid grid-cols-${pattern.cols} gap-${pattern.gap}" }`);
    
    for (const node of nodes) {
      lines.push(generateNodeDSL(node, depth + 1));
    }
  } else if (pattern.type === 'flex-row' && depth === 0) {
    lines.push(`${indent}[SECTION: row_container]`);
    lines.push(`${indent}  { ClassName: "flex flex-row gap-${pattern.gap}" }`);
    
    for (const node of nodes) {
      lines.push(generateNodeDSL(node, depth + 1));
    }
  } else if (pattern.type === 'flex-col' && depth === 0) {
    lines.push(`${indent}[SECTION: col_container]`);
    lines.push(`${indent}  { ClassName: "flex flex-col gap-${pattern.gap}" }`);
    
    for (const node of nodes) {
      lines.push(generateNodeDSL(node, depth + 1));
    }
  } else {
    for (const node of nodes) {
      lines.push(generateNodeDSL(node, depth));
    }
  }

  return lines.join('\n');
}

/**
 * 生成单个节点的 DSL
 */
function generateNodeDSL(node: ProcessedNode, depth: number): string {
  const lines: string[] = [];
  const indent = '  '.repeat(depth);

  const tag = mapTag(node.componentType);
  const id = node.name;

  // 节点标签
  lines.push(`${indent}[${tag}: ${id}]`);

  // ClassName
  const className = buildClassName(node.visual);
  if (className) {
    lines.push(`${indent}  { ClassName: "${className}" }`);
  }

  // 内容
  if (node.content.text) {
    lines.push(`${indent}  CONTENT: "${escapeString(node.content.text)}"`);
  }

  if (node.content.imageRef) {
    lines.push(`${indent}  ATTR: Src("${node.content.imageRef}"), Alt("${id}")`);
  }

  // 子节点
  for (const child of node.children) {
    lines.push(generateNodeDSL(child, depth + 1));
  }

  return lines.join('\n');
}

/**
 * 映射组件类型到 DSL 标签
 */
function mapTag(type: ProcessedNode['componentType']): string {
  const map: Record<string, string> = {
    'Card': 'CARD',
    'Section': 'SECTION',
    'Text': 'TEXT',
    'Image': 'IMAGE',
    'Icon': 'ICON',
    'Unknown': 'SECTION',
  };
  return map[type] || 'SECTION';
}

/**
 * 构建 ClassName（保留精确视觉细节）
 */
function buildClassName(visual: VisualDetails): string | null {
  const classes: string[] = [];

  // 尺寸（使用任意值保留精确尺寸）
  if (visual.width > 0) {
    classes.push(`w-[${visual.width}px]`);
  }
  if (visual.height > 0) {
    classes.push(`h-[${visual.height}px]`);
  }

  // 背景色
  if (visual.backgroundColor) {
    classes.push(`bg-[${visual.backgroundColor}]`);
  }

  // 圆角
  if (visual.borderRadius) {
    classes.push(`rounded-[${visual.borderRadius}px]`);
  }

  // 阴影（简化处理）
  if (visual.shadow) {
    classes.push('shadow-sm');
  }

  // 文字样式
  if (visual.fontSize) {
    classes.push(`text-[${visual.fontSize}px]`);
  }
  if (visual.fontWeight && visual.fontWeight >= 600) {
    classes.push('font-semibold');
  }
  if (visual.textColor) {
    classes.push(`text-[${visual.textColor}]`);
  }

  return classes.length > 0 ? classes.join(' ') : null;
}

/**
 * 转义字符串
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .trim();
}

/**
 * DSL 生成器 V1
 * 基于处理后的节点树生成 Stitch DSL
 */

import type { ProcessedNode, LayoutClasses } from './types';

/**
 * 将 LayoutClasses 转换为 ClassName 字符串
 */
function buildClassName(classes: LayoutClasses): string | null {
  const parts: string[] = [
    classes.width,
    classes.height,
    classes.background,
    classes.borderRadius,
    ...(classes.layout || []),
    ...(classes.spacing || []),
    ...(classes.others || []),
  ].filter(Boolean) as string[];
  
  if (parts.length === 0) return null;
  return parts.join(' ');
}

/**
 * 映射组件类型到 DSL 标签
 */
function mapComponentType(type: string): string {
  const tagMap: Record<string, string> = {
    'Container': 'SECTION',
    'Section': 'SECTION',
    'Row': 'SECTION',
    'Card': 'CARD',
    'Button': 'BUTTON',
    'Text': 'TEXT',
    'Heading': 'TEXT',
    'Image': 'IMAGE',
    'Icon': 'IMAGE',
    'Input': 'INPUT',
    'Frame': 'SECTION',
    'Group': 'SECTION',
  };
  return tagMap[type] || 'SECTION';
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

/**
 * 生成单个节点的 DSL
 */
function generateNodeDSL(node: ProcessedNode, depth: number): string[] {
  const lines: string[] = [];
  const indent = '  '.repeat(depth);
  
  // 如果被过滤，跳过
  if (node.filtered) {
    // 但被过滤的节点可能还有子节点需要处理
    for (const child of node.children) {
      lines.push(...generateNodeDSL(child, depth));
    }
    return lines;
  }
  
  const tag = mapComponentType(node.componentType);
  const id = node.semanticName;
  
  // 节点标签
  lines.push(`${indent}[${tag}: ${id}]`);
  
  // ClassName 属性
  const className = buildClassName(node.classNames);
  if (className) {
    lines.push(`${indent}  { ClassName: "${escapeString(className)}" }`);
  }
  
  // 文本内容
  const original = node.original;
  if (original.type === 'TEXT' && original.characters) {
    const text = escapeString(original.characters);
    if (text) {
      lines.push(`${indent}  CONTENT: "${text}"`);
    }
  }
  
  // 处理子节点
  for (const child of node.children) {
    lines.push(...generateNodeDSL(child, depth + 1));
  }
  
  return lines;
}

/**
 * 生成完整 DSL
 */
export function generateDSL(processedNodes: ProcessedNode[]): string {
  const lines: string[] = [];
  
  for (const node of processedNodes) {
    lines.push(...generateNodeDSL(node, 0));
  }
  
  return lines.join('\n');
}

/**
 * 简化版 DSL 生成（用于调试）
 */
export function generateSimpleDSL(processedNodes: ProcessedNode[]): string {
  const lines: string[] = [];
  
  function printNode(node: ProcessedNode, depth: number) {
    const indent = '  '.repeat(depth);
    const status = node.filtered ? '[FILTERED]' : `[${node.componentType}]`;
    const classInfo = buildClassName(node.classNames);
    const classStr = classInfo ? ` {${classInfo.substring(0, 40)}...}` : '';
    
    lines.push(`${indent}${status} ${node.semanticName}${classStr}`);
    
    if (node.filterReason) {
      lines.push(`${indent}  # ${node.filterReason}`);
    }
    
    for (const child of node.children) {
      printNode(child, depth + 1);
    }
  }
  
  for (const node of processedNodes) {
    printNode(node, 0);
  }
  
  return lines.join('\n');
}

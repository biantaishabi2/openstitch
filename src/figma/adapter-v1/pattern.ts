/**
 * 结构模式识别
 */

import type { ProcessedNode, StructurePattern } from './types';

/**
 * 检测结构模式
 */
export function detectPattern(nodes: ProcessedNode[]): StructurePattern {
  if (nodes.length < 2) {
    return { type: 'absolute' };
  }

  // 检测网格
  const grid = detectGrid(nodes);
  if (grid && grid.cols >= 2) {
    return { type: 'grid', cols: grid.cols, gap: grid.gap };
  }

  // 检测水平排列
  const horizontal = detectHorizontal(nodes);
  if (horizontal.isHorizontal) {
    return { type: 'flex-row', gap: horizontal.gap };
  }

  // 检测垂直排列
  const vertical = detectVertical(nodes);
  if (vertical.isVertical) {
    return { type: 'flex-col', gap: vertical.gap };
  }

  return { type: 'absolute' };
}

/**
 * 检测网格布局
 */
function detectGrid(nodes: ProcessedNode[]): { cols: number; gap: number } | null {
  if (nodes.length < 4) return null;

  // 按 Y 坐标分组（找行）
  const yGroups = groupByY(nodes);
  if (yGroups.length < 2) return null;

  // 检查每行列数是否一致
  const colCounts = yGroups.map(g => g.length);
  const allSameCols = colCounts.every(c => c === colCounts[0]);
  if (!allSameCols) return null;

  const cols = colCounts[0];
  if (cols < 2) return null;

  // 计算间距
  const firstRow = yGroups[0];
  const gaps: number[] = [];
  
  for (let i = 1; i < firstRow.length; i++) {
    const prev = firstRow[i - 1];
    const curr = firstRow[i];
    const gap = curr.visual.x - (prev.visual.x + prev.visual.width);
    if (gap > 0) gaps.push(gap);
  }

  // 行间间距
  for (let i = 1; i < yGroups.length; i++) {
    const prevRow = yGroups[i - 1];
    const currRow = yGroups[i];
    if (prevRow[0] && currRow[0]) {
      const gap = currRow[0].visual.y - (prevRow[0].visual.y + prevRow[0].visual.height);
      if (gap > 0) gaps.push(gap);
    }
  }

  const avgGap = gaps.length > 0 
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length / 4) * 4
    : 16;

  return { cols, gap: avgGap };
}

/**
 * 按 Y 坐标分组
 */
function groupByY(nodes: ProcessedNode[]): ProcessedNode[][] {
  const tolerance = 20; // Y 坐标容差
  const groups: ProcessedNode[][] = [];

  for (const node of nodes) {
    let added = false;
    for (const group of groups) {
      const groupY = group[0].visual.y;
      if (Math.abs(node.visual.y - groupY) < tolerance) {
        group.push(node);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push([node]);
    }
  }

  // 每组内按 X 排序
  groups.forEach(g => g.sort((a, b) => a.visual.x - b.visual.x));
  
  // 按 Y 排序组
  groups.sort((a, b) => a[0].visual.y - b[0].visual.y);

  return groups;
}

/**
 * 检测水平排列
 */
function detectHorizontal(nodes: ProcessedNode[]): { isHorizontal: boolean; gap: number } {
  if (nodes.length < 2) return { isHorizontal: false, gap: 0 };

  const tolerance = 20;
  const firstY = nodes[0].visual.y;
  
  // 检查是否在同一行
  const sameRow = nodes.every(n => Math.abs(n.visual.y - firstY) < tolerance);
  if (!sameRow) return { isHorizontal: false, gap: 0 };

  // 计算间距
  const sorted = [...nodes].sort((a, b) => a.visual.x - b.visual.x);
  const gaps: number[] = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].visual.x - (sorted[i-1].visual.x + sorted[i-1].visual.width);
    if (gap > 0) gaps.push(gap);
  }

  const avgGap = gaps.length > 0
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length / 4) * 4
    : 16;

  return { isHorizontal: true, gap: avgGap };
}

/**
 * 检测垂直排列
 */
function detectVertical(nodes: ProcessedNode[]): { isVertical: boolean; gap: number } {
  if (nodes.length < 2) return { isVertical: false, gap: 0 };

  const tolerance = 20;
  const firstX = nodes[0].visual.x;
  
  // 检查是否在同一列
  const sameCol = nodes.every(n => Math.abs(n.visual.x - firstX) < tolerance);
  if (!sameCol) return { isVertical: false, gap: 0 };

  // 计算间距
  const sorted = [...nodes].sort((a, b) => a.visual.y - b.visual.y);
  const gaps: number[] = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].visual.y - (sorted[i-1].visual.y + sorted[i-1].visual.height);
    if (gap > 0) gaps.push(gap);
  }

  const avgGap = gaps.length > 0
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length / 4) * 4
    : 16;

  return { isVertical: true, gap: avgGap };
}

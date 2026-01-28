/**
 * Adapter V1 类型定义
 */

import type { FigmaNode } from '../types';

export interface AdapterV1Options {
  context?: string;
}

export interface VisualDetails {
  width: number;
  height: number;
  x: number;
  y: number;
  backgroundColor?: string;
  borderRadius?: number;
  shadow?: {
    color: string;
    blur: number;
    x: number;
    y: number;
  };
  fontSize?: number;
  fontWeight?: number;
  textColor?: string;
}

export interface ContentAssets {
  text?: string;
  imageRef?: string;
  hasIcon?: boolean;
}

export interface ProcessedNode {
  id: string;
  name: string;
  type: string;
  componentType: 'Card' | 'Section' | 'Text' | 'Image' | 'Icon' | 'Unknown';
  visual: VisualDetails;
  content: ContentAssets;
  children: ProcessedNode[];
  filtered?: boolean;
  filterReason?: string;
}

export interface StructurePattern {
  type: 'grid' | 'flex-row' | 'flex-col' | 'absolute';
  cols?: number;
  gap?: number;
}

export interface AdapterV1Result {
  dsl: string;
  tokens: Record<string, string>;
  rootNodes: ProcessedNode[];
  stats: {
    total: number;
    filtered: number;
    cards: number;
  };
}

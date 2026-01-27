/**
 * 结构推断器
 * 三层架构：规则引擎 → 启发式引擎 → AI 引擎
 */

import * as fs from 'fs';
import * as path from 'path';
import type { FigmaNode } from '../types';
import { parse as parseDSL } from '../../lib/compiler/logic';

// === 提示词模板 ===

let structurePromptTemplate: string | null = null;

/**
 * 加载提示词模板
 */
function loadPromptTemplate(): string {
  if (structurePromptTemplate) {
    return structurePromptTemplate;
  }

  try {
    const promptPath = path.join(__dirname, 'prompts', 'structure-inference.md');
    structurePromptTemplate = fs.readFileSync(promptPath, 'utf-8');
    return structurePromptTemplate;
  } catch {
    // 如果文件不存在，使用内置的简化模板
    return `请识别这个 UI 元素是什么组件类型。

节点信息：
- 名称：{{name}}
- 类型：{{type}}
- 尺寸：{{width}}x{{height}}px
- 子节点数量：{{childCount}}
- 布局模式：{{layoutMode}}

可选类型：Button, Card, Input, Heading, Text, Image, Icon, Section, Row, Container, Unknown

返回 JSON 格式：
{
  "componentType": "类型名",
  "confidence": 0.0-1.0,
  "reasoning": "判断依据"
}`;
  }
}

// === 类型定义 ===

export type ComponentType =
  | 'Button'
  | 'Card'
  | 'Input'
  | 'Heading'
  | 'Text'
  | 'Image'
  | 'Icon'
  | 'Section'
  | 'Row'
  | 'Container'
  | 'Unknown';

export interface ComponentInference {
  componentType: ComponentType;
  confidence: number;
  method: 'rule' | 'heuristic' | 'ai' | 'fallback';
  rule?: string;
  features?: string[];
  reasoning?: string;
  aiProps?: {
    className?: string;
    style?: string;
  };
  aiDsl?: string;
}

export interface StructureInferenceResult {
  inferences: Map<string, ComponentInference>;  // nodeId → inference
  dsl: string;
  confidence: number;
  aiCallCount: number;
  warnings: string[];
}

// === 规则引擎 ===

interface Rule {
  name: string;
  match: (node: FigmaNode) => boolean;
  componentType: ComponentType;
  confidence: number;
}

const COMPONENT_RULES: Rule[] = [
  // Component 实例规则（最高置信度）
  {
    name: 'instance-button',
    match: (node) => node.type === 'INSTANCE' && /button/i.test(node.name),
    componentType: 'Button',
    confidence: 0.98,
  },
  {
    name: 'instance-card',
    match: (node) => node.type === 'INSTANCE' && /card/i.test(node.name),
    componentType: 'Card',
    confidence: 0.98,
  },
  {
    name: 'instance-input',
    match: (node) => node.type === 'INSTANCE' && /input|field|textfield/i.test(node.name),
    componentType: 'Input',
    confidence: 0.98,
  },

  // 命名规则
  {
    name: 'named-button',
    match: (node) => /button|btn/i.test(node.name) && node.type === 'FRAME',
    componentType: 'Button',
    confidence: 0.9,
  },
  {
    name: 'named-card',
    match: (node) => /card/i.test(node.name) && node.type === 'FRAME',
    componentType: 'Card',
    confidence: 0.9,
  },
  {
    name: 'named-input',
    match: (node) => /input|field/i.test(node.name) && node.type === 'FRAME',
    componentType: 'Input',
    confidence: 0.9,
  },
  {
    name: 'named-header',
    match: (node) => /header|heading|title/i.test(node.name) && node.type === 'TEXT',
    componentType: 'Heading',
    confidence: 0.85,
  },

  // 类型规则
  {
    name: 'text-large',
    match: (node) => node.type === 'TEXT' && (node.style?.fontSize || 0) >= 24,
    componentType: 'Heading',
    confidence: 0.85,
  },
  {
    name: 'text-normal',
    match: (node) => node.type === 'TEXT' && (node.style?.fontSize || 0) < 24,
    componentType: 'Text',
    confidence: 0.85,
  },
  {
    name: 'image-fill',
    match: (node) => {
      if (node.type !== 'RECTANGLE') return false;
      return node.fills?.some(f => f.type === 'IMAGE') || false;
    },
    componentType: 'Image',
    confidence: 0.95,
  },
  {
    name: 'vector-icon',
    match: (node) => {
      if (node.type !== 'VECTOR') return false;
      const box = node.absoluteBoundingBox;
      if (!box) return false;
      // 图标通常是小的正方形
      return box.width <= 32 && box.height <= 32 && Math.abs(box.width - box.height) < 4;
    },
    componentType: 'Icon',
    confidence: 0.8,
  },

  // 布局规则
  {
    name: 'layout-vertical',
    match: (node) => node.type === 'FRAME' && node.layoutMode === 'VERTICAL',
    componentType: 'Section',
    confidence: 0.7,
  },
  {
    name: 'layout-horizontal',
    match: (node) => node.type === 'FRAME' && node.layoutMode === 'HORIZONTAL',
    componentType: 'Row',
    confidence: 0.7,
  },
];

/**
 * 规则引擎：尝试用规则匹配
 */
export function applyRules(node: FigmaNode): ComponentInference | null {
  for (const rule of COMPONENT_RULES) {
    if (rule.match(node)) {
      return {
        componentType: rule.componentType,
        confidence: rule.confidence,
        method: 'rule',
        rule: rule.name,
      };
    }
  }
  return null;
}

// === 启发式引擎 ===

/**
 * 特征检测函数
 */
function hasRoundedCorners(node: FigmaNode): boolean {
  return (node.cornerRadius || 0) >= 4 ||
    (node.rectangleCornerRadii?.some(r => r >= 4) || false);
}

function hasShadow(node: FigmaNode): boolean {
  return node.effects?.some(e =>
    (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') && e.visible !== false
  ) || false;
}

function hasBorder(node: FigmaNode): boolean {
  return (node.strokes?.length || 0) > 0 && (node.strokeWeight || 0) > 0;
}

function hasSolidFill(node: FigmaNode): boolean {
  return node.fills?.some(f => f.type === 'SOLID' && f.visible !== false) || false;
}

function hasChildren(node: FigmaNode): boolean {
  return (node.children?.length || 0) > 0;
}

function hasTextChild(node: FigmaNode): boolean {
  return node.children?.some(c => c.type === 'TEXT') || false;
}

function hasCenteredTextChild(node: FigmaNode): boolean {
  if (!node.children) return false;
  const textChild = node.children.find(c => c.type === 'TEXT');
  return textChild?.style?.textAlignHorizontal === 'CENTER';
}

function isButtonSize(node: FigmaNode): boolean {
  const box = node.absoluteBoundingBox;
  if (!box) return false;
  // 按钮通常宽度 60-300，高度 30-60
  return box.width >= 60 && box.width <= 300 && box.height >= 28 && box.height <= 64;
}

function isCardSize(node: FigmaNode): boolean {
  const box = node.absoluteBoundingBox;
  if (!box) return false;
  // 卡片通常较大
  return box.width >= 150 && box.height >= 100;
}

function isInputSize(node: FigmaNode): boolean {
  const box = node.absoluteBoundingBox;
  if (!box) return false;
  // 输入框通常宽度 > 高度，高度 30-60
  return box.width >= 100 && box.height >= 30 && box.height <= 60 && box.width > box.height * 2;
}

/**
 * 启发式引擎：基于视觉特征推断
 */
export function applyHeuristics(node: FigmaNode): ComponentInference | null {
  if (node.type !== 'FRAME' && node.type !== 'RECTANGLE' && node.type !== 'GROUP') {
    return null;
  }

  const features: string[] = [];
  const scores: Record<ComponentType, number> = {
    Button: 0,
    Card: 0,
    Input: 0,
    Heading: 0,
    Text: 0,
    Image: 0,
    Icon: 0,
    Section: 0,
    Row: 0,
    Container: 0,
    Unknown: 0,
  };

  // 收集特征
  if (hasRoundedCorners(node)) features.push('rounded');
  if (hasShadow(node)) features.push('shadow');
  if (hasBorder(node)) features.push('border');
  if (hasSolidFill(node)) features.push('solid-fill');
  if (hasChildren(node)) features.push('has-children');
  if (hasTextChild(node)) features.push('has-text');
  if (hasCenteredTextChild(node)) features.push('centered-text');
  if (isButtonSize(node)) features.push('button-size');
  if (isCardSize(node)) features.push('card-size');
  if (isInputSize(node)) features.push('input-size');

  // Button 特征：圆角 + 居中文本 + 按钮尺寸 + 纯色填充
  if (features.includes('rounded') &&
      features.includes('centered-text') &&
      features.includes('button-size') &&
      features.includes('solid-fill')) {
    scores.Button += 0.85;
  } else if (features.includes('rounded') &&
             features.includes('has-text') &&
             features.includes('button-size')) {
    scores.Button += 0.7;
  }

  // Card 特征：圆角 + 阴影 + 卡片尺寸 + 多子节点
  if (features.includes('rounded') &&
      features.includes('shadow') &&
      features.includes('card-size') &&
      features.includes('has-children')) {
    scores.Card += 0.9;
  } else if (features.includes('shadow') &&
             features.includes('card-size')) {
    scores.Card += 0.7;
  }

  // Input 特征：边框 + 输入框尺寸 + (可能有文本子节点)
  if (features.includes('border') &&
      features.includes('input-size')) {
    scores.Input += 0.8;
  } else if (features.includes('border') &&
             !features.includes('shadow') &&
             features.includes('rounded')) {
    scores.Input += 0.6;
  }

  // Container 特征：有子节点但没有明显装饰
  if (features.includes('has-children') &&
      !features.includes('shadow') &&
      !features.includes('border')) {
    scores.Container += 0.5;
  }

  // 选择得分最高的
  let bestType: ComponentType = 'Unknown';
  let bestScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as ComponentType;
    }
  }

  if (bestScore >= 0.6) {
    return {
      componentType: bestType,
      confidence: bestScore,
      method: 'heuristic',
      features,
    };
  }

  return null;
}

// === AI 引擎 ===

export interface AIInferenceRequest {
  node: FigmaNode;
  context: string;
}

export interface AIInferenceResponse {
  componentType: ComponentType;
  confidence: number;
  reasoning: string;
  props?: {
    className?: string;
    style?: string;
  };
  dsl?: string;
}

/**
 * 构建给 AI 的 prompt
 *
 * 注意：这里提供的是"轻量但强判别力"的结构与视觉线索，
 * 目的是帮助 AI 在糟糕命名下做更稳健的结构判断（尤其 Input vs Button）。
 */
export function buildAIPrompt(node: FigmaNode): string {
  const box = node.absoluteBoundingBox;
  const width = Math.round(box?.width || 0);
  const height = Math.round(box?.height || 0);
  const childCount = node.children?.length || 0;
  const childTypes = node.children?.map(c => c.type).join(', ') || 'none';
  const textChildCount = node.children?.filter(c => c.type === 'TEXT').length || 0;
  const nonTextChildCount = Math.max(childCount - textChildCount, 0);
  const hasOnlyTextChild = childCount > 0 && textChildCount === childCount ? 'yes' : 'no';
  const aspectRatio =
    width > 0 && height > 0 ? (width / height).toFixed(2) : 'n/a';
  const sizeBucket = classifySizeBucket(width, height);
  const nameHint = inferNameHint(node.name);
  const hasStroke = hasVisibleStroke(node) ? 'yes' : 'no';
  const strokeWeight = getStrokeWeight(node);
  const hasFill = hasVisibleFill(node) ? 'yes' : 'no';
  const fillTypes = getVisibleFillTypes(node);
  const cornerRadius = describeCornerRadius(node);
  const hasShadowFlag = hasShadow(node) ? 'yes' : 'no';
  const hasBlurFlag = hasBlur(node) ? 'yes' : 'no';
  const textPreview = getTextPreview(node);
  const placeholderHint = looksLikePlaceholder(textPreview) ? 'yes' : 'no';
  const layoutHints = analyzeAbsoluteLayout(node);

  // 加载模板
  const template = loadPromptTemplate();

  // 替换模板变量
  return template
    .replace(/\{\{name\}\}/g, node.name || 'unnamed')
    .replace(/\{\{type\}\}/g, node.type)
    .replace(/\{\{width\}\}/g, String(width))
    .replace(/\{\{height\}\}/g, String(height))
    .replace(/\{\{childCount\}\}/g, String(childCount))
    .replace(/\{\{childTypes\}\}/g, childTypes)
    .replace(/\{\{layoutMode\}\}/g, node.layoutMode || 'none')
    .replace(/\{\{nameHint\}\}/g, nameHint)
    .replace(/\{\{aspectRatio\}\}/g, aspectRatio)
    .replace(/\{\{sizeBucket\}\}/g, sizeBucket)
    .replace(/\{\{textChildCount\}\}/g, String(textChildCount))
    .replace(/\{\{nonTextChildCount\}\}/g, String(nonTextChildCount))
    .replace(/\{\{hasOnlyTextChild\}\}/g, hasOnlyTextChild)
    .replace(/\{\{hasStroke\}\}/g, hasStroke)
    .replace(/\{\{strokeWeight\}\}/g, strokeWeight)
    .replace(/\{\{hasFill\}\}/g, hasFill)
    .replace(/\{\{fillTypes\}\}/g, fillTypes)
    .replace(/\{\{cornerRadius\}\}/g, cornerRadius)
    .replace(/\{\{hasShadow\}\}/g, hasShadowFlag)
    .replace(/\{\{hasBlur\}\}/g, hasBlurFlag)
    .replace(/\{\{textPreview\}\}/g, textPreview)
    .replace(/\{\{placeholderHint\}\}/g, placeholderHint)
    .replace(/\{\{layoutChildCount\}\}/g, String(layoutHints.layoutChildCount))
    .replace(/\{\{backgroundChildCount\}\}/g, String(layoutHints.backgroundChildCount))
    .replace(/\{\{inferredLayout\}\}/g, layoutHints.inferredLayout)
    .replace(/\{\{inferredGap\}\}/g, layoutHints.inferredGap)
    .replace(/\{\{inferredPadding\}\}/g, layoutHints.inferredPadding)
    .replace(/\{\{inferredAlignment\}\}/g, layoutHints.inferredAlignment)
    .replace(/\{\{overflowChildCount\}\}/g, String(layoutHints.overflowChildCount));
}

/**
 * 解析 AI 响应
 */
export function parseAIResponse(response: string): AIInferenceResponse | null {
  try {
    // 尝试提取 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // 兼容 AI 可能返回的不同字段名（componentType 或 type）
    const componentType = parsed.componentType || parsed.type;

    // 验证组件类型字段存在
    if (!componentType) {
      return null;
    }

    // 验证 componentType 是有效的
    const validTypes: ComponentType[] = [
      'Button',
      'Card',
      'Input',
      'Heading',
      'Text',
      'Image',
      'Icon',
      'Section',
      'Row',
      'Container',
    ];

    // 提取置信度，默认 0.7（AI 没有提供时）
    const confidence = typeof parsed.confidence === 'number'
      ? Math.min(Math.max(parsed.confidence, 0), 1)
      : 0.7;

    // 避免产出 Unknown（下游不支持），不确定时降级为 Container
    const normalizedType =
      componentType === 'Unknown'
        ? 'Container'
        : validTypes.includes(componentType)
          ? componentType
          : 'Container';

    const props = normalizeAIProps(parsed.props);
    const dsl = normalizeAIDsl(parsed.dsl);

    return {
      componentType: normalizedType,
      confidence,
      reasoning: parsed.reasoning || '',
      props,
      dsl,
    };
  } catch {
    return null;
  }
}

function classifySizeBucket(width: number, height: number): string {
  const area = width * height;
  if (area <= 0) return 'unknown';
  if (area < 4_000) return 'small';
  if (area < 30_000) return 'medium';
  return 'large';
}

function inferNameHint(name: string | undefined): string {
  if (!name) return 'none';
  const lower = name.toLowerCase();
  if (/button|btn/.test(lower)) return 'button';
  if (/card/.test(lower)) return 'card';
  if (/input|field|search|textbox/.test(lower)) return 'input';
  if (/title|heading|header/.test(lower)) return 'heading';
  if (/text|label|paragraph|body/.test(lower)) return 'text';
  if (/image|img|photo|picture/.test(lower)) return 'image';
  if (/icon|logo/.test(lower)) return 'icon';
  if (/section|block/.test(lower)) return 'section';
  if (/row|list item|item row/.test(lower)) return 'row';
  return 'unknown';
}

// === 主推断函数 ===

/**
 * 对单个节点进行推断
 */
export function inferComponent(
  node: FigmaNode,
  aiInfer?: (prompt: string) => Promise<string>
): ComponentInference | Promise<ComponentInference> {
  // 第一层：规则引擎
  const ruleResult = applyRules(node);
  if (ruleResult) {
    return ruleResult;
  }

  // 第二层：启发式引擎
  const heuristicResult = applyHeuristics(node);
  const STRONG_HEURISTIC_CONFIDENCE = 0.9;
  if (heuristicResult && (!aiInfer || heuristicResult.confidence >= STRONG_HEURISTIC_CONFIDENCE)) {
    return heuristicResult;
  }

  // 第三层：AI 引擎（如果提供了 AI 函数）
  if (aiInfer) {
    const prompt = buildAIPrompt(node);
    return aiInfer(prompt)
      .then(async response => {
        const parsed = parseAIResponse(response);
        if (!parsed) {
          return heuristicResult || {
            componentType: 'Container' as ComponentType,
            confidence: 0.3,
            method: 'fallback' as const,
          };
        }

        const id = sanitizeId(node.name || node.id);
        let validDsl = validateAIDsl(parsed.dsl, parsed.componentType, id);
        let aiDsl = validDsl.normalizedDsl;

        // 如果 DSL 无法通过 parse 校验，带错误信息重试一次
        if (parsed.dsl && validDsl.error) {
          const retryPrompt =
            `${prompt}\n\n` +
            `你上一次返回的 dsl 无法通过编译器 parse 校验。\n` +
            `错误: ${validDsl.error}\n` +
            `请严格遵守 DSL 约束并返回修复后的 JSON（尤其是 dsl 字段）。`;
          const retryResponse = await aiInfer(retryPrompt).catch(() => '');
          const retryParsed = retryResponse ? parseAIResponse(retryResponse) : null;
          if (retryParsed) {
            const retryValid = validateAIDsl(retryParsed.dsl, retryParsed.componentType, id);
            if (!retryValid.error) {
              return {
                componentType: retryParsed.componentType,
                confidence: retryParsed.confidence * 0.9,
                method: 'ai' as const,
                reasoning: retryParsed.reasoning,
                aiProps: retryParsed.props,
                aiDsl: retryValid.normalizedDsl,
              };
            }
          }
        }

        const aiResult: ComponentInference = {
          componentType: parsed.componentType,
          confidence: parsed.confidence * 0.9, // AI 结果略微降低置信度
          method: 'ai' as const,
          reasoning: parsed.reasoning,
          aiProps: parsed.props,
          aiDsl: aiDsl,
        };
        return aiResult;
      })
      .catch(() => {
        // AI 调用失败，降级
        return heuristicResult || {
          componentType: 'Container' as ComponentType,
          confidence: 0.3,
          method: 'fallback' as const,
        };
      });
  }

  // 没有 AI，直接降级
  return heuristicResult || {
    componentType: 'Container',
    confidence: 0.3,
    method: 'fallback',
  };
}

/**
 * 批量推断所有节点
 */
export async function inferStructure(
  nodes: FigmaNode[],
  aiInfer?: (prompt: string) => Promise<string>,
  assetUrls?: Map<string, string>
): Promise<StructureInferenceResult> {
  const inferences = new Map<string, ComponentInference>();
  const warnings: string[] = [];
  let aiCallCount = 0;
  let totalConfidence = 0;

  for (const node of nodes) {
    const result = inferComponent(node, aiInfer);

    if (result instanceof Promise) {
      const resolved = await result;
      inferences.set(node.id, resolved);
      totalConfidence += resolved.confidence;
      if (resolved.method === 'ai') {
        aiCallCount++;
      }
    } else {
      inferences.set(node.id, result);
      totalConfidence += result.confidence;
    }
  }

  // 生成 DSL
  const dsl = generateDSL(nodes, inferences, assetUrls);

  // 计算平均置信度
  const avgConfidence = nodes.length > 0 ? totalConfidence / nodes.length : 0;

  // 生成警告
  if (aiCallCount > 5) {
    warnings.push(`AI was called ${aiCallCount} times. Consider improving naming conventions in Figma.`);
  }

  const lowConfidenceCount = [...inferences.values()].filter(i => i.confidence < 0.6).length;
  if (lowConfidenceCount > 0) {
    warnings.push(`${lowConfidenceCount} components have low confidence (< 0.6).`);
  }

  return {
    inferences,
    dsl,
    confidence: avgConfidence,
    aiCallCount,
    warnings,
  };
}

// === DSL 生成 ===

function generateDSL(
  nodes: FigmaNode[],
  inferences: Map<string, ComponentInference>,
  assetUrls?: Map<string, string>
): string {
  const lines: string[] = [];
  const nodeIdSet = new Set(nodes.map(n => n.id));
  const childIdSet = new Set<string>();

  // Identify true roots so we do not emit every node twice.
  for (const node of nodes) {
    for (const child of node.children || []) {
      if (nodeIdSet.has(child.id)) {
        childIdSet.add(child.id);
      }
    }
  }

  const rootNodes = nodes.filter(n => !childIdSet.has(n.id));

  function mergeAttrLines(attrLines: string[]): string | null {
    if (attrLines.length === 0) return null;
    let merged = attrLines[0].trim();
    for (let i = 1; i < attrLines.length; i += 1) {
      const next = attrLines[i].trim();
      merged = appendAttrParts(merged, extractAttrParts(next));
    }
    return merged;
  }

  function extractAttrParts(line: string): string {
    const idx = line.indexOf(':');
    if (idx === -1) return '';
    return line.slice(idx + 1).trim().replace(/,\s*$/, '');
  }

  function appendAttrParts(baseLine: string, additions: string): string {
    if (!additions) return baseLine;
    const baseParts = extractAttrParts(baseLine);
    if (!baseParts) {
      return `ATTR: ${additions}`;
    }
    return `ATTR: ${baseParts.replace(/,\s*$/, '')}, ${additions}`;
  }

  function processNode(node: FigmaNode, depth: number) {
    const inference = inferences.get(node.id);
    if (!inference) return;

    const indent = '  '.repeat(depth);
    const id = sanitizeId(node.name || node.id);
    const type = inference.componentType;
    const tag = type.toUpperCase();
    const assetUrl = assetUrls?.get(node.id);

    lines.push(`${indent}[${tag}: ${id}]`);
    const aiOverrides = parseAIDslOverrides(inference.aiDsl, type, id);

    // 添加属性
    let hasContentLine = false;
    const defaultAttrParts: string[] = [];
    if (type === 'Text' || type === 'Heading') {
      const text = node.characters || '';
      if (text) {
        lines.push(`${indent}  CONTENT: "${escapeString(text)}"`);
        hasContentLine = true;
      }
    } else if (type === 'Button') {
      const textChild = node.children?.find(c => c.type === 'TEXT');
      if (textChild?.characters) {
        defaultAttrParts.push(`Text("${escapeString(textChild.characters)}")`);
      }
    } else if (type === 'Input') {
      const textChild = node.children?.find(c => c.type === 'TEXT');
      if (textChild?.characters) {
        defaultAttrParts.push(`Placeholder("${escapeString(textChild.characters)}")`);
      }
    }

    if (!hasContentLine && aiOverrides.contentLines.length > 0) {
      for (const line of aiOverrides.contentLines) {
        lines.push(`${indent}  ${line}`);
      }
    }

    const hasAIAttrOverride = aiOverrides.attrLines.length > 0;
    let attrLine = mergeAttrLines(aiOverrides.attrLines);
    if (!attrLine) {
      const aiAttrParts: string[] = [];
      if (inference.aiProps?.className) {
        aiAttrParts.push(`ClassName("${escapeString(inference.aiProps.className)}")`);
      }
      if (inference.aiProps?.style) {
        aiAttrParts.push(`Style("${escapeString(inference.aiProps.style)}")`);
      }
      if (aiAttrParts.length > 0) {
        attrLine = `ATTR: ${aiAttrParts.join(', ')}`;
      }
    }

    if (!hasAIAttrOverride && defaultAttrParts.length > 0) {
      attrLine = attrLine
        ? appendAttrParts(attrLine, defaultAttrParts.join(', '))
        : `ATTR: ${defaultAttrParts.join(', ')}`;
    }

    // 资产 URL 与 ATTR 合并，确保只输出一条 ATTR
    if (assetUrl && (type === 'Image' || type === 'Icon')) {
      const assetParts = [`Src("${escapeString(assetUrl)}")`];
      if (type === 'Image') {
        assetParts.push(`Alt("${escapeString(node.name || id)}")`);
      }
      const merged = attrLine ? appendAttrParts(attrLine, assetParts.join(', ')) : `ATTR: ${assetParts.join(', ')}`;
      attrLine = merged;
    }

    if (attrLine) {
      lines.push(`${indent}  ${attrLine}`);
    }

    // 递归处理子节点
    if (node.children) {
      for (const child of node.children) {
        if (child.visible !== false && inferences.has(child.id)) {
          processNode(child, depth + 1);
        }
      }
    }
  }

  for (const node of rootNodes) {
    if (inferences.has(node.id)) {
      processNode(node, 0);
    }
  }

  return lines.join('\n');
}

function sanitizeId(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 32) || 'unnamed';
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

function hasVisibleStroke(node: FigmaNode): boolean {
  return (
    (node.strokeWeight || 0) > 0 &&
    (node.strokes?.some(s => s.visible !== false) || false)
  );
}

function getStrokeWeight(node: FigmaNode): string {
  if (!hasVisibleStroke(node)) return '0';
  return String(Math.round(node.strokeWeight || 0));
}

function hasVisibleFill(node: FigmaNode): boolean {
  return node.fills?.some(f => f.visible !== false) || false;
}

function getVisibleFillTypes(node: FigmaNode): string {
  const types = node.fills
    ?.filter(f => f.visible !== false)
    .map(f => f.type);
  if (!types || types.length === 0) return 'none';
  return types.join(', ');
}

function describeCornerRadius(node: FigmaNode): string {
  if (typeof node.cornerRadius === 'number') {
    return String(Math.round(node.cornerRadius));
  }
  const radii = node.rectangleCornerRadii;
  if (!radii || radii.length === 0) return 'none';
  const uniq = Array.from(new Set(radii.map(r => Math.round(r))));
  return uniq.length === 1 ? String(uniq[0]) : 'mixed';
}

function hasBlur(node: FigmaNode): boolean {
  return node.effects?.some(e =>
    (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') && e.visible !== false
  ) || false;
}

type Box = { x: number; y: number; width: number; height: number };

type LayoutHints = {
  layoutChildCount: number;
  backgroundChildCount: number;
  inferredLayout: string;
  inferredGap: string;
  inferredPadding: string;
  inferredAlignment: string;
  overflowChildCount: number;
};

function getBox(node: FigmaNode | undefined): Box | null {
  const box = node?.absoluteBoundingBox;
  if (!box) return null;
  if (!Number.isFinite(box.x) || !Number.isFinite(box.y)) return null;
  if (!Number.isFinite(box.width) || !Number.isFinite(box.height)) return null;
  if (box.width <= 0 || box.height <= 0) return null;
  return {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
  };
}

function relBox(child: Box, parent: Box): Box {
  return {
    x: child.x - parent.x,
    y: child.y - parent.y,
    width: child.width,
    height: child.height,
  };
}

function isBackgroundLike(child: FigmaNode, parent: Box): boolean {
  const box = getBox(child);
  if (!box) return false;
  const areaRatio = (box.width * box.height) / (parent.width * parent.height);
  const typeOk = child.type === 'RECTANGLE' || child.type === 'FRAME';
  const hasChildren = (child.children?.length || 0) > 0;
  const hasText = typeof child.characters === 'string' && child.characters.trim().length > 0;
  // A near-full-bleed rectangle/frame with no content is usually decoration.
  return typeOk && areaRatio >= 0.82 && !hasChildren && !hasText;
}

function range(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = mean(values.map(v => (v - m) ** 2));
  return Math.sqrt(variance);
}

function formatGap(gaps: number[]): string {
  const positive = gaps.filter(g => g > 0);
  if (positive.length === 0) return 'none';
  const gMean = mean(positive);
  const gStd = stddev(positive);
  const cv = gMean > 0 ? gStd / gMean : 1;
  const uniformity =
    cv <= 0.25 ? 'high'
      : cv <= 0.6 ? 'medium'
        : 'low';
  return `${Math.round(gMean)}px (${uniformity})`;
}

function inferAlignment(
  relChildren: Box[],
  axis: 'horizontal' | 'vertical',
  parent: Box
): string {
  if (relChildren.length < 2) return 'unknown';
  if (axis === 'horizontal') {
    const centers = relChildren.map(c => c.y + c.height / 2);
    const tops = relChildren.map(c => c.y);
    const bottoms = relChildren.map(c => c.y + c.height);
    const centerSpread = range(centers);
    const topSpread = range(tops);
    const bottomSpread = range(bottoms);
    const threshold = Math.max(12, parent.height * 0.12);
    if (centerSpread <= threshold) return 'cross-axis center';
    if (topSpread <= threshold) return 'top-aligned';
    if (bottomSpread <= threshold) return 'bottom-aligned';
    return 'mixed';
  }
  const centers = relChildren.map(c => c.x + c.width / 2);
  const lefts = relChildren.map(c => c.x);
  const rights = relChildren.map(c => c.x + c.width);
  const centerSpread = range(centers);
  const leftSpread = range(lefts);
  const rightSpread = range(rights);
  const threshold = Math.max(12, parent.width * 0.12);
  if (centerSpread <= threshold) return 'cross-axis center';
  if (leftSpread <= threshold) return 'left-aligned';
  if (rightSpread <= threshold) return 'right-aligned';
  return 'mixed';
}

function countClusters(values: number[], threshold: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  let clusters = 1;
  let last = sorted[0];
  for (let i = 1; i < sorted.length; i += 1) {
    if (Math.abs(sorted[i] - last) > threshold) {
      clusters += 1;
    }
    last = sorted[i];
  }
  return clusters;
}

function analyzeAbsoluteLayout(node: FigmaNode): LayoutHints {
  const parent = getBox(node);
  const children = node.children || [];
  if (!parent || children.length === 0) {
    return {
      layoutChildCount: 0,
      backgroundChildCount: 0,
      inferredLayout: 'unknown',
      inferredGap: 'unknown',
      inferredPadding: 'unknown',
      inferredAlignment: 'unknown',
      overflowChildCount: 0,
    };
  }

  let backgroundChildCount = 0;
  const relChildren: Box[] = [];
  let overflowChildCount = 0;

  for (const child of children) {
    const childBox = getBox(child);
    if (!childBox) continue;
    if (isBackgroundLike(child, parent)) {
      backgroundChildCount += 1;
      continue;
    }
    const rel = relBox(childBox, parent);
    if (
      rel.x < 0 ||
      rel.y < 0 ||
      rel.x + rel.width > parent.width ||
      rel.y + rel.height > parent.height
    ) {
      overflowChildCount += 1;
    }
    relChildren.push(rel);
  }

  const layoutChildCount = relChildren.length;
  if (layoutChildCount < 2) {
    return {
      layoutChildCount,
      backgroundChildCount,
      inferredLayout: 'unknown',
      inferredGap: 'unknown',
      inferredPadding: 'unknown',
      inferredAlignment: 'unknown',
      overflowChildCount,
    };
  }

  const minX = Math.min(...relChildren.map(c => c.x));
  const minY = Math.min(...relChildren.map(c => c.y));
  const maxX = Math.max(...relChildren.map(c => c.x + c.width));
  const maxY = Math.max(...relChildren.map(c => c.y + c.height));

  const paddingTop = Math.max(0, Math.round(minY));
  const paddingLeft = Math.max(0, Math.round(minX));
  const paddingRight = Math.max(0, Math.round(parent.width - maxX));
  const paddingBottom = Math.max(0, Math.round(parent.height - maxY));
  const inferredPadding = `${paddingTop}/${paddingRight}/${paddingBottom}/${paddingLeft}`;

  const xCenters = relChildren.map(c => c.x + c.width / 2);
  const yCenters = relChildren.map(c => c.y + c.height / 2);
  const xLefts = relChildren.map(c => c.x);
  const xRights = relChildren.map(c => c.x + c.width);
  const yTops = relChildren.map(c => c.y);
  const yBottoms = relChildren.map(c => c.y + c.height);
  const xSpread = range(xCenters);
  const ySpread = range(yCenters);
  const xAlignSpread = Math.min(range(xLefts), range(xRights), xSpread);
  const yAlignSpread = Math.min(range(yTops), range(yBottoms), ySpread);
  const crossX = Math.max(16, parent.width * 0.18);
  const crossY = Math.max(16, parent.height * 0.18);

  const horizontalLikely = yAlignSpread <= crossY && xSpread > yAlignSpread * 1.2;
  const verticalLikely = xAlignSpread <= crossX && ySpread > xAlignSpread * 1.2;

  let inferredLayout = 'mixed/unknown';
  let inferredGap = 'unknown';
  let inferredAlignment = 'unknown';

  if (horizontalLikely) {
    inferredLayout = 'horizontal-from-positions';
    const sorted = [...relChildren].sort((a, b) => a.x - b.x);
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const gap = sorted[i + 1].x - (sorted[i].x + sorted[i].width);
      gaps.push(gap);
    }
    inferredGap = formatGap(gaps);
    inferredAlignment = inferAlignment(relChildren, 'horizontal', parent);
  } else if (verticalLikely) {
    inferredLayout = 'vertical-from-positions';
    const sorted = [...relChildren].sort((a, b) => a.y - b.y);
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const gap = sorted[i + 1].y - (sorted[i].y + sorted[i].height);
      gaps.push(gap);
    }
    inferredGap = formatGap(gaps);
    inferredAlignment = inferAlignment(relChildren, 'vertical', parent);
  } else {
    const xClusters = countClusters(xCenters, Math.max(24, parent.width * 0.12));
    const yClusters = countClusters(yCenters, Math.max(24, parent.height * 0.12));
    if (xClusters > 1 && yClusters > 1) {
      inferredLayout = 'grid-like-from-positions';
      inferredGap = 'grid-like';
      inferredAlignment = 'grid-like';
    }
  }

  return {
    layoutChildCount,
    backgroundChildCount,
    inferredLayout,
    inferredGap,
    inferredPadding,
    inferredAlignment,
    overflowChildCount,
  };
}

function getTextPreview(node: FigmaNode): string {
  const textChild = node.children?.find(c => c.type === 'TEXT' && c.characters);
  const raw = textChild?.characters?.trim();
  if (!raw) return 'none';
  const compact = raw.replace(/\s+/g, ' ');
  return compact.length > 48 ? `${compact.slice(0, 48)}...` : compact;
}

function looksLikePlaceholder(text: string): boolean {
  if (!text || text === 'none') return false;
  const lower = text.toLowerCase();
  if (lower.includes('...')) return true;
  return /(enter|search|type|email|name|phone|address|placeholder|请输入|搜索|查找|输入)/i.test(text);
}

function normalizeAIProps(raw: unknown): { className?: string; style?: string } | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  const className = typeof obj.className === 'string' ? obj.className.trim() : '';
  const style = typeof obj.style === 'string' ? obj.style.trim() : '';
  const next: { className?: string; style?: string } = {};
  if (className) {
    next.className = className.slice(0, 200);
  }
  if (style) {
    next.style = style.slice(0, 500);
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

function normalizeAIDsl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 2000);
}

function extractAIDslOverrideLines(dsl: string): {
  attrLines: string[];
  contentLines: string[];
} {
  const lines = dsl
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  const attrLines: string[] = [];
  const contentLines: string[] = [];

  for (const line of lines) {
    if (/^ATTR\s*:/i.test(line)) {
      attrLines.push(line);
    } else if (/^CONTENT\s*:/i.test(line)) {
      contentLines.push(line);
    }
  }

  return { attrLines, contentLines };
}

function parseAIDslOverrides(
  aiDsl: string | undefined,
  type: ComponentType,
  id: string
): { attrLines: string[]; contentLines: string[] } {
  const valid = validateAIDsl(aiDsl, type, id);
  if (valid.error || !valid.normalizedDsl) {
    return { attrLines: [], contentLines: [] };
  }
  return extractAIDslOverrideLines(valid.normalizedDsl);
}

function normalizeOverrideBlock(
  overrides: { attrLines: string[]; contentLines: string[] },
  tag: string,
  id: string
): string | null {
  const lines = [`[${tag}: ${id}]`];
  let contentValue: string | null = null;
  for (const line of overrides.contentLines) {
    const match = line.match(/^CONTENT\s*:\s*(.*)$/i);
    if (!match) continue;
    const raw = match[1].trim();
    if (!raw) continue;
    contentValue = raw.startsWith('"') ? raw : `"${escapeString(raw)}"`;
    break;
  }

  const attrFragments: string[] = [];
  for (const line of overrides.attrLines) {
    const match = line.match(/^ATTR\s*:\s*(.*)$/i);
    if (!match) continue;
    const rest = match[1].trim();
    if (!rest) continue;
    attrFragments.push(rest);
  }

  if (attrFragments.length > 0) {
    lines.push(`  ATTR: ${attrFragments.join(', ')}`);
  }
  if (contentValue) {
    lines.push(`  CONTENT: ${contentValue}`);
  }
  return lines.length > 1 ? lines.join('\n') : null;
}

function validateAIDsl(
  aiDsl: string | undefined,
  type: ComponentType,
  id: string
): { normalizedDsl?: string; error?: string } {
  if (!aiDsl) return {};
  const tag = type.toUpperCase();
  const overrideLines = extractAIDslOverrideLines(aiDsl);
  if (overrideLines.attrLines.length === 0 && overrideLines.contentLines.length === 0) {
    return {};
  }

  const normalized = normalizeOverrideBlock(overrideLines, tag, id);
  if (!normalized) {
    return { error: 'dsl missing ATTR/CONTENT overrides' };
  }

  const parsed = parseDSL(normalized);
  if (parsed.errors.length > 0 || parsed.cst.length === 0) {
    return { error: formatParseErrors(parsed.errors) };
  }

  return { normalizedDsl: normalized };
}

function formatParseErrors(
  errors: Array<{ message: string; line?: number; column?: number }>
): string {
  if (errors.length === 0) return 'unknown parse error';
  const first = errors[0];
  const where =
    typeof first.line === 'number' && typeof first.column === 'number'
      ? ` at ${first.line}:${first.column}`
      : '';
  return `${first.message}${where}`.slice(0, 300);
}

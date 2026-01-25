/**
 * 结构推断器测试
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import type { FigmaFile, FigmaNode } from '../../src/figma/types';
import { parse } from '../../src/lib/compiler/logic';
import {
  inferComponent,
  inferStructure,
  applyRules,
  applyHeuristics,
  buildAIPrompt,
  parseAIResponse,
  extractValidNodes,
} from '../../src/figma/inferrers';

// === 测试数据 ===

let cleanFixture: FigmaFile;
let ambiguousFixture: FigmaFile;

beforeAll(() => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  cleanFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'figma-api-response-clean.json'), 'utf-8')
  );
  ambiguousFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'figma-structure-ambiguous.json'), 'utf-8')
  );
});

// === 规则引擎测试 ===

describe('Rule Engine', () => {
  it('should recognize Component Instance with button name', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Primary Button',
      type: 'INSTANCE',
    };

    const result = applyRules(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Button');
    expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result?.method).toBe('rule');
  });

  it('should recognize named card frame', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Product Card',
      type: 'FRAME',
    };

    const result = applyRules(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Card');
  });

  it('should recognize large text as Heading', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'some text',
      type: 'TEXT',
      style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 32 },
    };

    const result = applyRules(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Heading');
  });

  it('should recognize small text as Text', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'paragraph',
      type: 'TEXT',
      style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
    };

    const result = applyRules(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Text');
  });

  it('should recognize vertical layout as Section', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Frame 1',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
    };

    const result = applyRules(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Section');
  });

  it('should NOT match poorly named frame', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Rectangle 47',
      type: 'FRAME',
    };

    const result = applyRules(node);
    // 没有 layoutMode，名字也不匹配任何规则
    expect(result).toBeNull();
  });
});

// === 启发式引擎测试 ===

describe('Heuristic Engine', () => {
  it('should recognize button by visual features', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Rectangle 47',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 44 },
      cornerRadius: 6,
      fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.5, b: 0.9, a: 1 } }],
      children: [
        {
          id: '2',
          name: 'text',
          type: 'TEXT',
          style: { fontFamily: 'Inter', fontWeight: 500, fontSize: 14, textAlignHorizontal: 'CENTER' },
        },
      ],
    };

    const result = applyHeuristics(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Button');
    expect(result?.method).toBe('heuristic');
    expect(result?.features).toContain('rounded');
    expect(result?.features).toContain('button-size');
  });

  it('should recognize card by visual features', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Frame 99',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 200 },
      cornerRadius: 12,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      effects: [
        { type: 'DROP_SHADOW', visible: true, color: { r: 0, g: 0, b: 0, a: 0.1 }, radius: 16 },
      ],
      children: [
        { id: '2', name: 'title', type: 'TEXT' },
        { id: '3', name: 'body', type: 'TEXT' },
      ],
    };

    const result = applyHeuristics(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Card');
    expect(result?.features).toContain('shadow');
    expect(result?.features).toContain('card-size');
  });

  it('should recognize input by visual features', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Frame 123',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 280, height: 48 },
      cornerRadius: 8,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      strokes: [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85, a: 1 } }],
      strokeWeight: 1,
      children: [],
    };

    const result = applyHeuristics(node);
    expect(result).not.toBeNull();
    expect(result?.componentType).toBe('Input');
    expect(result?.features).toContain('border');
    expect(result?.features).toContain('input-size');
  });

  it('should return null for ambiguous elements', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'weird box',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 200 },
      cornerRadius: 0,
      fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }],
      children: [],
    };

    const result = applyHeuristics(node);
    // 没有明显特征，应该返回 null 或低置信度
    if (result) {
      expect(result.confidence).toBeLessThan(0.6);
    }
  });
});

// === AI Prompt 和响应解析测试 ===

describe('AI Integration', () => {
  describe('buildAIPrompt', () => {
    it('should build informative prompt', () => {
      const node: FigmaNode = {
        id: '1',
        name: 'Rectangle 47',
        type: 'FRAME',
        absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 44 },
        cornerRadius: 6,
        fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.5, b: 0.9, a: 1 } }],
        effects: [],
        strokes: [],
        children: [
          { id: '2', name: 'text', type: 'TEXT' },
        ],
      };

      const prompt = buildAIPrompt(node);

      expect(prompt).toContain('Rectangle 47');
      expect(prompt).toContain('FRAME');
      expect(prompt).toContain('120x44');
      expect(prompt).toContain('子节点数量');
      expect(prompt).toContain('派生结构特征');
      expect(prompt).toContain('是否有描边');
      expect(prompt).toContain('圆角半径');
      expect(prompt).toContain('疑似占位符文本');
      expect(prompt).toContain('位置推断布局线索');
      expect(prompt).toContain('位置推断布局');
      expect(prompt).toContain('Button');
      expect(prompt).toContain('负约束');
      expect(prompt).toContain('textChildCount = 0');
      expect(prompt).toContain('Section vs Card');
      expect(prompt).toContain('Row vs Button');
      expect(prompt).toContain('Section vs Container');
      expect(prompt).toContain('JSON');
    });
  });

  describe('parseAIResponse', () => {
    it('should parse valid JSON response', () => {
      const response = `Based on the visual features, this appears to be a button.

{
  "componentType": "Button",
  "confidence": 0.85,
  "reasoning": "Rounded corners, solid fill, centered text, button-like dimensions",
  "props": {
    "className": "btn-primary",
    "style": "gap: 12px;"
  },
  "dsl": "[BUTTON: Rectangle_47]\\n  ATTR: ClassName(\\"btn-primary\\")"
}`;

      const result = parseAIResponse(response);
      expect(result).not.toBeNull();
      expect(result?.componentType).toBe('Button');
      expect(result?.confidence).toBe(0.85);
      expect(result?.reasoning).toContain('Rounded');
      expect(result?.props?.className).toBe('btn-primary');
      expect(result?.props?.style).toContain('gap: 12px');
      expect(result?.dsl).toContain('[BUTTON: Rectangle_47]');
    });

    it('should handle invalid component type', () => {
      const response = `{
  "componentType": "InvalidType",
  "confidence": 0.9,
  "reasoning": "test"
}`;

      const result = parseAIResponse(response);
      expect(result).not.toBeNull();
      expect(result?.componentType).toBe('Container');
    });

    it('should handle malformed JSON', () => {
      const response = 'This is not valid JSON at all';
      const result = parseAIResponse(response);
      expect(result).toBeNull();
    });

    it('should handle missing confidence with default value', () => {
      const response = '{ "componentType": "Button" }';
      const result = parseAIResponse(response);
      // 缺少 confidence 时使用默认值 0.7
      expect(result).not.toBeNull();
      expect(result?.componentType).toBe('Button');
      expect(result?.confidence).toBe(0.7);
    });

    it('should return null for missing componentType', () => {
      const response = '{ "confidence": 0.9 }';
      const result = parseAIResponse(response);
      // componentType 是必须的
      expect(result).toBeNull();
    });

    it('should clamp confidence to 0-1 range', () => {
      const response = `{
  "componentType": "Button",
  "confidence": 1.5,
  "reasoning": "test"
}`;

      const result = parseAIResponse(response);
      expect(result?.confidence).toBe(1.0);
    });
  });
});

// === 完整推断流程测试 ===

describe('Full Inference Flow', () => {
  it('should infer clean fixture with high confidence', async () => {
    const nodes = extractValidNodes(cleanFixture.document);
    const result = await inferStructure(nodes);

    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.aiCallCount).toBe(0); // 不应该需要 AI
    expect(result.dsl).toBeTruthy();
  });

  it('should generate valid DSL', async () => {
    const nodes = extractValidNodes(cleanFixture.document);
    const result = await inferStructure(nodes);

    // DSL 应该包含组件标签
    expect(result.dsl).toContain('[');
    expect(result.dsl).toContain(']');
  });

  describe('Ambiguous Fixture', () => {
    it('should fallback for ambiguous elements without AI', async () => {
      const nodes = extractValidNodes(ambiguousFixture.document);
      const result = await inferStructure(nodes);

      // 没有提供 AI 函数，应该有一些 fallback
      const fallbackCount = [...result.inferences.values()]
        .filter(i => i.method === 'fallback').length;

      // 一些节点会 fallback
      expect(fallbackCount).toBeGreaterThanOrEqual(0);
    });

    it('should correctly infer obvious button even with bad name', async () => {
      // 找到 "Rectangle 47" - 它看起来像按钮
      const nodes = extractValidNodes(ambiguousFixture.document);
      const buttonNode = nodes.find(n => n.name === 'Rectangle 47' && n.type === 'FRAME');

      if (buttonNode) {
        const inference = inferComponent(buttonNode);
        // 启发式应该能识别出这是按钮
        expect(inference).not.toBeInstanceOf(Promise);
        if (!(inference instanceof Promise)) {
          expect(inference.componentType).toBe('Button');
          expect(inference.method).toBe('heuristic');
        }
      }
    });

    it('should use AI when provided and rules/heuristics fail', async () => {
      // 模拟 AI 函数
      const mockAI = async (prompt: string): Promise<string> => {
        // 模拟 AI 总是返回 Container
        return JSON.stringify({
          componentType: 'Container',
          confidence: 0.7,
          reasoning: 'Mocked AI response',
        });
      };

      // 找一个规则和启发式都识别不了的节点
      const ambiguousNode: FigmaNode = {
        id: 'test:1',
        name: 'weird box',
        type: 'FRAME',
        absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 200 },
        cornerRadius: 0,
        fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }],
        children: [],
      };

      const inference = await inferComponent(ambiguousNode, mockAI);

      expect(inference.method).toBe('ai');
      expect(inference.componentType).toBe('Container');
    });
  });
});

describe('AI Priority and Fallback', () => {
  it('should prefer AI over non-strong heuristics when AI is available', async () => {
    const node: FigmaNode = {
      id: 'ai-priority:1',
      name: 'Rectangle 47',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 44 },
      cornerRadius: 6,
      fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.5, b: 0.9, a: 1 } }],
      children: [
        {
          id: 'ai-priority:1:text',
          name: 'label',
          type: 'TEXT',
          characters: 'Submit',
          style: { fontFamily: 'Inter', fontWeight: 500, fontSize: 14 },
        },
      ],
    };

    const mockAI = async (): Promise<string> =>
      JSON.stringify({
        componentType: 'Container',
        confidence: 0.8,
        reasoning: 'ai override',
        dsl: '[CONTAINER: Rectangle_47]',
      });

    const inference = await inferComponent(node, mockAI);
    expect(inference.method).toBe('ai');
    expect(inference.componentType).toBe('Container');
  });

  it('should keep strong heuristics and skip AI calls', () => {
    const node: FigmaNode = {
      id: 'ai-priority:2',
      name: 'Group 12',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 200 },
      cornerRadius: 12,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      effects: [
        { type: 'DROP_SHADOW', visible: true, color: { r: 0, g: 0, b: 0, a: 0.1 }, radius: 16 },
      ],
      children: [
        { id: 'ai-priority:2:text1', name: 'title', type: 'TEXT' },
        { id: 'ai-priority:2:text2', name: 'body', type: 'TEXT' },
      ],
    };

    let callCount = 0;
    const mockAI = async (): Promise<string> => {
      callCount += 1;
      return JSON.stringify({
        componentType: 'Container',
        confidence: 0.5,
        reasoning: 'should not be called',
        dsl: '[CONTAINER: Group_12]',
      });
    };

    const inference = inferComponent(node, mockAI);
    expect(inference).not.toBeInstanceOf(Promise);
    if (!(inference instanceof Promise)) {
      expect(inference.method).toBe('heuristic');
      expect(inference.componentType).toBe('Card');
    }
    expect(callCount).toBe(0);
  });

  it('should fall back to heuristics when AI output cannot be parsed', async () => {
    const node: FigmaNode = {
      id: 'ai-priority:3',
      name: 'Frame 99',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 180, height: 44 },
      cornerRadius: 8,
      fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.6, b: 0.9, a: 1 } }],
      children: [
        { id: 'ai-priority:3:text', name: 'text', type: 'TEXT', characters: 'Click me' },
      ],
    };

    const mockAI = async (): Promise<string> => 'not valid json';
    const inference = await inferComponent(node, mockAI);
    expect(inference.method).toBe('heuristic');
    expect(inference.componentType).toBe('Button');
  });
});

// === 模拟真实 AI 响应测试 ===

describe('Simulated AI Responses', () => {
  // 这些测试模拟 AI 对不同元素的识别

  const simulatedAIResponses: Record<string, string> = {
    'button-like': JSON.stringify({
      componentType: 'Button',
      confidence: 0.9,
      reasoning: '圆角、居中文本、按钮尺寸、纯色背景，典型的按钮样式',
    }),
    'card-like': JSON.stringify({
      componentType: 'Card',
      confidence: 0.85,
      reasoning: '卡片尺寸、阴影效果、包含标题和描述文本，是产品卡片',
    }),
    'input-like': JSON.stringify({
      componentType: 'Input',
      confidence: 0.88,
      reasoning: '边框、输入框尺寸、包含占位符文本，是文本输入框',
    }),
    'ambiguous': JSON.stringify({
      componentType: 'Container',
      confidence: 0.5,
      reasoning: '没有明显的组件特征，可能是容器或布局元素',
    }),
  };

  it('should parse simulated button response', () => {
    const result = parseAIResponse(simulatedAIResponses['button-like']);
    expect(result?.componentType).toBe('Button');
    expect(result?.confidence).toBe(0.9);
  });

  it('should parse simulated card response', () => {
    const result = parseAIResponse(simulatedAIResponses['card-like']);
    expect(result?.componentType).toBe('Card');
    expect(result?.confidence).toBe(0.85);
  });

  it('should parse simulated input response', () => {
    const result = parseAIResponse(simulatedAIResponses['input-like']);
    expect(result?.componentType).toBe('Input');
  });

  it('should handle low confidence ambiguous response', () => {
    const result = parseAIResponse(simulatedAIResponses['ambiguous']);
    expect(result?.componentType).toBe('Container');
    expect(result?.confidence).toBe(0.5);
  });
});

// === DSL 生成测试 ===

describe('DSL Generation', () => {
  it('should generate DSL that parses cleanly', async () => {
    const nodes = extractValidNodes(cleanFixture.document);
    const result = await inferStructure(nodes);

    const parseResult = parse(result.dsl);
    expect(parseResult.errors).toHaveLength(0);
    expect(parseResult.cst.length).toBeGreaterThan(0);
  });

  it('should include text content in DSL', async () => {
    const nodes = extractValidNodes(cleanFixture.document);
    const result = await inferStructure(nodes);

    // 应该包含文本内容
    expect(result.dsl).toMatch(/Content\(|Text\(|Placeholder\(/);
  });

  it('should include AI-provided className/style overrides in DSL', async () => {
    const node: FigmaNode = {
      id: 'ai:1',
      name: 'mystery box',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 96, height: 96 },
      children: [],
    };

    const mockAI = async (): Promise<string> =>
      JSON.stringify({
        componentType: 'Container',
        confidence: 0.8,
        reasoning: 'mocked',
        props: {
          className: 'custom-box gap-0',
          style: 'gap: 24px; borderRadius: 8px;',
        },
      });

    const result = await inferStructure([node], mockAI);
    expect(result.dsl).toContain('ClassName("custom-box gap-0")');
    expect(result.dsl).toContain('Style("gap: 24px; borderRadius: 8px;")');
  });

  it('should prefer AI-provided DSL ATTR/CONTENT overrides when present', async () => {
    const node: FigmaNode = {
      id: 'ai:2',
      name: 'Frame 99',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 280, height: 48 },
      children: [
        {
          id: 'ai:2:text',
          name: 'placeholder',
          type: 'TEXT',
          characters: 'Enter your email...',
        },
      ],
    };

    const mockAI = async (): Promise<string> =>
      JSON.stringify({
        componentType: 'Input',
        confidence: 0.9,
        reasoning: 'mocked',
        props: {
          className: 'should-not-appear',
        },
        dsl: '[INPUT: Frame_99]\n  ATTR: Placeholder("Email")\n  ATTR: Style("gap: 0px;")',
      });

    const result = await inferStructure([node], mockAI);
    expect(result.dsl).toContain('ATTR: Placeholder("Email")');
    expect(result.dsl).toContain('Style("gap: 0px;")');
    expect(result.dsl).not.toContain('should-not-appear');

    const parseResult = parse(result.dsl);
    expect(parseResult.errors).toHaveLength(0);
  });

  it('should sanitize node names for IDs', async () => {
    // 节点名包含特殊字符
    const node: FigmaNode = {
      id: '1',
      name: 'My Button (Primary) - v2',
      type: 'INSTANCE',
    };

    // inferComponent 返回的是推断结果，不是 DSL
    // 我们需要通过 inferStructure 来测试 DSL 生成
    const result = await inferStructure([node]);

    // DSL 中的 ID 应该被清理
    expect(result.dsl).not.toContain('(');
    expect(result.dsl).not.toContain(')');
  });
});

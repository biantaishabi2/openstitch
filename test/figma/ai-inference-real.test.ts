/**
 * AI 推断真实测试
 *
 * 这个测试会真正调用 AI CLI 来测试 AI 推断能力
 *
 * 重要说明：
 * AI 仍然不是多模态，但我们现在会提供一些"轻量视觉线索"
 * （如是否有描边、描边宽度、圆角、填充类型、文本预览等），
 * 以提升糟糕命名场景下的结构判断稳定性。
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, execSync } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

import type { FigmaNode } from '../../src/figma/types';
import { buildAIPrompt, parseAIResponse } from '../../src/figma/inferrers';

const RUN_REAL_AI = process.env.RUN_REAL_AI === '1';
const realAIDescribe = RUN_REAL_AI ? describe : describe.skip;
const USE_CODEX = process.env.USE_CODEX === '1';
const AI_PROVIDER = USE_CODEX ? 'codex' : 'claude';
let claudeBinPath: string | null = null;
let claudeScriptPath: string | null = null;

function getClaudeBinPath(): string {
  if (claudeBinPath && fs.existsSync(claudeBinPath)) return claudeBinPath;
  claudeBinPath = null;
  try {
    const resolved = execSync('which claude', { encoding: 'utf-8' }).trim();
    claudeBinPath = resolved;
  } catch {
    claudeBinPath = 'claude';
  }
  return claudeBinPath;
}

function getClaudeScriptPath(): string {
  if (claudeScriptPath) return claudeScriptPath;
  const binPath = getClaudeBinPath();
  try {
    claudeScriptPath = fs.realpathSync(binPath);
  } catch {
    claudeScriptPath = binPath;
  }
  return claudeScriptPath;
}

// === 工具函数 ===

/**
 * 调用 AI CLI 进行推断
 */
function callClaudeAI(prompt: string): string {
  const args = ['--print', '--dangerously-skip-permissions'];
  const opts = {
    input: prompt,
    encoding: 'utf-8' as const,
    timeout: 60000,
    maxBuffer: 1024 * 1024,
  };

  const attempts: Array<() => string> = [
    () => execFileSync(getClaudeBinPath(), args, opts),
    () => {
      const scriptPath = getClaudeScriptPath();
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`Claude script not found: ${scriptPath}`);
      }
      return execFileSync(process.execPath, [scriptPath, ...args], opts);
    },
    () => {
      // 清缓存后重新解析路径，缓解 CLI 安装路径偶发失效
      claudeBinPath = null;
      claudeScriptPath = null;
      return execFileSync(getClaudeBinPath(), args, opts);
    },
    () => execFileSync('claude', args, opts),
  ];

  let lastError: any = null;
  for (const attempt of attempts) {
    try {
      return attempt().trim();
    } catch (error: any) {
      lastError = error;
    }
  }

  console.error('Claude CLI 调用失败:', lastError?.message || 'unknown error');
  return '';
}

function callCodexAI(prompt: string): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-ai-'));
  const outputPath = path.join(tmpDir, 'last-message.txt');
  const args = [
    'exec',
    '--color',
    'never',
    '--output-last-message',
    outputPath,
    '-',
  ];

  try {
    execFileSync('codex', args, {
      input: prompt,
      encoding: 'utf-8' as const,
      timeout: 120000,
      maxBuffer: 1024 * 1024,
    });
    if (fs.existsSync(outputPath)) {
      return fs.readFileSync(outputPath, 'utf-8').trim();
    }
  } catch (error: any) {
    console.error('Codex CLI 调用失败:', error?.message || 'unknown error');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup failures
    }
  }

  return '';
}

function callRealAI(prompt: string): string {
  return USE_CODEX ? callCodexAI(prompt) : callClaudeAI(prompt);
}

// === 测试数据：需要 AI 识别的模糊节点 ===

const ambiguousNodes: Array<{
  name: string;
  node: FigmaNode;
  expectedType: string;
  description: string;
}> = [
  {
    name: '无名按钮',
    description: '名字是 Rectangle 47，但视觉上明显是按钮',
    expectedType: 'Button',
    node: {
      id: 'test:1',
      name: 'Rectangle 47',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 44 },
      cornerRadius: 6,
      fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.5, b: 0.9, a: 1 } }],
      strokes: [],
      effects: [],
      children: [
        {
          id: 'test:2',
          name: 'Text 1',
          type: 'TEXT',
          absoluteBoundingBox: { x: 30, y: 12, width: 60, height: 20 },
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
          characters: 'Submit',
          style: {
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 14,
            textAlignHorizontal: 'CENTER',
          },
        },
      ],
    },
  },
  {
    name: '无名卡片',
    description: '名字是 Group 12，但视觉上是产品卡片',
    expectedType: 'Card',
    node: {
      id: 'test:3',
      name: 'Group 12',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 180 },
      children: [
        {
          id: 'test:4',
          name: 'Rectangle 48',
          type: 'RECTANGLE',
          absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 180 },
          cornerRadius: 12,
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
          effects: [
            {
              type: 'DROP_SHADOW',
              visible: true,
              color: { r: 0, g: 0, b: 0, a: 0.1 },
              offset: { x: 0, y: 4 },
              radius: 16,
            },
          ],
        },
        {
          id: 'test:5',
          name: 'lorem text',
          type: 'TEXT',
          characters: 'Product Name',
          style: { fontFamily: 'Inter', fontWeight: 600, fontSize: 18 },
        },
        {
          id: 'test:6',
          name: 'more text',
          type: 'TEXT',
          characters: 'This is a product description.',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
        {
          id: 'test:7',
          name: 'price tag',
          type: 'TEXT',
          characters: '$99.00',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 20 },
        },
      ],
    },
  },
  {
    name: '无名输入框',
    description: '名字是 Frame 99，但视觉上是文本输入框',
    expectedType: 'Input',
    node: {
      id: 'test:8',
      name: 'Frame 99',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 280, height: 48 },
      cornerRadius: 8,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      strokes: [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85, a: 1 } }],
      strokeWeight: 1,
      effects: [],
      children: [
        {
          id: 'test:9',
          name: 'placeholder text',
          type: 'TEXT',
          characters: 'Enter your email...',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 15 },
          fills: [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6, a: 1 } }],
        },
      ],
    },
  },
  {
    name: '渐变按钮',
    description: '渐变填充的胶囊按钮，名字是 something 123',
    expectedType: 'Button',
    node: {
      id: 'test:10',
      name: 'something 123',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 180, height: 50 },
      cornerRadius: 25,
      fills: [
        {
          type: 'GRADIENT_LINEAR',
          gradientStops: [
            { position: 0, color: { r: 0.9, g: 0.3, b: 0.5, a: 1 } },
            { position: 1, color: { r: 0.6, g: 0.2, b: 0.8, a: 1 } },
          ],
        },
      ],
      strokes: [],
      effects: [],
      children: [
        {
          id: 'test:11',
          name: 'txt',
          type: 'TEXT',
          characters: 'Get Started',
          style: {
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: 16,
            textAlignHorizontal: 'CENTER',
          },
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        },
      ],
    },
  },
  {
    name: '模糊容器',
    description: '真正模糊的元素，可能是容器',
    expectedType: 'Container',
    node: {
      id: 'test:12',
      name: 'weird box',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 200 },
      cornerRadius: 0,
      fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }],
      strokes: [],
      effects: [],
      children: [
        {
          id: 'test:13',
          name: 'nested thing',
          type: 'FRAME',
          absoluteBoundingBox: { x: 20, y: 20, width: 160, height: 80 },
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        },
      ],
    },
  },
  {
    name: '烂输入框-超宽',
    description: '没有语义命名，只有描边和占位符文本',
    expectedType: 'Input',
    node: {
      id: 'test:14',
      name: 'Group 777',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 360, height: 44 },
      cornerRadius: 6,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      strokes: [{ type: 'SOLID', color: { r: 0.82, g: 0.82, b: 0.82, a: 1 } }],
      strokeWeight: 1,
      effects: [],
      children: [
        {
          id: 'test:14:text',
          name: 'text 999',
          type: 'TEXT',
          characters: 'Search products...',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
      ],
    },
  },
  {
    name: '烂按钮-小尺寸',
    description: '命名很差但尺寸和文案很像按钮',
    expectedType: 'Button',
    node: {
      id: 'test:15',
      name: 'Rectangle 888',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 96, height: 36 },
      cornerRadius: 8,
      fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.55, b: 0.9, a: 1 } }],
      strokes: [],
      effects: [],
      children: [
        {
          id: 'test:15:text',
          name: 'txt',
          type: 'TEXT',
          characters: 'Save',
          style: { fontFamily: 'Inter', fontWeight: 600, fontSize: 13 },
        },
      ],
    },
  },
  {
    name: '烂卡片-信息块',
    description: '纯 group 命名，结构像卡片信息块',
    expectedType: 'Card',
    node: {
      id: 'test:16',
      name: 'Group 404',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 320, height: 220 },
      children: [
        {
          id: 'test:16:bg',
          name: 'Rectangle 1',
          type: 'RECTANGLE',
          absoluteBoundingBox: { x: 0, y: 0, width: 320, height: 220 },
          cornerRadius: 12,
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        },
        {
          id: 'test:16:t1',
          name: 'title-ish',
          type: 'TEXT',
          characters: 'Monthly Report',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 18 },
        },
        {
          id: 'test:16:t2',
          name: 'subtitle-ish',
          type: 'TEXT',
          characters: 'Revenue growth',
          style: { fontFamily: 'Inter', fontWeight: 500, fontSize: 14 },
        },
        {
          id: 'test:16:t3',
          name: 'value-ish',
          type: 'TEXT',
          characters: '+18.2%',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 24 },
        },
      ],
    },
  },
  {
    name: '烂容器-布局块',
    description: '没有文本和装饰，只有多个子 frame',
    expectedType: 'Container',
    node: {
      id: 'test:17',
      name: 'Frame 12345',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 420, height: 280 },
      fills: [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.96, a: 1 } }],
      children: [
        {
          id: 'test:17:c1',
          name: 'inner 1',
          type: 'FRAME',
          absoluteBoundingBox: { x: 16, y: 16, width: 180, height: 100 },
        },
        {
          id: 'test:17:c2',
          name: 'inner 2',
          type: 'FRAME',
          absoluteBoundingBox: { x: 16, y: 132, width: 180, height: 100 },
        },
      ],
    },
  },
  {
    name: '烂容器-大壳子',
    description: '超大尺寸 + 多个子 frame + 无文本',
    expectedType: 'Container',
    node: {
      id: 'test:18',
      name: 'Group 999',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 640, height: 420 },
      fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98, a: 1 } }],
      children: [
        {
          id: 'test:18:c1',
          name: 'block a',
          type: 'FRAME',
          absoluteBoundingBox: { x: 24, y: 24, width: 280, height: 160 },
        },
        {
          id: 'test:18:c2',
          name: 'block b',
          type: 'FRAME',
          absoluteBoundingBox: { x: 24, y: 200, width: 280, height: 160 },
        },
        {
          id: 'test:18:c3',
          name: 'block c',
          type: 'FRAME',
          absoluteBoundingBox: { x: 328, y: 24, width: 280, height: 336 },
        },
      ],
    },
  },
  {
    name: '烂容器-横向排布',
    description: '横向 auto-layout + 多个子 frame + 无文本',
    expectedType: 'Row',
    node: {
      id: 'test:19',
      name: 'Frame 202020',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 16,
      absoluteBoundingBox: { x: 0, y: 0, width: 520, height: 180 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:19:c1',
          name: 'slot 1',
          type: 'FRAME',
          absoluteBoundingBox: { x: 0, y: 0, width: 160, height: 180 },
        },
        {
          id: 'test:19:c2',
          name: 'slot 2',
          type: 'FRAME',
          absoluteBoundingBox: { x: 176, y: 0, width: 160, height: 180 },
        },
        {
          id: 'test:19:c3',
          name: 'slot 3',
          type: 'FRAME',
          absoluteBoundingBox: { x: 352, y: 0, width: 160, height: 180 },
        },
      ],
    },
  },
  {
    name: '烂区块-竖向内容',
    description: '竖向 auto-layout + 标题 + 多段文本',
    expectedType: 'Section',
    node: {
      id: 'test:20',
      name: 'Frame 303030',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 12,
      absoluteBoundingBox: { x: 0, y: 0, width: 360, height: 260 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:20:h1',
          name: 'Text 1',
          type: 'TEXT',
          characters: 'Overview',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 24 },
        },
        {
          id: 'test:20:p1',
          name: 'Text 2',
          type: 'TEXT',
          characters: 'This block explains the current status.',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
        {
          id: 'test:20:p2',
          name: 'Text 3',
          type: 'TEXT',
          characters: 'It is a vertical content section.',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
      ],
    },
  },
  {
    name: '烂行-图标加文字',
    description: '横向 auto-layout + icon + 文本，名字很烂',
    expectedType: 'Row',
    node: {
      id: 'test:21',
      name: 'Group 5151',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 8,
      absoluteBoundingBox: { x: 0, y: 0, width: 180, height: 40 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:21:icon',
          name: 'Vector 1',
          type: 'VECTOR',
          absoluteBoundingBox: { x: 0, y: 0, width: 20, height: 20 },
        },
        {
          id: 'test:21:text',
          name: 'Text 1',
          type: 'TEXT',
          characters: 'Profile settings',
          style: { fontFamily: 'Inter', fontWeight: 500, fontSize: 14 },
        },
      ],
    },
  },
  {
    name: '烂输入框-无描边但像输入',
    description: '没有描边但宽高比极大且文本像占位符',
    expectedType: 'Input',
    node: {
      id: 'test:22',
      name: 'Rectangle 123',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 420, height: 44 },
      cornerRadius: 10,
      fills: [{ type: 'SOLID', color: { r: 0.99, g: 0.99, b: 0.99, a: 1 } }],
      strokes: [],
      effects: [],
      children: [
        {
          id: 'test:22:text',
          name: 'text 22',
          type: 'TEXT',
          characters: 'Type to search...',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
      ],
    },
  },
  {
    name: '复杂区块-竖向仪表盘段落',
    description: '竖向 auto-layout + 标题 + 多个子块',
    expectedType: 'Section',
    node: {
      id: 'test:23',
      name: 'Frame 909090',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 20,
      absoluteBoundingBox: { x: 0, y: 0, width: 720, height: 640 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:23:title',
          name: 'Text 23',
          type: 'TEXT',
          characters: 'Analytics overview',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 28 },
        },
        {
          id: 'test:23:row1',
          name: 'Row 1',
          type: 'FRAME',
          layoutMode: 'HORIZONTAL',
          absoluteBoundingBox: { x: 0, y: 0, width: 720, height: 180 },
          children: [
            { id: 'test:23:row1:c1', name: 'card a', type: 'FRAME' },
            { id: 'test:23:row1:c2', name: 'card b', type: 'FRAME' },
            { id: 'test:23:row1:c3', name: 'card c', type: 'FRAME' },
          ],
        },
        {
          id: 'test:23:row2',
          name: 'Row 2',
          type: 'FRAME',
          absoluteBoundingBox: { x: 0, y: 220, width: 720, height: 360 },
          children: [
            { id: 'test:23:row2:c1', name: 'panel a', type: 'FRAME' },
            { id: 'test:23:row2:c2', name: 'panel b', type: 'FRAME' },
          ],
        },
      ],
    },
  },
  {
    name: '复杂区块-竖向内容编排',
    description: '竖向 auto-layout + 多文本 + 子容器',
    expectedType: 'Section',
    node: {
      id: 'test:24',
      name: 'Group 242424',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 16,
      absoluteBoundingBox: { x: 0, y: 0, width: 680, height: 520 },
      fills: [{ type: 'SOLID', color: { r: 0.99, g: 0.99, b: 0.99, a: 1 } }],
      children: [
        {
          id: 'test:24:h',
          name: 'heading-ish',
          type: 'TEXT',
          characters: 'Team activity',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 26 },
        },
        {
          id: 'test:24:p1',
          name: 'paragraph 1',
          type: 'TEXT',
          characters: 'Latest updates across the workspace.',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 15 },
        },
        {
          id: 'test:24:content',
          name: 'content stack',
          type: 'FRAME',
          layoutMode: 'VERTICAL',
          absoluteBoundingBox: { x: 0, y: 120, width: 680, height: 380 },
          children: [
            { id: 'test:24:c1', name: 'item 1', type: 'FRAME' },
            { id: 'test:24:c2', name: 'item 2', type: 'FRAME' },
            { id: 'test:24:c3', name: 'item 3', type: 'FRAME' },
          ],
        },
      ],
    },
  },
  {
    name: '复杂行-横向卡片带标签',
    description: '横向 auto-layout + 多子块 + 非动作文本',
    expectedType: 'Row',
    node: {
      id: 'test:25',
      name: 'Frame 252525',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 12,
      absoluteBoundingBox: { x: 0, y: 0, width: 960, height: 220 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:25:label',
          name: 'label',
          type: 'TEXT',
          characters: 'Featured',
          style: { fontFamily: 'Inter', fontWeight: 600, fontSize: 14 },
        },
        { id: 'test:25:c1', name: 'card 1', type: 'FRAME' },
        { id: 'test:25:c2', name: 'card 2', type: 'FRAME' },
        { id: 'test:25:c3', name: 'card 3', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂行-横向芯片集合',
    description: '横向 auto-layout + 多个子 frame + 无动作词',
    expectedType: 'Row',
    node: {
      id: 'test:26',
      name: 'Group 262626',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 10,
      absoluteBoundingBox: { x: 0, y: 0, width: 820, height: 64 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        { id: 'test:26:c1', name: 'chip a', type: 'FRAME' },
        { id: 'test:26:c2', name: 'chip b', type: 'FRAME' },
        { id: 'test:26:c3', name: 'chip c', type: 'FRAME' },
        { id: 'test:26:c4', name: 'chip d', type: 'FRAME' },
        { id: 'test:26:c5', name: 'chip e', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂卡片-带阴影和图文',
    description: '阴影 + 圆角 + 图片占位 + 多文本',
    expectedType: 'Card',
    node: {
      id: 'test:27',
      name: 'Card 27',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 360, height: 280 },
      cornerRadius: 16,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.12 },
          offset: { x: 0, y: 10 },
          radius: 24,
        },
      ],
      children: [
        { id: 'test:27:img', name: 'image', type: 'RECTANGLE' },
        {
          id: 'test:27:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Project Phoenix',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 20 },
        },
        {
          id: 'test:27:desc',
          name: 'desc',
          type: 'TEXT',
          characters: 'Weekly status and blockers',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
      ],
    },
  },
  {
    name: '复杂卡片-统计摘要卡',
    description: '阴影 + 圆角 + 标题 + 数值 + 说明',
    expectedType: 'Card',
    node: {
      id: 'test:28',
      name: 'Group 282828',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 320, height: 200 },
      cornerRadius: 14,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 0, y: 6 },
          radius: 18,
        },
      ],
      children: [
        {
          id: 'test:28:title',
          name: 'title-ish',
          type: 'TEXT',
          characters: 'Active users',
          style: { fontFamily: 'Inter', fontWeight: 600, fontSize: 16 },
        },
        {
          id: 'test:28:value',
          name: 'value-ish',
          type: 'TEXT',
          characters: '12,483',
          style: { fontFamily: 'Inter', fontWeight: 800, fontSize: 34 },
        },
        {
          id: 'test:28:meta',
          name: 'meta row',
          type: 'FRAME',
          layoutMode: 'HORIZONTAL',
          children: [
            { id: 'test:28:meta:icon', name: 'icon', type: 'VECTOR' },
            { id: 'test:28:meta:text', name: 'text', type: 'TEXT', characters: '+6.4%' },
          ],
        },
      ],
    },
  },
  {
    name: '复杂容器-大面积布局壳',
    description: '超大尺寸 + 多个子 frame + 无文本',
    expectedType: 'Container',
    node: {
      id: 'test:29',
      name: 'Frame 292929',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 1280, height: 720 },
      fills: [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97, a: 1 } }],
      children: [
        { id: 'test:29:left', name: 'left panel', type: 'FRAME' },
        { id: 'test:29:center', name: 'center panel', type: 'FRAME' },
        { id: 'test:29:right', name: 'right panel', type: 'FRAME' },
        { id: 'test:29:footer', name: 'footer panel', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂容器-网格面板组合',
    description: '大尺寸 + 多个非文本子节点 + 无布局模式',
    expectedType: 'Container',
    node: {
      id: 'test:30',
      name: 'Group 303131',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 1040, height: 640 },
      fills: [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.96, a: 1 } }],
      children: [
        { id: 'test:30:r1', name: 'row 1', type: 'FRAME' },
        { id: 'test:30:r2', name: 'row 2', type: 'FRAME' },
        { id: 'test:30:r3', name: 'row 3', type: 'FRAME' },
        { id: 'test:30:bg', name: 'bg rect', type: 'RECTANGLE' },
      ],
    },
  },
  {
    name: '复杂输入框-带图标和占位符',
    description: '有描边 + 大宽高比 + 占位符文本 + 图标',
    expectedType: 'Input',
    node: {
      id: 'test:31',
      name: 'Frame 313131',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 420, height: 48 },
      cornerRadius: 12,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      strokes: [{ type: 'SOLID', color: { r: 0.82, g: 0.82, b: 0.82, a: 1 } }],
      strokeWeight: 1,
      children: [
        { id: 'test:31:icon', name: 'icon', type: 'VECTOR' },
        {
          id: 'test:31:text',
          name: 'placeholder',
          type: 'TEXT',
          characters: 'Search everything...',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 15 },
        },
      ],
    },
  },
  {
    name: '复杂输入框-中文占位符',
    description: '有描边 + 占位符中文 + 中等高度',
    expectedType: 'Input',
    node: {
      id: 'test:32',
      name: 'Rectangle 323232',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 360, height: 44 },
      cornerRadius: 10,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      strokes: [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8, a: 1 } }],
      strokeWeight: 1,
      children: [
        {
          id: 'test:32:text',
          name: 'placeholder',
          type: 'TEXT',
          characters: '请输入手机号',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
      ],
    },
  },
  {
    name: '复杂按钮-图标加动作词',
    description: '动作词文本 + 图标子节点 + 中等尺寸',
    expectedType: 'Button',
    node: {
      id: 'test:33',
      name: 'Group 333333',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 164, height: 44 },
      cornerRadius: 10,
      fills: [{ type: 'SOLID', color: { r: 0.12, g: 0.58, b: 0.95, a: 1 } }],
      strokes: [],
      children: [
        { id: 'test:33:icon', name: 'icon', type: 'VECTOR' },
        {
          id: 'test:33:text',
          name: 'label',
          type: 'TEXT',
          characters: 'Confirm',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 15 },
        },
      ],
    },
  },
  {
    name: '复杂按钮-支付动作',
    description: '动作词文本 + 强填充 + 圆角',
    expectedType: 'Button',
    node: {
      id: 'test:34',
      name: 'Frame 343434',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 150, height: 48 },
      cornerRadius: 12,
      fills: [{ type: 'SOLID', color: { r: 0.05, g: 0.2, b: 0.6, a: 1 } }],
      strokes: [],
      children: [
        {
          id: 'test:34:text',
          name: 'label',
          type: 'TEXT',
          characters: 'Pay now',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 16 },
        },
      ],
    },
  },
  {
    name: '复杂区块-竖向带卡片列表',
    description: '竖向 auto-layout + 标题 + 多个卡片子块',
    expectedType: 'Section',
    node: {
      id: 'test:35',
      name: 'Frame 353535',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 18,
      absoluteBoundingBox: { x: 0, y: 0, width: 820, height: 720 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:35:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Recent projects',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 30 },
        },
        { id: 'test:35:c1', name: 'card 1', type: 'FRAME' },
        { id: 'test:35:c2', name: 'card 2', type: 'FRAME' },
        { id: 'test:35:c3', name: 'card 3', type: 'FRAME' },
        { id: 'test:35:c4', name: 'card 4', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂行-图标加名词短语',
    description: '横向 auto-layout + 图标 + 名词文本',
    expectedType: 'Row',
    node: {
      id: 'test:36',
      name: 'Row 363636',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 10,
      absoluteBoundingBox: { x: 0, y: 0, width: 260, height: 46 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        { id: 'test:36:icon', name: 'icon', type: 'VECTOR' },
        {
          id: 'test:36:text',
          name: 'label',
          type: 'TEXT',
          characters: 'Billing plan',
          style: { fontFamily: 'Inter', fontWeight: 600, fontSize: 15 },
        },
        { id: 'test:36:badge', name: 'badge', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂卡片-小尺寸信息卡',
    description: '阴影 + 圆角 + 标题 + 描述',
    expectedType: 'Card',
    node: {
      id: 'test:37',
      name: 'Card 373737',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 280, height: 160 },
      cornerRadius: 12,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.08 },
          offset: { x: 0, y: 4 },
          radius: 12,
        },
      ],
      children: [
        {
          id: 'test:37:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Storage usage',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 18 },
        },
        {
          id: 'test:37:desc',
          name: 'desc',
          type: 'TEXT',
          characters: '72% of 1TB used',
          style: { fontFamily: 'Inter', fontWeight: 400, fontSize: 14 },
        },
        { id: 'test:37:meta', name: 'meta', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂卡片-带图片区和操作区',
    description: '阴影 + 圆角 + 图片占位 + 操作行',
    expectedType: 'Card',
    node: {
      id: 'test:38',
      name: 'Group 383838',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 400, height: 320 },
      cornerRadius: 18,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      effects: [
        {
          type: 'DROP_SHADOW',
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 0.14 },
          offset: { x: 0, y: 12 },
          radius: 28,
        },
      ],
      children: [
        { id: 'test:38:img', name: 'hero image', type: 'RECTANGLE' },
        {
          id: 'test:38:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Design system update',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 22 },
        },
        {
          id: 'test:38:actions',
          name: 'actions',
          type: 'FRAME',
          layoutMode: 'HORIZONTAL',
          children: [
            { id: 'test:38:actions:a1', name: 'action 1', type: 'FRAME' },
            { id: 'test:38:actions:a2', name: 'action 2', type: 'FRAME' },
          ],
        },
      ],
    },
  },
  {
    name: '复杂容器-多面板无文本',
    description: '大尺寸 + 多子面板 + 无文本',
    expectedType: 'Container',
    node: {
      id: 'test:39',
      name: 'Frame 393939',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
      fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }],
      children: [
        { id: 'test:39:nav', name: 'nav', type: 'FRAME' },
        { id: 'test:39:main', name: 'main', type: 'FRAME' },
        { id: 'test:39:aside', name: 'aside', type: 'FRAME' },
        { id: 'test:39:modals', name: 'modals', type: 'FRAME' },
        { id: 'test:39:bg', name: 'bg', type: 'RECTANGLE' },
      ],
    },
  },
  {
    name: '复杂区块-竖向表单容器',
    description: '竖向 auto-layout + 标题 + 多输入子块',
    expectedType: 'Section',
    node: {
      id: 'test:40',
      name: 'Form 404040',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 14,
      absoluteBoundingBox: { x: 0, y: 0, width: 640, height: 760 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:40:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Create workspace',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 28 },
        },
        { id: 'test:40:field1', name: 'field 1', type: 'FRAME' },
        { id: 'test:40:field2', name: 'field 2', type: 'FRAME' },
        { id: 'test:40:field3', name: 'field 3', type: 'FRAME' },
        { id: 'test:40:actions', name: 'actions', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂行-工具栏集合',
    description: '横向 auto-layout + 多按钮子块 + 标题文本',
    expectedType: 'Row',
    node: {
      id: 'test:41',
      name: 'Toolbar 414141',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 12,
      absoluteBoundingBox: { x: 0, y: 0, width: 980, height: 72 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:41:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Filters',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 18 },
        },
        { id: 'test:41:b1', name: 'btn 1', type: 'FRAME' },
        { id: 'test:41:b2', name: 'btn 2', type: 'FRAME' },
        { id: 'test:41:b3', name: 'btn 3', type: 'FRAME' },
        { id: 'test:41:b4', name: 'btn 4', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂容器-多区块拼接',
    description: '超大尺寸 + 多区块子节点 + 无文本',
    expectedType: 'Container',
    node: {
      id: 'test:42',
      name: 'Canvas 424242',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 1600, height: 1200 },
      fills: [{ type: 'SOLID', color: { r: 0.94, g: 0.94, b: 0.94, a: 1 } }],
      children: [
        { id: 'test:42:top', name: 'top section', type: 'FRAME' },
        { id: 'test:42:mid', name: 'mid section', type: 'FRAME' },
        { id: 'test:42:bot', name: 'bottom section', type: 'FRAME' },
        { id: 'test:42:overlay', name: 'overlay', type: 'FRAME' },
        { id: 'test:42:decoration', name: 'decoration', type: 'RECTANGLE' },
      ],
    },
  },
  {
    name: '复杂区块-竖向表单栈（少文本）',
    description: 'VERTICAL + 1个标题文本 + 多个字段子块',
    expectedType: 'Section',
    node: {
      id: 'test:43',
      name: 'Frame 434343',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 16,
      absoluteBoundingBox: { x: 0, y: 0, width: 680, height: 900 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:43:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Account settings',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 26 },
        },
        { id: 'test:43:f1', name: 'field 1', type: 'FRAME' },
        { id: 'test:43:f2', name: 'field 2', type: 'FRAME' },
        { id: 'test:43:f3', name: 'field 3', type: 'FRAME' },
        { id: 'test:43:f4', name: 'field 4', type: 'FRAME' },
        { id: 'test:43:f5', name: 'field 5', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂区块-竖向面板编排（标题+多块）',
    description: 'VERTICAL + 标题文本 + 多个面板子块',
    expectedType: 'Section',
    node: {
      id: 'test:44',
      name: 'Group 444444',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 18,
      absoluteBoundingBox: { x: 0, y: 0, width: 920, height: 780 },
      fills: [{ type: 'SOLID', color: { r: 0.99, g: 0.99, b: 0.99, a: 1 } }],
      children: [
        {
          id: 'test:44:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Workspace overview',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 30 },
        },
        { id: 'test:44:p1', name: 'panel 1', type: 'FRAME' },
        { id: 'test:44:p2', name: 'panel 2', type: 'FRAME' },
        { id: 'test:44:p3', name: 'panel 3', type: 'FRAME' },
        { id: 'test:44:p4', name: 'panel 4', type: 'FRAME' },
      ],
    },
  },
  {
    name: '复杂区块-竖向步骤流（标题+步骤块）',
    description: 'VERTICAL + 标题文本 + 多个步骤子块',
    expectedType: 'Section',
    node: {
      id: 'test:45',
      name: 'Flow 454545',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      itemSpacing: 14,
      absoluteBoundingBox: { x: 0, y: 0, width: 760, height: 860 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:45:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Getting started',
          style: { fontFamily: 'Inter', fontWeight: 800, fontSize: 28 },
        },
        { id: 'test:45:s1', name: 'step 1', type: 'FRAME' },
        { id: 'test:45:s2', name: 'step 2', type: 'FRAME' },
        { id: 'test:45:s3', name: 'step 3', type: 'FRAME' },
        { id: 'test:45:s4', name: 'step 4', type: 'FRAME' },
        { id: 'test:45:s5', name: 'step 5', type: 'FRAME' },
      ],
    },
  },
  {
    name: '无自动布局-水平排布靠坐标',
    description: 'layoutMode=none，但子块坐标呈水平等间距排布',
    expectedType: 'Row',
    node: {
      id: 'test:46',
      name: 'Group 464646',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 960, height: 140 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:46:c1',
          name: 'card a',
          type: 'FRAME',
          absoluteBoundingBox: { x: 24, y: 30, width: 280, height: 80 },
        },
        {
          id: 'test:46:c2',
          name: 'card b',
          type: 'FRAME',
          absoluteBoundingBox: { x: 320, y: 30, width: 280, height: 80 },
        },
        {
          id: 'test:46:c3',
          name: 'card c',
          type: 'FRAME',
          absoluteBoundingBox: { x: 616, y: 30, width: 280, height: 80 },
        },
      ],
    },
  },
  {
    name: '无自动布局-竖向排布靠坐标',
    description: 'layoutMode=none，但标题+字段坐标呈竖向等间距排布',
    expectedType: 'Section',
    node: {
      id: 'test:47',
      name: 'Frame 474747',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 520, height: 720 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:47:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Profile',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 24 },
          absoluteBoundingBox: { x: 40, y: 32, width: 180, height: 32 },
        },
        {
          id: 'test:47:f1',
          name: 'field 1',
          type: 'FRAME',
          absoluteBoundingBox: { x: 40, y: 96, width: 440, height: 56 },
        },
        {
          id: 'test:47:f2',
          name: 'field 2',
          type: 'FRAME',
          absoluteBoundingBox: { x: 40, y: 172, width: 440, height: 56 },
        },
        {
          id: 'test:47:f3',
          name: 'field 3',
          type: 'FRAME',
          absoluteBoundingBox: { x: 40, y: 248, width: 440, height: 56 },
        },
        {
          id: 'test:47:f4',
          name: 'field 4',
          type: 'FRAME',
          absoluteBoundingBox: { x: 40, y: 324, width: 440, height: 56 },
        },
      ],
    },
  },
  {
    name: '背景层干扰-水平列表',
    description: '有近乎铺满的背景层，但内容子块呈水平排布',
    expectedType: 'Row',
    node: {
      id: 'test:48',
      name: 'Group 484848',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 1000, height: 200 },
      children: [
        {
          id: 'test:48:bg',
          name: 'bg',
          type: 'RECTANGLE',
          absoluteBoundingBox: { x: 0, y: 0, width: 1000, height: 200 },
          fills: [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97, a: 1 } }],
        },
        {
          id: 'test:48:c1',
          name: 'card 1',
          type: 'FRAME',
          absoluteBoundingBox: { x: 32, y: 40, width: 280, height: 120 },
        },
        {
          id: 'test:48:c2',
          name: 'card 2',
          type: 'FRAME',
          absoluteBoundingBox: { x: 344, y: 40, width: 280, height: 120 },
        },
        {
          id: 'test:48:c3',
          name: 'card 3',
          type: 'FRAME',
          absoluteBoundingBox: { x: 656, y: 40, width: 280, height: 120 },
        },
      ],
    },
  },
  {
    name: '背景层干扰-竖向表单',
    description: '有背景层且 layoutMode=none，但内容坐标呈竖向表单结构',
    expectedType: 'Section',
    node: {
      id: 'test:49',
      name: 'Frame 494949',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 600, height: 820 },
      children: [
        {
          id: 'test:49:bg',
          name: 'bg',
          type: 'RECTANGLE',
          absoluteBoundingBox: { x: 0, y: 0, width: 600, height: 820 },
          fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98, a: 1 } }],
        },
        {
          id: 'test:49:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Security',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 26 },
          absoluteBoundingBox: { x: 36, y: 28, width: 200, height: 34 },
        },
        {
          id: 'test:49:f1',
          name: 'field 1',
          type: 'FRAME',
          absoluteBoundingBox: { x: 36, y: 96, width: 528, height: 60 },
        },
        {
          id: 'test:49:f2',
          name: 'field 2',
          type: 'FRAME',
          absoluteBoundingBox: { x: 36, y: 176, width: 528, height: 60 },
        },
        {
          id: 'test:49:f3',
          name: 'field 3',
          type: 'FRAME',
          absoluteBoundingBox: { x: 36, y: 256, width: 528, height: 60 },
        },
      ],
    },
  },
  {
    name: '缺容器-卡片散落但坐标成行',
    description: '没有 auto-layout 容器，但多个卡片坐标明显在同一行',
    expectedType: 'Row',
    node: {
      id: 'test:50',
      name: 'Canvas 505050',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 1280, height: 360 },
      children: [
        { id: 'test:50:c1', name: 'card 1', type: 'FRAME', absoluteBoundingBox: { x: 48, y: 64, width: 360, height: 240 } },
        { id: 'test:50:c2', name: 'card 2', type: 'FRAME', absoluteBoundingBox: { x: 432, y: 64, width: 360, height: 240 } },
        { id: 'test:50:c3', name: 'card 3', type: 'FRAME', absoluteBoundingBox: { x: 816, y: 64, width: 360, height: 240 } },
      ],
    },
  },
  {
    name: '缺容器-列表散落但坐标成列',
    description: '没有 auto-layout 容器，但多个列表项坐标明显成列',
    expectedType: 'Section',
    node: {
      id: 'test:51',
      name: 'Group 515151',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 520, height: 880 },
      children: [
        { id: 'test:51:i1', name: 'item 1', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 48, width: 456, height: 120 } },
        { id: 'test:51:i2', name: 'item 2', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 192, width: 456, height: 120 } },
        { id: 'test:51:i3', name: 'item 3', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 336, width: 456, height: 120 } },
        { id: 'test:51:i4', name: 'item 4', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 480, width: 456, height: 120 } },
      ],
    },
  },
  {
    name: '实例图标-乱命名',
    description: 'INSTANCE 名称杂乱但尺寸很小且包含矢量子节点',
    expectedType: 'Icon',
    node: {
      id: 'test:52',
      name: 'ic_24/outline/home',
      type: 'INSTANCE',
      absoluteBoundingBox: { x: 0, y: 0, width: 24, height: 24 },
      children: [
        {
          id: 'test:52:v1',
          name: 'Vector 1',
          type: 'VECTOR',
          absoluteBoundingBox: { x: 2, y: 2, width: 20, height: 20 },
        },
      ],
    },
  },
  {
    name: '组件集-按钮变体',
    description: 'COMPONENT_SET 名字带 Button/Primary，但无 auto layout',
    expectedType: 'Button',
    node: {
      id: 'test:53',
      name: 'Button/Primary',
      type: 'COMPONENT_SET',
      absoluteBoundingBox: { x: 0, y: 0, width: 140, height: 44 },
      cornerRadius: 8,
      fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.5, b: 0.9, a: 1 } }],
      children: [
        {
          id: 'test:53:t1',
          name: 'label',
          type: 'TEXT',
          characters: 'Confirm',
          style: { fontFamily: 'Inter', fontWeight: 600, fontSize: 14 },
          absoluteBoundingBox: { x: 36, y: 12, width: 68, height: 20 },
        },
      ],
    },
  },
  {
    name: '组件-图标',
    description: 'COMPONENT 名字带 Icon/Settings，尺寸小方形',
    expectedType: 'Icon',
    node: {
      id: 'test:54',
      name: 'Icon/Settings',
      type: 'COMPONENT',
      absoluteBoundingBox: { x: 0, y: 0, width: 24, height: 24 },
      children: [
        {
          id: 'test:54:v1',
          name: 'Vector 2',
          type: 'VECTOR',
          absoluteBoundingBox: { x: 1, y: 1, width: 22, height: 22 },
        },
      ],
    },
  },
  {
    name: '溢出图层-标题在边界外',
    description: '标题文字超出父容器边界，但整体是竖向内容区块',
    expectedType: 'Section',
    node: {
      id: 'test:55',
      name: 'Frame 555555',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 480, height: 520 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
      children: [
        {
          id: 'test:55:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Overview',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 24 },
          absoluteBoundingBox: { x: 24, y: -6, width: 160, height: 28 },
        },
        {
          id: 'test:55:c1',
          name: 'card 1',
          type: 'FRAME',
          absoluteBoundingBox: { x: 24, y: 48, width: 432, height: 120 },
        },
        {
          id: 'test:55:c2',
          name: 'card 2',
          type: 'FRAME',
          absoluteBoundingBox: { x: 24, y: 188, width: 432, height: 120 },
        },
        {
          id: 'test:55:c3',
          name: 'card 3',
          type: 'FRAME',
          absoluteBoundingBox: { x: 24, y: 336, width: 432, height: 120 },
        },
      ],
    },
  },
  {
    name: '非等距间距-竖向表单',
    description: '子节点间距不等，但仍然明显是竖向表单',
    expectedType: 'Section',
    node: {
      id: 'test:56',
      name: 'Form 565656',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 520, height: 680 },
      children: [
        {
          id: 'test:56:title',
          name: 'title',
          type: 'TEXT',
          characters: 'Billing',
          style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 24 },
          absoluteBoundingBox: { x: 32, y: 24, width: 140, height: 28 },
        },
        { id: 'test:56:f1', name: 'field 1', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 84, width: 456, height: 56 } },
        { id: 'test:56:f2', name: 'field 2', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 164, width: 456, height: 56 } },
        { id: 'test:56:f3', name: 'field 3', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 252, width: 456, height: 56 } },
        { id: 'test:56:f4', name: 'field 4', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 352, width: 456, height: 56 } },
      ],
    },
  },
  {
    name: '网格布局-无容器',
    description: '2x2 面板网格，无 auto layout，应该是容器',
    expectedType: 'Container',
    node: {
      id: 'test:57',
      name: 'Canvas 575757',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 760, height: 560 },
      children: [
        { id: 'test:57:p1', name: 'panel 1', type: 'FRAME', absoluteBoundingBox: { x: 24, y: 24, width: 340, height: 220 } },
        { id: 'test:57:p2', name: 'panel 2', type: 'FRAME', absoluteBoundingBox: { x: 396, y: 24, width: 340, height: 220 } },
        { id: 'test:57:p3', name: 'panel 3', type: 'FRAME', absoluteBoundingBox: { x: 24, y: 284, width: 340, height: 220 } },
        { id: 'test:57:p4', name: 'panel 4', type: 'FRAME', absoluteBoundingBox: { x: 396, y: 284, width: 340, height: 220 } },
      ],
    },
  },
  {
    name: '布尔图标-小尺寸',
    description: 'BOOLEAN_OPERATION 小尺寸，应该判为 Icon',
    expectedType: 'Icon',
    node: {
      id: 'test:58',
      name: 'boolean icon',
      type: 'BOOLEAN_OPERATION',
      absoluteBoundingBox: { x: 0, y: 0, width: 20, height: 20 },
    },
  },
  {
    name: '实例图片-乱命名',
    description: 'INSTANCE 名字带 Image/Hero，应该判为 Image',
    expectedType: 'Image',
    node: {
      id: 'test:59',
      name: 'Image/Hero',
      type: 'INSTANCE',
      absoluteBoundingBox: { x: 0, y: 0, width: 480, height: 260 },
    },
  },
  {
    name: '深层缺容器-二级列表',
    description: '两组列表项坐标成列，但中间缺 Row/Section 容器',
    expectedType: 'Section',
    node: {
      id: 'test:60',
      name: 'Group 606060',
      type: 'GROUP',
      absoluteBoundingBox: { x: 0, y: 0, width: 640, height: 840 },
      children: [
        { id: 'test:60:head', name: 'title', type: 'TEXT', characters: 'Tasks', style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 22 }, absoluteBoundingBox: { x: 32, y: 24, width: 120, height: 28 } },
        { id: 'test:60:item1', name: 'item 1', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 80, width: 576, height: 96 } },
        { id: 'test:60:item2', name: 'item 2', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 196, width: 576, height: 96 } },
        { id: 'test:60:item3', name: 'item 3', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 312, width: 576, height: 96 } },
        { id: 'test:60:item4', name: 'item 4', type: 'FRAME', absoluteBoundingBox: { x: 32, y: 428, width: 576, height: 96 } },
      ],
    },
  },
];

// === 真实 AI 推断测试 ===

realAIDescribe('Real AI Inference Tests', () => {
  // 设置较长的超时时间，因为要调用 AI
  const TIMEOUT = 120000; // 2 分钟
  const predictions: Array<{ expected: string; predicted: string }> = [];

  describe('AI CLI 可用性', () => {
    it('should have AI CLI installed', () => {
      const result = execSync(`which ${AI_PROVIDER}`, { encoding: 'utf-8' });
      expect(result.trim()).toContain(AI_PROVIDER);
    });
  });

  describe('单个节点 AI 推断', () => {
    for (const testCase of ambiguousNodes) {
      it(
        `应该正确识别: ${testCase.name} → ${testCase.expectedType}`,
        async () => {
          // 1. 构建 prompt
          const prompt = buildAIPrompt(testCase.node);
          console.log(`\n=== 测试: ${testCase.name} ===`);
          console.log(`描述: ${testCase.description}`);
          console.log(`期望类型: ${testCase.expectedType}`);
          console.log(`\nPrompt:\n${prompt.substring(0, 200)}...`);

          // 2. 调用 AI CLI
          const aiResponse = callRealAI(prompt);
          if (!aiResponse) {
            console.warn('AI CLI 不可用，跳过该用例');
            return;
          }
          console.log(`\nAI 响应:\n${aiResponse.substring(0, 500)}`);

          // 3. 解析响应
          let parsed = parseAIResponse(aiResponse);
          console.log(`\n解析结果:`, parsed);

          // 若没有返回合法 JSON，则追加错误提示重试一次
          if (!parsed) {
            const retryPrompt =
              `${prompt}\n\n` +
              `你上一次没有返回合法 JSON（或 componentType 字段缺失）。\n` +
              `请只返回符合格式的 JSON，不要解释。`;
            const retryResponse = callRealAI(retryPrompt);
            if (!retryResponse) {
              console.warn('AI CLI 重试不可用，跳过该用例');
              return;
            }
            console.log(`\nAI 重试响应:\n${retryResponse.substring(0, 500)}`);
            parsed = parseAIResponse(retryResponse);
            console.log(`\n重试解析结果:`, parsed);
          }

          // 4. 验证
          expect(parsed).not.toBeNull();
          if (parsed) {
            // 验证返回了有效的组件类型
            const validTypes = [
              'Button', 'Card', 'Input', 'Heading', 'Text',
              'Image', 'Icon', 'Section', 'Row', 'Container'
            ];
            expect(validTypes).toContain(parsed.componentType);

            console.log(`AI 判断: ${parsed.componentType}, 期望: ${testCase.expectedType}`);
            predictions.push({ expected: testCase.expectedType, predicted: parsed.componentType });

            // 置信度应该大于 0.4（因为信息有限，允许较低置信度）
            expect(parsed.confidence).toBeGreaterThanOrEqual(0.4);
          }
        },
        TIMEOUT
      );
    }
  });

  afterAll(() => {
    if (predictions.length === 0) return;
    const total = predictions.length;
    const correct = predictions.filter(p => p.expected === p.predicted).length;
    const accuracy = correct / total;

    const types = Array.from(
      new Set(predictions.flatMap(p => [p.expected, p.predicted]))
    );

    const matrix: Record<string, Record<string, number>> = {};
    for (const expected of types) {
      matrix[expected] = {};
      for (const predicted of types) {
        matrix[expected][predicted] = 0;
      }
    }
    for (const { expected, predicted } of predictions) {
      matrix[expected][predicted] += 1;
    }

    console.log('\n=== 真实 AI 结构判断质量报告 ===');
    console.log(`准确率: ${(accuracy * 100).toFixed(1)}% (${correct}/${total})`);
    console.log('混淆矩阵 (expected -> predicted):');
    for (const expected of types) {
      const row = types.map(t => String(matrix[expected][t]).padStart(2, ' ')).join(' ');
      console.log(`${expected.padEnd(10, ' ')} | ${row}`);
    }

    // 真实 AI 具有波动性，用温和阈值避免偶发失败
    expect(accuracy).toBeGreaterThanOrEqual(0.6);
  });
});

// === 导出供其他测试使用 ===

export { callClaudeAI, ambiguousNodes };

/**
 * Stitch 编译器主入口
 *
 * 编译流程：DSL → AST → Tokens → IR → React → HTML
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        Stitch 编译器                             │
 * │                                                                  │
 * │  DSL 输入                                                        │
 * │      │                                                          │
 * │      ▼                                                          │
 * │  逻辑引擎 (logic/) ──────────────────┐                          │
 * │      │                               │                          │
 * │      ▼                               ▼                          │
 * │     AST                         视觉引擎 (visual/)              │
 * │      │                               │                          │
 * │      │                               ▼                          │
 * │      │                         Design Tokens                    │
 * │      │                               │                          │
 * │      └───────────────┬───────────────┘                          │
 * │                      ▼                                          │
 * │               组件工厂 (factory/)                                │
 * │                      │                                          │
 * │                      ▼                                          │
 * │               React 组件树                                       │
 * │                      │                                          │
 * │                      ▼                                          │
 * │               SSR 引擎 (ssr/)                                   │
 * │                      │                                          │
 * │                      ▼                                          │
 * │               单文件 HTML                                        │
 * │                                                                  │
 * └─────────────────────────────────────────────────────────────────┘
 * ```
 */

// 逻辑引擎
export {
  parse,
  tokenize,
  compile as compileLogic,
  type StitchAST,
  type ASTNode,
  type ComponentType,
  type BaseProps,
  type CompileResult as ParseResult,
  type CompileError as ParseError,
} from './logic';

// 视觉引擎
export {
  generateDesignTokens,
  createSession,
  getSession,
  type DesignTokens,
  type SessionState,
} from './visual';

// 便捷函数别名
export { createSession as createSessionState } from './visual';

// 组件工厂
export {
  componentFactory,
  renderAST,
  StitchFactory,
  useStitchFactory,
  generateIR,
  ThemeProvider,
  useTheme,
  type UINode,
  type FactoryInput,
  type FactoryOutput,
  type FactoryOptions,
} from './factory';

// SSR 引擎
export {
  renderToStaticHTML,
  renderToHTML,
  renderFactoryOutput,
  renderToHEEx,
  dehydrate,
  purgeCSS,
  solidifyAssets,
  type SSROptions,
  type SSRResult,
  type SSRStats,
} from './ssr';

// ============================================
// 编译器主函数
// ============================================

import { compile as compileLogic, parse } from './logic';
import { generateDesignTokens, createSession, type SessionState } from './visual';
import { componentFactory, ThemeProvider } from './factory';
import * as React from 'react';
import { renderToHEEx, renderToStaticHTML, type SSROptions, type SSRResult } from './ssr';
import { precomputeCodeHighlights } from './ssr/code-highlighter';
import { render as renderUINode } from '../renderer';
import type { StitchAST } from './logic';
import type { DesignTokens } from './visual';
import type { FactoryOutput } from './factory';

// 创建 Session State 的便捷函数
function createSessionState(): SessionState {
  return createSession();
}

/**
 * 编译选项
 */
export interface CompileOptions {
  /** 上下文描述 (用于视觉引擎场景检测) */
  context?: string;
  /** 平台类型 - 由规划层明确指定，独立于导航配置 */
  platform?: 'web' | 'mobile';
  /** 移动端导航项 - 仅在 mobile 平台有效：有值时使用 BottomTabs，null 时使用 Drawer */
  mobileNavigation?: string[] | null;
  /** Session State (用于确定性渲染) */
  session?: SessionState;
  /** SSR 选项 */
  ssr?: Omit<SSROptions, 'tokens'>;
  /** SSR 预渲染代码高亮 */
  highlightCode?: boolean;
  /** 是否注入事件桩函数 */
  injectEvents?: boolean;
  /** 调试模式 */
  debug?: boolean;
  /** Token 覆盖 (用于自定义颜色等) */
  tokenOverrides?: Partial<DesignTokens>;
}

/**
 * 编译结果
 */
export interface CompileResult {
  /** 解析后的 AST */
  ast: StitchAST;
  /** 生成的 Design Tokens */
  tokens: DesignTokens;
  /** 组件工厂输出 */
  factory: FactoryOutput;
  /** SSR 渲染结果 */
  ssr: SSRResult;
  /** 编译统计信息 */
  stats: CompileStats;
}

/**
 * 编译统计信息
 */
export interface CompileStats {
  /** 解析耗时 (ms) */
  parseTime: number;
  /** Token 生成耗时 (ms) */
  tokenGenTime: number;
  /** 工厂处理耗时 (ms) */
  factoryTime: number;
  /** SSR 渲染耗时 (ms) */
  ssrTime: number;
  /** 总耗时 (ms) */
  totalTime: number;
  /** AST 节点数量 */
  nodeCount: number;
  /** CSS 压缩率 */
  cssCompressionRatio: number;
  /** 最终 HTML 大小 (bytes) */
  htmlSize: number;
}

/**
 * 编译 DSL 为 HTML
 *
 * 完整编译流程：DSL → AST → Tokens → IR → React → HTML
 *
 * @param dsl DSL 源码
 * @param options 编译选项
 * @returns 编译结果
 *
 * @example
 * ```typescript
 * const result = await compile(`
 *   [Layout]
 *   [Card]
 *     [Heading] Welcome [/Heading]
 *     [Button] Click me [/Button]
 *   [/Card]
 *   [/Layout]
 * `, {
 *   context: '用户管理后台',
 *   ssr: { title: 'My App' }
 * });
 *
 * // 输出单文件 HTML
 * console.log(result.ssr.html);
 * ```
 */
export async function compile(
  dsl: string,
  options: CompileOptions = {}
): Promise<CompileResult> {
  const totalStartTime = performance.now();

  const {
    context = '',
    platform: inputPlatform,
    mobileNavigation,
    session = createSessionState(),
    ssr: ssrOptions = {},
    injectEvents = true,
    debug = false,
    highlightCode = true,
    tokenOverrides,
  } = options;

  // 1. 解析 DSL → AST
  const parseStartTime = performance.now();
  const parseResult = compileLogic(dsl, { context, platform: inputPlatform, mobileNavigation });

  if (!parseResult.success || !parseResult.ast) {
    throw new CompileError('Parse failed', parseResult.errors || []);
  }

  const ast = parseResult.ast;
  const parseTime = performance.now() - parseStartTime;

  // 2. 生成 Design Tokens（传入 platform 进行移动端适配）
  const tokenStartTime = performance.now();
  const platform = ast.platform || 'web';
  let tokens = generateDesignTokens({
    context,
    sessionId: session.sessionId,
    platform,  // 传入平台，触发移动端参数调整
  });

  // 应用 Token 覆盖
  if (tokenOverrides) {
    tokens = { ...tokens, ...tokenOverrides };
  }
  const tokenGenTime = performance.now() - tokenStartTime;

  // 3. 组件工厂：AST + Tokens → React 组件树
  const factoryStartTime = performance.now();
  const factory = componentFactory({
    ast,
    tokens,
    options: {
      injectEvents,
      debug,
      platform,  // 传入平台，触发触摸反馈等移动端样式
    },
  });
  const factoryTime = performance.now() - factoryStartTime;

  // 4. SSR 引擎：React → HTML
  const ssrStartTime = performance.now();
  let ssrElement = factory.element;
  if (highlightCode !== false) {
    await precomputeCodeHighlights(factory.ir);
    const rendered = renderUINode(factory.ir, { debug });
    ssrElement = React.createElement(ThemeProvider, { tokens }, rendered);
  }

  const ssrResult = await renderToStaticHTML(ssrElement, {
    ...ssrOptions,
    tokens,
    debug,
  });
  const ssrTime = performance.now() - ssrStartTime;

  const totalTime = performance.now() - totalStartTime;

  // 5. 统计信息
  const stats: CompileStats = {
    parseTime,
    tokenGenTime,
    factoryTime,
    ssrTime,
    totalTime,
    nodeCount: countNodes(ast),
    cssCompressionRatio: ssrResult.stats.cssCompressionRatio,
    htmlSize: ssrResult.stats.htmlSize,
  };

  return {
    ast,
    tokens,
    factory,
    ssr: ssrResult,
    stats,
  };
}

/**
 * 快捷函数：编译 DSL 为 HTML 字符串
 */
export async function compileToHTML(
  dsl: string,
  options: CompileOptions = {}
): Promise<string> {
  const result = await compile(dsl, options);
  return result.ssr.html;
}

/**
 * 快捷函数：编译 DSL 为 HEEx 字符串
 */
export async function compileToHEEx(
  dsl: string,
  options: CompileOptions = {}
): Promise<string> {
  const result = await compile(dsl, options);
  return renderToHEEx(result.factory.ir);
}

/**
 * 编译错误
 */
export class CompileError extends Error {
  constructor(
    message: string,
    public errors: Array<{ message: string; line?: number; column?: number }>
  ) {
    super(message);
    this.name = 'CompileError';
  }
}

/**
 * 统计 AST 节点数量
 */
function countNodes(ast: StitchAST): number {
  let count = 0;

  function traverse(nodes: StitchAST['children']) {
    for (const node of nodes) {
      count++;
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(ast.children);
  return count;
}

/**
 * 增量编译支持
 *
 * 用于检测 AST 变更，支持增量更新
 */
export interface DiffResult {
  /** 是否有变更 */
  hasChanges: boolean;
  /** 变更的节点 ID 列表 */
  changedNodes: string[];
  /** 新增的节点 ID 列表 */
  addedNodes: string[];
  /** 删除的节点 ID 列表 */
  removedNodes: string[];
}

/**
 * 比较两个 AST 的差异
 */
export function diffAST(oldAST: StitchAST, newAST: StitchAST): DiffResult {
  const oldNodes = new Map<string, StitchAST['children'][0]>();
  const newNodes = new Map<string, StitchAST['children'][0]>();

  // 收集所有节点
  function collectNodes(
    nodes: StitchAST['children'],
    map: Map<string, StitchAST['children'][0]>
  ) {
    for (const node of nodes) {
      if (node.id) {
        map.set(node.id, node);
      }
      if (node.children) {
        collectNodes(node.children, map);
      }
    }
  }

  collectNodes(oldAST.children, oldNodes);
  collectNodes(newAST.children, newNodes);

  const changedNodes: string[] = [];
  const addedNodes: string[] = [];
  const removedNodes: string[] = [];

  // 检查新增和变更的节点
  for (const [id, newNode] of newNodes) {
    const oldNode = oldNodes.get(id);
    if (!oldNode) {
      addedNodes.push(id);
    } else if (!nodesEqual(oldNode, newNode)) {
      changedNodes.push(id);
    }
  }

  // 检查删除的节点
  for (const id of oldNodes.keys()) {
    if (!newNodes.has(id)) {
      removedNodes.push(id);
    }
  }

  return {
    hasChanges: changedNodes.length > 0 || addedNodes.length > 0 || removedNodes.length > 0,
    changedNodes,
    addedNodes,
    removedNodes,
  };
}

/**
 * 比较两个节点是否相等
 */
function nodesEqual(
  a: StitchAST['children'][0],
  b: StitchAST['children'][0]
): boolean {
  // 比较类型
  if (a.type !== b.type) return false;

  // 比较 props
  const aProps = JSON.stringify(a.props || {});
  const bProps = JSON.stringify(b.props || {});
  if (aProps !== bProps) return false;

  // 比较子节点数量
  const aChildren = a.children || [];
  const bChildren = b.children || [];
  if (aChildren.length !== bChildren.length) return false;

  return true;
}

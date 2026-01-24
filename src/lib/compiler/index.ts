/**
 * Stitch UI 编译器 - 统一入口
 *
 * DSL → AST → Design Tokens → React 组件树
 */

// 逻辑综合层
export { compileDSL } from "./frontend";
export type { ASTNode, CompileResult } from "./frontend";

// 视觉引擎层
export { synthesizeDesignTokens, tokensToCSSVariables } from "./middle";
export type { DesignTokens, SynthesizerInput } from "./middle";

// 组件工厂层
export {
  createComponentTree,
  StitchRenderer,
  ThemeProvider,
  useTheme,
} from "./factory";
export type { ComponentFactoryInput, FactoryContext } from "./factory";

// ============================================
// 一站式编译函数
// ============================================

import { compileDSL as compile } from "./frontend";
import { synthesizeDesignTokens } from "./middle";
import { createComponentTree } from "./factory";
import type { DesignTokens } from "./middle";

export interface StitchCompileInput {
  dsl: string;
  context: string;
  sessionId?: string;
  onInteraction?: (nodeId: string, event: string, data?: any) => void;
}

export interface StitchCompileOutput {
  ast: ReturnType<typeof compile>;
  tokens: DesignTokens;
  tree: React.ReactNode;
}

/**
 * 一站式编译：DSL → React 组件树
 *
 * @example
 * ```tsx
 * const { tree } = compileStitch({
 *   dsl: '[SECTION: main] [CARD: demo] ATTR: Title("Hello")',
 *   context: '技术架构',
 * });
 *
 * // 渲染
 * return <div>{tree}</div>;
 * ```
 */
export function compileStitch(input: StitchCompileInput): StitchCompileOutput {
  const { dsl, context, sessionId, onInteraction } = input;

  // 1. 逻辑综合：DSL → AST
  const ast = compile(dsl);

  // 2. 视觉引擎：context → Design Tokens
  const tokens = synthesizeDesignTokens({ context, sessionId });

  // 3. 组件工厂：AST + Tokens → React 树
  const tree = createComponentTree({ ast, tokens, onInteraction });

  return { ast, tokens, tree };
}

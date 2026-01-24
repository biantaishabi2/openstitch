/**
 * 逻辑引擎入口
 *
 * 提供 DSL → AST 的完整编译流程
 * 流程：DSL 文本 → Token 流 → CST → AST
 */

// 导出所有类型
export type {
  CSTNode,
  CSTAttr,
  ASTNode,
  StitchAST,
  ComponentType,
  BaseProps,
  CompileError,
  CompileResult,
  ErrorLevel,
} from './ast';

export {
  PROP_KEY_MAP,
  PROP_VALUE_MAP,
  DEFAULT_PROPS,
  TAG_TO_TYPE,
} from './ast';

// 导出 Lexer
export {
  tokenize,
  extractTagName,
  extractStringValue,
  printTokens,
  StitchLexer,
  allTokens,
} from './lexer';

// 导出 Parser
export { parse, printCST } from './parser';

// 导出 Semantic
export {
  transformToAST,
  printAST,
  CompileOptionsSchema,
  type CompileOptions,
} from './semantic';

// ============================================
// 统一编译入口
// ============================================

import { tokenize } from './lexer';
import { parse } from './parser';
import { transformToAST, type CompileOptions } from './semantic';
import type { StitchAST, CompileResult, CompileError } from './ast';

/**
 * 编译 DSL 文本为 AST
 *
 * @param input DSL 文本
 * @param options 编译选项
 * @returns 编译结果
 *
 * @example
 * ```typescript
 * const result = compile(`
 *   [SECTION: Execution_Flow]
 *     { Gutter: "32px", Align: "Center" }
 *     [CARD: node_opencode]
 *       ATTR: Title("OpenCode 接口调用"), Icon("Terminal")
 *       CONTENT: "执行层通过 handle_opencode_call/7 订阅 SSE 事件"
 * `, { context: "技术架构" });
 *
 * if (result.success) {
 *   console.log(result.ast);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function compile(
  input: string,
  options: CompileOptions = {}
): CompileResult {
  const allErrors: CompileError[] = [];

  // Step 1: 词法分析
  const { tokens, errors: lexErrors } = tokenize(input);
  if (lexErrors.length > 0) {
    return {
      success: false,
      errors: lexErrors.map(e => ({
        level: 'error' as const,
        message: e.message,
        line: e.line,
        column: e.column,
      })),
      warnings: [],
    };
  }

  // Step 2: 语法分析
  const { cst, errors: parseErrors } = parse(input);
  if (parseErrors.length > 0) {
    return {
      success: false,
      errors: parseErrors.map(e => ({
        level: 'error' as const,
        message: e.message,
        line: e.line,
        column: e.column,
      })),
      warnings: [],
    };
  }

  // Step 3: 语义收敛
  const { ast, errors: semanticErrors } = transformToAST(cst, options);

  // 分离错误和警告
  const errors = semanticErrors.filter(e => e.level === 'error');
  const warnings = semanticErrors.filter(e => e.level === 'warning' || e.level === 'info');

  return {
    success: errors.length === 0,
    ast,
    errors,
    warnings,
  };
}

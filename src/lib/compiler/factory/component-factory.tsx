/**
 * 组件工厂
 *
 * 将 AST + Design Tokens 组装成可渲染的 React 组件树
 */

'use client';

import * as React from 'react';
import { render as renderUINode } from '../../renderer';
import type { StitchAST } from '../logic/ast';
import type { DesignTokens } from '../visual/types';
import type { UINode, FactoryOptions, FactoryInput } from './types';
import { generateIR } from './ir-generator';
import { ThemeProvider } from './theme-provider';

/**
 * 组件工厂输出
 */
export interface FactoryOutput {
  /** 可渲染的 React 节点 */
  element: React.ReactNode;
  /** 生成的 IR (UINode) */
  ir: UINode;
}

/**
 * 组件工厂
 *
 * 将 AST + Design Tokens 组装成 React 组件树
 *
 * @param input 工厂输入 (ast, tokens, options)
 * @returns 工厂输出 (element, ir)
 *
 * @example
 * ```typescript
 * const { element, ir } = componentFactory({
 *   ast: compileResult.ast,
 *   tokens: designTokens,
 *   options: { debug: true }
 * });
 *
 * // 在 React 中渲染
 * return <div>{element}</div>;
 * ```
 */
export function componentFactory(input: FactoryInput): FactoryOutput {
  const { ast, tokens, options = {} } = input;

  // 1. 生成 IR (UINode)
  const ir = generateIR(ast, tokens, options);

  // 2. 使用渲染器将 IR 转换为 React 组件
  const renderedContent = renderUINode(ir, {
    debug: options.debug,
  });

  // 3. 用 ThemeProvider 包裹
  const element = (
    <ThemeProvider tokens={tokens}>
      {renderedContent}
    </ThemeProvider>
  );

  return { element, ir };
}

/**
 * 快捷函数：直接渲染 AST + Tokens
 *
 * @param ast Stitch AST
 * @param tokens Design Tokens
 * @param options 可选配置
 * @returns React 节点
 */
export function renderAST(
  ast: StitchAST,
  tokens: DesignTokens,
  options: FactoryOptions = {}
): React.ReactNode {
  const { element } = componentFactory({ ast, tokens, options });
  return element;
}

/**
 * StitchFactory 组件
 *
 * 声明式组件，用于在 JSX 中直接渲染 AST
 *
 * @example
 * ```tsx
 * <StitchFactory ast={ast} tokens={tokens} />
 * ```
 */
export interface StitchFactoryProps {
  /** AST */
  ast: StitchAST;
  /** Design Tokens */
  tokens: DesignTokens;
  /** 可选配置 */
  options?: FactoryOptions;
  /** 额外的 className */
  className?: string;
}

export function StitchFactory({
  ast,
  tokens,
  options = {},
  className,
}: StitchFactoryProps): React.ReactElement {
  // 生成 IR
  const ir = React.useMemo(
    () => generateIR(ast, tokens, options),
    [ast, tokens, options]
  );

  // 渲染
  const content = React.useMemo(
    () => renderUINode(ir, { debug: options.debug }),
    [ir, options.debug]
  );

  return (
    <ThemeProvider tokens={tokens} className={className}>
      {content}
    </ThemeProvider>
  );
}

/**
 * useStitchFactory Hook
 *
 * 在函数组件中使用组件工厂
 *
 * @param ast Stitch AST
 * @param tokens Design Tokens
 * @param options 可选配置
 * @returns { element, ir }
 */
export function useStitchFactory(
  ast: StitchAST | null,
  tokens: DesignTokens | null,
  options: FactoryOptions = {}
): { element: React.ReactNode | null; ir: UINode | null } {
  const result = React.useMemo(() => {
    if (!ast || !tokens) {
      return { element: null, ir: null };
    }

    return componentFactory({ ast, tokens, options });
  }, [ast, tokens, options]);

  return result;
}

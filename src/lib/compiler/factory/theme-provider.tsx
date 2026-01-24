/**
 * Theme Provider
 *
 * 将 Design Tokens 注入到组件树，使深层组件可以获取主题变量
 */

'use client';

import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { DesignTokens } from '../visual/types';

/**
 * Theme Context
 */
const ThemeContext = createContext<DesignTokens | null>(null);

/**
 * ThemeProvider Props
 */
export interface ThemeProviderProps {
  /** Design Tokens */
  tokens: DesignTokens;
  /** 子节点 */
  children: React.ReactNode;
  /** 可选的额外 className */
  className?: string;
}

/**
 * ThemeProvider 组件
 *
 * 将 Design Tokens 作为 CSS 变量注入到包裹元素，
 * 并通过 Context 提供给深层组件
 */
export function ThemeProvider({
  tokens,
  children,
  className,
}: ThemeProviderProps): React.ReactElement {
  // 将 tokens 转换为 CSS 变量样式对象
  const style = useMemo(() => {
    const vars: Record<string, string> = {};

    for (const [key, value] of Object.entries(tokens)) {
      // 只处理 CSS 变量（以 -- 开头的 key）
      if (key.startsWith('--') && typeof value === 'string') {
        vars[key] = value;
      }
    }

    return vars as React.CSSProperties;
  }, [tokens]);

  return (
    <ThemeContext.Provider value={tokens}>
      <div style={style} className={className}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 *
 * 获取当前主题的 Design Tokens
 *
 * @throws 如果在 ThemeProvider 外部使用会抛出错误
 */
export function useTheme(): DesignTokens {
  const tokens = useContext(ThemeContext);

  if (!tokens) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return tokens;
}

/**
 * useThemeToken Hook
 *
 * 获取单个 token 的值
 *
 * @param tokenKey token 名称，如 '--primary-color'
 * @returns token 值，如果不存在返回 undefined
 */
export function useThemeToken(tokenKey: string): string | undefined {
  const tokens = useTheme();
  return tokens[tokenKey as keyof DesignTokens] as string | undefined;
}

/**
 * useThemeTokens Hook
 *
 * 获取多个 token 的值
 *
 * @param tokenKeys token 名称数组
 * @returns token 值对象
 */
export function useThemeTokens(
  tokenKeys: string[]
): Record<string, string | undefined> {
  const tokens = useTheme();
  const result: Record<string, string | undefined> = {};

  for (const key of tokenKeys) {
    result[key] = tokens[key as keyof DesignTokens] as string | undefined;
  }

  return result;
}

/**
 * withTheme HOC
 *
 * 高阶组件，自动注入 tokens prop
 */
export function withTheme<P extends { tokens?: DesignTokens }>(
  WrappedComponent: React.ComponentType<P>
): React.FC<Omit<P, 'tokens'>> {
  const WithTheme: React.FC<Omit<P, 'tokens'>> = (props) => {
    const tokens = useTheme();
    return <WrappedComponent {...(props as P)} tokens={tokens} />;
  };

  WithTheme.displayName = `withTheme(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithTheme;
}

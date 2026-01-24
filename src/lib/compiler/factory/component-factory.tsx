/**
 * Stitch 组件工厂
 *
 * 职责：AST + Design Tokens → React 组件树
 * 四大核心功能：Props归一化 / 插槽分发 / 事件桩函数 / Context注入
 */

import * as React from 'react';
import type { DesignTokens } from '../middle/synthesizer';

// ============================================
// 类型定义
// ============================================

export interface ASTNode {
  id: string;
  type: string;
  props: Record<string, string>;
  children?: ASTNode[];
}

export interface FactoryContext {
  tokens: DesignTokens;
  onInteraction?: (nodeId: string, event: string, data?: any) => void;
}

// ============================================
// Theme Context
// ============================================

const ThemeContext = React.createContext<DesignTokens | null>(null);

export function useTheme(): DesignTokens {
  const tokens = React.useContext(ThemeContext);
  if (!tokens) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return tokens;
}

export function ThemeProvider({
  tokens,
  children,
}: {
  tokens: DesignTokens;
  children: React.ReactNode;
}) {
  // 将 tokens 转换为 CSS 变量
  const style = React.useMemo(() => {
    return {
      '--color-primary': tokens.colors.primary,
      '--color-primary-light': tokens.colors.primaryLight,
      '--color-primary-dark': tokens.colors.primaryDark,
      '--color-secondary': tokens.colors.secondary,
      '--color-background': tokens.colors.background,
      '--color-surface': tokens.colors.surface,
      '--color-text': tokens.colors.text,
      '--color-text-muted': tokens.colors.textMuted,
      '--color-border': tokens.colors.border,
      '--spacing-xs': tokens.spacing.xs,
      '--spacing-sm': tokens.spacing.sm,
      '--spacing-md': tokens.spacing.md,
      '--spacing-lg': tokens.spacing.lg,
      '--spacing-xl': tokens.spacing.xl,
      '--radius-sm': tokens.shape.radiusSm,
      '--radius-md': tokens.shape.radiusMd,
      '--radius-lg': tokens.shape.radiusLg,
      '--shadow-sm': tokens.shape.shadowSm,
      '--shadow-md': tokens.shape.shadowMd,
      '--shadow-lg': tokens.shape.shadowLg,
      '--font-size-sm': tokens.typography.sizeSm,
      '--font-size-base': tokens.typography.sizeBase,
      '--font-size-lg': tokens.typography.sizeLg,
      '--font-size-xl': tokens.typography.sizeXl,
    } as React.CSSProperties;
  }, [tokens]);

  return (
    <ThemeContext.Provider value={tokens}>
      <div style={style} className="stitch-root">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// ============================================
// Props 归一化
// ============================================

function normalizeProps(
  astProps: Record<string, string>,
  tokens: DesignTokens
): { className: string; style: React.CSSProperties; rest: Record<string, any> } {
  const classNames: string[] = [];
  const style: React.CSSProperties = {};
  const rest: Record<string, any> = {};

  for (const [key, value] of Object.entries(astProps)) {
    switch (key) {
      case 'size':
        if (value === 'small') {
          classNames.push('text-sm', 'p-2');
          style.fontSize = tokens.typography.sizeSm;
        } else if (value === 'large') {
          classNames.push('text-lg', 'p-4');
          style.fontSize = tokens.typography.sizeLg;
        } else {
          classNames.push('text-base', 'p-3');
          style.fontSize = tokens.typography.sizeBase;
        }
        break;

      case 'variant':
        if (value === 'outline') {
          classNames.push('border', 'border-current', 'bg-transparent');
        } else if (value === 'ghost') {
          classNames.push('bg-transparent', 'hover:bg-gray-100');
        } else {
          // primary
          style.backgroundColor = tokens.colors.primary;
          style.color = '#ffffff';
        }
        break;

      case 'align':
        if (value === 'center') {
          classNames.push('flex', 'justify-center', 'items-center');
        } else if (value === 'right') {
          classNames.push('flex', 'justify-end');
        }
        break;

      case 'gutter':
        style.gap = value;
        break;

      case 'content':
        rest.content = value;
        break;

      default:
        rest[key] = value;
    }
  }

  return {
    className: classNames.join(' '),
    style,
    rest,
  };
}

// ============================================
// 事件桩函数生成
// ============================================

function createEventStub(
  nodeId: string,
  eventName: string,
  onInteraction?: FactoryContext['onInteraction']
) {
  return (e?: React.SyntheticEvent) => {
    console.log(`[Stitch] Event: ${eventName} on ${nodeId}`);
    onInteraction?.(nodeId, eventName, { timestamp: Date.now() });
  };
}

// ============================================
// 基础组件库（可替换为 shadcn/ui）
// ============================================

function StitchSection({
  id,
  className,
  style,
  children,
}: {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const tokens = useTheme();
  return (
    <section
      id={id}
      className={`stitch-section ${className || ''}`}
      style={{
        padding: tokens.spacing.paddingSection,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function StitchCard({
  id,
  title,
  icon,
  className,
  style,
  children,
}: {
  id: string;
  title?: string;
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const tokens = useTheme();
  return (
    <div
      id={id}
      className={`stitch-card ${className || ''}`}
      style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.shape.radiusMd,
        boxShadow: tokens.shape.shadowMd,
        padding: tokens.spacing.paddingCard,
        ...style,
      }}
    >
      {title && (
        <div className="stitch-card-header" style={{ marginBottom: tokens.spacing.sm }}>
          {icon && <span className="stitch-card-icon">{icon}</span>}
          <h3 style={{ fontSize: tokens.typography.sizeLg, fontWeight: 600 }}>{title}</h3>
        </div>
      )}
      <div className="stitch-card-body">{children}</div>
    </div>
  );
}

function StitchButton({
  id,
  text,
  variant = 'primary',
  size = 'md',
  onClick,
  className,
  style,
}: {
  id: string;
  text?: string;
  variant?: string;
  size?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const tokens = useTheme();

  const baseStyle: React.CSSProperties = {
    borderRadius: tokens.shape.radiusMd,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: { padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`, fontSize: tokens.typography.sizeSm },
    md: { padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, fontSize: tokens.typography.sizeBase },
    large: { padding: `${tokens.spacing.md} ${tokens.spacing.lg}`, fontSize: tokens.typography.sizeLg },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: tokens.colors.primary,
      color: '#ffffff',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: tokens.colors.primary,
      border: `1px solid ${tokens.colors.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: tokens.colors.text,
      border: 'none',
    },
  };

  return (
    <button
      id={id}
      className={`stitch-button ${className || ''}`}
      style={{
        ...baseStyle,
        ...sizeStyles[size] || sizeStyles.md,
        ...variantStyles[variant] || variantStyles.primary,
        ...style,
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

function StitchText({
  id,
  content,
  className,
  style,
}: {
  id?: string;
  content?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const tokens = useTheme();
  return (
    <p
      id={id}
      className={`stitch-text ${className || ''}`}
      style={{
        color: tokens.colors.text,
        lineHeight: tokens.spacing.lineHeightBody,
        ...style,
      }}
    >
      {content}
    </p>
  );
}

// ============================================
// 组件注册表
// ============================================

type ComponentRenderer = (props: {
  node: ASTNode;
  tokens: DesignTokens;
  onInteraction?: FactoryContext['onInteraction'];
  children?: React.ReactNode;
}) => React.ReactNode;

const ComponentRegistry: Record<string, ComponentRenderer> = {
  Section: ({ node, tokens, children }) => (
    <StitchSection
      id={node.id}
      className={normalizeProps(node.props, tokens).className}
      style={normalizeProps(node.props, tokens).style}
    >
      {children}
    </StitchSection>
  ),

  Card: ({ node, tokens, children }) => {
    const { rest } = normalizeProps(node.props, tokens);
    return (
      <StitchCard
        id={node.id}
        title={rest.title}
        icon={rest.icon}
        className={normalizeProps(node.props, tokens).className}
        style={normalizeProps(node.props, tokens).style}
      >
        {children}
      </StitchCard>
    );
  },

  Button: ({ node, tokens, onInteraction }) => {
    const { rest } = normalizeProps(node.props, tokens);
    return (
      <StitchButton
        id={node.id}
        text={rest.text || node.props.content}
        variant={node.props.variant}
        size={node.props.size}
        onClick={createEventStub(node.id, 'click', onInteraction)}
      />
    );
  },

  Text: ({ node, tokens }) => {
    const { rest } = normalizeProps(node.props, tokens);
    return (
      <StitchText
        id={node.id}
        content={rest.content}
        style={normalizeProps(node.props, tokens).style}
      />
    );
  },

  // 默认：渲染为 div
  Default: ({ node, tokens, children }) => (
    <div
      id={node.id}
      className={`stitch-${node.type.toLowerCase()}`}
      style={normalizeProps(node.props, tokens).style}
    >
      {children}
    </div>
  ),
};

// ============================================
// 核心：递归渲染 AST
// ============================================

function renderNode(
  node: ASTNode,
  context: FactoryContext
): React.ReactNode {
  const { tokens, onInteraction } = context;

  // 递归渲染子节点
  const children = node.children?.map((child) => renderNode(child, context));

  // 查找组件渲染器
  const Renderer = ComponentRegistry[node.type] || ComponentRegistry.Default;

  return (
    <React.Fragment key={node.id}>
      {Renderer({ node, tokens, onInteraction, children })}
    </React.Fragment>
  );
}

// ============================================
// 主入口：AST → React 组件树
// ============================================

export interface ComponentFactoryInput {
  ast: { type: string; children: ASTNode[] };
  tokens: DesignTokens;
  onInteraction?: (nodeId: string, event: string, data?: any) => void;
}

/**
 * 将 AST 转换为 React 组件树
 */
export function createComponentTree(input: ComponentFactoryInput): React.ReactNode {
  const { ast, tokens, onInteraction } = input;
  const context: FactoryContext = { tokens, onInteraction };

  return (
    <ThemeProvider tokens={tokens}>
      {ast.children.map((node) => renderNode(node, context))}
    </ThemeProvider>
  );
}

/**
 * StitchRenderer 组件
 */
export function StitchRenderer({
  ast,
  tokens,
  onInteraction,
}: ComponentFactoryInput) {
  return <>{createComponentTree({ ast, tokens, onInteraction })}</>;
}

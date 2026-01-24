/**
 * 词法分析器 (Lexer)
 *
 * 使用 Chevrotain 解析 Stitch DSL 的 Token 流
 * 支持的语法：
 * - [TAG: id] 或 [TAG: "text"] - 标签定义
 * - { Key: "value", ... } - 布局属性
 * - ATTR: Key("value"), ... - 组件属性
 * - CONTENT: "text" - 内容定义
 */

import { createToken, Lexer, ITokenConfig } from 'chevrotain';

// ============================================
// Token 定义
// ============================================

// 空白字符（跳过）
export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED,
});

// 换行符（用于缩进解析）
export const NewLine = createToken({
  name: 'NewLine',
  pattern: /\r?\n/,
});

// 缩进（空格，用于层级判断）
export const Indent = createToken({
  name: 'Indent',
  pattern: /^[ \t]+/,
  line_breaks: false,
});

// ============================================
// 标签 Token
// ============================================

// 通用标签模式: [TAG
export const TagOpen = createToken({
  name: 'TagOpen',
  pattern: /\[([A-Z][A-Z_]*)/,
});

// 标签关闭: ]
export const TagClose = createToken({
  name: 'TagClose',
  pattern: /\]/,
});

// ============================================
// 关键字 Token
// ============================================

// ATTR 关键字
export const AttrKeyword = createToken({
  name: 'AttrKeyword',
  pattern: /ATTR/,
});

// CONTENT 关键字
export const ContentKeyword = createToken({
  name: 'ContentKeyword',
  pattern: /CONTENT/,
});

// ============================================
// 符号 Token
// ============================================

// 冒号
export const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
});

// 逗号
export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
});

// 左大括号
export const LBrace = createToken({
  name: 'LBrace',
  pattern: /\{/,
});

// 右大括号
export const RBrace = createToken({
  name: 'RBrace',
  pattern: /\}/,
});

// 左小括号
export const LParen = createToken({
  name: 'LParen',
  pattern: /\(/,
});

// 右小括号
export const RParen = createToken({
  name: 'RParen',
  pattern: /\)/,
});

// ============================================
// 值 Token
// ============================================

// 字符串（双引号）
export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"(?:[^"\\]|\\.)*"/,
});

// 标识符（变量名、属性名）
export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

// 数字
export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?/,
});

// ============================================
// Token 列表（顺序很重要！）
// ============================================

// 注意：Token 的顺序决定了匹配优先级
// 更具体的 Token 应该放在前面
export const allTokens = [
  // 空白和换行
  WhiteSpace,
  NewLine,

  // 关键字（必须在 Identifier 之前）
  AttrKeyword,
  ContentKeyword,

  // 标签
  TagOpen,
  TagClose,

  // 符号
  Colon,
  Comma,
  LBrace,
  RBrace,
  LParen,
  RParen,

  // 值
  StringLiteral,
  NumberLiteral,
  Identifier,
];

// ============================================
// Lexer 实例
// ============================================

export const StitchLexer = new Lexer(allTokens, {
  // 启用行追踪，用于错误报告
  positionTracking: 'full',
});

// ============================================
// 辅助函数
// ============================================

/**
 * 词法分析入口
 * @param input DSL 文本
 * @returns Token 流和错误信息
 */
export function tokenize(input: string) {
  const result = StitchLexer.tokenize(input);

  if (result.errors.length > 0) {
    console.error('Lexer errors:', result.errors);
  }

  return {
    tokens: result.tokens,
    errors: result.errors,
    groups: result.groups,
  };
}

/**
 * 从 TagOpen Token 中提取标签名
 * @param tokenImage Token 的原始文本，如 "[SECTION"
 * @returns 标签名，如 "SECTION"
 */
export function extractTagName(tokenImage: string): string {
  // 移除开头的 "["
  return tokenImage.slice(1);
}

/**
 * 从 StringLiteral Token 中提取字符串值
 * @param tokenImage Token 的原始文本，如 '"hello"'
 * @returns 字符串值，如 "hello"
 */
export function extractStringValue(tokenImage: string): string {
  // 移除首尾的引号，并处理转义字符
  return tokenImage
    .slice(1, -1)
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
}

/**
 * 打印 Token 流（调试用）
 */
export function printTokens(input: string): void {
  const { tokens, errors } = tokenize(input);

  console.log('=== Token Stream ===');
  tokens.forEach((token, index) => {
    console.log(
      `${index}: ${token.tokenType.name} = "${token.image}" (L${token.startLine}:${token.startColumn})`
    );
  });

  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    errors.forEach((error) => {
      console.log(`  ${error.message} at L${error.line}:${error.column}`);
    });
  }
}

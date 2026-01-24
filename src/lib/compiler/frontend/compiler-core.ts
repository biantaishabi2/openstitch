/**
 * Stitch 逻辑综合层 - 编译器核心
 *
 * 职责：DSL → Token流 → CST → AST
 * 技术栈：Chevrotain (词法/语法) + Zod (语义收敛)
 */

import { createToken, Lexer, CstParser } from "chevrotain";
import { z } from "zod";

// ============================================
// 1. 词法定义 (Lexer Tokens)
// ============================================

const LSquare = createToken({ name: "LSquare", pattern: /\[/ });
const RSquare = createToken({ name: "RSquare", pattern: /\]/ });
const LCurly = createToken({ name: "LCurly", pattern: /\{/ });
const RCurly = createToken({ name: "RCurly", pattern: /\}/ });
const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });
const Colon = createToken({ name: "Colon", pattern: /:/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });

// 关键字
const ATTR = createToken({ name: "ATTR", pattern: /ATTR/ });
const CONTENT = createToken({ name: "CONTENT", pattern: /CONTENT/ });

// 标识符和字符串
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z_]\w*/ });
const StringLiteral = createToken({ name: "StringLiteral", pattern: /"(?:[^"\\]|\\.)*"/ });

// 空白（跳过）
const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });

// Token 顺序很重要：关键字必须在 Identifier 之前
const allTokens = [
  WhiteSpace,
  LSquare, RSquare, LCurly, RCurly, LParen, RParen,
  Colon, Comma,
  ATTR, CONTENT,  // 关键字优先
  StringLiteral,
  Identifier
];

const StitchLexer = new Lexer(allTokens);

// ============================================
// 2. 语法解析器 (Parser: DSL -> CST)
// ============================================

class StitchParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  // 顶层规则：页面由多个元素组成
  public page = this.RULE("page", () => {
    this.MANY(() => this.SUBRULE(this.element));
  });

  // 元素规则: [TYPE: id] { props } ATTR: ... CONTENT: ... [children]
  private element = this.RULE("element", () => {
    // [TYPE: id] 或 [TYPE: "text"]
    this.CONSUME(LSquare);
    this.CONSUME(Identifier, { LABEL: "type" });
    this.OPTION(() => {
      this.CONSUME(Colon);
      this.OR([
        { ALT: () => this.CONSUME2(Identifier, { LABEL: "id" }) },
        { ALT: () => this.CONSUME(StringLiteral, { LABEL: "text" }) }
      ]);
    });
    this.CONSUME(RSquare);

    // 可选：{ key: "value", ... } 布局属性
    this.OPTION2(() => this.SUBRULE(this.layoutProps));

    // 可选：ATTR: Key("value"), ...
    this.OPTION3(() => this.SUBRULE(this.attrDecl));

    // 可选：CONTENT: "..."
    this.OPTION4(() => this.SUBRULE(this.contentDecl));

    // 递归：嵌套子元素
    this.MANY(() => this.SUBRULE2(this.element));
  });

  // 布局属性：{ Gutter: "32px", Align: "Center" }
  private layoutProps = this.RULE("layoutProps", () => {
    this.CONSUME(LCurly);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.CONSUME(Identifier, { LABEL: "key" });
        this.CONSUME(Colon);
        this.CONSUME(StringLiteral, { LABEL: "value" });
      }
    });
    this.CONSUME(RCurly);
  });

  // ATTR 声明：ATTR: Title("xxx"), Icon("yyy")
  private attrDecl = this.RULE("attrDecl", () => {
    this.CONSUME(ATTR);
    this.CONSUME(Colon);
    this.AT_LEAST_ONE_SEP({
      SEP: Comma,
      DEF: () => {
        this.CONSUME(Identifier, { LABEL: "attrKey" });
        this.CONSUME(LParen);
        this.CONSUME(StringLiteral, { LABEL: "attrValue" });
        this.CONSUME(RParen);
      }
    });
  });

  // CONTENT 声明：CONTENT: "..."
  private contentDecl = this.RULE("contentDecl", () => {
    this.CONSUME(CONTENT);
    this.CONSUME(Colon);
    this.CONSUME(StringLiteral, { LABEL: "contentValue" });
  });
}

const parser = new StitchParser();

// ============================================
// 3. 语义收敛与 AST 生成 (Zod Transform)
// ============================================

// AST 节点类型定义
interface ASTNode {
  id: string;
  type: string;
  props: Record<string, string>;
  children: ASTNode[];
}

// Zod Schema（递归定义）
// Zod v4: 使用 z.record(z.string(), z.string()) 代替 z.record(z.string())
const BaseASTSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.string()).default({}),
  children: z.array(z.lazy(() => ASTSchema)).default([])
});

const ASTSchema: z.ZodType<ASTNode> = BaseASTSchema;

// 属性键名归一化映射
const propKeyNormalize: Record<string, string> = {
  "Title": "title",
  "Icon": "icon",
  "Variant": "variant",
  "Size": "size",
  "Gutter": "gutter",
  "Align": "align",
  "Color": "color",
};

// 属性值归一化映射
const propValueNormalize: Record<string, Record<string, string>> = {
  variant: { "Outline": "outline", "Primary": "primary", "Ghost": "ghost" },
  size: { "Small": "small", "Medium": "md", "Large": "lg" },
  align: { "Center": "center", "Left": "left", "Right": "right" },
};

// 需要归一化值的键（枚举类型）
const enumKeys = new Set(['variant', 'size', 'align']);

// 去除字符串引号
function unquote(str: string): string {
  return str.replace(/^"|"$/g, '');
}

// 归一化属性键
function normalizeKey(key: string): string {
  return propKeyNormalize[key] || key.toLowerCase();
}

// 归一化属性值
function normalizeValue(key: string, value: string): string {
  const normalizedKey = normalizeKey(key);
  // 只有枚举类型的值才做小写化，其他保持原样（如 title, icon, content）
  if (enumKeys.has(normalizedKey)) {
    const valueMap = propValueNormalize[normalizedKey];
    return valueMap?.[value] || value.toLowerCase();
  }
  return value;  // 保持原样
}

// 类型名归一化：SECTION → Section, CARD → Card
function normalizeType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

/**
 * 将 CST 转换为标准化 AST
 *
 * 核心功能：
 * 1. ID 自动生成（基于 depth + index，保证确定性）
 * 2. Props 归一化（大写 → 小写，别名映射）
 * 3. 递归处理 children
 */
function transformCstToAst(cst: any, depth = 0, index = 0): ASTNode {
  const children = cst.children;

  // 提取类型并归一化：SECTION → Section
  const rawType = children.type?.[0]?.image || "Unknown";
  const type = normalizeType(rawType);

  // 核心：确定性 ID 生成
  // 格式：{type}_d{depth}_{index}，如 card_d0_1
  // 如果 DSL 显式指定了 ID，优先使用
  const explicitId = children.id?.[0]?.image;
  const textAsId = children.text?.[0]?.image;
  const id = explicitId || (textAsId ? unquote(textAsId) : `${rawType.toLowerCase()}_d${depth}_${index}`);

  // 收集 props
  const props: Record<string, string> = {};

  // 从 layoutProps 收集：{ Gutter: "32px" }
  if (children.layoutProps) {
    const layout = children.layoutProps[0].children;
    layout.key?.forEach((keyTok: any, idx: number) => {
      const key = keyTok.image;
      const value = unquote(layout.value[idx].image);
      props[normalizeKey(key)] = normalizeValue(key, value);
    });
  }

  // 从 attrDecl 收集：ATTR: Title("xxx")
  if (children.attrDecl) {
    const attrs = children.attrDecl[0].children;
    attrs.attrKey?.forEach((keyTok: any, idx: number) => {
      const key = keyTok.image;
      const value = unquote(attrs.attrValue[idx].image);
      props[normalizeKey(key)] = normalizeValue(key, value);
    });
  }

  // 从 contentDecl 收集：CONTENT: "..."
  if (children.contentDecl) {
    const content = children.contentDecl[0].children;
    props.content = unquote(content.contentValue[0].image);
  }

  // 递归处理子元素
  const childNodes = (children.element || []).map((childCst: any, idx: number) =>
    transformCstToAst(childCst, depth + 1, idx)
  );

  // Zod 校验并返回
  return ASTSchema.parse({
    id,
    type,
    props,
    children: childNodes
  });
}

// ============================================
// 4. 统一调用接口
// ============================================

export interface CompileResult {
  type: "Root";
  children: ASTNode[];
}

/**
 * 编译 DSL 文本为 AST
 *
 * @param text DSL 文本
 * @returns 标准化 AST
 * @throws Error 语法错误时抛出
 */
export function compileDSL(text: string): CompileResult {
  // Step 1: 词法分析
  const lexResult = StitchLexer.tokenize(text);

  if (lexResult.errors.length > 0) {
    const err = lexResult.errors[0];
    throw new Error(`Lexer Error at line ${err.line}, col ${err.column}: ${err.message}`);
  }

  // Step 2: 语法分析
  parser.input = lexResult.tokens;
  const cst = parser.page();

  if (parser.errors.length > 0) {
    const err = parser.errors[0];
    throw new Error(`Parser Error: ${err.message}`);
  }

  // Step 3: 语义收敛 → AST
  const rootChildren = (cst.children.element || []).map((el: any, idx: number) =>
    transformCstToAst(el, 0, idx)
  );

  return {
    type: "Root",
    children: rootChildren
  };
}

// 导出类型
export type { ASTNode };

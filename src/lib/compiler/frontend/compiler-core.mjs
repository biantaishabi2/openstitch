/**
 * Stitch 逻辑综合层 - 编译器核心 (ESM)
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

// 关键字（必须在 Identifier 之前）
const ATTR = createToken({ name: "ATTR", pattern: /ATTR/ });
const CONTENT = createToken({ name: "CONTENT", pattern: /CONTENT/ });

// 标识符和字符串
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z_]\w*/ });
const StringLiteral = createToken({ name: "StringLiteral", pattern: /"(?:[^"\\]|\\.)*"/ });

// 空白（跳过）
const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });

const allTokens = [
  WhiteSpace,
  LSquare, RSquare, LCurly, RCurly, LParen, RParen,
  Colon, Comma,
  ATTR, CONTENT,
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

  page = this.RULE("page", () => {
    this.MANY(() => this.SUBRULE(this.element));
  });

  element = this.RULE("element", () => {
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

    this.OPTION2(() => this.SUBRULE(this.layoutProps));
    this.OPTION3(() => this.SUBRULE(this.attrDecl));
    this.OPTION4(() => this.SUBRULE(this.contentDecl));
    this.MANY(() => this.SUBRULE2(this.element));
  });

  layoutProps = this.RULE("layoutProps", () => {
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

  attrDecl = this.RULE("attrDecl", () => {
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

  contentDecl = this.RULE("contentDecl", () => {
    this.CONSUME(CONTENT);
    this.CONSUME(Colon);
    this.CONSUME(StringLiteral, { LABEL: "contentValue" });
  });
}

const parser = new StitchParser();

// ============================================
// 3. 语义收敛 (Zod Transform)
// ============================================

// Zod v4: 使用 z.record(z.string(), z.string()) 代替 z.record(z.string())
const BaseASTSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.string()).default({}),
  children: z.array(z.lazy(() => ASTSchema)).default([])
});

const ASTSchema = BaseASTSchema;

const propKeyNormalize = {
  "Title": "title", "Icon": "icon", "Variant": "variant",
  "Size": "size", "Gutter": "gutter", "Align": "align", "Color": "color",
};

const propValueNormalize = {
  variant: { "Outline": "outline", "Primary": "primary", "Ghost": "ghost" },
  size: { "Small": "small", "Medium": "md", "Large": "lg" },
  align: { "Center": "center", "Left": "left", "Right": "right" },
};

function unquote(str) {
  return str.replace(/^"|"$/g, '');
}

function normalizeKey(key) {
  return propKeyNormalize[key] || key.toLowerCase();
}

// 需要归一化值的键（枚举类型）
const enumKeys = new Set(['variant', 'size', 'align']);

function normalizeValue(key, value) {
  const nKey = normalizeKey(key);
  // 只有枚举类型的值才做小写化，其他保持原样（如 title, icon, content）
  if (enumKeys.has(nKey)) {
    return propValueNormalize[nKey]?.[value] || value.toLowerCase();
  }
  return value;  // 保持原样
}

// 类型名归一化：SECTION → Section, CARD → Card
function normalizeType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function transformCstToAst(cst, depth = 0, index = 0) {
  const children = cst.children;
  const rawType = children.type?.[0]?.image || "Unknown";
  const type = normalizeType(rawType);

  const explicitId = children.id?.[0]?.image;
  const textAsId = children.text?.[0]?.image;
  // 自动生成确定性 ID：{type}_d{depth}_{index}
  const id = explicitId || (textAsId ? unquote(textAsId) : `${rawType.toLowerCase()}_d${depth}_${index}`);

  const props = {};

  if (children.layoutProps) {
    const layout = children.layoutProps[0].children;
    layout.key?.forEach((keyTok, idx) => {
      const key = keyTok.image;
      const value = unquote(layout.value[idx].image);
      props[normalizeKey(key)] = normalizeValue(key, value);
    });
  }

  if (children.attrDecl) {
    const attrs = children.attrDecl[0].children;
    attrs.attrKey?.forEach((keyTok, idx) => {
      const key = keyTok.image;
      const value = unquote(attrs.attrValue[idx].image);
      props[normalizeKey(key)] = normalizeValue(key, value);
    });
  }

  if (children.contentDecl) {
    const content = children.contentDecl[0].children;
    props.content = unquote(content.contentValue[0].image);
  }

  const childNodes = (children.element || []).map((childCst, idx) =>
    transformCstToAst(childCst, depth + 1, idx)
  );

  return ASTSchema.parse({ id, type, props, children: childNodes });
}

// ============================================
// 4. 统一调用接口
// ============================================

export function compileDSL(text) {
  const lexResult = StitchLexer.tokenize(text);

  if (lexResult.errors.length > 0) {
    const err = lexResult.errors[0];
    throw new Error(`Lexer Error at line ${err.line}, col ${err.column}: ${err.message}`);
  }

  parser.input = lexResult.tokens;
  const cst = parser.page();

  if (parser.errors.length > 0) {
    throw new Error(`Parser Error: ${parser.errors[0].message}`);
  }

  const rootChildren = (cst.children.element || []).map((el, idx) =>
    transformCstToAst(el, 0, idx)
  );

  return { type: "Root", children: rootChildren };
}

// ============================================
// 测试
// ============================================

const dsl = `
[SECTION: Execution_Flow]
  { Gutter: "32px", Align: "Center" }
  [CARD: node_opencode]
    ATTR: Title("OpenCode 接口调用"), Icon("Terminal")
    CONTENT: "执行层通过 handle_opencode_call/7 订阅 SSE 事件"
    [BUTTON: "运行调试"]
      ATTR: Variant("Outline"), Size("Small")
`;

console.log("=== DSL 输入 ===");
console.log(dsl);

console.log("\n=== AST 输出 ===");
const ast = compileDSL(dsl);
console.log(JSON.stringify(ast, null, 2));

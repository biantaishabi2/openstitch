/**
 * 语法分析器 (Parser)
 *
 * 使用 Chevrotain 将 Token 流构建为 CST (Concrete Syntax Tree)
 * 支持的语法：
 * - [TAG: id] 或 [TAG: "text"] - 标签定义
 * - { Key: "value", ... } - 布局属性
 * - ATTR: Key("value"), ... - 组件属性
 * - CONTENT: "text" - 内容定义
 * - 缩进表示层级嵌套
 */

import { CstParser, IToken } from 'chevrotain';
import {
  allTokens,
  tokenize,
  extractTagName,
  extractStringValue,
  TagOpen,
  TagClose,
  Colon,
  Comma,
  LBrace,
  RBrace,
  LParen,
  RParen,
  AttrKeyword,
  ContentKeyword,
  CssKeyword,
  StringLiteral,
  Identifier,
  NumberLiteral,
  NewLine,
} from './lexer';
import type { CSTNode, CSTAttr } from './ast';

// ============================================
// CST Parser
// ============================================

class StitchCstParser extends CstParser {
  constructor() {
    super(allTokens, {
      // 启用自动错误恢复
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }

  // 根规则：解析整个 DSL
  public document = this.RULE('document', () => {
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.element) },
        { ALT: () => this.CONSUME(NewLine) },
      ]);
    });
  });

  // 元素规则：解析单个标签元素
  private element = this.RULE('element', () => {
    // [TAG
    this.CONSUME(TagOpen);
    // :
    this.CONSUME(Colon);
    // id 或 "text"
    this.OR([
      { ALT: () => this.CONSUME(Identifier) },
      { ALT: () => this.CONSUME(StringLiteral) },
    ]);
    // ]
    this.CONSUME(TagClose);

    // 可选：换行
    this.OPTION(() => this.CONSUME(NewLine));

    // 可选：布局属性 { ... }
    this.OPTION2(() => this.SUBRULE(this.layoutProps));

    // 可选：ATTR: ...
    this.OPTION3(() => this.SUBRULE(this.attrDecl));

    // 可选：CONTENT: ...
    this.OPTION4(() => this.SUBRULE(this.contentDecl));

    // 可选：子元素
    this.MANY(() => {
      this.OR2([
        { ALT: () => this.SUBRULE2(this.element) },
        { ALT: () => this.CONSUME2(NewLine) },
      ]);
    });
  });

  // 布局属性规则：{ Key: "value", ... }
  private layoutProps = this.RULE('layoutProps', () => {
    this.CONSUME(LBrace);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => this.SUBRULE(this.propPair),
    });
    this.CONSUME(RBrace);
    this.OPTION(() => this.CONSUME(NewLine));
  });

  // 属性对规则：Key: "value"
  private propPair = this.RULE('propPair', () => {
    this.CONSUME(Identifier);
    this.CONSUME(Colon);
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME2(Identifier) },
    ]);
  });

  // ATTR 声明规则：ATTR: Key("value"), ...
  private attrDecl = this.RULE('attrDecl', () => {
    this.CONSUME(AttrKeyword);
    this.CONSUME(Colon);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => this.SUBRULE(this.attrCall),
    });
    this.OPTION(() => this.CONSUME(NewLine));
  });

  // 属性调用规则：Key("value")
  private attrCall = this.RULE('attrCall', () => {
    this.CONSUME(Identifier);
    this.CONSUME(LParen);
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME2(Identifier) },
    ]);
    this.CONSUME(RParen);
  });

  // CONTENT 声明规则：CONTENT: "text"
  private contentDecl = this.RULE('contentDecl', () => {
    this.CONSUME(ContentKeyword);
    this.CONSUME(Colon);
    this.CONSUME(StringLiteral);
    this.OPTION(() => this.CONSUME(NewLine));
  });
}

// 单例 Parser 实例
const parserInstance = new StitchCstParser();

// ============================================
// CST 访问器 - 将 Chevrotain CST 转换为我们的 CSTNode
// ============================================

interface ParseContext {
  tokens: IToken[];
  currentIndex: number;
  indentStack: number[];  // 缩进栈，用于判断层级
}

/**
 * 基于缩进的递归下降解析器
 * 通过 Token 的 startColumn 判断层级关系
 *
 * 核心规则：
 * - 缩进增加 → 子节点
 * - 缩进相同 → 兄弟节点
 * - 缩进减少 → 返回上层
 */
class SimpleParser {
  private tokens: IToken[];
  private pos: number = 0;

  constructor(tokens: IToken[]) {
    // 只保留有意义的 Token，过滤掉 NewLine（但保留位置信息）
    this.tokens = tokens.filter(t => t.tokenType.name !== 'NewLine');
  }

  private current(): IToken | undefined {
    return this.tokens[this.pos];
  }

  private peek(offset: number = 0): IToken | undefined {
    return this.tokens[this.pos + offset];
  }

  private consume(tokenName?: string): IToken {
    const token = this.current();
    if (!token) {
      throw new Error(`Unexpected end of input`);
    }
    if (tokenName && token.tokenType.name !== tokenName) {
      throw new Error(
        `Expected ${tokenName} but got ${token.tokenType.name} at L${token.startLine}:${token.startColumn}`
      );
    }
    this.pos++;
    return token;
  }

  private match(tokenName: string): boolean {
    return this.current()?.tokenType.name === tokenName;
  }

  /**
   * 获取下一个 TagOpen 的缩进级别（列位置）
   * 返回 -1 表示没有更多元素
   */
  private peekNextTagIndent(): number {
    const token = this.current();
    if (!token || token.tokenType.name !== 'TagOpen') {
      return -1;
    }
    // startColumn 是 1-based，转为 0-based 作为缩进级别
    return (token.startColumn || 1) - 1;
  }

  /**
   * 解析整个文档
   * 顶层元素的缩进级别为 0
   */
  public parseDocument(): CSTNode[] {
    const nodes: CSTNode[] = [];
    while (this.current()) {
      const indent = this.peekNextTagIndent();
      if (indent < 0) break;
      nodes.push(this.parseElement(0)); // 顶层缩进为 0
    }
    return nodes;
  }

  /**
   * 解析单个元素及其子元素
   * @param parentIndent 父元素的缩进级别
   */
  private parseElement(parentIndent: number): CSTNode {
    // 记录当前元素的缩进级别
    const myIndent = this.peekNextTagIndent();

    // [TAG
    const tagToken = this.consume('TagOpen');
    const tag = extractTagName(tagToken.image);

    // :
    this.consume('Colon');

    // id 或 "text"
    let id: string | undefined;
    let text: string | undefined;
    if (this.match('Identifier')) {
      id = this.consume('Identifier').image;
    } else if (this.match('StringLiteral')) {
      text = extractStringValue(this.consume('StringLiteral').image);
    }

    // ]
    this.consume('TagClose');

    const node: CSTNode = { tag };
    if (id) node.id = id;
    if (text) node.text = text;

    // 解析可选属性：layoutProps, ATTR, CONTENT, CSS（任意顺序）
    // 循环直到遇到子元素（TagOpen）或结束
    while (true) {
      if (this.match('LBrace')) {
        node.layoutProps = this.parseLayoutProps();
      } else if (this.match('AttrKeyword')) {
        node.attrs = this.parseAttrDecl();
      } else if (this.match('ContentKeyword')) {
        node.content = this.parseContentDecl();
      } else if (this.match('CssKeyword')) {
        node.css = this.parseCssDecl();
      } else {
        // 不是属性 token，可能是子元素或结束
        break;
      }
    }

    // 解析子元素：只有缩进更深的才是子元素
    const children: CSTNode[] = [];

    while (this.match('TagOpen')) {
      const nextIndent = this.peekNextTagIndent();

      // 下一个元素的缩进 <= 当前元素的缩进，说明不是子元素
      if (nextIndent <= myIndent) {
        break;
      }

      // 缩进更深，是子元素
      children.push(this.parseElement(myIndent));
    }

    if (children.length > 0) {
      node.children = children;
    }

    // 错误检测：检查是否有意外的 token
    // 如果当前 token 不是 TagOpen，且不是文件末尾，说明有无法解析的内容
    const currentToken = this.current();
    if (currentToken && !this.match('TagOpen')) {
      const tokenName = currentToken.tokenType.name;
      const tokenImage = currentToken.image;

      // 检查是否是属性顺序错误导致的
      if (tokenName === 'LBrace') {
        throw new Error(
          `解析错误 at L${currentToken.startLine}:${currentToken.startColumn}: ` +
          `遇到意外的布局属性 '${tokenImage}'。\n` +
          `提示：布局属性 { ... } 必须在 ATTR: 之前。正确顺序：\n` +
          `  [TAG: id]\n` +
          `    { layoutProps }  ← 先写这个\n` +
          `    ATTR: ...        ← 后写这个`
        );
      } else if (tokenName === 'AttrKeyword' || tokenName === 'ContentKeyword' || tokenName === 'CssKeyword') {
        throw new Error(
          `解析错误 at L${currentToken.startLine}:${currentToken.startColumn}: ` +
          `在元素 [${tag}${id ? ': ' + id : ''}] 中遇到重复的关键字 '${tokenImage}'`
        );
      } else {
        throw new Error(
          `解析错误 at L${currentToken.startLine}:${currentToken.startColumn}: ` +
          `遇到意外的 token '${tokenImage}' (${tokenName})，无法继续解析。\n` +
          `当前元素：[${tag}${id ? ': ' + id : ''}]`
        );
      }
    }

    return node;
  }

  /**
   * 解析布局属性 { Key: "value", ... }
   */
  private parseLayoutProps(): Record<string, string> {
    this.consume('LBrace');
    const props: Record<string, string> = {};

    while (!this.match('RBrace')) {
      const key = this.consume('Identifier').image;
      this.consume('Colon');

      let value: string;
      if (this.match('StringLiteral')) {
        value = extractStringValue(this.consume('StringLiteral').image);
      } else if (this.match('NumberLiteral')) {
        value = this.consume('NumberLiteral').image;
      } else {
        value = this.consume('Identifier').image;
      }

      props[key] = value;

      // 可选逗号
      if (this.match('Comma')) {
        this.consume('Comma');
      }
    }

    this.consume('RBrace');
    return props;
  }

  /**
   * 解析 ATTR: Key("value"), ...
   */
  private parseAttrDecl(): CSTAttr[] {
    this.consume('AttrKeyword');
    this.consume('Colon');

    const attrs: CSTAttr[] = [];

    while (this.match('Identifier') && this.peek(1)?.tokenType.name === 'LParen') {
      const key = this.consume('Identifier').image;
      this.consume('LParen');

      let value: string;
      if (this.match('StringLiteral')) {
        value = extractStringValue(this.consume('StringLiteral').image);
      } else if (this.match('NumberLiteral')) {
        value = this.consume('NumberLiteral').image;
      } else {
        value = this.consume('Identifier').image;
      }

      this.consume('RParen');
      attrs.push({ key, value });

      // 可选逗号
      if (this.match('Comma')) {
        this.consume('Comma');
      }
    }

    return attrs;
  }

  /**
   * 解析 CONTENT: "text"
   */
  private parseContentDecl(): string {
    this.consume('ContentKeyword');
    this.consume('Colon');
    return extractStringValue(this.consume('StringLiteral').image);
  }

  /**
   * 解析 CSS: "tailwind classes" (样式透传通道)
   */
  private parseCssDecl(): string {
    this.consume('CssKeyword');
    this.consume('Colon');
    return extractStringValue(this.consume('StringLiteral').image);
  }
}

// ============================================
// 导出函数
// ============================================

/**
 * 解析 DSL 文本为 CST
 * @param input DSL 文本
 * @returns CST 节点数组和错误信息
 */
export function parse(input: string): {
  cst: CSTNode[];
  errors: Array<{ message: string; line?: number; column?: number }>;
} {
  // Step 1: 词法分析
  const { tokens, errors: lexErrors } = tokenize(input);

  if (lexErrors.length > 0) {
    return {
      cst: [],
      errors: lexErrors.map(e => ({
        message: e.message,
        line: e.line,
        column: e.column,
      })),
    };
  }

  // Step 2: 语法分析
  try {
    const parser = new SimpleParser(tokens);
    const cst = parser.parseDocument();
    return { cst, errors: [] };
  } catch (error) {
    return {
      cst: [],
      errors: [{
        message: error instanceof Error ? error.message : String(error),
      }],
    };
  }
}

/**
 * 打印 CST（调试用）
 */
export function printCST(nodes: CSTNode[], indent: number = 0): void {
  const prefix = '  '.repeat(indent);
  for (const node of nodes) {
    console.log(`${prefix}[${node.tag}${node.id ? `: ${node.id}` : ''}${node.text ? `: "${node.text}"` : ''}]`);

    if (node.layoutProps) {
      console.log(`${prefix}  { ${Object.entries(node.layoutProps).map(([k, v]) => `${k}: "${v}"`).join(', ')} }`);
    }

    if (node.attrs && node.attrs.length > 0) {
      console.log(`${prefix}  ATTR: ${node.attrs.map(a => `${a.key}("${a.value}")`).join(', ')}`);
    }

    if (node.content) {
      console.log(`${prefix}  CONTENT: "${node.content}"`);
    }

    if (node.children) {
      printCST(node.children, indent + 1);
    }
  }
}

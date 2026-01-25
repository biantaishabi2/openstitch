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
 * 简化的递归下降解析器
 * 直接从 Token 流构建 CSTNode
 */
class SimpleParser {
  private tokens: IToken[];
  private pos: number = 0;

  constructor(tokens: IToken[]) {
    // 过滤掉换行符，简化解析
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
   * 解析整个文档
   */
  public parseDocument(): CSTNode[] {
    const nodes: CSTNode[] = [];
    while (this.current()) {
      nodes.push(this.parseElement());
    }
    return nodes;
  }

  /**
   * 解析单个元素
   */
  private parseElement(): CSTNode {
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

    // 可选：布局属性 { ... }
    if (this.match('LBrace')) {
      node.layoutProps = this.parseLayoutProps();
    }

    // 可选：ATTR: ...
    if (this.match('AttrKeyword')) {
      node.attrs = this.parseAttrDecl();
    }

    // 可选：CONTENT: ...
    if (this.match('ContentKeyword')) {
      node.content = this.parseContentDecl();
    }

    // 子元素处理：
    // - SECTION 是顶层容器，遇到新的 SECTION 时停止
    // - 同级元素（如 CARD 与 CARD、BUTTON 与 BUTTON）应该是兄弟而非嵌套
    // - 只有明确的父子关系才嵌套（如 SECTION 包含 CARD）
    const children: CSTNode[] = [];

    // 定义容器类型 - 这些可以包含其他元素
    const containerTypes = ['SECTION', 'CARD', 'GRID', 'FLEX', 'STACK', 'PAGE'];
    // 定义叶子类型 - 这些不应该包含同级元素
    const leafTypes = ['BUTTON', 'TEXT', 'INPUT', 'BADGE', 'ICON'];

    while (this.match('TagOpen')) {
      const nextTag = extractTagName(this.current()!.image);

      // 遇到新的 SECTION，停止（它是顶层兄弟）
      if (nextTag === 'SECTION') {
        break;
      }

      // 如果当前是叶子类型，不应该有子元素
      if (leafTypes.includes(tag)) {
        break;
      }

      // 如果当前和下一个都是同类型，停止（它们是兄弟）
      if (tag === nextTag) {
        break;
      }

      // 如果当前是 CARD，下一个也是 CARD，停止（兄弟关系）
      if (tag === 'CARD' && nextTag === 'CARD') {
        break;
      }

      // 如果当前是 BUTTON，下一个也是 BUTTON，停止（兄弟关系）
      if (tag === 'BUTTON' && nextTag === 'BUTTON') {
        break;
      }

      children.push(this.parseElement());
    }
    if (children.length > 0) {
      node.children = children;
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

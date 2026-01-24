/**
 * 逻辑引擎测试
 *
 * 测试用例覆盖：
 * - TC-LEXER-01: 词法分析
 * - TC-PARSER-01: 语法分析
 * - TC-ZOD-01 ~ TC-ZOD-05: 语义收敛
 */

import { describe, it, expect } from 'vitest';
import {
  tokenize,
  extractTagName,
  extractStringValue,
  parse,
  transformToAST,
  compile,
} from '../index';

// ============================================
// TC-LEXER-01: 词法分析测试
// ============================================

describe('Lexer (TC-LEXER-01)', () => {
  it('should tokenize [SECTION: id] tag', () => {
    const input = '[SECTION: Execution_Flow]';
    const { tokens, errors } = tokenize(input);

    expect(errors).toHaveLength(0);
    expect(tokens.length).toBeGreaterThan(0);

    // 验证 Token 类型
    const tokenNames = tokens.map(t => t.tokenType.name);
    expect(tokenNames).toContain('TagOpen');
    expect(tokenNames).toContain('Colon');
    expect(tokenNames).toContain('Identifier');
    expect(tokenNames).toContain('TagClose');
  });

  it('should tokenize layout props { Gutter: "32px" }', () => {
    const input = '{ Gutter: "32px", Align: "Center" }';
    const { tokens, errors } = tokenize(input);

    expect(errors).toHaveLength(0);

    const tokenNames = tokens.map(t => t.tokenType.name);
    expect(tokenNames).toContain('LBrace');
    expect(tokenNames).toContain('Identifier');
    expect(tokenNames).toContain('Colon');
    expect(tokenNames).toContain('StringLiteral');
    expect(tokenNames).toContain('Comma');
    expect(tokenNames).toContain('RBrace');
  });

  it('should tokenize ATTR: Key("value")', () => {
    const input = 'ATTR: Title("OpenCode 接口调用"), Icon("Terminal")';
    const { tokens, errors } = tokenize(input);

    expect(errors).toHaveLength(0);

    const tokenNames = tokens.map(t => t.tokenType.name);
    expect(tokenNames).toContain('AttrKeyword');
    expect(tokenNames).toContain('LParen');
    expect(tokenNames).toContain('RParen');
  });

  it('should tokenize CONTENT: "text"', () => {
    const input = 'CONTENT: "执行层通过 handle_opencode_call/7 订阅 SSE 事件"';
    const { tokens, errors } = tokenize(input);

    expect(errors).toHaveLength(0);

    const tokenNames = tokens.map(t => t.tokenType.name);
    expect(tokenNames).toContain('ContentKeyword');
    expect(tokenNames).toContain('StringLiteral');
  });

  it('should extract tag name from TagOpen token', () => {
    expect(extractTagName('[SECTION')).toBe('SECTION');
    expect(extractTagName('[CARD')).toBe('CARD');
    expect(extractTagName('[BUTTON')).toBe('BUTTON');
  });

  it('should extract string value from StringLiteral token', () => {
    expect(extractStringValue('"hello"')).toBe('hello');
    expect(extractStringValue('"hello \\"world\\""')).toBe('hello "world"');
    expect(extractStringValue('"line1\\nline2"')).toBe('line1\nline2');
  });
});

// ============================================
// TC-PARSER-01: 语法分析测试
// ============================================

describe('Parser (TC-PARSER-01)', () => {
  it('should parse simple tag', () => {
    const input = '[SECTION: Execution_Flow]';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    expect(cst).toHaveLength(1);
    expect(cst[0].tag).toBe('SECTION');
    expect(cst[0].id).toBe('Execution_Flow');
  });

  it('should parse tag with layout props', () => {
    const input = '[SECTION: test] { Gutter: "32px", Align: "Center" }';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    expect(cst[0].layoutProps).toEqual({
      Gutter: '32px',
      Align: 'Center',
    });
  });

  it('should parse tag with ATTR', () => {
    const input = '[CARD: node_opencode] ATTR: Title("OpenCode 接口调用"), Icon("Terminal")';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    expect(cst[0].attrs).toEqual([
      { key: 'Title', value: 'OpenCode 接口调用' },
      { key: 'Icon', value: 'Terminal' },
    ]);
  });

  it('should parse tag with CONTENT', () => {
    const input = '[CARD: test] CONTENT: "执行层通过 handle_opencode_call/7 订阅 SSE 事件"';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    expect(cst[0].content).toBe('执行层通过 handle_opencode_call/7 订阅 SSE 事件');
  });

  it('should parse tag with text content [BUTTON: "运行调试"]', () => {
    const input = '[BUTTON: "运行调试"]';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    expect(cst[0].tag).toBe('BUTTON');
    expect(cst[0].text).toBe('运行调试');
  });

  it('should parse nested tags', () => {
    const input = '[SECTION: test] [CARD: card1] [BUTTON: "按钮"]';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    // 简化 parser 将所有后续标签视为子元素
    expect(cst[0].children).toBeDefined();
  });
});

// ============================================
// TC-ZOD-01: 语义收敛 - 属性转换测试
// ============================================

describe('Semantic - Property Transform (TC-ZOD-01)', () => {
  it('should transform ATTR to normalized props', () => {
    const cst = [{
      tag: 'CARD',
      id: 'node_opencode',
      attrs: [
        { key: 'Title', value: 'OpenCode 接口调用' },
        { key: 'Icon', value: 'Terminal' },
      ],
    }];

    const { ast, errors } = transformToAST(cst);

    expect(errors.filter(e => e.level === 'error')).toHaveLength(0);
    expect(ast.children[0].type).toBe('Card');
    expect(ast.children[0].id).toBe('node_opencode');
    expect(ast.children[0].props.title).toBe('OpenCode 接口调用');
    expect(ast.children[0].props.icon).toBe('Terminal');
  });
});

// ============================================
// TC-ZOD-02: 语义收敛 - 别名映射测试
// ============================================

describe('Semantic - Alias Mapping (TC-ZOD-02)', () => {
  it('should map Variant("Outline") to variant: "outline"', () => {
    const cst = [{
      tag: 'BUTTON',
      text: '运行调试',
      attrs: [
        { key: 'Variant', value: 'Outline' },
      ],
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.variant).toBe('outline');
  });

  it('should map Align("Center") to align: "center"', () => {
    const cst = [{
      tag: 'SECTION',
      id: 'test',
      layoutProps: { Align: 'Center' },
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.align).toBe('center');
  });

  it('should map Size("Small") to size: "sm"', () => {
    const cst = [{
      tag: 'BUTTON',
      text: 'test',
      attrs: [{ key: 'Size', value: 'Small' }],
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.size).toBe('sm');
  });
});

// ============================================
// TC-ZOD-03: 语义收敛 - 默认值补全测试
// ============================================

describe('Semantic - Default Value Completion (TC-ZOD-03)', () => {
  it('should add default variant and size for Button', () => {
    const cst = [{
      tag: 'BUTTON',
      text: 'test',
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.variant).toBe('primary');
    expect(ast.children[0].props.size).toBe('md');
  });

  it('should not override explicitly set values', () => {
    const cst = [{
      tag: 'BUTTON',
      text: 'test',
      attrs: [{ key: 'Variant', value: 'Outline' }],
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.variant).toBe('outline');
    expect(ast.children[0].props.size).toBe('md');  // 默认值仍然补全
  });

  it('should add default variant for Card', () => {
    const cst = [{
      tag: 'CARD',
      id: 'test',
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.variant).toBe('default');
  });
});

// ============================================
// TC-ZOD-04: 语义收敛 - 嵌套校验测试
// ============================================

describe('Semantic - Nesting Validation (TC-ZOD-04)', () => {
  it('should warn when Button contains children', () => {
    const cst = [{
      tag: 'BUTTON',
      text: 'test',
      children: [{ tag: 'TABLE', id: 'table1' }],
    }];

    const { ast, errors } = transformToAST(cst);

    // 应该有警告
    expect(errors.some(e => e.message.includes('叶子组件'))).toBe(true);
  });

  it('should warn about invalid nesting', () => {
    const cst = [{
      tag: 'CARD',
      id: 'card1',
      children: [{ tag: 'SECTION', id: 'section1' }],
    }];

    const { ast, errors } = transformToAST(cst);

    // Section 不应该在 Card 内部
    expect(errors.some(e => e.message.includes('不建议直接包含'))).toBe(true);
  });
});

// ============================================
// TC-ZOD-05: 完整 AST 输出测试
// ============================================

describe('Semantic - Complete AST Output (TC-ZOD-05)', () => {
  it('should generate complete AST from complex CST', () => {
    const cst = [{
      tag: 'SECTION',
      id: 'Execution_Flow',
      layoutProps: { Gutter: '32px', Align: 'Center' },
      children: [{
        tag: 'CARD',
        id: 'node_opencode',
        attrs: [
          { key: 'Title', value: 'OpenCode 接口调用' },
          { key: 'Icon', value: 'Terminal' },
        ],
        content: '执行层通过 handle_opencode_call/7 订阅 SSE 事件',
        children: [{
          tag: 'BUTTON',
          text: '运行调试',
          attrs: [
            { key: 'Variant', value: 'Outline' },
            { key: 'Size', value: 'Small' },
          ],
        }],
      }],
    }];

    const { ast, errors } = transformToAST(cst, {
      title: 'OpenCode 流程图',
      context: '技术架构',
    });

    // 验证 Root
    expect(ast.type).toBe('Root');
    expect(ast.metadata?.title).toBe('OpenCode 流程图');
    expect(ast.metadata?.context).toBe('技术架构');

    // 验证 Section
    const section = ast.children[0];
    expect(section.type).toBe('Section');
    expect(section.id).toBe('Execution_Flow');
    expect(section.props.gutter).toBe('32px');
    expect(section.props.align).toBe('center');

    // 验证 Card
    const card = section.children![0];
    expect(card.type).toBe('Card');
    expect(card.id).toBe('node_opencode');
    expect(card.props.title).toBe('OpenCode 接口调用');
    expect(card.props.icon).toBe('Terminal');
    expect(card.props.content).toBe('执行层通过 handle_opencode_call/7 订阅 SSE 事件');

    // 验证 Button
    const button = card.children![0];
    expect(button.type).toBe('Button');
    expect(button.props.text).toBe('运行调试');
    expect(button.props.variant).toBe('outline');
    expect(button.props.size).toBe('sm');
  });

  it('should auto-generate IDs when not provided', () => {
    const cst = [
      { tag: 'CARD' },
      { tag: 'CARD' },
      { tag: 'BUTTON', text: 'btn1' },
    ];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].id).toBe('card_1');
    expect(ast.children[1].id).toBe('card_2');
    expect(ast.children[2].id).toBe('button_1');
  });
});

// ============================================
// 集成测试：完整编译流程
// ============================================

describe('Integration - compile()', () => {
  it('should compile DSL text to AST', () => {
    const input = `[SECTION: Execution_Flow] { Gutter: "32px", Align: "Center" } [CARD: node_opencode] ATTR: Title("OpenCode 接口调用"), Icon("Terminal")`;

    const result = compile(input, { context: '技术架构' });

    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
    expect(result.ast!.children[0].type).toBe('Section');
  });

  it('should return errors for invalid input', () => {
    const input = '[INVALID';

    const result = compile(input);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

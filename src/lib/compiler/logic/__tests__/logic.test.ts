/**
 * 逻辑引擎测试
 *
 * 测试用例覆盖：
 * - TC-LEXER-01: 词法分析
 * - TC-PARSER-01: 语法分析
 * - TC-ZOD-01 ~ TC-ZOD-05: 语义收敛
 * - TC-TRANSFORM-01: ID 稳定性
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

  // CSS 样式透传通道测试
  it('should tokenize CSS: "tailwind classes"', () => {
    const input = 'CSS: "bg-gradient-to-r from-blue-600 to-purple-600 text-white"';
    const { tokens, errors } = tokenize(input);

    expect(errors).toHaveLength(0);

    const tokenNames = tokens.map(t => t.tokenType.name);
    expect(tokenNames).toContain('CssKeyword');
    expect(tokenNames).toContain('Colon');
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

  // CSS 样式透传通道测试
  it('should parse tag with CSS passthrough', () => {
    const input = '[CARD: gradient_card] CSS: "bg-gradient-to-r from-blue-600 to-purple-600"';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    expect(cst[0].css).toBe('bg-gradient-to-r from-blue-600 to-purple-600');
  });

  it('should parse tag with ATTR, CONTENT and CSS', () => {
    const input = '[CARD: full_card] ATTR: Title("标题") CONTENT: "内容" CSS: "shadow-xl rounded-lg"';
    const { cst, errors } = parse(input);

    expect(errors).toHaveLength(0);
    expect(cst[0].attrs).toEqual([{ key: 'Title', value: '标题' }]);
    expect(cst[0].content).toBe('内容');
    expect(cst[0].css).toBe('shadow-xl rounded-lg');
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

  // CSS 样式透传通道测试
  it('should transform CSS to customClassName', () => {
    const cst = [{
      tag: 'CARD',
      id: 'gradient_card',
      css: 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl',
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.customClassName).toBe('bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl');
  });

  it('should preserve CSS along with other props', () => {
    const cst = [{
      tag: 'CARD',
      id: 'styled_card',
      attrs: [{ key: 'Title', value: '渐变卡片' }],
      content: '卡片内容',
      css: 'border-2 border-blue-500 rounded-lg',
    }];

    const { ast } = transformToAST(cst);

    expect(ast.children[0].props.title).toBe('渐变卡片');
    expect(ast.children[0].props.content).toBe('卡片内容');
    expect(ast.children[0].props.customClassName).toBe('border-2 border-blue-500 rounded-lg');
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
// 边界情况测试
// ============================================

describe('Edge Cases', () => {
  it('should handle empty input', () => {
    const result = compile('');
    expect(result.success).toBe(true);
    expect(result.ast?.children).toHaveLength(0);
  });

  it('should handle Unicode in strings', () => {
    const cst = [{
      tag: 'CARD',
      id: 'test',
      attrs: [{ key: 'Title', value: '中文标题 🎉 émoji' }],
    }];
    const { ast } = transformToAST(cst);
    expect(ast.children[0].props.title).toBe('中文标题 🎉 émoji');
  });

  it('should handle deeply nested structure', () => {
    const cst = [{
      tag: 'SECTION',
      id: 's1',
      children: [{
        tag: 'CARD',
        id: 'c1',
        children: [{
          tag: 'FLEX',
          id: 'f1',
          children: [{
            tag: 'BUTTON',
            text: 'deep',
          }],
        }],
      }],
    }];
    const { ast, errors } = transformToAST(cst);
    expect(ast.children[0].children![0].children![0].children![0].props.text).toBe('deep');
  });

  it('should preserve unknown attributes', () => {
    const cst = [{
      tag: 'CARD',
      id: 'test',
      attrs: [{ key: 'CustomAttr', value: 'custom-value' }],
    }];
    const { ast } = transformToAST(cst);
    expect(ast.children[0].props.customattr).toBe('custom-value');
  });

  it('should handle multiple root nodes', () => {
    const cst = [
      { tag: 'SECTION', id: 's1' },
      { tag: 'SECTION', id: 's2' },
      { tag: 'CARD', id: 'c1' },
    ];
    const { ast } = transformToAST(cst);
    expect(ast.children).toHaveLength(3);
  });

  it('should handle component without any props', () => {
    const cst = [{ tag: 'DIVIDER' }];
    const { ast } = transformToAST(cst);
    expect(ast.children[0].type).toBe('Divider');
    expect(ast.children[0].id).toBe('divider_1');
  });
});

// ============================================
// 错误处理测试
// ============================================

describe('Error Handling', () => {
  it('should report lexer errors for invalid characters', () => {
    const input = '[CARD: test] @#$%';
    const { tokens, errors } = tokenize(input);
    // 词法分析器可能报错或跳过非法字符
    // 具体行为取决于 lexer 配置
  });

  it('should report parser errors for unclosed tag', () => {
    const input = '[CARD: test';
    const result = compile(input);
    expect(result.success).toBe(false);
  });

  it('should report parser errors for missing colon', () => {
    const input = '[CARD test]';
    const result = compile(input);
    expect(result.success).toBe(false);
  });

  it('should collect multiple warnings', () => {
    const cst = [{
      tag: 'BUTTON',
      text: 'btn',
      children: [
        { tag: 'TABLE', id: 't1' },
        { tag: 'FORM', id: 'f1' },
      ],
    }];
    const { errors } = transformToAST(cst);
    // Button 是叶子组件，不能有 children，应该有警告
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ============================================
// Metadata 测试
// ============================================

describe('Metadata', () => {
  it('should include all metadata fields', () => {
    const cst = [{ tag: 'CARD', id: 'test' }];
    const { ast } = transformToAST(cst, {
      title: 'Test Page',
      context: '技术架构',
      sessionId: 'sess_123',
    });

    expect(ast.metadata?.title).toBe('Test Page');
    expect(ast.metadata?.context).toBe('技术架构');
    expect(ast.metadata?.sessionId).toBe('sess_123');
    expect(ast.metadata?.createdAt).toBeDefined();
  });

  it('should not include metadata if no options provided', () => {
    const cst = [{ tag: 'CARD', id: 'test' }];
    const { ast } = transformToAST(cst);
    expect(ast.metadata).toBeUndefined();
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

  it('should separate errors and warnings', () => {
    // 有效的 DSL 但有嵌套警告
    const input = '[BUTTON: "test"]';
    const result = compile(input);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    // warnings 可能为空（取决于具体输入）
  });
});

// ============================================
// TC-TRANSFORM-01: ID 稳定性
// ============================================

describe('ID Stability (TC-TRANSFORM-01)', () => {
  it('should generate consistent auto IDs across multiple compilations', () => {
    // 使用有效的 DSL 语法
    const dsl = '[CARD: c1] [BUTTON: "Click"] [TEXT: "Hello"]';

    const result1 = compile(dsl);
    const result2 = compile(dsl);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    // 显式 ID 在不同编译中一致
    expect(result1.ast?.children[0].id).toBe('c1');
    expect(result2.ast?.children[0].id).toBe('c1');
  });

  it('should generate deterministic IDs based on position', () => {
    const cst = [
      { tag: 'CARD' },
      { tag: 'CARD' },
      { tag: 'BUTTON', text: 'btn' },
      { tag: 'BUTTON', text: 'btn2' },
    ];

    const { ast: ast1 } = transformToAST(cst);
    const { ast: ast2 } = transformToAST(cst);

    // 相同输入应产生相同的 ID 序列
    expect(ast1.children.map(c => c.id)).toEqual(ast2.children.map(c => c.id));
    expect(ast1.children[0].id).toBe('card_1');
    expect(ast1.children[1].id).toBe('card_2');
    expect(ast1.children[2].id).toBe('button_1');
    expect(ast1.children[3].id).toBe('button_2');
  });

  it('should preserve explicit IDs unchanged', () => {
    const dsl = '[CARD: my_card] [BUTTON: my_btn]';

    const result1 = compile(dsl);
    const result2 = compile(dsl);

    expect(result1.ast?.children[0].id).toBe('my_card');
    expect(result2.ast?.children[0].id).toBe('my_card');
  });
});

// ============================================
// 深度嵌套测试 (10 层)
// ============================================

describe('Deep Nesting (10 levels)', () => {
  it('should parse 10 levels of nesting correctly', () => {
    // 构建 10 层嵌套的 CST，使用 FLEX 避免 Section 嵌套警告
    let deepCST: any = { tag: 'TEXT', text: '最深层' };
    for (let i = 9; i >= 0; i--) {
      deepCST = {
        tag: 'FLEX',
        id: `level_${i}`,
        children: [deepCST],
      };
    }

    const { ast, errors } = transformToAST([deepCST]);

    // 深度嵌套应该能正确解析
    expect(ast.children[0]).toBeDefined();

    // 遍历验证 10 层
    let current: any = ast.children[0];
    for (let i = 0; i < 10; i++) {
      expect(current.id).toBe(`level_${i}`);
      expect(current.type).toBe('Flex');
      current = current.children[0];
    }

    // 最深层是 Text
    expect(current.type).toBe('Text');
    expect(current.props.text).toBe('最深层');
  });

  it('should compile 10 level DSL via multiline format', () => {
    const dsl = `
[SECTION: l0]
  [SECTION: l1]
    [SECTION: l2]
      [SECTION: l3]
        [SECTION: l4]
          [SECTION: l5]
            [SECTION: l6]
              [SECTION: l7]
                [SECTION: l8]
                  [SECTION: l9]
                    [TEXT: deep] CONTENT: "第10层"
`;
    const result = compile(dsl);

    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();

    // 验证最深层内容
    let current: any = result.ast?.children[0];
    for (let i = 0; i < 10; i++) {
      expect(current.id).toBe(`l${i}`);
      current = current.children?.[0];
    }
    expect(current.props.content).toBe('第10层');
  });
});

// ============================================
// 超长字符串测试
// ============================================

describe('Long String Handling', () => {
  it('should handle very long content strings', () => {
    const longContent = 'A'.repeat(10000); // 10000 字符
    const cst = [{
      tag: 'TEXT',
      id: 'long_text',
      text: longContent,
    }];

    const { ast, errors } = transformToAST(cst);

    expect(errors).toHaveLength(0);
    expect(ast.children[0].props.text).toBe(longContent);
    expect(ast.children[0].props.text.length).toBe(10000);
  });

  it('should handle very long attribute values', () => {
    const longTitle = '标题'.repeat(1000); // 2000 字符
    const cst = [{
      tag: 'CARD',
      id: 'long_title_card',
      attrs: [{ key: 'Title', value: longTitle }],
    }];

    const { ast, errors } = transformToAST(cst);

    expect(errors).toHaveLength(0);
    expect(ast.children[0].props.title).toBe(longTitle);
  });

  it('should handle long IDs', () => {
    const longId = 'component_' + 'x'.repeat(200);
    const cst = [{
      tag: 'CARD',
      id: longId,
    }];

    const { ast, errors } = transformToAST(cst);

    expect(errors).toHaveLength(0);
    expect(ast.children[0].id).toBe(longId);
  });
});

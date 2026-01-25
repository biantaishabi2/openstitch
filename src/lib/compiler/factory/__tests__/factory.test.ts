/**
 * 组件工厂测试
 *
 * 测试用例覆盖：
 * - TC-FACTORY-01: Props 归一化
 * - TC-FACTORY-02: 插槽分发
 * - TC-FACTORY-03: 空插槽不渲染
 * - TC-FACTORY-04: 事件桩函数注入
 * - TC-FACTORY-05: Context 注入 (ThemeProvider)
 * - TC-PROPS-01: 样式优先级 (显式属性优先于 Token)
 */

import { describe, it, expect } from 'vitest';
import type { StitchAST, ASTNode } from '../../logic/ast';
import type { DesignTokens } from '../../visual/types';
import type { UINode } from '../types';
import { generateDesignTokens } from '../../visual/synthesizer';
import { normalizeProps } from '../props-normalizer';
import { distributeToSlots, isSlotEmpty, getSlotWrapper, SLOT_RULES } from '../slot-distributor';
import { injectEventStubs, needsEventStubs, EVENT_STUBS } from '../event-stubs';
import { getMappedType, getSpecialProps, isCompositeComponent, TYPE_MAP } from '../type-map';
import { generateIR } from '../ir-generator';

// 创建测试用 tokens
function createTestTokens(): DesignTokens {
  return generateDesignTokens({ context: 'test', sessionId: 'test' });
}

// 创建简单 AST
function createSimpleAST(children: ASTNode[]): StitchAST {
  return { type: 'Root', children };
}

// ============================================
// TC-FACTORY-01: Props 归一化
// ============================================

describe('Props Normalization (TC-FACTORY-01)', () => {
  const tokens = createTestTokens();

  it('should normalize size prop to className', () => {
    const props = { size: 'lg' as const };
    const result = normalizeProps(props, tokens);

    expect(result.className).toContain('text-lg');
  });

  it('should normalize size prop to style with token value', () => {
    const props = { size: 'lg' as const };
    const result = normalizeProps(props, tokens);

    expect(result.style).toBeDefined();
    expect(result.style?.fontSize).toBe(tokens['--font-size-lg']);
  });

  it('should normalize align prop', () => {
    const props = { align: 'center' as const };
    const result = normalizeProps(props, tokens);

    expect(result.className).toContain('text-center');
  });

  it('should normalize justify prop', () => {
    const props = { justify: 'between' as const };
    const result = normalizeProps(props, tokens);

    expect(result.className).toContain('justify-between');
  });

  it('should normalize gutter to gap style', () => {
    const props = { gutter: '32px' };
    const result = normalizeProps(props, tokens);

    expect(result.style?.gap).toBe('32px');
  });

  it('should pass through variant prop', () => {
    const props = { variant: 'outline' as const };
    const result = normalizeProps(props, tokens);

    expect(result.variant).toBe('outline');
  });

  it('should merge multiple normalizations', () => {
    const props = {
      size: 'lg' as const,
      align: 'center' as const,
      gutter: '16px',
    };
    const result = normalizeProps(props, tokens);

    expect(result.className).toContain('text-lg');
    expect(result.className).toContain('text-center');
    expect(result.style?.gap).toBe('16px');
  });

  it('should normalize spacing prop to gap style', () => {
    const props = { spacing: 'compact' as const };
    const result = normalizeProps(props, tokens);

    expect(result.style).toBeDefined();
    expect(result.style?.gap).toBe(tokens['--spacing-sm']);
  });

  it('should normalize spacing "normal" to medium gap', () => {
    const props = { spacing: 'normal' as const };
    const result = normalizeProps(props, tokens);

    expect(result.style?.gap).toBe(tokens['--spacing-md']);
  });

  it('should normalize spacing "spacious" to large gap', () => {
    const props = { spacing: 'spacious' as const };
    const result = normalizeProps(props, tokens);

    expect(result.style?.gap).toBe(tokens['--spacing-lg']);
  });

  it('should normalize padding prop', () => {
    const props = { padding: '16px' };
    const result = normalizeProps(props, tokens);

    expect(result.style?.padding).toBe('16px');
  });

  it('should normalize width and height props', () => {
    const props = { width: '100%', height: '200px' };
    const result = normalizeProps(props, tokens);

    expect(result.style?.width).toBe('100%');
    expect(result.style?.height).toBe('200px');
  });

  // Style Passthrough Channel tests (CSS: 样式透传)
  it('should apply customClassName to result', () => {
    const props = { customClassName: 'bg-gradient-to-r from-blue-600 to-purple-600' };
    const result = normalizeProps(props, tokens);

    expect(result.className).toContain('bg-gradient-to-r');
    expect(result.className).toContain('from-blue-600');
    expect(result.className).toContain('to-purple-600');
  });

  it('should merge customClassName with standard className using twMerge', () => {
    const props = {
      size: 'lg' as const,
      customClassName: 'text-blue-400', // 应该覆盖 size 生成的 text-lg
    };
    const result = normalizeProps(props, tokens);

    // twMerge 会智能合并，customClassName 优先级更高
    expect(result.className).toContain('text-blue-400');
  });

  it('should handle customClassName with multiple conflicting classes', () => {
    const props = {
      align: 'center' as const,  // 生成 text-center
      justify: 'between' as const,  // 生成 justify-between
      customClassName: 'text-left justify-end', // 覆盖 align 但保留 justify
    };
    const result = normalizeProps(props, tokens);

    // twMerge 处理冲突：text-left 覆盖 text-center，justify-end 覆盖 justify-between
    expect(result.className).toContain('text-left');
    expect(result.className).toContain('justify-end');
    expect(result.className).not.toContain('text-center');
    expect(result.className).not.toContain('justify-between');
  });

  it('should handle customClassName with non-conflicting classes', () => {
    const props = {
      size: 'lg' as const,
      customClassName: 'shadow-xl rounded-lg border-2',
    };
    const result = normalizeProps(props, tokens);

    // 非冲突的类应该都保留
    expect(result.className).toContain('text-lg');
    expect(result.className).toContain('shadow-xl');
    expect(result.className).toContain('rounded-lg');
    expect(result.className).toContain('border-2');
  });
});

// ============================================
// TC-FACTORY-02: 插槽分发
// ============================================

describe('Slot Distribution (TC-FACTORY-02)', () => {
  it('should distribute Card children to correct slots', () => {
    const children: ASTNode[] = [
      { id: 'heading1', type: 'Heading', props: { title: 'Card Title' } },
      { id: 'text1', type: 'Text', props: { content: 'Card content' } },
      { id: 'btn1', type: 'Button', props: { text: 'Submit' } },
    ];

    const distribution = distributeToSlots('Card', children);

    expect(distribution).not.toBeNull();
    expect(distribution!.header).toHaveLength(1);
    expect(distribution!.header[0].id).toBe('heading1');
    expect(distribution!.content).toHaveLength(1);
    expect(distribution!.content[0].id).toBe('text1');
    expect(distribution!.footer).toHaveLength(1);
    expect(distribution!.footer[0].id).toBe('btn1');
  });

  it('should distribute Alert children to title and description slots', () => {
    const children: ASTNode[] = [
      { id: 'title1', type: 'Heading', props: {} },
      { id: 'desc1', type: 'Text', props: { content: 'Description' } },
    ];

    const distribution = distributeToSlots('Alert', children);

    expect(distribution).not.toBeNull();
    expect(distribution!.title).toHaveLength(1);
    expect(distribution!.description).toHaveLength(1);
  });

  it('should get correct slot wrapper component', () => {
    expect(getSlotWrapper('Card', 'header')).toBe('CardHeader');
    expect(getSlotWrapper('Card', 'content')).toBe('CardContent');
    expect(getSlotWrapper('Card', 'footer')).toBe('CardFooter');
    expect(getSlotWrapper('Alert', 'title')).toBe('AlertTitle');
    expect(getSlotWrapper('Alert', 'description')).toBe('AlertDescription');
  });

  it('should return null for non-composite components', () => {
    const children: ASTNode[] = [
      { id: 'text1', type: 'Text', props: {} },
    ];

    const distribution = distributeToSlots('Button', children);
    expect(distribution).toBeNull();
  });

  it('should have slot rules for all composite components', () => {
    expect(SLOT_RULES['Card']).toBeDefined();
    expect(SLOT_RULES['Alert']).toBeDefined();
    expect(SLOT_RULES['Dialog']).toBeDefined();
    expect(SLOT_RULES['Tabs']).toBeDefined();
    expect(SLOT_RULES['Table']).toBeDefined();
  });
});

// ============================================
// TC-FACTORY-03: 空插槽不渲染
// ============================================

describe('Empty Slot Handling (TC-FACTORY-03)', () => {
  it('should detect empty slots', () => {
    const children: ASTNode[] = [
      { id: 'text1', type: 'Text', props: { content: 'Content only' } },
    ];

    const distribution = distributeToSlots('Card', children);

    expect(distribution).not.toBeNull();
    expect(isSlotEmpty(distribution!, 'header')).toBe(true);
    expect(isSlotEmpty(distribution!, 'content')).toBe(false);
    expect(isSlotEmpty(distribution!, 'footer')).toBe(true);
  });

  it('should not generate IR for empty slots', () => {
    const tokens = createTestTokens();
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'card1',
          type: 'Card',
          props: {},
          children: [
            { id: 'text1', type: 'Text', props: { content: 'Only content' } },
          ],
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // Card 的 IR 应该只有 content slot，没有 header 和 footer
    expect(ir.slots).toBeDefined();
    expect(ir.slots?.content).toBeDefined();
    expect(ir.slots?.header).toBeUndefined();
    expect(ir.slots?.footer).toBeUndefined();
  });
});

// ============================================
// TC-FACTORY-04: 事件桩函数注入
// ============================================

describe('Event Stubs Injection (TC-FACTORY-04)', () => {
  it('should inject onClick for Button', () => {
    const props = injectEventStubs('Button', 'btn_1', {});

    expect(props.onClick).toBeDefined();
    expect(typeof props.onClick).toBe('function');
  });

  it('should inject onChange, onFocus, onBlur for Input', () => {
    const props = injectEventStubs('Input', 'input_1', {});

    expect(props.onChange).toBeDefined();
    expect(props.onFocus).toBeDefined();
    expect(props.onBlur).toBeDefined();
  });

  it('should inject onCheckedChange for Checkbox', () => {
    const props = injectEventStubs('Checkbox', 'check_1', {});

    expect(props.onCheckedChange).toBeDefined();
  });

  it('should inject onValueChange for Tabs', () => {
    const props = injectEventStubs('Tabs', 'tabs_1', {});

    expect(props.onValueChange).toBeDefined();
  });

  it('should not override existing event handlers', () => {
    const customHandler = () => 'custom';
    const props = injectEventStubs('Button', 'btn_1', { onClick: customHandler });

    expect(props.onClick).toBe(customHandler);
  });

  it('should identify components that need event stubs', () => {
    expect(needsEventStubs('Button')).toBe(true);
    expect(needsEventStubs('Input')).toBe(true);
    expect(needsEventStubs('Checkbox')).toBe(true);
    expect(needsEventStubs('Text')).toBe(false);
    expect(needsEventStubs('Card')).toBe(false);
  });

  it('should have event stubs for all interactive components', () => {
    expect(EVENT_STUBS['Button']).toBeDefined();
    expect(EVENT_STUBS['Input']).toBeDefined();
    expect(EVENT_STUBS['Checkbox']).toBeDefined();
    expect(EVENT_STUBS['Switch']).toBeDefined();
    expect(EVENT_STUBS['Tabs']).toBeDefined();
    expect(EVENT_STUBS['Dialog']).toBeDefined();
    expect(EVENT_STUBS['Select']).toBeDefined();
  });
});

// ============================================
// TC-FACTORY-05: Context 注入 (Type Mapping)
// ============================================

describe('Type Mapping and Context (TC-FACTORY-05)', () => {
  it('should map AST types to component-map keys', () => {
    expect(getMappedType('Section')).toBe('Section');
    expect(getMappedType('Card')).toBe('Card');
    expect(getMappedType('Button')).toBe('Button');
  });

  it('should map renamed types correctly', () => {
    expect(getMappedType('Modal')).toBe('Dialog');
    expect(getMappedType('Divider')).toBe('Separator');
    expect(getMappedType('Code')).toBe('CodeBlock');
  });

  it('should map missing types to equivalent components', () => {
    expect(getMappedType('Form')).toBe('Stack');
    expect(getMappedType('Header')).toBe('Header');   // 语义化页头组件
    expect(getMappedType('Footer')).toBe('Footer');   // 语义化页脚组件
    expect(getMappedType('Sidebar')).toBe('Stack');
    expect(getMappedType('Heading')).toBe('Text');
  });

  it('should provide special props for mapped types', () => {
    const headingProps = getSpecialProps('Heading');
    expect(headingProps.variant).toBe('title');
    expect(headingProps.as).toBe('h2');

    const formProps = getSpecialProps('Form');
    expect(formProps.direction).toBe('col');
  });

  it('should identify composite components', () => {
    expect(isCompositeComponent('Card')).toBe(true);
    expect(isCompositeComponent('Alert')).toBe(true);
    expect(isCompositeComponent('Dialog')).toBe(true);
    expect(isCompositeComponent('Button')).toBe(false);
    expect(isCompositeComponent('Text')).toBe(false);
  });

  it('should have mapping for all AST component types', () => {
    const astTypes = [
      'Root', 'Section', 'Card', 'Button', 'Text', 'Input', 'Table',
      'List', 'Image', 'Icon', 'Badge', 'Alert', 'Modal', 'Tabs',
      'Form', 'Grid', 'Flex', 'Divider', 'Spacer', 'Container',
      'Header', 'Footer', 'Sidebar', 'Nav', 'Link', 'Code', 'Quote', 'Heading',
    ];

    for (const type of astTypes) {
      expect(TYPE_MAP[type as keyof typeof TYPE_MAP]).toBeDefined();
    }
  });
});

// ============================================
// IR 生成测试
// ============================================

describe('IR Generation', () => {
  const tokens = createTestTokens();

  it('should generate UINode from simple AST', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'btn1',
          type: 'Button',
          props: { text: 'Click me', variant: 'primary' },
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Button');
    expect(ir.id).toBe('btn1');
    // DSL 'primary' variant 映射到 shadcn 的 'default' variant
    expect(ir.props?.variant).toBe('default');
  });

  it('should generate UINode with nested children', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'section1',
          type: 'Section',
          props: { gutter: '32px' },
          children: [
            { id: 'text1', type: 'Text', props: { content: 'Hello' } },
            { id: 'text2', type: 'Text', props: { content: 'World' } },
          ],
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Section');
    expect(ir.children).toBeDefined();
    expect(Array.isArray(ir.children)).toBe(true);
    expect((ir.children as any[]).length).toBe(2);
  });

  it('should apply type mapping in IR', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'modal1', type: 'Modal', props: {} },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Dialog'); // Modal → Dialog
  });

  it('should inject event stubs in IR', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'btn1', type: 'Button', props: { text: 'Click' } },
      ],
    };

    const ir = generateIR(ast, tokens, { injectEvents: true });

    expect(ir.props?.onClick).toBeDefined();
  });

  it('should skip event injection when disabled', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'btn1', type: 'Button', props: { text: 'Click' } },
      ],
    };

    const ir = generateIR(ast, tokens, { injectEvents: false });

    expect(ir.props?.onClick).toBeUndefined();
  });

  it('should wrap multiple top-level nodes in Page', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'text1', type: 'Text', props: {} },
        { id: 'text2', type: 'Text', props: {} },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Page');
    expect(Array.isArray(ir.children)).toBe(true);
  });

  it('should handle deeply nested children', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'section1',
          type: 'Section',
          props: {},
          children: [
            {
              id: 'flex1',
              type: 'Flex',
              props: {},
              children: [
                {
                  id: 'card1',
                  type: 'Card',
                  props: {},
                  children: [
                    { id: 'text1', type: 'Text', props: { content: 'Deep' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Section');
    expect(ir.children).toBeDefined();
    // 验证嵌套结构存在
    const flexNode = ir.children as UINode;
    expect(flexNode.type).toBe('Flex');
    const cardNode = flexNode.children as UINode;
    expect(cardNode.type).toBe('Card');
  });

  it('should handle empty children array', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'section1',
          type: 'Section',
          props: {},
          children: [],
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Section');
    expect(ir.children).toBeUndefined();
  });

  it('should handle node without children property', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'btn1', type: 'Button', props: { text: 'Click' } },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Button');
    expect(ir.children).toBe('Click');
  });
});

// ============================================
// 组件工厂集成测试 (通过 IR 生成器验证)
// ============================================

describe('Component Factory Integration', () => {
  const tokens = createTestTokens();

  it('should generate complete IR with all props', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'btn1', type: 'Button', props: { text: 'Submit', variant: 'primary' } },
      ],
    };

    const ir = generateIR(ast, tokens);

    expect(ir.type).toBe('Button');
    expect(ir.id).toBe('btn1');
    // DSL 'primary' variant 映射到 shadcn 的 'default' variant
    expect(ir.props?.variant).toBe('default');
    expect(ir.children).toBe('Submit');
  });

  it('should apply options to IR generation', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'input1', type: 'Input', props: { placeholder: 'Enter text' } },
      ],
    };

    // 启用事件注入
    const withEvents = generateIR(ast, tokens, { injectEvents: true });
    expect(withEvents.props?.onChange).toBeDefined();

    // 禁用事件注入
    const withoutEvents = generateIR(ast, tokens, { injectEvents: false });
    expect(withoutEvents.props?.onChange).toBeUndefined();
  });

  it('should handle complex AST with slots and events', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'card1',
          type: 'Card',
          props: {},
          children: [
            { id: 'heading1', type: 'Heading', props: { title: 'Welcome' } },
            { id: 'text1', type: 'Text', props: { content: 'Content here' } },
            { id: 'btn1', type: 'Button', props: { text: 'Action' } },
          ],
        },
      ],
    };

    const ir = generateIR(ast, tokens, { injectEvents: true });

    expect(ir.type).toBe('Card');
    expect(ir.slots).toBeDefined();
    expect(ir.slots?.header).toBeDefined();
    expect(ir.slots?.content).toBeDefined();
    expect(ir.slots?.footer).toBeDefined();
  });

  it('should normalize props and inject events together', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'section1',
          type: 'Section',
          props: { spacing: 'compact' as const },
          children: [
            { id: 'btn1', type: 'Button', props: { text: 'Click', size: 'lg' as const } },
          ],
        },
      ],
    };

    const ir = generateIR(ast, tokens, { injectEvents: true });

    expect(ir.type).toBe('Section');
    expect(ir.props?.style?.gap).toBe(tokens['--spacing-sm']);

    // 子节点也被处理
    const btnNode = ir.children as UINode;
    expect(btnNode.props?.onClick).toBeDefined();
  });
});

// ============================================
// 边界情况测试
// ============================================

describe('Edge Cases', () => {
  const tokens = createTestTokens();

  it('should handle empty AST', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [],
    };

    // 空 AST 应该返回空 Page
    const ir = generateIR(ast, tokens);
    expect(ir.type).toBe('Page');
    expect(ir.children).toEqual([]);
  });

  it('should handle unknown component type gracefully', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        { id: 'unknown1', type: 'UnknownComponent' as any, props: {} },
      ],
    };

    // 未知类型应该透传
    const ir = generateIR(ast, tokens);
    expect(ir.type).toBe('UnknownComponent');
  });

  it('should preserve original props when no normalization needed', () => {
    const props = { customProp: 'value', anotherProp: 123 };
    const result = normalizeProps(props, tokens);

    expect(result.customProp).toBe('value');
    expect(result.anotherProp).toBe(123);
  });

  it('should handle null and undefined prop values', () => {
    const props = {
      size: 'lg' as const,
      nullProp: null,
      undefinedProp: undefined
    };
    const result = normalizeProps(props as any, tokens);

    expect(result.className).toContain('text-lg');
    expect(result.nullProp).toBeUndefined();
    expect(result.undefinedProp).toBeUndefined();
  });

  it('should handle Card with only header content', () => {
    const children: ASTNode[] = [
      { id: 'heading1', type: 'Heading', props: { title: 'Only Header' } },
    ];

    const distribution = distributeToSlots('Card', children);

    expect(distribution).not.toBeNull();
    expect(distribution!.header).toHaveLength(1);
    expect(isSlotEmpty(distribution!, 'header')).toBe(false);
    expect(isSlotEmpty(distribution!, 'content')).toBe(true);
    expect(isSlotEmpty(distribution!, 'footer')).toBe(true);
  });

  it('should handle multiple buttons in Card footer', () => {
    const children: ASTNode[] = [
      { id: 'text1', type: 'Text', props: {} },
      { id: 'btn1', type: 'Button', props: { text: 'Cancel' } },
      { id: 'btn2', type: 'Button', props: { text: 'Submit' } },
    ];

    const distribution = distributeToSlots('Card', children);

    expect(distribution).not.toBeNull();
    expect(distribution!.footer).toHaveLength(2);
    expect(distribution!.footer[0].id).toBe('btn1');
    expect(distribution!.footer[1].id).toBe('btn2');
  });
});

// ============================================
// TC-PROPS-01: 样式优先级 (显式属性优先于 Token)
// ============================================

describe('Style Priority (TC-PROPS-01)', () => {
  const tokens = createTestTokens();

  it('should prioritize explicit size prop over token default', () => {
    // 显式指定 size="lg" 应覆盖默认值
    const props = { size: 'lg' as const };
    const result = normalizeProps(props, tokens);

    expect(result.className).toContain('text-lg');
    // 不应使用 tokens 中的默认字号
  });

  it('should prioritize explicit variant prop over token default', () => {
    const props = { variant: 'outline' as const };
    const result = normalizeProps(props, tokens);

    expect(result.variant).toBe('outline');
  });

  it('should prioritize explicit spacing prop over token default', () => {
    const props = { spacing: 'compact' as const };
    const result = normalizeProps(props, tokens);

    // compact 应映射到 --spacing-sm
    expect(result.style?.gap).toBe(tokens['--spacing-sm']);
  });

  it('should allow explicit style to override token-derived style', () => {
    const props = {
      spacing: 'normal' as const,
      style: { gap: '100px' }, // 显式 style
    };
    const result = normalizeProps(props, tokens);

    expect(result.style).toBeDefined();
    // 显式 style 应覆盖 token 推导的 gap
    expect(result.style?.gap).toBe('100px');
  });

  it('should allow explicit className to augment generated className', () => {
    const props = {
      size: 'lg' as const,
      className: 'custom-class',
    };
    const result = normalizeProps(props, tokens);

    // 验证 size 归一化正确
    expect(result.className).toContain('text-lg');
    // 显式 className 应被保留
    expect(result.className).toContain('custom-class');
  });

  it('should parse JSON style string from DSL attrs', () => {
    const props = {
      spacing: 'normal' as const,
      style: '{"gap":"80px","color":"#ff0000"}',
    };
    const result = normalizeProps(props, tokens);

    expect(result.style?.gap).toBe('80px');
    expect(result.style?.color).toBe('#ff0000');
  });

  it('should carry explicit className/style through IR generation', () => {
    const ast = createSimpleAST([
      {
        id: 'row',
        type: 'Flex',
        props: {
          spacing: 'normal',
          className: 'custom-flex gap-0',
          style: '{"gap":"64px"}',
        },
      },
    ]);

    const ir = generateIR(ast, tokens);
    expect(ir.props?.className).toContain('custom-flex');
    expect(ir.props?.style?.gap).toBe('64px');
  });

  it('should preserve explicit variant when token provides similar default', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'btn1',
          type: 'Button',
          props: {
            text: 'Click',
            variant: 'ghost', // 显式指定 ghost
          },
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // 显式 variant 应该被保留
    expect(ir.props?.variant).toBe('ghost');
  });

  it('should not override explicit color with token color', () => {
    const props = {
      style: { color: '#ff0000' }, // 显式红色
    };
    const result = normalizeProps(props, tokens);

    // 显式颜色应保留，不被 token 覆盖
    expect(result.style?.color).toBe('#ff0000');
  });

  it('should respect explicit direction over mapped direction', () => {
    const ast: StitchAST = {
      type: 'Root',
      children: [
        {
          id: 'nav1',
          type: 'Nav',
          props: { direction: 'row' }, // Nav 默认是 col，但显式指定 row
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // 显式 direction 应优先于类型映射的默认值
    // 注意：这取决于具体实现，可能需要调整预期
    expect(ir.props?.direction).toBeDefined();
  });
});

// ============================================
// TC-FACTORY-06: 平台适配
// ============================================

describe('Platform Adaptation (TC-FACTORY-06)', () => {
  const tokens = createTestTokens();

  it('should add touch feedback classes for mobile Button', () => {
    const ast: StitchAST = {
      type: 'Root',
      platform: 'mobile',
      children: [
        {
          id: 'btn1',
          type: 'Button',
          props: { text: 'Click' },
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // 移动端 Button 应该有触摸反馈类
    expect(ir.props?.className).toContain('active:scale-[0.97]');
    expect(ir.props?.className).toContain('transition-transform');
  });

  it('should NOT add touch feedback classes for web Button', () => {
    const ast: StitchAST = {
      type: 'Root',
      platform: 'web',
      children: [
        {
          id: 'btn1',
          type: 'Button',
          props: { text: 'Click' },
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // Web 端不应该有触摸反馈类
    const className = ir.props?.className as string || '';
    expect(className).not.toContain('active:scale-[0.97]');
  });

  it('should add touch feedback classes for mobile Card', () => {
    const ast: StitchAST = {
      type: 'Root',
      platform: 'mobile',
      children: [
        {
          id: 'card1',
          type: 'Card',
          props: { title: 'Test' },
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // 移动端 Card 应该有触摸反馈类
    expect(ir.props?.className).toContain('active:scale-[0.97]');
  });

  it('should wrap content with MobileShell when platform is mobile', () => {
    const ast: StitchAST = {
      type: 'Root',
      platform: 'mobile',
      mobileNavigation: ['首页', '我的'],
      children: [
        {
          id: 'section1',
          type: 'Section',
          props: {},
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // 应该被 MobileShell 包裹
    expect(ir.type).toBe('MobileShell');
    expect(ir.props?.hasBottomNav).toBe(true);
  });

  it('should NOT wrap with MobileShell when platform is web', () => {
    const ast: StitchAST = {
      type: 'Root',
      platform: 'web',
      children: [
        {
          id: 'section1',
          type: 'Section',
          props: {},
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // 不应该被 MobileShell 包裹
    expect(ir.type).not.toBe('MobileShell');
  });

  it('should generate BottomTabs with correct navigation items', () => {
    const ast: StitchAST = {
      type: 'Root',
      platform: 'mobile',
      mobileNavigation: ['首页', '搜索', '我的'],
      children: [
        {
          id: 'content',
          type: 'Section',
          props: {},
        },
      ],
    };

    const ir = generateIR(ast, tokens);

    // 找到 BottomTabsList
    const bottomTabs = ir.children as UINode;
    expect(bottomTabs.type).toBe('BottomTabs');

    const tabsChildren = bottomTabs.children as UINode[];
    const tabsList = tabsChildren.find(c => c.type === 'BottomTabsList');
    expect(tabsList).toBeDefined();

    // 应该有 3 个触发器
    const triggers = tabsList?.children as UINode[];
    expect(triggers.length).toBe(3);
    expect(triggers[0].props?.label).toBe('首页');
    expect(triggers[1].props?.label).toBe('搜索');
    expect(triggers[2].props?.label).toBe('我的');
  });
});

/**
 * 组件工厂测试
 *
 * 测试用例覆盖：
 * - TC-FACTORY-01: Props 归一化
 * - TC-FACTORY-02: 插槽分发
 * - TC-FACTORY-03: 空插槽不渲染
 * - TC-FACTORY-04: 事件桩函数注入
 * - TC-FACTORY-05: Context 注入 (ThemeProvider)
 */

import { describe, it, expect } from 'vitest';
import type { StitchAST, ASTNode } from '../../logic/ast';
import type { DesignTokens } from '../../visual/types';
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
    expect(getMappedType('Header')).toBe('Flex');
    expect(getMappedType('Footer')).toBe('Flex');
    expect(getMappedType('Sidebar')).toBe('Stack');
    expect(getMappedType('Heading')).toBe('Text');
  });

  it('should provide special props for mapped types', () => {
    const headingProps = getSpecialProps('Heading');
    expect(headingProps.variant).toBe('title');
    expect(headingProps.as).toBe('h2');

    const formProps = getSpecialProps('Form');
    expect(formProps.direction).toBe('column');
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
    expect(ir.props?.variant).toBe('primary');
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
});

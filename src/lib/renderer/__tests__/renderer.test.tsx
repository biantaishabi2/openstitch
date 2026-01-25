/**
 * 渲染器测试
 *
 * 测试用例覆盖：
 * - TC-RENDERER-01: 基础组件渲染
 * - TC-RENDERER-02: Card 组件 Slots 渲染
 * - TC-RENDERER-03: Alert 组件 Slots 渲染
 * - TC-RENDERER-04: Dialog 组件 Slots 渲染
 * - TC-RENDERER-05: Tabs 组件渲染
 * - TC-RENDERER-06: Table 组件渲染
 * - TC-RENDERER-07: 嵌套组件渲染
 * - TC-RENDERER-08: Props 类型正确性
 * - TC-RENDERER-09: 事件桩函数渲染
 * - TC-RENDERER-10: 未知组件类型降级
 */

import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, hasComponent, getComponent } from '../renderer';
import { renderToString } from 'react-dom/server';
import type { UINode } from '../types';

// 辅助函数：渲染 UINode 到 HTML 字符串
function renderToHTML(node: UINode): string {
  const element = render(node);
  return renderToString(element as React.ReactElement);
}

// ============================================
// TC-RENDERER-01: 基础组件渲染
// ============================================

describe('Basic Component Rendering (TC-RENDERER-01)', () => {
  it('should render Button with text', () => {
    const node: UINode = {
      type: 'Button',
      props: {},
      children: 'Click Me',
    };

    const html = renderToHTML(node);

    expect(html).toContain('Click Me');
    expect(html).toContain('<button');
  });

  it('should render Text component', () => {
    const node: UINode = {
      type: 'Text',
      props: {},
      children: 'Hello World',
    };

    const html = renderToHTML(node);

    expect(html).toContain('Hello World');
  });

  it('should render Input with placeholder', () => {
    const node: UINode = {
      type: 'Input',
      props: {
        placeholder: 'Enter text...',
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('<input');
    expect(html).toContain('placeholder="Enter text..."');
  });

  it('should render Badge with variant', () => {
    const node: UINode = {
      type: 'Badge',
      props: {
        variant: 'secondary',
      },
      children: 'New',
    };

    const html = renderToHTML(node);

    expect(html).toContain('New');
  });

  it('should render Separator', () => {
    const node: UINode = {
      type: 'Separator',
      props: {},
    };

    const html = renderToHTML(node);

    // Separator should render without errors
    expect(html).toBeDefined();
  });

  it('should render Checkbox', () => {
    const node: UINode = {
      type: 'Checkbox',
      props: {
        id: 'terms',
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('id="terms"');
  });

  it('should render Switch', () => {
    const node: UINode = {
      type: 'Switch',
      props: {},
    };

    const html = renderToHTML(node);

    expect(html).toBeDefined();
  });

  it('should render Progress', () => {
    const node: UINode = {
      type: 'Progress',
      props: {
        value: 50,
      },
    };

    const html = renderToHTML(node);

    expect(html).toBeDefined();
  });
});

// ============================================
// TC-RENDERER-02: Card 组件 Slots 渲染
// ============================================

describe('Card Slots Rendering (TC-RENDERER-02)', () => {
  it('should render Card with title in header slot', () => {
    const node: UINode = {
      type: 'Card',
      props: {},
      slots: {
        header: {
          type: 'Text',
          props: {},
          children: 'Card Title',
        },
      },
    };

    const html = renderToHTML(node);

    // title 应该在 HTML 中可见
    expect(html).toContain('Card Title');
    // 不应该出现 [object Object]
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('slots=');
  });

  it('should render Card with content in content slot', () => {
    const node: UINode = {
      type: 'Card',
      props: {},
      slots: {
        content: {
          type: 'Text',
          props: {},
          children: 'This is the card content.',
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('This is the card content.');
    expect(html).not.toContain('[object Object]');
  });

  it('should render Card with footer slot containing Button', () => {
    const node: UINode = {
      type: 'Card',
      props: {},
      slots: {
        footer: {
          type: 'Button',
          props: {},
          children: 'Submit',
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('Submit');
    expect(html).toContain('<button');
    expect(html).not.toContain('[object Object]');
  });

  it('should render Card with all slots', () => {
    const node: UINode = {
      type: 'Card',
      props: {},
      slots: {
        header: {
          type: 'Text',
          props: {},
          children: 'Title Here',
        },
        content: {
          type: 'Text',
          props: {},
          children: 'Body content here',
        },
        footer: {
          type: 'Button',
          props: {},
          children: 'Action',
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('Title Here');
    expect(html).toContain('Body content here');
    expect(html).toContain('Action');
    expect(html).not.toContain('[object Object]');
  });

  it('should render Card without slots prop appearing in HTML', () => {
    const node: UINode = {
      type: 'Card',
      props: {
        title: 'My Card',
      },
      slots: {
        content: {
          type: 'Text',
          props: {},
          children: 'Content',
        },
      },
    };

    const html = renderToHTML(node);

    // slots 属性不应该出现在 HTML 中
    expect(html).not.toMatch(/slots\s*=/);
  });
});

// ============================================
// TC-RENDERER-03: Alert 组件 Slots 渲染
// ============================================

describe('Alert Slots Rendering (TC-RENDERER-03)', () => {
  it('should render Alert with title', () => {
    const node: UINode = {
      type: 'Alert',
      props: {},
      slots: {
        title: {
          type: 'Text',
          props: {},
          children: 'Alert Title',
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('Alert Title');
    expect(html).not.toContain('[object Object]');
  });

  it('should render Alert with description', () => {
    const node: UINode = {
      type: 'Alert',
      props: {},
      slots: {
        description: {
          type: 'Text',
          props: {},
          children: 'This is an important alert.',
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('This is an important alert.');
  });

  it('should render Alert with both title and description', () => {
    const node: UINode = {
      type: 'Alert',
      props: {
        variant: 'destructive',
      },
      slots: {
        title: {
          type: 'Text',
          props: {},
          children: 'Error',
        },
        description: {
          type: 'Text',
          props: {},
          children: 'Something went wrong.',
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('Error');
    expect(html).toContain('Something went wrong.');
    expect(html).not.toContain('[object Object]');
  });
});

// ============================================
// TC-RENDERER-04: Dialog 组件 Slots 渲染
// ============================================

describe('Dialog Slots Rendering (TC-RENDERER-04)', () => {
  it('should render Dialog with header', () => {
    const node: UINode = {
      type: 'Dialog',
      props: {
        open: true,
      },
      slots: {
        header: {
          type: 'Text',
          props: {},
          children: 'Dialog Header',
        },
      },
    };

    const html = renderToHTML(node);

    // Dialog 渲染应该不报错
    expect(html).toBeDefined();
  });

  it('should render Dialog structure without [object Object]', () => {
    const node: UINode = {
      type: 'Dialog',
      props: {},
      slots: {
        content: {
          type: 'Text',
          props: {},
          children: 'Dialog body',
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).not.toContain('[object Object]');
  });
});

// ============================================
// TC-RENDERER-05: Tabs 组件渲染
// ============================================

describe('Tabs Component Rendering (TC-RENDERER-05)', () => {
  it('should render Tabs with triggers and content', () => {
    const node: UINode = {
      type: 'Tabs',
      props: {
        defaultValue: 'tab1',
      },
      children: [
        {
          type: 'TabsList',
          props: {},
          children: [
            {
              type: 'TabsTrigger',
              props: { value: 'tab1' },
              children: 'Tab 1',
            },
            {
              type: 'TabsTrigger',
              props: { value: 'tab2' },
              children: 'Tab 2',
            },
          ],
        },
        {
          type: 'TabsContent',
          props: { value: 'tab1' },
          children: 'Content for tab 1',
        },
        {
          type: 'TabsContent',
          props: { value: 'tab2' },
          children: 'Content for tab 2',
        },
      ],
    };

    const html = renderToHTML(node);

    // Tab triggers 应该全部可见
    expect(html).toContain('Tab 1');
    expect(html).toContain('Tab 2');

    // 活动标签的内容应该可见
    expect(html).toContain('Content for tab 1');

    // 注意: 非活动标签内容在 SSR 中不会渲染 (Radix Tabs 行为)
    // 这是正确的行为 - 隐藏的 tab content 不包含实际内容
  });
});

// ============================================
// TC-RENDERER-06: Table 组件渲染
// ============================================

describe('Table Component Rendering (TC-RENDERER-06)', () => {
  it('should render Table with headers and rows', () => {
    const node: UINode = {
      type: 'Table',
      props: {},
      children: [
        {
          type: 'TableHeader',
          props: {},
          children: {
            type: 'TableRow',
            props: {},
            children: [
              { type: 'TableHead', props: {}, children: 'Name' },
              { type: 'TableHead', props: {}, children: 'Age' },
            ],
          },
        },
        {
          type: 'TableBody',
          props: {},
          children: [
            {
              type: 'TableRow',
              props: {},
              children: [
                { type: 'TableCell', props: {}, children: 'Alice' },
                { type: 'TableCell', props: {}, children: '25' },
              ],
            },
            {
              type: 'TableRow',
              props: {},
              children: [
                { type: 'TableCell', props: {}, children: 'Bob' },
                { type: 'TableCell', props: {}, children: '30' },
              ],
            },
          ],
        },
      ],
    };

    const html = renderToHTML(node);

    expect(html).toContain('<table');
    expect(html).toContain('Name');
    expect(html).toContain('Age');
    expect(html).toContain('Alice');
    expect(html).toContain('Bob');
    expect(html).toContain('25');
    expect(html).toContain('30');
  });
});

// ============================================
// TC-RENDERER-07: 嵌套组件渲染
// ============================================

describe('Nested Component Rendering (TC-RENDERER-07)', () => {
  it('should render Section containing multiple Cards', () => {
    const node: UINode = {
      type: 'Section',
      props: {},
      children: [
        {
          type: 'Card',
          id: 'card1',
          props: {},
          slots: {
            header: { type: 'Text', props: {}, children: 'Card 1' },
          },
        },
        {
          type: 'Card',
          id: 'card2',
          props: {},
          slots: {
            header: { type: 'Text', props: {}, children: 'Card 2' },
          },
        },
      ],
    };

    const html = renderToHTML(node);

    expect(html).toContain('Card 1');
    expect(html).toContain('Card 2');
    expect(html).not.toContain('[object Object]');
  });

  it('should render Card containing Button', () => {
    const node: UINode = {
      type: 'Card',
      props: {},
      children: [
        {
          type: 'Button',
          props: {},
          children: 'Nested Button',
        },
      ],
    };

    const html = renderToHTML(node);

    expect(html).toContain('Nested Button');
    expect(html).toContain('<button');
  });

  it('should render deeply nested structure', () => {
    const node: UINode = {
      type: 'Section',
      props: {},
      children: {
        type: 'Card',
        props: {},
        slots: {
          content: {
            type: 'Stack',
            props: {},
            children: [
              { type: 'Text', props: {}, children: 'Level 1' },
              {
                type: 'Flex',
                props: {},
                children: [
                  { type: 'Button', props: {}, children: 'Deep Button' },
                ],
              },
            ],
          },
        },
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('Level 1');
    expect(html).toContain('Deep Button');
  });
});

// ============================================
// TC-RENDERER-08: Props 类型正确性
// ============================================

describe('Props Type Correctness (TC-RENDERER-08)', () => {
  it('should handle string props correctly', () => {
    const node: UINode = {
      type: 'Button',
      props: {
        className: 'custom-class',
        'data-testid': 'test-button',
      },
      children: 'Test',
    };

    const html = renderToHTML(node);

    expect(html).toContain('custom-class');
    expect(html).toContain('data-testid="test-button"');
  });

  it('should handle boolean props correctly', () => {
    const node: UINode = {
      type: 'Input',
      props: {
        disabled: true,
        required: true,
      },
    };

    const html = renderToHTML(node);

    expect(html).toContain('disabled');
  });

  it('should not serialize object props as [object Object]', () => {
    const node: UINode = {
      type: 'Card',
      props: {},
      slots: {
        header: { type: 'Text', props: {}, children: 'Title' },
      },
    };

    const html = renderToHTML(node);

    // 不应该有任何 [object Object] 字符串
    expect(html).not.toContain('[object Object]');
  });

  it('should pass id prop correctly', () => {
    const node: UINode = {
      type: 'Section',
      id: 'my-section',
      props: {},
      children: 'Content',
    };

    const html = renderToHTML(node);

    expect(html).toContain('id="my-section"');
  });
});

// ============================================
// TC-RENDERER-09: 事件桩函数渲染
// ============================================

describe('Event Stub Rendering (TC-RENDERER-09)', () => {
  it('should render Button with onClick handler', () => {
    const mockOnClick = vi.fn();

    const node: UINode = {
      type: 'Button',
      props: {
        onClick: mockOnClick,
      },
      children: 'Clickable',
    };

    // 使用 render 而不是 renderToString 来检查事件
    const element = render(node);

    expect(element).toBeDefined();
    expect((element as React.ReactElement).props.onClick).toBe(mockOnClick);
  });

  it('should render Input with onChange handler', () => {
    const mockOnChange = vi.fn();

    const node: UINode = {
      type: 'Input',
      props: {
        onChange: mockOnChange,
      },
    };

    const element = render(node);

    expect((element as React.ReactElement).props.onChange).toBe(mockOnChange);
  });
});

// ============================================
// TC-RENDERER-10: 未知组件类型降级
// ============================================

describe('Unknown Component Fallback (TC-RENDERER-10)', () => {
  it('should return null for unknown component in non-strict mode', () => {
    const node: UINode = {
      type: 'UnknownComponent',
      props: {},
    };

    const element = render(node, { strict: false });

    expect(element).toBeNull();
  });

  it('should throw error for unknown component in strict mode', () => {
    const node: UINode = {
      type: 'UnknownComponent',
      props: {},
    };

    expect(() => {
      render(node, { strict: true });
    }).toThrow('Unknown component type: "UnknownComponent"');
  });

  it('should log warning for unknown component', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const node: UINode = {
      type: 'NonExistent',
      props: {},
    };

    render(node, { strict: false });

    expect(warnSpy).toHaveBeenCalledWith('[Stitch] Unknown component: "NonExistent"');

    warnSpy.mockRestore();
  });
});

// ============================================
// 组件映射表测试
// ============================================

describe('Component Map', () => {
  it('should have Button component registered', () => {
    expect(hasComponent('Button')).toBe(true);
  });

  it('should have Card component registered', () => {
    expect(hasComponent('Card')).toBe(true);
  });

  it('should have Section component registered', () => {
    expect(hasComponent('Section')).toBe(true);
  });

  it('should return false for unknown component', () => {
    expect(hasComponent('NonExistent')).toBe(false);
  });

  it('should get Button component', () => {
    const Button = getComponent('Button');
    expect(Button).toBeDefined();
  });
});

// ============================================
// 边界情况测试
// ============================================

describe('Edge Cases', () => {
  it('should handle null node', () => {
    const element = render(null as any);
    expect(element).toBeNull();
  });

  it('should handle empty props', () => {
    const node: UINode = {
      type: 'Div',
      props: {},
    };

    const html = renderToHTML(node);
    expect(html).toContain('<div');
  });

  it('should handle empty children array', () => {
    const node: UINode = {
      type: 'Div',
      props: {},
      children: [],
    };

    const html = renderToHTML(node);
    expect(html).toBeDefined();
  });

  it('should handle string children', () => {
    const node: UINode = {
      type: 'Span',
      props: {},
      children: 'Just text',
    };

    const html = renderToHTML(node);
    expect(html).toContain('Just text');
  });
});

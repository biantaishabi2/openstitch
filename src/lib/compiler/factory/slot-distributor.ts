/**
 * 插槽分发器
 *
 * 将 AST 的 children 分发到复合组件的不同插槽
 */

import type { ASTNode } from '../logic/ast';
import type { SlotRule, SlotDistribution } from './types';

/**
 * 插槽分发规则配置
 */
export const SLOT_RULES: Record<string, SlotRule> = {
  Card: {
    slots: ['header', 'content', 'footer'],
    distribute: (child: ASTNode) => {
      // Heading 或带 title 的节点 → header
      if (child.type === 'Heading') return 'header';
      if (child.props.title && ['Text'].includes(child.type)) return 'header';

      // Button、Link → footer
      if (['Button', 'Link'].includes(child.type)) return 'footer';

      // 其他 → content
      return 'content';
    },
    render: {
      header: 'CardHeader',
      content: 'CardContent',
      footer: 'CardFooter',
    },
  },

  Alert: {
    slots: ['title', 'description'],
    distribute: (child: ASTNode) => {
      // 带 title 的 → title 插槽
      if (child.props.title) return 'title';
      // Heading → title 插槽
      if (child.type === 'Heading') return 'title';
      // 其他 → description
      return 'description';
    },
    render: {
      title: 'AlertTitle',
      description: 'AlertDescription',
    },
  },

  Dialog: {
    slots: ['header', 'content', 'footer'],
    distribute: (child: ASTNode) => {
      // Heading 或带 title 的节点 → header
      if (child.type === 'Heading') return 'header';
      if (child.props.title && ['Text'].includes(child.type)) return 'header';

      // Button、Link → footer
      if (['Button', 'Link'].includes(child.type)) return 'footer';

      // 其他 → content
      return 'content';
    },
    render: {
      header: 'DialogHeader',
      content: 'DialogContent',
      footer: 'DialogFooter',
    },
  },

  // Tabs 需要特殊处理
  Tabs: {
    slots: ['list', 'content'],
    distribute: () => 'content', // 默认分发到 content
    render: {
      list: 'TabsList',
      content: 'TabsContent',
    },
    special: true,
  },

  // Table 需要特殊处理 - 不自动包装，由 SlottedTable 处理结构
  Table: {
    slots: ['header', 'body'],
    distribute: (child: ASTNode) => {
      // 表头行：包含 th 或者类型为 Text/Heading 的子元素作为表头
      if (child.type === 'Text' || child.type === 'Heading') return 'header';
      // 其他作为表格内容
      return 'body';
    },
    render: {
      // 不使用包装组件，直接传递子元素给 SlottedTable
      header: null,
      body: null,
    },
    special: true,
  },

  // Accordion 需要特殊处理
  Accordion: {
    slots: ['items'],
    distribute: () => 'items',
    render: {
      items: 'AccordionItem',
    },
    special: true,
  },

  // Timeline 时间线
  Timeline: {
    slots: ['items'],
    distribute: () => 'items',
    render: {
      items: 'TimelineItem',
    },
    special: true,
  },

  // Breadcrumb 面包屑
  Breadcrumb: {
    slots: ['items'],
    distribute: () => 'items',
    render: {
      items: 'BreadcrumbItem',
    },
    special: true,
  },

  // Stepper 步骤条
  Stepper: {
    slots: ['steps'],
    distribute: () => 'steps',
    render: {
      steps: 'Step',
    },
    special: true,
  },

  // Tooltip 提示
  Tooltip: {
    slots: ['trigger', 'content'],
    distribute: (child: ASTNode) => {
      // 第一个子节点作为触发器，其他作为内容
      return 'trigger';
    },
    render: {
      trigger: 'TooltipTrigger',
      content: 'TooltipContent',
    },
    special: true,
  },
};

/**
 * 获取组件的插槽规则
 */
export function getSlotRule(componentType: string): SlotRule | undefined {
  return SLOT_RULES[componentType];
}

/**
 * 分发子节点到插槽
 *
 * @param componentType 组件类型
 * @param children 子节点列表
 * @returns 插槽分发结果
 */
export function distributeToSlots(
  componentType: string,
  children: ASTNode[]
): SlotDistribution | null {
  const rule = SLOT_RULES[componentType];

  if (!rule) {
    return null; // 非复合组件，不需要分发
  }

  // 初始化插槽
  const distribution: SlotDistribution = {};
  for (const slotName of rule.slots) {
    distribution[slotName] = [];
  }

  // 分发子节点
  for (const child of children) {
    const targetSlot = rule.distribute(child);
    if (distribution[targetSlot]) {
      distribution[targetSlot].push(child);
    }
  }

  return distribution;
}

/**
 * 判断插槽是否为空
 */
export function isSlotEmpty(distribution: SlotDistribution, slotName: string): boolean {
  return !distribution[slotName] || distribution[slotName].length === 0;
}

/**
 * 获取插槽对应的包装组件类型
 */
export function getSlotWrapper(
  componentType: string,
  slotName: string
): string | undefined {
  const rule = SLOT_RULES[componentType];
  return rule?.render[slotName];
}

/**
 * 处理 Tabs 的特殊分发逻辑
 *
 * Tabs 需要从 props.tabs 数组生成 TabsList 和 TabsContent
 */
export function distributeTabsContent(
  props: Record<string, unknown>
): { tabs: Array<{ value: string; label: string; content?: unknown }> } | null {
  if (!props.tabs || !Array.isArray(props.tabs)) {
    return null;
  }

  return {
    tabs: props.tabs as Array<{ value: string; label: string; content?: unknown }>,
  };
}

/**
 * 处理 Table 的特殊分发逻辑
 *
 * Table 需要从 props.columns 和 props.data 生成表格结构
 */
export function distributeTableContent(
  props: Record<string, unknown>
): {
  columns: Array<{ key: string; header: string }>;
  data: Array<Record<string, unknown>>;
} | null {
  if (!props.columns || !Array.isArray(props.columns)) {
    return null;
  }

  return {
    columns: props.columns as Array<{ key: string; header: string }>,
    data: (props.data as Array<Record<string, unknown>>) || [],
  };
}

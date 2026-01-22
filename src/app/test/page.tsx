'use client';

import { StitchRenderer } from '@/lib/renderer';
import type { UINode } from '@/lib/renderer';

// ============================================
// 1. 布局组件测试 - Slot 模式
// ============================================

// Grid 测试 - 不同列数
const gridTest: UINode = {
  type: 'Section',
  props: { title: 'Grid 布局', subtitle: '支持 1-6 列，使用 slots 定位' },
  children: [
    {
      type: 'Stack',
      props: { gap: 8 },
      children: [
        // 3列
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '3 列 Grid',
        },
        {
          type: 'Grid',
          props: { columns: 3, gap: 4 },
          slots: {
            '1': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'Slot 1' }] },
            '2': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'Slot 2' }] },
            '3': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'Slot 3' }] },
          },
        },
        // 4列
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '4 列 Grid',
        },
        {
          type: 'Grid',
          props: { columns: 4, gap: 4 },
          slots: {
            '1': { type: 'Card', props: { className: 'p-4 bg-blue-50' }, children: [{ type: 'Text', children: '1' }] },
            '2': { type: 'Card', props: { className: 'p-4 bg-green-50' }, children: [{ type: 'Text', children: '2' }] },
            '3': { type: 'Card', props: { className: 'p-4 bg-yellow-50' }, children: [{ type: 'Text', children: '3' }] },
            '4': { type: 'Card', props: { className: 'p-4 bg-red-50' }, children: [{ type: 'Text', children: '4' }] },
          },
        },
        // 6列
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '6 列 Grid',
        },
        {
          type: 'Grid',
          props: { columns: 6, gap: 2 },
          slots: {
            '1': { type: 'Badge', children: '1' },
            '2': { type: 'Badge', props: { variant: 'secondary' }, children: '2' },
            '3': { type: 'Badge', props: { variant: 'outline' }, children: '3' },
            '4': { type: 'Badge', props: { variant: 'destructive' }, children: '4' },
            '5': { type: 'Badge', children: '5' },
            '6': { type: 'Badge', props: { variant: 'secondary' }, children: '6' },
          },
        },
      ],
    },
  ],
};

// Columns 测试
const columnsTest: UINode = {
  type: 'Section',
  props: { title: 'Columns 布局', subtitle: '支持 2-4 列和自定义比例' },
  children: [
    {
      type: 'Stack',
      props: { gap: 8 },
      children: [
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '2 列 (1:1)',
        },
        {
          type: 'Columns',
          props: { count: 2, gap: 4 },
          slots: {
            '1': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: '左侧内容' }] },
            '2': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: '右侧内容' }] },
          },
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '3 列',
        },
        {
          type: 'Columns',
          props: { count: 3, gap: 4 },
          slots: {
            '1': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'A' }] },
            '2': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'B' }] },
            '3': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'C' }] },
          },
        },
      ],
    },
  ],
};

// Split 测试
const splitTest: UINode = {
  type: 'Section',
  props: { title: 'Split 布局', subtitle: '左右分栏，支持不同比例' },
  children: [
    {
      type: 'Stack',
      props: { gap: 8 },
      children: [
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '1:1 比例',
        },
        {
          type: 'Split',
          props: { ratio: '1:1', gap: 4 },
          slots: {
            left: { type: 'Card', props: { className: 'p-4 bg-blue-50' }, children: [{ type: 'Text', children: 'Left (50%)' }] },
            right: { type: 'Card', props: { className: 'p-4 bg-green-50' }, children: [{ type: 'Text', children: 'Right (50%)' }] },
          },
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '2:1 比例',
        },
        {
          type: 'Split',
          props: { ratio: '2:1', gap: 4 },
          slots: {
            left: { type: 'Card', props: { className: 'p-4 bg-purple-50' }, children: [{ type: 'Text', children: 'Left (66%)' }] },
            right: { type: 'Card', props: { className: 'p-4 bg-orange-50' }, children: [{ type: 'Text', children: 'Right (33%)' }] },
          },
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '1:2 比例',
        },
        {
          type: 'Split',
          props: { ratio: '1:2', gap: 4 },
          slots: {
            left: { type: 'Card', props: { className: 'p-4 bg-pink-50' }, children: [{ type: 'Text', children: 'Left (33%)' }] },
            right: { type: 'Card', props: { className: 'p-4 bg-cyan-50' }, children: [{ type: 'Text', children: 'Right (66%)' }] },
          },
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '3:1 比例',
        },
        {
          type: 'Split',
          props: { ratio: '3:1', gap: 4 },
          slots: {
            left: { type: 'Card', props: { className: 'p-4 bg-indigo-50' }, children: [{ type: 'Text', children: 'Left (75%)' }] },
            right: { type: 'Card', props: { className: 'p-4 bg-amber-50' }, children: [{ type: 'Text', children: 'Right (25%)' }] },
          },
        },
      ],
    },
  ],
};

// Rows 测试
const rowsTest: UINode = {
  type: 'Section',
  props: { title: 'Rows 布局', subtitle: '行布局，使用 slots' },
  children: [
    {
      type: 'Rows',
      props: { gap: 4 },
      slots: {
        '1': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'Row 1' }] },
        '2': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'Row 2' }] },
        '3': { type: 'Card', props: { className: 'p-4' }, children: [{ type: 'Text', children: 'Row 3' }] },
      },
    },
  ],
};

// ============================================
// 2. 布局组件测试 - Children 模式
// ============================================

// Stack 测试
const stackTest: UINode = {
  type: 'Section',
  props: { title: 'Stack 布局', subtitle: '垂直堆叠，不同间距' },
  children: [
    {
      type: 'Grid',
      props: { columns: 3, gap: 6 },
      slots: {
        '1': {
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            {
              type: 'Stack',
              props: { gap: 2 },
              children: [
                { type: 'Text', props: { variant: 'subtitle' }, children: 'gap=2' },
                { type: 'Badge', children: 'Item 1' },
                { type: 'Badge', children: 'Item 2' },
                { type: 'Badge', children: 'Item 3' },
              ],
            },
          ],
        },
        '2': {
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            {
              type: 'Stack',
              props: { gap: 4 },
              children: [
                { type: 'Text', props: { variant: 'subtitle' }, children: 'gap=4' },
                { type: 'Badge', children: 'Item 1' },
                { type: 'Badge', children: 'Item 2' },
                { type: 'Badge', children: 'Item 3' },
              ],
            },
          ],
        },
        '3': {
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            {
              type: 'Stack',
              props: { gap: 6 },
              children: [
                { type: 'Text', props: { variant: 'subtitle' }, children: 'gap=6' },
                { type: 'Badge', children: 'Item 1' },
                { type: 'Badge', children: 'Item 2' },
                { type: 'Badge', children: 'Item 3' },
              ],
            },
          ],
        },
      },
    },
  ],
};

// Flex 测试
const flexTest: UINode = {
  type: 'Section',
  props: { title: 'Flex 布局', subtitle: '水平排列，不同对齐方式' },
  children: [
    {
      type: 'Stack',
      props: { gap: 6 },
      children: [
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: 'justify: start (默认)',
        },
        {
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            {
              type: 'Flex',
              props: { gap: 2 },
              children: [
                { type: 'Badge', children: 'A' },
                { type: 'Badge', children: 'B' },
                { type: 'Badge', children: 'C' },
              ],
            },
          ],
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: 'justify: center',
        },
        {
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            {
              type: 'Flex',
              props: { justify: 'center', gap: 2 },
              children: [
                { type: 'Badge', children: 'A' },
                { type: 'Badge', children: 'B' },
                { type: 'Badge', children: 'C' },
              ],
            },
          ],
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: 'justify: between',
        },
        {
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            {
              type: 'Flex',
              props: { justify: 'between', gap: 2 },
              children: [
                { type: 'Badge', children: 'A' },
                { type: 'Badge', children: 'B' },
                { type: 'Badge', children: 'C' },
              ],
            },
          ],
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: 'justify: end',
        },
        {
          type: 'Card',
          props: { className: 'p-4' },
          children: [
            {
              type: 'Flex',
              props: { justify: 'end', gap: 2 },
              children: [
                { type: 'Badge', children: 'A' },
                { type: 'Badge', children: 'B' },
                { type: 'Badge', children: 'C' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Center 测试
const centerTest: UINode = {
  type: 'Section',
  props: { title: 'Center 布局', subtitle: '水平垂直居中' },
  children: [
    {
      type: 'Card',
      props: { className: 'h-32' },
      children: [
        {
          type: 'Center',
          props: { className: 'h-full' },
          children: [
            { type: 'Badge', props: { variant: 'secondary' }, children: '居中内容' },
          ],
        },
      ],
    },
  ],
};

// Spacer 和 LayoutDivider 测试
const spacerDividerTest: UINode = {
  type: 'Section',
  props: { title: 'Spacer & Divider', subtitle: '间隔和分割线' },
  children: [
    {
      type: 'Card',
      props: { className: 'p-4' },
      children: [
        {
          type: 'Stack',
          props: { gap: 0 },
          children: [
            { type: 'Text', children: '上方内容' },
            { type: 'Spacer', props: { size: 'md' } },
            { type: 'Text', children: 'Spacer (md) 后的内容' },
            { type: 'Spacer', props: { size: 'lg' } },
            { type: 'Text', children: 'Spacer (lg) 后的内容' },
            { type: 'LayoutDivider' },
            { type: 'Text', children: 'Divider 后的内容' },
          ],
        },
      ],
    },
  ],
};

// ============================================
// 3. 自定义组件测试
// ============================================

// Hero 测试
const heroTest: UINode = {
  type: 'Stack',
  props: { gap: 8 },
  children: [
    {
      type: 'Hero',
      props: {
        title: 'Hero Small',
        subtitle: 'size="sm"',
        description: '这是一个小尺寸的 Hero 组件',
        size: 'sm',
      },
    },
    {
      type: 'Hero',
      props: {
        title: 'Hero Medium',
        subtitle: 'size="md"',
        description: '这是一个中等尺寸的 Hero 组件，适合大多数场景',
        size: 'md',
      },
    },
  ],
};

// Icon 测试
const iconTest: UINode = {
  type: 'Section',
  props: { title: 'Icon 组件', subtitle: '动态加载 Lucide 图标' },
  children: [
    {
      type: 'Stack',
      props: { gap: 6 },
      children: [
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '不同尺寸',
        },
        {
          type: 'Flex',
          props: { gap: 4, align: 'center' },
          children: [
            { type: 'Icon', props: { name: 'Star', size: 'xs' } },
            { type: 'Text', props: { variant: 'muted' }, children: 'xs' },
            { type: 'Icon', props: { name: 'Star', size: 'sm' } },
            { type: 'Text', props: { variant: 'muted' }, children: 'sm' },
            { type: 'Icon', props: { name: 'Star', size: 'md' } },
            { type: 'Text', props: { variant: 'muted' }, children: 'md' },
            { type: 'Icon', props: { name: 'Star', size: 'lg' } },
            { type: 'Text', props: { variant: 'muted' }, children: 'lg' },
            { type: 'Icon', props: { name: 'Star', size: 'xl' } },
            { type: 'Text', props: { variant: 'muted' }, children: 'xl' },
          ],
        },
        {
          type: 'Text',
          props: { variant: 'subtitle' },
          children: '常用图标',
        },
        {
          type: 'Flex',
          props: { gap: 4, wrap: true },
          children: [
            { type: 'Icon', props: { name: 'Home', size: 'lg' } },
            { type: 'Icon', props: { name: 'Settings', size: 'lg' } },
            { type: 'Icon', props: { name: 'User', size: 'lg' } },
            { type: 'Icon', props: { name: 'Mail', size: 'lg' } },
            { type: 'Icon', props: { name: 'Bell', size: 'lg' } },
            { type: 'Icon', props: { name: 'Search', size: 'lg' } },
            { type: 'Icon', props: { name: 'Heart', size: 'lg' } },
            { type: 'Icon', props: { name: 'Check', size: 'lg' } },
            { type: 'Icon', props: { name: 'X', size: 'lg' } },
            { type: 'Icon', props: { name: 'Plus', size: 'lg' } },
            { type: 'Icon', props: { name: 'Minus', size: 'lg' } },
            { type: 'Icon', props: { name: 'ChevronRight', size: 'lg' } },
          ],
        },
      ],
    },
  ],
};

// CodeBlock 测试
const codeBlockTest: UINode = {
  type: 'Section',
  props: { title: 'CodeBlock 组件', subtitle: '代码高亮显示' },
  children: [
    {
      type: 'Grid',
      props: { columns: 2, gap: 6 },
      slots: {
        '1': {
          type: 'CodeBlock',
          props: {
            language: 'typescript',
            filename: 'example.ts',
            code: `interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  return { id, name: 'John', email: 'john@example.com' };
}`,
          },
        },
        '2': {
          type: 'CodeBlock',
          props: {
            language: 'python',
            filename: 'main.py',
            code: `def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 计算前 10 个斐波那契数
for i in range(10):
    print(fibonacci(i))`,
          },
        },
      },
    },
  ],
};

// Statistic 测试
const statisticTest: UINode = {
  type: 'Section',
  props: { title: 'Statistic 组件', subtitle: '数据统计展示' },
  children: [
    {
      type: 'Grid',
      props: { columns: 4, gap: 4 },
      slots: {
        '1': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: {
                title: '上升趋势',
                value: 1234,
                trend: 'up',
                trendValue: '+12.5%',
              },
            },
          ],
        },
        '2': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: {
                title: '下降趋势',
                value: 567,
                trend: 'down',
                trendValue: '-8.3%',
              },
            },
          ],
        },
        '3': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: {
                title: '带前缀',
                value: 99.9,
                valuePrefix: '¥',
                valueSuffix: 'k',
              },
            },
          ],
        },
        '4': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: {
                title: '百分比',
                value: '95.5%',
                description: '较上月提升',
              },
            },
          ],
        },
      },
    },
  ],
};

// Timeline 测试
const timelineTest: UINode = {
  type: 'Section',
  props: { title: 'Timeline 组件', subtitle: '时间线展示' },
  children: [
    {
      type: 'Timeline',
      props: { size: 'md' },
      children: [
        {
          type: 'TimelineItem',
          props: {
            title: 'Completed 状态',
            description: '这是一个已完成的步骤',
            status: 'completed',
          },
        },
        {
          type: 'TimelineItem',
          props: {
            title: 'In Progress 状态',
            description: '这是一个进行中的步骤',
            status: 'in-progress',
          },
        },
        {
          type: 'TimelineItem',
          props: {
            title: 'Pending 状态',
            description: '这是一个待处理的步骤',
            status: 'pending',
          },
        },
      ],
    },
  ],
};

// Stepper 测试
const stepperTest: UINode = {
  type: 'Section',
  props: { title: 'Stepper 组件', subtitle: '步骤指示器' },
  children: [
    {
      type: 'Card',
      props: { className: 'p-6' },
      children: [
        {
          type: 'Stepper',
          props: { currentStep: 2 },
          children: [
            { type: 'Step', props: { title: '注册账号', description: '填写基本信息' } },
            { type: 'Step', props: { title: '完善资料', description: '补充详细信息' } },
            { type: 'Step', props: { title: '身份验证', description: '上传证件照片' } },
            { type: 'Step', props: { title: '完成', description: '开始使用' } },
          ],
        },
      ],
    },
  ],
};

// List 测试
const listTest: UINode = {
  type: 'Section',
  props: { title: 'List 组件', subtitle: '列表展示' },
  children: [
    {
      type: 'Grid',
      props: { columns: 2, gap: 6 },
      slots: {
        '1': {
          type: 'Card',
          children: [
            {
              type: 'CardHeader',
              children: [{ type: 'CardTitle', children: '普通列表' }],
            },
            {
              type: 'CardContent',
              children: [
                {
                  type: 'List',
                  children: [
                    { type: 'ListItem', props: { title: '列表项 1' } },
                    { type: 'ListItem', props: { title: '列表项 2' } },
                    { type: 'ListItem', props: { title: '列表项 3' } },
                  ],
                },
              ],
            },
          ],
        },
        '2': {
          type: 'Card',
          children: [
            {
              type: 'CardHeader',
              children: [{ type: 'CardTitle', children: '带描述列表' }],
            },
            {
              type: 'CardContent',
              children: [
                {
                  type: 'List',
                  props: { divided: true },
                  children: [
                    { type: 'ListItem', props: { title: '功能 A', description: '这是功能 A 的详细描述' } },
                    { type: 'ListItem', props: { title: '功能 B', description: '这是功能 B 的详细描述' } },
                    { type: 'ListItem', props: { title: '功能 C', description: '这是功能 C 的详细描述' } },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  ],
};

// EmptyState 测试
const emptyStateTest: UINode = {
  type: 'Section',
  props: { title: 'EmptyState 组件', subtitle: '空状态提示' },
  children: [
    {
      type: 'Grid',
      props: { columns: 2, gap: 6 },
      slots: {
        '1': {
          type: 'Card',
          props: { className: 'p-8' },
          children: [
            {
              type: 'EmptyState',
              props: {
                icon: 'Inbox',
                title: '暂无数据',
                description: '当前没有可显示的内容',
              },
            },
          ],
        },
        '2': {
          type: 'Card',
          props: { className: 'p-8' },
          children: [
            {
              type: 'EmptyState',
              props: {
                icon: 'Search',
                title: '未找到结果',
                description: '请尝试修改搜索条件',
              },
            },
          ],
        },
      },
    },
  ],
};

// ============================================
// 4. shadcn 官方组件对比测试
// ============================================

// Button 测试
const buttonTest: UINode = {
  type: 'Section',
  props: { title: 'Button (shadcn)', subtitle: '按钮变体' },
  children: [
    {
      type: 'Flex',
      props: { gap: 4, wrap: true },
      children: [
        { type: 'Button', children: 'Default' },
        { type: 'Button', props: { variant: 'secondary' }, children: 'Secondary' },
        { type: 'Button', props: { variant: 'outline' }, children: 'Outline' },
        { type: 'Button', props: { variant: 'ghost' }, children: 'Ghost' },
        { type: 'Button', props: { variant: 'link' }, children: 'Link' },
        { type: 'Button', props: { variant: 'destructive' }, children: 'Destructive' },
      ],
    },
  ],
};

// Badge 测试
const badgeTest: UINode = {
  type: 'Section',
  props: { title: 'Badge (shadcn)', subtitle: '徽章变体' },
  children: [
    {
      type: 'Flex',
      props: { gap: 4, wrap: true },
      children: [
        { type: 'Badge', children: 'Default' },
        { type: 'Badge', props: { variant: 'secondary' }, children: 'Secondary' },
        { type: 'Badge', props: { variant: 'outline' }, children: 'Outline' },
        { type: 'Badge', props: { variant: 'destructive' }, children: 'Destructive' },
      ],
    },
  ],
};

// Alert 测试
const alertTest: UINode = {
  type: 'Section',
  props: { title: 'Alert (shadcn)', subtitle: '提示框' },
  children: [
    {
      type: 'Stack',
      props: { gap: 4 },
      children: [
        {
          type: 'Alert',
          children: [
            { type: 'AlertTitle', children: '默认提示' },
            { type: 'AlertDescription', children: '这是一条默认的提示信息。' },
          ],
        },
        {
          type: 'Alert',
          props: { variant: 'destructive' },
          children: [
            { type: 'AlertTitle', children: '错误提示' },
            { type: 'AlertDescription', children: '操作失败，请稍后重试。' },
          ],
        },
      ],
    },
  ],
};

// Card 测试
const cardTest: UINode = {
  type: 'Section',
  props: { title: 'Card (shadcn)', subtitle: '卡片组件' },
  children: [
    {
      type: 'Grid',
      props: { columns: 2, gap: 6 },
      slots: {
        '1': {
          type: 'Card',
          children: [
            {
              type: 'CardHeader',
              children: [
                { type: 'CardTitle', children: '卡片标题' },
                { type: 'CardDescription', children: '卡片描述文字' },
              ],
            },
            {
              type: 'CardContent',
              children: [{ type: 'Text', children: '这是卡片的主要内容区域。' }],
            },
            {
              type: 'CardFooter',
              children: [
                { type: 'Button', props: { variant: 'outline' }, children: '取消' },
                { type: 'Button', children: '确认' },
              ],
            },
          ],
        },
        '2': {
          type: 'Card',
          children: [
            {
              type: 'CardHeader',
              children: [
                { type: 'CardTitle', children: '简单卡片' },
              ],
            },
            {
              type: 'CardContent',
              children: [
                {
                  type: 'Stack',
                  props: { gap: 2 },
                  children: [
                    { type: 'Text', children: '行 1: 内容' },
                    { type: 'Text', children: '行 2: 内容' },
                    { type: 'Text', children: '行 3: 内容' },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  ],
};

// Avatar 测试
const avatarTest: UINode = {
  type: 'Section',
  props: { title: 'Avatar (shadcn)', subtitle: '头像组件' },
  children: [
    {
      type: 'Flex',
      props: { gap: 4, align: 'center' },
      children: [
        {
          type: 'Avatar',
          children: [
            { type: 'AvatarImage', props: { src: 'https://github.com/shadcn.png', alt: 'User' } },
            { type: 'AvatarFallback', children: 'CN' },
          ],
        },
        {
          type: 'Avatar',
          children: [
            { type: 'AvatarFallback', children: 'JD' },
          ],
        },
        {
          type: 'Avatar',
          children: [
            { type: 'AvatarFallback', children: 'AB' },
          ],
        },
      ],
    },
  ],
};

// Progress 测试
const progressTest: UINode = {
  type: 'Section',
  props: { title: 'Progress (shadcn)', subtitle: '进度条' },
  children: [
    {
      type: 'Stack',
      props: { gap: 4 },
      children: [
        {
          type: 'Flex',
          props: { gap: 2, align: 'center' },
          children: [
            { type: 'Text', props: { variant: 'muted' }, children: '25%' },
            { type: 'Progress', props: { value: 25, className: 'flex-1' } },
          ],
        },
        {
          type: 'Flex',
          props: { gap: 2, align: 'center' },
          children: [
            { type: 'Text', props: { variant: 'muted' }, children: '50%' },
            { type: 'Progress', props: { value: 50, className: 'flex-1' } },
          ],
        },
        {
          type: 'Flex',
          props: { gap: 2, align: 'center' },
          children: [
            { type: 'Text', props: { variant: 'muted' }, children: '75%' },
            { type: 'Progress', props: { value: 75, className: 'flex-1' } },
          ],
        },
        {
          type: 'Flex',
          props: { gap: 2, align: 'center' },
          children: [
            { type: 'Text', props: { variant: 'muted' }, children: '100%' },
            { type: 'Progress', props: { value: 100, className: 'flex-1' } },
          ],
        },
      ],
    },
  ],
};

// Tabs 测试
const tabsTest: UINode = {
  type: 'Section',
  props: { title: 'Tabs (shadcn)', subtitle: '选项卡' },
  children: [
    {
      type: 'Tabs',
      props: { defaultValue: 'tab1' },
      children: [
        {
          type: 'TabsList',
          children: [
            { type: 'TabsTrigger', props: { value: 'tab1' }, children: '选项卡 1' },
            { type: 'TabsTrigger', props: { value: 'tab2' }, children: '选项卡 2' },
            { type: 'TabsTrigger', props: { value: 'tab3' }, children: '选项卡 3' },
          ],
        },
        {
          type: 'TabsContent',
          props: { value: 'tab1' },
          children: [
            {
              type: 'Card',
              props: { className: 'p-4' },
              children: [{ type: 'Text', children: '选项卡 1 的内容' }],
            },
          ],
        },
        {
          type: 'TabsContent',
          props: { value: 'tab2' },
          children: [
            {
              type: 'Card',
              props: { className: 'p-4' },
              children: [{ type: 'Text', children: '选项卡 2 的内容' }],
            },
          ],
        },
        {
          type: 'TabsContent',
          props: { value: 'tab3' },
          children: [
            {
              type: 'Card',
              props: { className: 'p-4' },
              children: [{ type: 'Text', children: '选项卡 3 的内容' }],
            },
          ],
        },
      ],
    },
  ],
};

// Accordion 测试
const accordionTest: UINode = {
  type: 'Section',
  props: { title: 'Accordion (shadcn)', subtitle: '手风琴' },
  children: [
    {
      type: 'Accordion',
      props: { type: 'single', collapsible: true },
      children: [
        {
          type: 'AccordionItem',
          props: { value: 'item-1' },
          children: [
            { type: 'AccordionTrigger', children: '什么是 Stitch？' },
            { type: 'AccordionContent', children: 'Stitch 是一个 JSON 到 React 组件的渲染引擎。' },
          ],
        },
        {
          type: 'AccordionItem',
          props: { value: 'item-2' },
          children: [
            { type: 'AccordionTrigger', children: '如何使用？' },
            { type: 'AccordionContent', children: '只需要定义 JSON Schema，然后使用 StitchRenderer 组件渲染即可。' },
          ],
        },
        {
          type: 'AccordionItem',
          props: { value: 'item-3' },
          children: [
            { type: 'AccordionTrigger', children: '支持哪些组件？' },
            { type: 'AccordionContent', children: '支持 80+ 组件，包括 shadcn/ui 原生组件和自定义扩展组件。' },
          ],
        },
      ],
    },
  ],
};

// Table 测试
const tableTest: UINode = {
  type: 'Section',
  props: { title: 'Table (shadcn)', subtitle: '表格' },
  children: [
    {
      type: 'Card',
      children: [
        {
          type: 'Table',
          children: [
            {
              type: 'TableHeader',
              children: [
                {
                  type: 'TableRow',
                  children: [
                    { type: 'TableHead', children: 'ID' },
                    { type: 'TableHead', children: '名称' },
                    { type: 'TableHead', children: '状态' },
                    { type: 'TableHead', children: '操作' },
                  ],
                },
              ],
            },
            {
              type: 'TableBody',
              children: [
                {
                  type: 'TableRow',
                  children: [
                    { type: 'TableCell', children: '001' },
                    { type: 'TableCell', children: '项目 A' },
                    { type: 'TableCell', children: [{ type: 'Badge', children: '进行中' }] },
                    { type: 'TableCell', children: [{ type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: '查看' }] },
                  ],
                },
                {
                  type: 'TableRow',
                  children: [
                    { type: 'TableCell', children: '002' },
                    { type: 'TableCell', children: '项目 B' },
                    { type: 'TableCell', children: [{ type: 'Badge', props: { variant: 'secondary' }, children: '已完成' }] },
                    { type: 'TableCell', children: [{ type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: '查看' }] },
                  ],
                },
                {
                  type: 'TableRow',
                  children: [
                    { type: 'TableCell', children: '003' },
                    { type: 'TableCell', children: '项目 C' },
                    { type: 'TableCell', children: [{ type: 'Badge', props: { variant: 'outline' }, children: '待审核' }] },
                    { type: 'TableCell', children: [{ type: 'Button', props: { variant: 'ghost', size: 'sm' }, children: '查看' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Text 变体测试
const textTest: UINode = {
  type: 'Section',
  props: { title: 'Text 组件', subtitle: '文本变体' },
  children: [
    {
      type: 'Stack',
      props: { gap: 4 },
      children: [
        { type: 'Text', props: { variant: 'title' }, children: 'Title 变体' },
        { type: 'Text', props: { variant: 'subtitle' }, children: 'Subtitle 变体' },
        { type: 'Text', props: { variant: 'large' }, children: 'Large 变体' },
        { type: 'Text', props: { variant: 'default' }, children: 'Default 变体' },
        { type: 'Text', props: { variant: 'muted' }, children: 'Muted 变体' },
        { type: 'Text', props: { variant: 'small' }, children: 'Small 变体' },
      ],
    },
  ],
};

// ============================================
// 主页面
// ============================================

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <StitchRenderer schema={heroTest} />

      <div className="container mx-auto py-8 space-y-16">
        {/* 布局组件 - Slot 模式 */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold border-b pb-4">布局组件 - Slot 模式</h2>
          <StitchRenderer schema={gridTest} />
          <StitchRenderer schema={columnsTest} />
          <StitchRenderer schema={splitTest} />
          <StitchRenderer schema={rowsTest} />
        </div>

        {/* 布局组件 - Children 模式 */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold border-b pb-4">布局组件 - Children 模式</h2>
          <StitchRenderer schema={stackTest} />
          <StitchRenderer schema={flexTest} />
          <StitchRenderer schema={centerTest} />
          <StitchRenderer schema={spacerDividerTest} />
        </div>

        {/* 自定义组件 */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold border-b pb-4">自定义扩展组件</h2>
          <StitchRenderer schema={iconTest} />
          <StitchRenderer schema={textTest} />
          <StitchRenderer schema={codeBlockTest} />
          <StitchRenderer schema={statisticTest} />
          <StitchRenderer schema={timelineTest} />
          <StitchRenderer schema={stepperTest} />
          <StitchRenderer schema={listTest} />
          <StitchRenderer schema={emptyStateTest} />
        </div>

        {/* shadcn 官方组件 */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold border-b pb-4">shadcn 官方组件</h2>
          <StitchRenderer schema={buttonTest} />
          <StitchRenderer schema={badgeTest} />
          <StitchRenderer schema={alertTest} />
          <StitchRenderer schema={cardTest} />
          <StitchRenderer schema={avatarTest} />
          <StitchRenderer schema={progressTest} />
          <StitchRenderer schema={tabsTest} />
          <StitchRenderer schema={accordionTest} />
          <StitchRenderer schema={tableTest} />
        </div>
      </div>
    </div>
  );
}

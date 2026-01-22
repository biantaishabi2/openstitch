'use client';

import { StitchRenderer } from '@/lib/renderer';
import type { UINode } from '@/lib/renderer';

// 示例1：三栏架构图
const architectureSchema: UINode = {
  type: 'Page',
  props: { padding: 8 },
  children: [
    {
      type: 'Section',
      props: { title: 'RLM 核心架构', subtitle: '规划层与执行层的协作机制' },
      children: [
        {
          type: 'Grid',
          props: { columns: 3, gap: 6 },
          slots: {
            '1': {
              type: 'Card',
              children: [
                {
                  type: 'CardHeader',
                  children: [
                    {
                      type: 'Flex',
                      props: { align: 'center', gap: 2 },
                      children: [
                        { type: 'Icon', props: { name: 'Cpu', size: 'lg' } },
                        { type: 'CardTitle', children: '规划层' },
                      ],
                    },
                  ],
                },
                {
                  type: 'CardContent',
                  children: [
                    { type: 'Text', children: 'Controller.run/2' },
                    {
                      type: 'Text',
                      props: { variant: 'muted' },
                      children: 'Elixir 控制器，负责迭代循环',
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
                  children: [
                    {
                      type: 'Flex',
                      props: { align: 'center', gap: 2 },
                      children: [
                        { type: 'Icon', props: { name: 'Terminal', size: 'lg' } },
                        { type: 'CardTitle', children: 'Python REPL' },
                      ],
                    },
                  ],
                },
                {
                  type: 'CardContent',
                  children: [
                    { type: 'Text', children: '沙箱执行环境' },
                    {
                      type: 'Text',
                      props: { variant: 'muted' },
                      children: 'TOOL_REQUEST/RESPONSE 协议',
                    },
                  ],
                },
              ],
            },
            '3': {
              type: 'Card',
              children: [
                {
                  type: 'CardHeader',
                  children: [
                    {
                      type: 'Flex',
                      props: { align: 'center', gap: 2 },
                      children: [
                        { type: 'Icon', props: { name: 'Wrench', size: 'lg' } },
                        { type: 'CardTitle', children: '执行层' },
                      ],
                    },
                  ],
                },
                {
                  type: 'CardContent',
                  children: [
                    { type: 'Text', children: 'OpenCode / 工具集' },
                    {
                      type: 'Text',
                      props: { variant: 'muted' },
                      children: 'handle_opencode_call/7',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  ],
};

// 示例2：左右分栏
const splitSchema: UINode = {
  type: 'Section',
  props: { title: '代码示例' },
  children: [
    {
      type: 'Split',
      props: { ratio: '1:1', gap: 6 },
      slots: {
        left: {
          type: 'CodeBlock',
          props: {
            language: 'elixir',
            filename: 'controller.ex',
            code: `def run(task, opts) do
  with {:ok, plan} <- Planner.call(task),
       {:ok, result} <- PythonRepl.exec(plan) do
    handle_result(result)
  end
end`,
          },
        },
        right: {
          type: 'Stack',
          props: { gap: 4 },
          children: [
            { type: 'Text', props: { variant: 'title' }, children: '核心控制流' },
            {
              type: 'Text',
              children:
                'Controller.run/2 是 RLM 的主入口，负责协调规划层和执行层的交互。',
            },
            {
              type: 'List',
              props: { divided: true },
              children: [
                {
                  type: 'ListItem',
                  props: {
                    title: 'Planner.call',
                    description: '调用规划器生成 REPL 代码',
                  },
                },
                {
                  type: 'ListItem',
                  props: {
                    title: 'PythonRepl.exec',
                    description: '在沙箱中执行代码',
                  },
                },
                {
                  type: 'ListItem',
                  props: {
                    title: 'handle_result',
                    description: '处理执行结果，决定下一步',
                  },
                },
              ],
            },
          ],
        },
      },
    },
  ],
};

// 示例3：统计卡片（简化版，不用icon）
const statisticsSchema: UINode = {
  type: 'Section',
  props: { title: '运行统计' },
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
                title: '总任务数',
                value: 1234,
                trend: 'up',
                trendValue: '+12%',
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
                title: '成功率',
                value: '98.5%',
                trend: 'up',
                trendValue: '+2.1%',
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
                title: '平均耗时',
                value: '2.3s',
                trend: 'down',
                trendValue: '-0.5s',
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
                title: '错误数',
                value: 18,
                trend: 'down',
                trendValue: '-5',
              },
            },
          ],
        },
      },
    },
  ],
};

// 示例4：时间线
const timelineSchema: UINode = {
  type: 'Section',
  props: { title: '主循环流程' },
  children: [
    {
      type: 'Timeline',
      props: { size: 'md' },
      children: [
        {
          type: 'TimelineItem',
          props: {
            title: '初始化环境',
            description: '加载 system_prompt、planner、workspace',
            status: 'completed',
          },
        },
        {
          type: 'TimelineItem',
          props: {
            title: '动态注入 Anchor',
            description: '从 REPL 读取 TODO dict，构建目标摘要',
            status: 'completed',
          },
        },
        {
          type: 'TimelineItem',
          props: {
            title: '调用规划器',
            description: 'call_planner/3 生成 REPL 代码块',
            status: 'in-progress',
          },
        },
        {
          type: 'TimelineItem',
          props: {
            title: '执行与回传',
            description: 'PythonRepl.exec/3 执行代码，结果回灌',
            status: 'pending',
          },
        },
      ],
    },
  ],
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <StitchRenderer
        schema={{
          type: 'Hero',
          props: {
            title: 'Stitch 渲染引擎演示',
            subtitle: 'JSON → React 组件',
            description: '通过声明式的 JSON Schema 生成完整的 UI 界面',
            size: 'md',
          },
        }}
      />

      {/* 架构图 */}
      <div className="container mx-auto py-8">
        <StitchRenderer schema={architectureSchema} config={{ debug: true }} />
      </div>

      {/* 统计卡片 */}
      <div className="container mx-auto py-8">
        <StitchRenderer schema={statisticsSchema} />
      </div>

      {/* 代码示例 */}
      <div className="container mx-auto py-8">
        <StitchRenderer schema={splitSchema} />
      </div>

      {/* 时间线 */}
      <div className="container mx-auto py-8 max-w-2xl">
        <StitchRenderer schema={timelineSchema} />
      </div>
    </div>
  );
}

# Stitch 渲染引擎设计文档

## 1. 概述

Stitch 是一个 **JSON→React组件** 的映射渲染引擎。通过声明式的 JSON 描述，自动组装 shadcn/ui 组件，最终输出可用的 React 界面或静态 HTML。

### 核心思想：骨架先行，插槽填充

```
1. 先声明布局骨架（Grid/Flex/Columns）
2. 骨架自带插槽（slots）
3. 往插槽里填充组件
```

### 核心流程

```
JSON Schema  →  渲染器(Renderer)  →  React组件树  →  HTML/DOM
     ↓              ↓                    ↓
  声明式描述      查表+递归组装         ReactDOM渲染
```

## 2. 架构设计

### 2.1 三层架构

```
┌─────────────────────────────────────────────────┐
│                  输入层 (Input)                  │
│  JSON Schema - 描述页面结构、组件类型、属性      │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                 转换层 (Transform)               │
│  1. 解析布局骨架（Grid/Flex/Columns）            │
│  2. 创建插槽占位符                               │
│  3. 查找组件映射表，填充插槽                     │
│  4. 递归渲染子节点                               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                  输出层 (Output)                 │
│  React 组件树 / HTML 字符串 / DOM               │
└─────────────────────────────────────────────────┘
```

### 2.2 渲染流程详解

```
render(rootNode)
    │
    ├─→ 解析布局节点（Grid/Flex/Columns）
    │       │
    │       └─→ 根据 columns/direction 创建插槽结构
    │
    ├─→ 处理 slots（插槽填充）
    │       │
    │       └─→ 遍历 slots 对象，将组件填入对应位置
    │
    ├─→ 处理 children（普通子节点）
    │       │
    │       └─→ 递归渲染每个子节点
    │
    └─→ 返回组装好的 React 组件树
```

## 3. JSON Schema 设计

### 3.1 基本结构

```typescript
interface UINode {
  type: string;                    // 组件类型
  props?: Record<string, any>;     // 组件属性
  slots?: Record<string, UINode>;  // 插槽（用于布局组件）
  children?: UINode[] | string;    // 子节点或文本
  id?: string;                     // 可选，用于DOM映射
}
```

### 3.2 两种子节点模式

**模式1：slots（插槽式，用于布局）**
- 明确指定位置
- 适合 Grid、Columns 等需要精确定位的场景

```json
{
  "type": "Grid",
  "props": { "columns": 3 },
  "slots": {
    "1": { "type": "Card", "children": "第1列" },
    "2": { "type": "Card", "children": "第2列" },
    "3": { "type": "Card", "children": "第3列" }
  }
}
```

**模式2：children（顺序式，用于普通容器）**
- 按顺序渲染
- 适合 Card、Section 等内容容器

```json
{
  "type": "Card",
  "children": [
    { "type": "CardHeader", "children": "标题" },
    { "type": "CardContent", "children": "内容" }
  ]
}
```

## 4. 布局系统

### 4.1 布局组件列表

| 组件 | 用途 | 插槽命名 |
|-----|-----|---------|
| `Grid` | 网格布局 | "1", "2", "3"... 或 "row-col" |
| `Columns` | 多列布局 | "left", "center", "right" 或 "1", "2"... |
| `Rows` | 多行布局 | "1", "2", "3"... |
| `Flex` | 弹性布局 | 使用 children 顺序排列 |
| `Split` | 左右分栏 | "left", "right" |
| `Stack` | 垂直堆叠 | 使用 children 顺序排列 |

### 4.2 Grid 布局

```json
{
  "type": "Grid",
  "props": {
    "columns": 3,
    "gap": 4,
    "responsive": { "sm": 1, "md": 2, "lg": 3 }
  },
  "slots": {
    "1": { "type": "Card", "children": "规划层" },
    "2": { "type": "Card", "children": "Python REPL" },
    "3": { "type": "Card", "children": "执行层" }
  }
}
```

渲染结果：
```html
<div class="grid grid-cols-3 gap-4">
  <div data-slot="1"><!-- Card --></div>
  <div data-slot="2"><!-- Card --></div>
  <div data-slot="3"><!-- Card --></div>
</div>
```

### 4.3 Columns 布局（语义化）

```json
{
  "type": "Columns",
  "props": { "layout": "1:2:1" },
  "slots": {
    "left": { "type": "Sidebar" },
    "center": { "type": "MainContent" },
    "right": { "type": "Sidebar" }
  }
}
```

### 4.4 Split 布局（左右分栏）

```json
{
  "type": "Split",
  "props": { "ratio": "1:1" },
  "slots": {
    "left": { "type": "Card", "children": "左边内容" },
    "right": { "type": "Card", "children": "右边内容" }
  }
}
```

### 4.5 Stack 布局（垂直堆叠）

```json
{
  "type": "Stack",
  "props": { "gap": 4 },
  "children": [
    { "type": "Hero", "props": { "title": "标题" } },
    { "type": "Section", "children": "..." },
    { "type": "Footer" }
  ]
}
```

### 4.6 跨列/跨行

```json
{
  "type": "Grid",
  "props": { "columns": 3 },
  "slots": {
    "1": { "type": "Card", "props": { "span": 2 }, "children": "跨2列" },
    "3": { "type": "Card", "children": "第3列" }
  }
}
```

## 5. 组件映射表

### 5.1 布局组件

```typescript
const LayoutComponents = {
  // 网格布局
  Grid: ({ columns, gap, responsive, slots, children }) => {
    // 根据 slots 创建网格
  },

  // 多列布局
  Columns: ({ layout, slots }) => {
    // 根据 layout 比例分配宽度
  },

  // 左右分栏
  Split: ({ ratio, slots }) => {
    // left/right 两个插槽
  },

  // 垂直堆叠
  Stack: ({ gap, children }) => {
    // 垂直排列 children
  },

  // 弹性布局
  Flex: ({ direction, justify, align, gap, children }) => {
    // flexbox 布局
  },
};
```

### 5.2 完整组件分类

| 分类 | 组件 |
|-----|-----|
| **布局** | Grid, Columns, Split, Stack, Flex, Rows |
| **页面** | Page, Section, Container, Hero |
| **容器** | Card, CardHeader, CardContent, CardFooter |
| **导航** | Tabs, TabsList, TabsTrigger, TabsContent, Breadcrumb, Stepper |
| **数据展示** | Table, Timeline, Accordion, List, ListItem, Statistic, CodeBlock |
| **表单** | Button, Input, Select, Checkbox, Switch, Slider |
| **反馈** | Alert, Badge, Progress, Dialog, Tooltip, EmptyState |
| **媒体** | Icon, Avatar, Image |

## 6. 渲染器实现

### 6.1 核心代码

```typescript
function render(node: UINode | string): React.ReactNode {
  // 1. 文本节点直接返回
  if (typeof node === 'string') return node;

  // 2. 查找组件
  const Component = ComponentMap[node.type];
  if (!Component) {
    console.warn(`Unknown component: ${node.type}`);
    return null;
  }

  // 3. 处理插槽（布局组件）
  let renderedSlots: Record<string, React.ReactNode> | undefined;
  if (node.slots) {
    renderedSlots = {};
    for (const [slotName, slotNode] of Object.entries(node.slots)) {
      renderedSlots[slotName] = render(slotNode);
    }
  }

  // 4. 处理子节点
  let children: React.ReactNode = null;
  if (node.children) {
    if (Array.isArray(node.children)) {
      children = node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child)}</React.Fragment>
      ));
    } else {
      children = render(node.children);
    }
  }

  // 5. 返回组件
  return (
    <Component {...node.props} slots={renderedSlots}>
      {children}
    </Component>
  );
}
```

### 6.2 布局组件实现示例

```typescript
// Grid 组件
const Grid: React.FC<GridProps> = ({ columns = 3, gap = 4, slots, children }) => {
  return (
    <div className={`grid grid-cols-${columns} gap-${gap}`}>
      {slots
        ? Object.entries(slots).map(([key, content]) => (
            <div key={key} data-slot={key}>{content}</div>
          ))
        : children
      }
    </div>
  );
};

// Split 组件
const Split: React.FC<SplitProps> = ({ ratio = '1:1', slots }) => {
  const [left, right] = ratio.split(':').map(Number);
  return (
    <div className="flex">
      <div style={{ flex: left }}>{slots?.left}</div>
      <div style={{ flex: right }}>{slots?.right}</div>
    </div>
  );
};
```

## 7. 完整示例

### 7.1 PPT 标题页

```json
{
  "type": "Page",
  "props": { "className": "min-h-screen" },
  "children": [
    {
      "type": "Hero",
      "props": {
        "title": "RLM 机制调研总结",
        "subtitle": "聚焦控制器、规划与执行层分工",
        "size": "full",
        "align": "center"
      }
    }
  ]
}
```

### 7.2 三栏架构图

```json
{
  "type": "Page",
  "children": [
    {
      "type": "Section",
      "props": { "title": "RLM 核心架构" },
      "children": [
        {
          "type": "Grid",
          "props": { "columns": 3, "gap": 6 },
          "slots": {
            "1": {
              "type": "Card",
              "children": [
                { "type": "CardHeader", "children": [
                  { "type": "Icon", "props": { "name": "Cpu" } },
                  { "type": "CardTitle", "children": "规划层" }
                ]},
                { "type": "CardContent", "children": [
                  { "type": "Text", "children": "Controller.run/2" },
                  { "type": "Text", "props": { "variant": "muted" }, "children": "Elixir 控制器" }
                ]}
              ]
            },
            "2": {
              "type": "Card",
              "children": [
                { "type": "CardHeader", "children": [
                  { "type": "Icon", "props": { "name": "Terminal" } },
                  { "type": "CardTitle", "children": "Python REPL" }
                ]},
                { "type": "CardContent", "children": [
                  { "type": "Text", "children": "沙箱执行环境" },
                  { "type": "Text", "props": { "variant": "muted" }, "children": "TOOL_REQUEST 协议" }
                ]}
              ]
            },
            "3": {
              "type": "Card",
              "children": [
                { "type": "CardHeader", "children": [
                  { "type": "Icon", "props": { "name": "Wrench" } },
                  { "type": "CardTitle", "children": "执行层" }
                ]},
                { "type": "CardContent", "children": [
                  { "type": "Text", "children": "OpenCode / 工具集" },
                  { "type": "Text", "props": { "variant": "muted" }, "children": "handle_opencode_call/7" }
                ]}
              ]
            }
          }
        }
      ]
    }
  ]
}
```

### 7.3 时间线流程页

```json
{
  "type": "Page",
  "children": [
    {
      "type": "Section",
      "props": { "title": "主循环流程" },
      "children": [
        {
          "type": "Timeline",
          "props": { "size": "md" },
          "children": [
            {
              "type": "TimelineItem",
              "props": {
                "title": "初始化环境",
                "description": "加载 system_prompt、planner、workspace",
                "status": "completed",
                "icon": { "type": "Icon", "props": { "name": "Play" } }
              }
            },
            {
              "type": "TimelineItem",
              "props": {
                "title": "动态注入 Anchor",
                "description": "从 REPL 读取 TODO dict，构建目标摘要",
                "status": "completed"
              }
            },
            {
              "type": "TimelineItem",
              "props": {
                "title": "调用规划器",
                "description": "call_planner/3 生成 REPL 代码块",
                "status": "in-progress"
              }
            },
            {
              "type": "TimelineItem",
              "props": {
                "title": "执行与回传",
                "description": "PythonRepl.exec/3 执行代码，结果回灌",
                "status": "pending"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 7.4 左右分栏（代码+说明）

```json
{
  "type": "Split",
  "props": { "ratio": "1:1", "gap": 8 },
  "slots": {
    "left": {
      "type": "CodeBlock",
      "props": {
        "language": "elixir",
        "filename": "controller.ex",
        "code": "def run(task, opts) do\n  with {:ok, plan} <- Planner.call(task),\n       {:ok, result} <- PythonRepl.exec(plan) do\n    handle_result(result)\n  end\nend"
      }
    },
    "right": {
      "type": "Stack",
      "props": { "gap": 4 },
      "children": [
        { "type": "Text", "props": { "variant": "title" }, "children": "核心控制流" },
        { "type": "Text", "children": "Controller.run/2 是 RLM 的主入口，负责协调规划层和执行层的交互。" },
        {
          "type": "List",
          "children": [
            { "type": "ListItem", "props": { "title": "Planner.call", "description": "调用规划器生成代码" } },
            { "type": "ListItem", "props": { "title": "PythonRepl.exec", "description": "在沙箱中执行代码" } },
            { "type": "ListItem", "props": { "title": "handle_result", "description": "处理执行结果" } }
          ]
        }
      ]
    }
  }
}
```

## 8. 导出功能

### 8.1 导出为 HTML

```typescript
import { renderToString } from 'react-dom/server';

function exportToHTML(schema: UINode): string {
  const element = render(schema);
  const html = renderToString(element);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="styles.css" rel="stylesheet">
</head>
<body class="bg-background text-foreground">
  <div id="root">${html}</div>
</body>
</html>`;
}
```

### 8.2 CSS 提取

```bash
npx tailwindcss -i ./src/app/globals.css -o ./output/styles.css --minify
```

## 9. 后续规划

1. **Schema 校验**：使用 Zod 定义严格的类型
2. **可视化编辑器**：拖拽编辑 JSON
3. **DOM 双向映射**：点击界面定位到 JSON 节点
4. **主题系统**：切换配色方案
5. **模板库**：预置常用页面模板

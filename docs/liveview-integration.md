# Stitch LiveView 集成方案

## 概述

Stitch 是一个 JSON Schema 驱动的 UI 渲染引擎。本文档描述如何将 Stitch 与 Phoenix LiveView 集成，实现：

- **设计阶段**: 使用 React 渲染器实时预览
- **部署阶段**: 导出为 LiveView 组件，在 Phoenix 应用中运行

## 项目结构

采用 monorepo 方式组织，React 和 LiveView 实现放在同一仓库：

```
stitch/
├── src/                          # React 渲染器（设计预览）
│   ├── components/ui/            # shadcn 组件
│   ├── lib/renderer/             # JSON Schema 渲染器
│   └── data/schemas/             # JSON Schema 示例
│
├── packages/
│   └── liveview/                 # LiveView 组件库（生产运行）
│       ├── lib/
│       │   └── stitch_ui/
│       │       ├── components/   # 组件实现
│       │       │   ├── button.ex
│       │       │   ├── card.ex
│       │       │   ├── badge.ex
│       │       │   ├── tabs.ex
│       │       │   └── ...
│       │       ├── layouts/      # 布局组件
│       │       │   ├── flex.ex
│       │       │   ├── stack.ex
│       │       │   └── grid.ex
│       │       ├── exporter.ex   # JSON → HEEx 导出器
│       │       └── stitch_ui.ex  # 主模块
│       ├── mix.exs
│       └── README.md
│
├── docs/
│   └── liveview-integration.md   # 本文档
│
└── scripts/
    └── export-static.tsx         # 静态 HTML 导出
```

**优势：**
- JSON Schema 定义与两套实现放一起，方便同步
- 开发时可以同时验证 React 和 LiveView 输出
- 以后可以将 `packages/liveview` 发布为独立 Hex 包

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                      JSON Schema                            │
│  { "type": "Button", "props": {...}, "children": "..." }   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     React 渲染器         │     │    HEEx 导出器          │
│  (设计 & 预览)           │     │  (生成 LiveView 代码)   │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   浏览器实时预览         │     │   Phoenix 应用运行      │
│   - 快速迭代             │     │   - 服务端渲染          │
│   - 所见即所得           │     │   - 完整交互            │
└─────────────────────────┘     └─────────────────────────┘
```

## 工作流

### 1. 设计阶段

使用现有的 React Demo 页面设计 UI：

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3002/demo
# 实时预览和调整 JSON Schema
```

### 2. 导出阶段

将 JSON Schema 导出为 HEEx 模板：

```bash
# 导出为 HEEx（计划中）
mix stitch.export schema.json --output lib/my_app_web/components/page.ex
```

### 3. 运行阶段

在 Phoenix 应用中使用生成的 LiveView 组件：

```elixir
defmodule MyAppWeb.PageLive do
  use MyAppWeb, :live_view

  def render(assigns) do
    ~H"""
    <.stitch_page schema={@schema} />
    """
  end
end
```

## 组件映射

### 映射规则

| JSON Schema Type | React 组件 | LiveView 组件 |
|-----------------|-----------|--------------|
| `Button` | `<Button>` | `<.button>` |
| `Card` | `<Card>` | `<.card>` |
| `Input` | `<Input>` | `<.input>` |
| `Tabs` | `<Tabs>` | `<.tabs>` |
| `Dialog` | `<Dialog>` | `<.modal>` |
| `Alert` | `<Alert>` | `<.alert>` |
| ... | ... | ... |

### 属性映射

```json
// JSON Schema
{
  "type": "Button",
  "props": {
    "variant": "primary",
    "size": "lg",
    "onClick": "submit_form"
  },
  "children": "提交"
}
```

```heex
<!-- 导出的 HEEx -->
<.button variant="primary" size="lg" phx-click="submit_form">
  提交
</.button>
```

### 事件映射

| JSON Schema | LiveView |
|-------------|----------|
| `onClick` | `phx-click` |
| `onChange` | `phx-change` |
| `onSubmit` | `phx-submit` |
| `onBlur` | `phx-blur` |
| `onFocus` | `phx-focus` |

## Phoenix 组件库

### 目录结构

```
lib/stitch_ui/
├── components/
│   ├── button.ex          # 按钮组件
│   ├── card.ex            # 卡片组件
│   ├── input.ex           # 输入框组件
│   ├── badge.ex           # 徽章组件
│   ├── alert.ex           # 提示组件
│   ├── tabs.ex            # 标签页组件
│   ├── table.ex           # 表格组件
│   ├── modal.ex           # 模态框组件
│   ├── progress.ex        # 进度条组件
│   ├── avatar.ex          # 头像组件
│   └── ...
├── layouts/
│   ├── flex.ex            # Flex 布局
│   ├── grid.ex            # Grid 布局
│   ├── stack.ex           # Stack 布局
│   └── ...
└── stitch_ui.ex           # 主模块，导出所有组件
```

### 组件实现示例

#### Button 组件

```elixir
defmodule StitchUI.Components.Button do
  use Phoenix.Component

  @variants %{
    "default" => "bg-primary text-primary-foreground hover:bg-primary/90",
    "secondary" => "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    "outline" => "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    "ghost" => "hover:bg-accent hover:text-accent-foreground",
    "link" => "text-primary underline-offset-4 hover:underline",
    "destructive" => "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  }

  @sizes %{
    "sm" => "h-9 px-3 text-sm",
    "default" => "h-10 px-4 py-2",
    "lg" => "h-11 px-8 text-lg",
    "icon" => "h-10 w-10"
  }

  attr :variant, :string, default: "default"
  attr :size, :string, default: "default"
  attr :class, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :rest, :global, include: ~w(phx-click phx-target phx-disable-with)
  slot :inner_block, required: true

  def button(assigns) do
    ~H"""
    <button
      class={[
        "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium",
        "ring-offset-background transition-colors focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        @variants[@variant],
        @sizes[@size],
        @class
      ]}
      disabled={@disabled}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end
end
```

#### Card 组件

```elixir
defmodule StitchUI.Components.Card do
  use Phoenix.Component

  attr :class, :string, default: nil
  slot :inner_block, required: true

  def card(assigns) do
    ~H"""
    <div class={[
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      @class
    ]}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  slot :inner_block, required: true
  attr :class, :string, default: nil

  def card_header(assigns) do
    ~H"""
    <div class={["flex flex-col space-y-1.5 p-6", @class]}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  slot :inner_block, required: true
  attr :class, :string, default: nil

  def card_title(assigns) do
    ~H"""
    <h3 class={["text-2xl font-semibold leading-none tracking-tight", @class]}>
      <%= render_slot(@inner_block) %>
    </h3>
    """
  end

  slot :inner_block, required: true
  attr :class, :string, default: nil

  def card_description(assigns) do
    ~H"""
    <p class={["text-sm text-muted-foreground", @class]}>
      <%= render_slot(@inner_block) %>
    </p>
    """
  end

  slot :inner_block, required: true
  attr :class, :string, default: nil

  def card_content(assigns) do
    ~H"""
    <div class={["p-6 pt-0", @class]}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  slot :inner_block, required: true
  attr :class, :string, default: nil

  def card_footer(assigns) do
    ~H"""
    <div class={["flex items-center p-6 pt-0", @class]}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
```

#### Tabs 组件（有状态）

```elixir
defmodule StitchUI.Components.Tabs do
  use Phoenix.Component

  attr :id, :string, required: true
  attr :default_value, :string, required: true
  attr :class, :string, default: nil
  slot :inner_block, required: true

  def tabs(assigns) do
    ~H"""
    <div
      id={@id}
      class={@class}
      phx-hook="StitchTabs"
      data-default-value={@default_value}
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  slot :inner_block, required: true
  attr :class, :string, default: nil

  def tabs_list(assigns) do
    ~H"""
    <div class={[
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      @class
    ]}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :value, :string, required: true
  attr :class, :string, default: nil
  slot :inner_block, required: true

  def tabs_trigger(assigns) do
    ~H"""
    <button
      class={[
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5",
        "text-sm font-medium ring-offset-background transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        @class
      ]}
      data-value={@value}
      phx-click={JS.dispatch("stitch:tab-change", detail: %{value: @value})}
    >
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  attr :value, :string, required: true
  attr :class, :string, default: nil
  slot :inner_block, required: true

  def tabs_content(assigns) do
    ~H"""
    <div
      class={[
        "mt-2 ring-offset-background focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        @class
      ]}
      data-value={@value}
      data-state="inactive"
    >
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
```

## HEEx 导出器

### 核心逻辑

```elixir
defmodule Stitch.Exporter.HEEx do
  @moduledoc """
  将 JSON Schema 转换为 HEEx 模板
  """

  @doc """
  将 JSON Schema 导出为 HEEx 字符串
  """
  def export(schema) when is_map(schema) do
    render_node(schema, 0)
  end

  defp render_node(%{"type" => type, "props" => props, "children" => children}, indent) do
    component = map_component(type)
    attrs = render_attrs(props)
    inner = render_children(children, indent + 2)

    spaces = String.duplicate(" ", indent)

    """
    #{spaces}<.#{component}#{attrs}>
    #{inner}
    #{spaces}</.#{component}>
    """
  end

  defp render_node(%{"type" => type, "props" => props}, indent) do
    component = map_component(type)
    attrs = render_attrs(props)
    spaces = String.duplicate(" ", indent)

    "#{spaces}<.#{component}#{attrs} />"
  end

  defp render_node(text, indent) when is_binary(text) do
    spaces = String.duplicate(" ", indent)
    "#{spaces}#{text}"
  end

  defp render_children(children, indent) when is_list(children) do
    children
    |> Enum.map(&render_node(&1, indent))
    |> Enum.join("\n")
  end

  defp render_children(child, indent), do: render_node(child, indent)

  defp render_attrs(nil), do: ""
  defp render_attrs(props) when map_size(props) == 0, do: ""
  defp render_attrs(props) do
    props
    |> Enum.map(&render_attr/1)
    |> Enum.join("")
  end

  defp render_attr({"onClick", value}), do: ~s( phx-click="#{value}")
  defp render_attr({"onChange", value}), do: ~s( phx-change="#{value}")
  defp render_attr({"className", value}), do: ~s( class="#{value}")
  defp render_attr({key, value}) when is_binary(value), do: ~s( #{snake_case(key)}="#{value}")
  defp render_attr({key, value}) when is_number(value), do: ~s( #{snake_case(key)}={#{value}})
  defp render_attr({key, true}), do: ~s( #{snake_case(key)})
  defp render_attr({_key, false}), do: ""

  defp map_component("Button"), do: "button"
  defp map_component("Card"), do: "card"
  defp map_component("CardHeader"), do: "card_header"
  defp map_component("CardTitle"), do: "card_title"
  defp map_component("CardDescription"), do: "card_description"
  defp map_component("CardContent"), do: "card_content"
  defp map_component("CardFooter"), do: "card_footer"
  defp map_component("Input"), do: "input"
  defp map_component("Badge"), do: "badge"
  defp map_component("Alert"), do: "alert"
  defp map_component("Tabs"), do: "tabs"
  defp map_component("TabsList"), do: "tabs_list"
  defp map_component("TabsTrigger"), do: "tabs_trigger"
  defp map_component("TabsContent"), do: "tabs_content"
  defp map_component("Stack"), do: "stack"
  defp map_component("Flex"), do: "flex"
  defp map_component("Grid"), do: "grid"
  defp map_component("Text"), do: "text"
  defp map_component(type), do: String.downcase(type)

  defp snake_case(str) do
    str
    |> String.replace(~r/([A-Z])/, "_\\1")
    |> String.downcase()
    |> String.trim_leading("_")
  end
end
```

### Mix 任务

```elixir
defmodule Mix.Tasks.Stitch.Export do
  use Mix.Task

  @shortdoc "Export JSON Schema to HEEx template"

  def run([input_file | opts]) do
    output = Keyword.get(parse_opts(opts), :output, "output.heex")

    schema = input_file |> File.read!() |> Jason.decode!()
    heex = Stitch.Exporter.HEEx.export(schema)

    File.write!(output, heex)
    Mix.shell().info("Exported to #{output}")
  end

  defp parse_opts(opts) do
    {parsed, _, _} = OptionParser.parse(opts, switches: [output: :string])
    parsed
  end
end
```

## 从 shop 项目迁移

shop 项目已有完善的 LiveView 组件库（50+ 组件），可以作为基础进行改造。

### 现有组件清单（shop）

| 类别 | 组件 |
|-----|------|
| 基础 | Button, Badge/Tag, Card, Dropdown, Tooltip, Switch |
| 导航 | Breadcrumb, Tabs, BottomNavigation, MobileNavigation |
| 表单 | Input, Select, SearchableSelect, DatePicker, RangePicker, Cascader, TreeSelect |
| 数据 | Table, Timeline, Steps, Statistic, MetricCard, Progress |
| 反馈 | Modal, Alert, Flash |
| 图表 | AntVChart, CPU/Memory Gauge |

### 样式系统对比

**shop 当前样式（直接 Tailwind 颜色）：**
```elixir
# Tag 组件颜色映射
%{
  "primary" => ["bg-orange-100", "text-orange-800", "border-orange-200"],
  "info" => ["bg-blue-100", "text-blue-800", "border-blue-200"],
  "success" => ["bg-green-100", "text-green-800", "border-green-200"],
  "warning" => ["bg-yellow-100", "text-yellow-800", "border-yellow-200"],
  "danger" => ["bg-red-100", "text-red-800", "border-red-200"]
}

# Button 组件
"bg-zinc-900 hover:bg-zinc-700 text-white"
```

**shadcn/stitch 目标样式（CSS 变量）：**
```elixir
# 使用语义化颜色
%{
  "default" => ["bg-primary", "text-primary-foreground"],
  "secondary" => ["bg-secondary", "text-secondary-foreground"],
  "outline" => ["border", "border-input", "bg-background", "hover:bg-accent"],
  "ghost" => ["hover:bg-accent", "hover:text-accent-foreground"],
  "destructive" => ["bg-destructive", "text-destructive-foreground"]
}

# Button 组件
"bg-primary hover:bg-primary/90 text-primary-foreground"
```

### 迁移步骤

1. **复制组件到 stitch**
   ```bash
   # 从 shop 复制核心组件
   cp shop/lib/shop_web/components/card.ex stitch/packages/liveview/lib/stitch_ui/components/
   cp shop/lib/shop_web/components/tag.ex stitch/packages/liveview/lib/stitch_ui/components/badge.ex
   cp shop/lib/shop_web/components/tabs.ex stitch/packages/liveview/lib/stitch_ui/components/
   # ...
   ```

2. **更新颜色类名**
   ```elixir
   # 改前
   "bg-orange-100 text-orange-800"

   # 改后
   "bg-primary/10 text-primary"
   # 或
   "bg-primary text-primary-foreground"
   ```

3. **统一 API 命名**
   ```elixir
   # shop 风格
   attr :color, :string, values: ~w(primary info success warning danger)

   # shadcn 风格
   attr :variant, :string, values: ~w(default secondary outline ghost destructive)
   ```

4. **添加 CSS 变量支持**

## CSS 主题配置

在 Phoenix 项目中配置 Tailwind CSS 变量（与 shadcn 一致）：

```css
/* assets/css/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* ... 其他暗色主题变量 */
  }
}
```

```javascript
// assets/tailwind.config.js
module.exports = {
  content: [
    "./lib/**/*.ex",
    "./lib/**/*.heex",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... 其他颜色
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
```

## 实现路线图

## 组件覆盖范围（Components Showcase）

先覆盖 `components-showcase` 中出现的组件类型（共 93 个），确保页面可完整渲染。当前已全部覆盖。

**覆盖清单（按类别）**：

- 布局/结构：Div, Span, Layout, Stack, Flex, Grid, Columns, Rows, Split, Center, Spacer, LayoutDivider, Page, Section, Container, Hero
- 元素/媒体：Text, Link, Image, Icon, Avatar, AvatarImage, AvatarFallback
- 卡片：Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- 导航：Tabs, TabsList, TabsTrigger, TabsContent, Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, Stepper, Step
- 数据展示：Table, TableHeader, TableBody, TableRow, TableHead, TableCell, List, ListItem, Timeline, TimelineItem, TimelineContent, TimelineHeader, TimelineTitle, TimelineTime, TimelineDescription, TimelineConnector, TimelineEmpty, Statistic, StatisticCard, CodeBlock, InlineCode
- 表单/控件：Button, Input, Label, Checkbox, RadioGroup, RadioGroupItem, Switch, Slider
- 反馈/杂项：Alert, AlertTitle, AlertDescription, Badge, Progress, Skeleton, EmptyState, Separator, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Tooltip, TooltipProvider, TooltipTrigger, TooltipContent
- 折叠：Accordion, AccordionItem, AccordionTrigger, AccordionContent

## 实现原则（LiveView）

- **纯 LiveView**：不使用 `phx-hook`/自定义 JS，交互组件用 `phx-` 事件 + assigns 管理状态（Tabs demo 使用 `tabs-change`；Accordion 走 `<details>` 原生折叠，可选 `on_toggle` 事件）。
- **主题方案**：默认使用全局 CSS 变量（shadcn tokens）；保留根容器 `theme`/`style` 覆盖作为可选扩展。
- **导出器映射**：HEEx 导出需覆盖以上 69 个类型及其 slots/children 规则。
- **行为差异**：如遇无法纯 LiveView 复刻的交互，需明确降级行为并记录。

## TODO

- [x] 覆盖 `components-showcase` 的 93 个组件类型（按上方清单）
- [x] Tabs/Accordion/Stepper 用纯 LiveView（无 hook）实现基础交互
- [ ] 表单控件交互示例：Checkbox/Radio/Switch/Slider 的 LiveView 状态与事件
- [ ] CodeBlock 语法高亮与 Copy 行为（需要 JS 或服务器推送提示）
- [ ] 主题方案 helper：Elixir 侧生成 CSS 变量（当前仅支持 style/data-theme 透传）
- [ ] 记录不可纯 LiveView 复刻的交互（Dialog/Tooltip 等）及降级方案

### 阶段 0: 项目初始化
- [ ] 创建 `packages/liveview` 目录结构
- [ ] 初始化 mix.exs（stitch_ui 包）
- [ ] 配置 CSS 变量和 Tailwind

### 阶段 1: 基础组件迁移（从 shop）
- [ ] Button（shop: core_components.ex → 改造样式）
- [ ] Badge（shop: tag.ex → 重命名 + 改造）
- [ ] Card（shop: card.ex → 改造样式）
- [ ] Alert（shop: core_components.ex → 改造）
- [ ] Input, Label, Checkbox, Switch

### 阶段 2: 布局组件
- [ ] Stack, Flex, Grid（新建，参考 React 版本）
- [ ] Columns, Split, Rows
- [ ] Container, Center, Spacer

### 阶段 3: 复杂组件迁移
- [ ] Tabs（shop: tabs.ex → 改造）
- [ ] Accordion（新建）
- [ ] Modal/Dialog（shop: core_components.ex → 改造）
- [ ] Tooltip（shop: tooltip.ex → 改造）
- [ ] Progress（shop: progress.ex → 改造）

### 阶段 4: 数据展示迁移
- [ ] Table（shop: table.ex → 改造）
- [ ] Timeline（shop: timeline.ex → 改造）
- [ ] Statistic（shop: statistic.ex → 改造）
- [ ] Steps（shop: steps.ex → 改造）
- [ ] List（新建）

### 阶段 5: 导出器
- [ ] JSON Schema 解析（Elixir）
- [ ] HEEx 代码生成
- [ ] Mix 任务：`mix stitch.export`
- [ ] 事件映射（onClick → phx-click）

### 阶段 6: 集成测试
- [ ] 在 zcpg 项目中测试组件
- [ ] 验证 JSON Schema → LiveView 完整流程
- [ ] 性能优化

---

## 详细实现步骤

### 阶段 0: 项目初始化

#### 步骤 0.1: 创建目录结构

```bash
# 在 stitch 项目根目录执行
mkdir -p packages/liveview/lib/stitch_ui/{components,layouts}
mkdir -p packages/liveview/test/stitch_ui
```

#### 步骤 0.2: 创建 mix.exs

```bash
cat > packages/liveview/mix.exs << 'EOF'
defmodule StitchUI.MixProject do
  use Mix.Project

  def project do
    [
      app: :stitch_ui,
      version: "0.1.0",
      elixir: "~> 1.14",
      deps: deps()
    ]
  end

  def application do
    [extra_applications: [:logger]]
  end

  defp deps do
    [
      {:phoenix_live_view, "~> 0.20"},
      {:jason, "~> 1.4"}
    ]
  end
end
EOF
```

#### 步骤 0.3: 创建主模块

```bash
cat > packages/liveview/lib/stitch_ui.ex << 'EOF'
defmodule StitchUI do
  @moduledoc """
  Stitch UI 组件库 - shadcn 风格的 Phoenix LiveView 组件
  """

  defmacro __using__(_opts) do
    quote do
      import StitchUI.Components.Button
      import StitchUI.Components.Card
      import StitchUI.Components.Badge
      import StitchUI.Layouts.Stack
      import StitchUI.Layouts.Flex
      import StitchUI.Layouts.Grid
    end
  end
end
EOF
```

#### 步骤 0.4: 配置 CSS 变量

在目标 Phoenix 项目的 `assets/css/app.css` 添加 CSS 变量（参考上文 CSS 主题配置章节）。

在 `assets/tailwind.config.js` 添加颜色扩展（参考上文配置）。

### 阶段 1: 基础组件迁移

#### 步骤 1.1: Button 组件

```bash
# 从 shop 复制并改造
cp /path/to/shop/lib/shop_web/components/button.ex \
   packages/liveview/lib/stitch_ui/components/button.ex

# 修改内容：
# 1. 修改模块名为 StitchUI.Components.Button
# 2. 替换颜色类名为 CSS 变量版本
# 3. 统一 variant 名称（primary → default）
```

#### 步骤 1.2: Badge 组件

```bash
# 从 shop 的 tag.ex 改造
cp /path/to/shop/lib/shop_web/components/tag.ex \
   packages/liveview/lib/stitch_ui/components/badge.ex

# 修改内容：
# 1. 重命名函数 tag → badge
# 2. 替换 color 属性为 variant
# 3. 使用 CSS 变量颜色
```

#### 步骤 1.3: Card 组件

参考上文 "Card 组件" 代码示例，创建完整的 Card 组件族。

### 阶段 2: 布局组件

#### 步骤 2.1: Stack 组件

```elixir
# packages/liveview/lib/stitch_ui/layouts/stack.ex
defmodule StitchUI.Layouts.Stack do
  use Phoenix.Component

  @gaps %{
    0 => "gap-0",
    1 => "gap-1",
    2 => "gap-2",
    3 => "gap-3",
    4 => "gap-4",
    6 => "gap-6",
    8 => "gap-8"
  }

  attr :gap, :integer, default: 4
  attr :class, :string, default: nil
  slot :inner_block, required: true

  def stack(assigns) do
    ~H"""
    <div class={["flex flex-col", @gaps[@gap], @class]}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
```

#### 步骤 2.2: Flex 组件

```elixir
# packages/liveview/lib/stitch_ui/layouts/flex.ex
defmodule StitchUI.Layouts.Flex do
  use Phoenix.Component

  @justify %{
    "start" => "justify-start",
    "center" => "justify-center",
    "end" => "justify-end",
    "between" => "justify-between"
  }

  @align %{
    "start" => "items-start",
    "center" => "items-center",
    "end" => "items-end",
    "stretch" => "items-stretch"
  }

  attr :gap, :integer, default: 4
  attr :justify, :string, default: "start"
  attr :align, :string, default: "stretch"
  attr :class, :string, default: nil
  slot :inner_block, required: true

  def flex(assigns) do
    ~H"""
    <div class={[
      "flex",
      "gap-#{@gap}",
      @justify[@justify],
      @align[@align],
      @class
    ]}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
```

### 阶段 5: 导出器

#### 步骤 5.1: 创建导出模块

```bash
cat > packages/liveview/lib/stitch_ui/exporter.ex << 'EOF'
# 参考上文 HEEx 导出器代码
EOF
```

#### 步骤 5.2: 创建 Mix 任务

```bash
mkdir -p packages/liveview/lib/mix/tasks
cat > packages/liveview/lib/mix/tasks/stitch_export.ex << 'EOF'
# 参考上文 Mix 任务代码
EOF
```

---

## 验证步骤

### 阶段 0 验证：项目初始化

```bash
# 1. 检查目录结构
tree packages/liveview

# 预期输出：
# packages/liveview
# ├── lib
# │   └── stitch_ui
# │       ├── components
# │       ├── layouts
# │       ├── exporter.ex
# │       └── stitch_ui.ex
# ├── mix.exs
# └── test

# 2. 编译测试
cd packages/liveview
mix deps.get
mix compile

# 预期：无编译错误

# 3. 在测试项目中引用
# 在目标项目 mix.exs 添加：
# {:stitch_ui, path: "../stitch/packages/liveview"}
# 然后运行 mix deps.get
```

**验证标准**：
- 目录结构正确
- 编译无错误
- 可被其他项目引用

### 阶段 1 验证：基础组件

```elixir
# 在目标项目的 LiveView 中测试
defmodule TestLive do
  use MyAppWeb, :live_view
  use StitchUI

  def render(assigns) do
    ~H"""
    <.stack gap={4}>
      <.button variant="default">默认按钮</.button>
      <.button variant="secondary">次要按钮</.button>
      <.button variant="outline">边框按钮</.button>
      <.button variant="destructive">危险按钮</.button>
      <.badge>标签</.badge>
      <.badge variant="secondary">次要标签</.badge>
    </.stack>
    """
  end
end
```

```bash
# 启动服务器访问测试页面
mix phx.server
open http://localhost:4000/test

# 检查：
# 1. 按钮样式是否正确（与 shadcn 一致）
# 2. 颜色是否使用 CSS 变量
# 3. hover/focus 状态是否正常
```

**验证标准**：
- 组件渲染无错误
- 样式与 React 版本一致
- 交互状态正常

### 阶段 2 验证：布局组件

```elixir
# 测试布局组件
~H"""
<.flex justify="between" align="center" gap={4}>
  <.text>左侧</.text>
  <.text>右侧</.text>
</.flex>

<.stack gap={2}>
  <.card>卡片 1</.card>
  <.card>卡片 2</.card>
</.stack>

<.grid columns={3} gap={4}>
  <.card>1</.card>
  <.card>2</.card>
  <.card>3</.card>
</.grid>
"""
```

**验证标准**：
- Flex 布局正确（justify/align 生效）
- Stack 垂直排列正确
- Grid 列数正确
- Gap 间距正确

### 阶段 5 验证：导出器

```bash
# 1. 创建测试 JSON Schema
cat > /tmp/test-schema.json << 'EOF'
{
  "type": "Card",
  "children": [
    {
      "type": "CardHeader",
      "children": [
        { "type": "CardTitle", "children": "测试标题" }
      ]
    },
    {
      "type": "CardContent",
      "children": [
        { "type": "Button", "props": { "variant": "primary" }, "children": "点击" }
      ]
    }
  ]
}
EOF

# 2. 运行导出
cd packages/liveview
mix stitch.export /tmp/test-schema.json --output /tmp/test.heex

# 3. 检查输出
cat /tmp/test.heex

# 预期输出：
# <.card>
#   <.card_header>
#     <.card_title>测试标题</.card_title>
#   </.card_header>
#   <.card_content>
#     <.button variant="primary">点击</.button>
#   </.card_content>
# </.card>
```

**验证标准**：
- JSON 正确解析
- 组件名正确映射（CardHeader → card_header）
- 属性正确转换（className → class）
- 事件正确映射（onClick → phx-click）
- 缩进格式正确

### 阶段 6 验证：端到端测试

```bash
# 完整流程测试

# 1. 在 React Demo 中设计页面
open http://localhost:3002/demo
# 创建或修改 JSON Schema

# 2. 导出静态 HTML 验证设计
npx tsx scripts/export-static.tsx my-page

# 3. 导出 HEEx 模板
mix stitch.export src/data/schemas/my-page.json \
  --output /path/to/phoenix/lib/my_app_web/components/my_page.heex

# 4. 在 Phoenix 中使用
# 在 LiveView 中 import 并渲染

# 5. 对比验证
# - 打开 React 预览和 Phoenix 页面
# - 对比布局、颜色、间距是否一致
# - 测试交互功能
```

**验证标准**：
- React 和 LiveView 渲染结果视觉一致
- 交互行为等价（click → phx-click）
- 响应式布局正常
- 无 CSS 样式差异

## 使用示例

### 在 LiveView 中使用

```elixir
defmodule MyAppWeb.DashboardLive do
  use MyAppWeb, :live_view
  import StitchUI

  def render(assigns) do
    ~H"""
    <.stack gap={6} class="p-8">
      <.card>
        <.card_header>
          <.card_title>用户统计</.card_title>
          <.card_description>最近 30 天数据</.card_description>
        </.card_header>
        <.card_content>
          <.statistic title="总用户" value="12,345" trend="up" trend_value="+15%" />
        </.card_content>
      </.card>

      <.tabs id="main-tabs" default_value="overview">
        <.tabs_list>
          <.tabs_trigger value="overview">概览</.tabs_trigger>
          <.tabs_trigger value="analytics">分析</.tabs_trigger>
        </.tabs_list>
        <.tabs_content value="overview">
          <.text>概览内容</.text>
        </.tabs_content>
        <.tabs_content value="analytics">
          <.text>分析内容</.text>
        </.tabs_content>
      </.tabs>
    </.stack>
    """
  end
end
```

### 从 JSON Schema 生成

```bash
# 输入: dashboard.json
{
  "type": "Stack",
  "props": { "gap": 6, "className": "p-8" },
  "children": [
    {
      "type": "Card",
      "children": [
        { "type": "CardHeader", "children": [...] },
        { "type": "CardContent", "children": [...] }
      ]
    }
  ]
}

# 命令
mix stitch.export dashboard.json --output lib/my_app_web/components/dashboard.heex

# 输出: dashboard.heex
<.stack gap={6} class="p-8">
  <.card>
    <.card_header>
      ...
    </.card_header>
    <.card_content>
      ...
    </.card_content>
  </.card>
</.stack>
```

### Demo 页面（用于对比 React 导出）

已提供 `StitchUI.DemoLive` 和内置的 `components_showcase.html.heex`：

```elixir
# router.ex
live "/stitch-demo", StitchUI.DemoLive
```

访问 `http://localhost:4000/stitch-demo`，对比 `components-showcase.html` 的导出效果。

### 最小 Demo App（本仓库）

为了直接浏览器对比，仓库内新增了 Phoenix demo：

```bash
cd examples/stitch_demo
mix deps.get
mix assets.setup
mix assets.build
mix phx.server
```

访问 `http://localhost:4000/`。

该 Demo 在根容器上挂载了 `phx-hook="StitchUI"`，用于在浏览器侧补齐 Tabs/Accordion/Slider/CodeBlock 的交互体验（见 `examples/stitch_demo/assets/js/app.js`）。

### 交互状态（纯 LiveView）

- Tabs: 在 `TabsTrigger` 上传 `on_change`，服务器更新 `@active_tab` 后传给 `active_value`
- Accordion: 在 `AccordionTrigger` 上传 `on_toggle`，服务器更新 `@open_items`
- Stepper: 通过 `current_step` 驱动，Step 会自动计算 `status`/`step_number`

```elixir
<.tabs value={@active_tab}>
  <.tabs_list>
    <.tabs_trigger value="overview" active_value={@active_tab} on_change="tabs:change">
      概览
    </.tabs_trigger>
  </.tabs_list>
  <.tabs_content value="overview" active_value={@active_tab}>...</.tabs_content>
</.tabs>
```

## 总结

这个方案的核心优势：

1. **设计与运行分离** - React 负责设计预览，LiveView 负责生产运行
2. **样式一致** - 使用相同的 Tailwind CSS 变量，shadcn 风格
3. **渐进式采用** - 可以先手写 LiveView 组件，再逐步引入 JSON Schema
4. **服务端交互** - LiveView 提供完整的服务端交互能力

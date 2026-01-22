# Stitch LiveView 集成方案

## 概述

Stitch 是一个 JSON Schema 驱动的 UI 渲染引擎。本文档描述如何将 Stitch 与 Phoenix LiveView 集成，实现：

- **设计阶段**: 使用 React 渲染器实时预览
- **部署阶段**: 导出为 LiveView 组件，在 Phoenix 应用中运行

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

### 阶段 1: 基础组件库
- [ ] Button, Badge, Alert
- [ ] Card (Card, CardHeader, CardTitle, CardContent, CardFooter)
- [ ] Input, Label, Checkbox, Switch
- [ ] Progress, Skeleton

### 阶段 2: 布局组件
- [ ] Stack, Flex, Grid
- [ ] Columns, Split, Rows
- [ ] Container, Center, Spacer

### 阶段 3: 复杂组件
- [ ] Tabs (需要 JS Hook)
- [ ] Accordion (需要 JS Hook)
- [ ] Dialog/Modal
- [ ] Tooltip

### 阶段 4: 数据展示
- [ ] Table
- [ ] Timeline
- [ ] Statistic
- [ ] List

### 阶段 5: 导出器
- [ ] JSON Schema 解析
- [ ] HEEx 代码生成
- [ ] Mix 任务集成
- [ ] 事件映射

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

## 总结

这个方案的核心优势：

1. **设计与运行分离** - React 负责设计预览，LiveView 负责生产运行
2. **样式一致** - 使用相同的 Tailwind CSS 变量，shadcn 风格
3. **渐进式采用** - 可以先手写 LiveView 组件，再逐步引入 JSON Schema
4. **服务端交互** - LiveView 提供完整的服务端交互能力

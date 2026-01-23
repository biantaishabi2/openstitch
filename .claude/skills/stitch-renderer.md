# Stitch UI 执行层

接收 Planner 的意图描述 JSON，转换成组件 JSON Schema，然后渲染成 Phoenix LiveView 代码。

## 工作流程

```
意图描述 JSON (from Planner)
    ↓
[Step 1] 意图 → 组件 Schema 转换
    ↓
组件 JSON Schema
    ↓
[Step 2] Schema → HEEx 代码渲染
    ↓
Phoenix LiveView 代码
```

---

## Step 1: 意图 → 组件 Schema 转换规则

### stats → Grid + StatisticCard

意图：
```json
{"intent": "stats", "items": [{"label": "总用户", "value": "12,345", "trend": "up", "change": "+12%"}]}
```

组件 Schema：
```json
{
  "type": "Grid",
  "props": {"columns": 3, "gap": "4"},
  "children": [
    {"type": "StatisticCard", "props": {"title": "总用户", "value": "12,345", "trend": "up", "change": "+12%"}}
  ]
}
```

### hero → Hero

意图：
```json
{"intent": "hero", "title": "欢迎", "subtitle": "副标题", "cta": {"label": "开始"}}
```

组件 Schema：
```json
{
  "type": "Hero",
  "props": {"title": "欢迎", "subtitle": "副标题"},
  "children": [
    {"type": "Button", "props": {"size": "lg"}, "children": "开始"}
  ]
}
```

### feature_grid → Grid + Card

意图：
```json
{"intent": "feature_grid", "columns": 3, "items": [{"title": "功能1", "description": "描述", "icon": "zap"}]}
```

组件 Schema：
```json
{
  "type": "Grid",
  "props": {"columns": 3, "gap": "6"},
  "children": [
    {
      "type": "Card",
      "children": [
        {"type": "CardHeader", "children": [
          {"type": "Icon", "props": {"name": "zap", "size": 24}},
          {"type": "CardTitle", "children": "功能1"}
        ]},
        {"type": "CardContent", "children": [
          {"type": "Text", "children": "描述"}
        ]}
      ]
    }
  ]
}
```

### form → Card + Form Fields

意图：
```json
{
  "intent": "form",
  "title": "登录",
  "fields": [{"name": "email", "label": "邮箱", "type": "email"}],
  "actions": [{"label": "登录", "primary": true}]
}
```

组件 Schema：
```json
{
  "type": "Card",
  "props": {"className": "w-96"},
  "children": [
    {"type": "CardHeader", "children": [
      {"type": "CardTitle", "children": "登录"}
    ]},
    {"type": "CardContent", "children": [
      {"type": "Stack", "props": {"gap": "4"}, "children": [
        {"type": "Label", "children": "邮箱"},
        {"type": "Input", "props": {"type": "email", "name": "email"}}
      ]}
    ]},
    {"type": "CardFooter", "children": [
      {"type": "Button", "children": "登录"}
    ]}
  ]
}
```

### table → Table

意图：
```json
{
  "intent": "table",
  "columns": [{"key": "name", "label": "姓名"}, {"key": "status", "label": "状态", "type": "badge"}]
}
```

组件 Schema：
```json
{
  "type": "Table",
  "children": [
    {"type": "TableHeader", "children": [
      {"type": "TableRow", "children": [
        {"type": "TableHead", "children": "姓名"},
        {"type": "TableHead", "children": "状态"}
      ]}
    ]},
    {"type": "TableBody", "props": {"data_key": "items"}}
  ]
}
```

### steps → Stepper

意图：
```json
{"intent": "steps", "items": [{"title": "步骤1", "description": "说明"}]}
```

组件 Schema：
```json
{
  "type": "Stepper",
  "props": {"activeStep": 0},
  "children": [
    {"type": "Step", "props": {"title": "步骤1", "description": "说明"}}
  ]
}
```

### card_grid → Grid + Card

意图：
```json
{
  "intent": "card_grid",
  "columns": 2,
  "items": [{"title": "标题", "description": "描述", "footer": {"actions": [{"label": "查看"}]}}]
}
```

组件 Schema：
```json
{
  "type": "Grid",
  "props": {"columns": 2, "gap": "4"},
  "children": [
    {
      "type": "Card",
      "children": [
        {"type": "CardHeader", "children": [
          {"type": "CardTitle", "children": "标题"},
          {"type": "CardDescription", "children": "描述"}
        ]},
        {"type": "CardFooter", "children": [
          {"type": "Button", "props": {"variant": "outline"}, "children": "查看"}
        ]}
      ]
    }
  ]
}
```

---

## Step 2: Schema → HEEx 代码渲染规则

### 布局组件

**Page**
```heex
<div class="min-h-screen bg-background">
  <%= render_children(@children) %>
</div>
```

**Stack**
```heex
<div class={"flex flex-col gap-#{@gap}"}>
  <%= render_children(@children) %>
</div>
```

**Grid**
```heex
<div class={"grid grid-cols-#{@columns} gap-#{@gap}"}>
  <%= render_children(@children) %>
</div>
```

**Split**
```heex
<%# ratio "4:6" → grid-cols-[4fr_6fr] %>
<div class="grid grid-cols-[4fr_6fr] gap-6">
  <%= render_children(@children) %>
</div>
```

### 卡片组件

**Card**
```heex
<.card class={@className}>
  <%= render_children(@children) %>
</.card>
```

**CardHeader / CardContent / CardFooter / CardTitle / CardDescription**
```heex
<.card_header><%= render_children(@children) %></.card_header>
<.card_content><%= render_children(@children) %></.card_content>
<.card_footer><%= render_children(@children) %></.card_footer>
<.card_title><%= @text %></.card_title>
<.card_description><%= @text %></.card_description>
```

### 表单组件

**Button**
```heex
<.button variant={@variant} size={@size}><%= @text %></.button>
```

**Input**
```heex
<.input type={@type} name={@name} placeholder={@placeholder} />
```

**Label**
```heex
<.label><%= @text %></.label>
```

### 数据展示组件

**StatisticCard**
```heex
<.card>
  <.card_content class="pt-6">
    <div class="text-sm text-muted-foreground"><%= @title %></div>
    <div class="text-2xl font-bold"><%= @value %></div>
    <div class={"text-xs " <> if(@trend == "up", do: "text-green-600", else: "text-red-600")}>
      <%= @change %>
    </div>
  </.card_content>
</.card>
```

**Table**
```heex
<.table>
  <.table_header>
    <.table_row>
      <%= for col <- @columns do %>
        <.table_head><%= col.label %></.table_head>
      <% end %>
    </.table_row>
  </.table_header>
  <.table_body>
    <%= for row <- @data do %>
      <.table_row>
        <%= for col <- @columns do %>
          <.table_cell><%= row[col.key] %></.table_cell>
        <% end %>
      </.table_row>
    <% end %>
  </.table_body>
</.table>
```

**Stepper**
```heex
<.stepper active_step={@active_step}>
  <%= for step <- @steps do %>
    <.step title={step.title} description={step.description} />
  <% end %>
</.stepper>
```

### 文本组件

**Text**
```heex
<%# variant: title/subtitle/body/caption %>
<p class={text_class(@variant)}><%= @content %></p>

defp text_class("title"), do: "text-xl font-semibold"
defp text_class("subtitle"), do: "text-lg font-medium"
defp text_class("caption"), do: "text-sm text-muted-foreground"
defp text_class(_), do: "text-base"
```

**CodeBlock**
```heex
<.code_block language={@language}>
  <%= @code %>
</.code_block>
```

### 基础组件

**Icon**
```heex
<.icon name={@name} class={"w-#{@size} h-#{@size}"} />
```

**Badge**
```heex
<.badge variant={@variant}><%= @text %></.badge>
```

---

## 完整示例

### 输入（Planner 输出的意图 JSON）
```json
{
  "page_type": "dashboard",
  "sections": [
    {
      "intent": "stats",
      "items": [
        {"label": "总用户", "value": "12,345", "trend": "up", "change": "+12%"},
        {"label": "活跃用户", "value": "8,901", "trend": "up", "change": "+5%"}
      ]
    },
    {
      "intent": "table",
      "title": "用户列表",
      "columns": [
        {"key": "name", "label": "姓名"},
        {"key": "status", "label": "状态", "type": "badge"}
      ]
    }
  ]
}
```

### Step 1 输出（组件 JSON Schema）
```json
{
  "type": "Page",
  "children": [
    {
      "type": "Stack",
      "props": {"gap": "6"},
      "children": [
        {
          "type": "Grid",
          "props": {"columns": 2, "gap": "4"},
          "children": [
            {"type": "StatisticCard", "props": {"title": "总用户", "value": "12,345", "trend": "up", "change": "+12%"}},
            {"type": "StatisticCard", "props": {"title": "活跃用户", "value": "8,901", "trend": "up", "change": "+5%"}}
          ]
        },
        {
          "type": "Card",
          "children": [
            {"type": "CardHeader", "children": [
              {"type": "CardTitle", "children": "用户列表"}
            ]},
            {"type": "CardContent", "children": [
              {"type": "Table", "props": {"columns": [{"key": "name", "label": "姓名"}, {"key": "status", "label": "状态"}]}}
            ]}
          ]
        }
      ]
    }
  ]
}
```

### Step 2 输出（HEEx 代码）
```heex
<div class="min-h-screen bg-background p-6">
  <div class="flex flex-col gap-6">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 gap-4">
      <.card>
        <.card_content class="pt-6">
          <div class="text-sm text-muted-foreground">总用户</div>
          <div class="text-2xl font-bold">12,345</div>
          <div class="text-xs text-green-600">+12%</div>
        </.card_content>
      </.card>
      <.card>
        <.card_content class="pt-6">
          <div class="text-sm text-muted-foreground">活跃用户</div>
          <div class="text-2xl font-bold">8,901</div>
          <div class="text-xs text-green-600">+5%</div>
        </.card_content>
      </.card>
    </div>

    <!-- 用户列表 -->
    <.card>
      <.card_header>
        <.card_title>用户列表</.card_title>
      </.card_header>
      <.card_content>
        <.table>
          <.table_header>
            <.table_row>
              <.table_head>姓名</.table_head>
              <.table_head>状态</.table_head>
            </.table_row>
          </.table_header>
          <.table_body>
            <%= for user <- @users do %>
              <.table_row>
                <.table_cell><%= user.name %></.table_cell>
                <.table_cell><.badge><%= user.status %></.badge></.table_cell>
              </.table_row>
            <% end %>
          </.table_body>
        </.table>
      </.card_content>
    </.card>
  </div>
</div>
```

---

## 组件清单

| 组件 | 用途 | 核心 Props |
|------|------|-----------|
| `Page` | 页面容器 | `className` |
| `Stack` | 垂直堆叠 | `gap` |
| `Grid` | 网格布局 | `columns`, `gap` |
| `Split` | 分栏布局 | `ratio` |
| `Card` | 卡片 | `className` |
| `CardHeader/Content/Footer` | 卡片区块 | - |
| `CardTitle/Description` | 卡片文本 | - |
| `Button` | 按钮 | `variant`, `size` |
| `Input` | 输入框 | `type`, `placeholder` |
| `Label` | 标签 | - |
| `Table` | 表格 | `columns` |
| `StatisticCard` | 统计卡片 | `title`, `value`, `trend`, `change` |
| `Stepper` | 步骤条 | `activeStep` |
| `Step` | 步骤项 | `title`, `description` |
| `Text` | 文本 | `variant` |
| `Icon` | 图标 | `name`, `size` |
| `Badge` | 徽章 | `variant` |
| `CodeBlock` | 代码块 | `language` |

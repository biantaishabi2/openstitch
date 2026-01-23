# Stitch UI 执行层

接收规划层的视觉设计指令，解析自然语言描述，渲染成 Phoenix LiveView 代码。

## 工作流程

```
规划层输出 (function_call JSON)
    ↓
[Step 1] 解析 description 中的指令标签
    ↓
[Step 2] 映射到组件结构
    ↓
[Step 3] 渲染 HEEx 代码
    ↓
Phoenix LiveView 代码
```

---

## Step 1: 解析指令标签

从 `description` 中识别以下标签：

| 标签 | 作用 | 示例 |
|------|------|------|
| `[Layout]` | 页面整体布局 | 三栏网格、Dashboard 布局 |
| `[Theme]` | 主题和色彩 | 企业风格、暗色主题 |
| `[Content - X]` | 内容区块 | Header、Stats、Table、Form |
| `[Details]` | 细节要求 | 图标、字体、交互 |

---

## Step 2: 指令 → 组件映射

### 布局映射 [Layout]

| 指令描述 | 组件结构 |
|----------|----------|
| 三栏式水平网格 | `Grid columns=3` |
| Dashboard 布局 | `Stack > [Stats Grid] + [Content Card]` |
| 左右分栏 30%/70% | `Split ratio="3:7"` |
| 移动端单列 | `Stack` |
| 顶部固定导航 | `Page > [Navbar] + [Content]` |

### 内容映射 [Content]

| 指令描述 | 组件结构 |
|----------|----------|
| `[Content - Header]` 页面标题 + 按钮 | `<div class="flex justify-between"> + <.button>` |
| `[Content - Stats]` 统计卡片 | `Grid > StatisticCard[]` |
| `[Content - Table]` 数据表格 | `Card > Table` |
| `[Content - Form]` 表单 | `Card > Form > Input[] + Button` |
| `[Content - Cards]` 卡片网格 | `Grid > Card[]` |
| `[Content - Column N]` 分栏内容 | 对应 Grid 的第 N 个子元素 |

### 细节映射 [Details]

| 指令描述 | 实现方式 |
|----------|----------|
| 图标 xxx | `<.icon name="xxx" />` |
| 等宽字体 | `class="font-mono"` |
| 语义色（成功/失败/警告） | `text-green-600` / `text-red-600` / `text-yellow-600` |
| 箭头指示 | `<.icon name="arrow-right" />` |
| Badge 组件 | `<.badge variant={...}>` |

### 主题映射 [Theme]

执行层根据 `[Theme]` 指令和 `context` 自行判断实现方式：

- **同一 `context` 下的页面应保持风格一致**
- 优先使用 Tailwind CSS 变量（`bg-background`, `text-foreground`）
- 色彩遵循规划层的语义色指令

| 主题描述 | 实现参考 |
|----------|----------|
| 暗色主题 | `<html class="dark">` + dark 模式变量 |
| 主色调蓝色 | 按钮 `bg-blue-600`，链接 `text-blue-600` |
| 企业风格 | 圆角 `rounded-md`，间距 `gap-4` |
| 清新简约 | 圆角 `rounded-xl`，大量留白 `gap-8` |

**注意**：具体实现由执行层自行决定，不需要写死。

---

## Step 3: HEEx 渲染规则

### 页面容器
```heex
<div class="min-h-screen bg-background p-6">
  <div class="max-w-7xl mx-auto">
    <%= @content %>
  </div>
</div>
```

### 页面标题 + 操作按钮
```heex
<div class="flex items-center justify-between mb-6">
  <h1 class="text-2xl font-bold"><%= @title %></h1>
  <.button>
    <.icon name="plus" class="w-4 h-4 mr-2" />
    <%= @action_label %>
  </.button>
</div>
```

### 统计卡片行
```heex
<div class="grid grid-cols-3 gap-4 mb-6">
  <%= for stat <- @stats do %>
    <.card>
      <.card_content class="pt-6">
        <div class="flex items-center gap-2">
          <.icon name={stat.icon} class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm text-muted-foreground"><%= stat.label %></span>
        </div>
        <div class="text-2xl font-bold mt-2"><%= stat.value %></div>
        <div class={[
          "text-xs mt-1",
          stat.trend == "up" && "text-green-600",
          stat.trend == "down" && "text-red-600"
        ]}>
          <%= if stat.trend == "up" do %>↑<% else %>↓<% end %>
          <%= stat.change %>
        </div>
      </.card_content>
    </.card>
  <% end %>
</div>
```

### 数据表格
```heex
<.card>
  <.card_header>
    <.card_title><%= @table_title %></.card_title>
  </.card_header>
  <.card_content>
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
              <.table_cell>
                <%= case col.type do %>
                  <% :badge -> %>
                    <.badge variant={badge_variant(row[col.key])}><%= row[col.key] %></.badge>
                  <% :actions -> %>
                    <div class="flex gap-2">
                      <.button variant="ghost" size="icon"><.icon name="edit" class="w-4 h-4" /></.button>
                      <.button variant="ghost" size="icon"><.icon name="trash" class="w-4 h-4" /></.button>
                    </div>
                  <% _ -> %>
                    <%= row[col.key] %>
                <% end %>
              </.table_cell>
            <% end %>
          </.table_row>
        <% end %>
      </.table_body>
    </.table>
  </.card_content>
</.card>
```

### 表单
```heex
<.card class="max-w-md">
  <.card_header>
    <.card_title><%= @form_title %></.card_title>
  </.card_header>
  <.card_content>
    <.form for={@form} phx-submit="submit" class="space-y-4">
      <%= for field <- @fields do %>
        <div>
          <.label><%= field.label %></.label>
          <.input type={field.type} name={field.name} required={field.required} />
        </div>
      <% end %>
      <.button type="submit" class="w-full"><%= @submit_label %></.button>
    </.form>
  </.card_content>
</.card>
```

### 三栏布局
```heex
<div class="grid grid-cols-3 gap-6">
  <%= for column <- @columns do %>
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <.icon name={column.icon} class="w-5 h-5" />
        <%= column.title %>
      </h3>
      <.card>
        <.card_content class="pt-6">
          <%= column.content %>
        </.card_content>
      </.card>
    </div>
  <% end %>
</div>
```

### 代码路径（等宽字体）
```heex
<code class="font-mono text-sm bg-muted px-1.5 py-0.5 rounded"><%= @path %></code>
```

### 流程箭头
```heex
<div class="flex items-center justify-center">
  <.icon name="arrow-right" class="w-6 h-6 text-muted-foreground" />
</div>
```

---

## 完整示例

### 输入（规划层输出）
```json
{
  "function_call": "generate_design",
  "arguments": {
    "title": "用户管理",
    "context": "后台管理系统",
    "description": "[Layout] Dashboard 布局，顶部统计卡片行，下方数据表格。\n\n[Content - Header] 页面标题"用户管理"，右侧"新增用户"按钮。\n\n[Content - Stats] 三个统计卡片：用户总数、活跃用户、新增用户。\n\n[Content - Table] 用户列表，列：用户名、邮箱、状态（Badge）、操作。\n\n[Details] 状态使用语义色。操作按钮用图标。"
  }
}
```

### 输出（HEEx 代码）
```heex
<div class="min-h-screen bg-background p-6">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">用户管理</h1>
      <.button>
        <.icon name="user-plus" class="w-4 h-4 mr-2" />
        新增用户
      </.button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <.card>
        <.card_content class="pt-6">
          <div class="flex items-center gap-2">
            <.icon name="users" class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">用户总数</span>
          </div>
          <div class="text-2xl font-bold mt-2">12,345</div>
          <div class="text-xs text-green-600 mt-1">↑ +12%</div>
        </.card_content>
      </.card>
      <.card>
        <.card_content class="pt-6">
          <div class="flex items-center gap-2">
            <.icon name="activity" class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">活跃用户</span>
          </div>
          <div class="text-2xl font-bold mt-2">8,901</div>
          <div class="text-xs text-green-600 mt-1">↑ +5%</div>
        </.card_content>
      </.card>
      <.card>
        <.card_content class="pt-6">
          <div class="flex items-center gap-2">
            <.icon name="user-plus" class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">新增用户</span>
          </div>
          <div class="text-2xl font-bold mt-2">234</div>
          <div class="text-xs text-green-600 mt-1">↑ +18%</div>
        </.card_content>
      </.card>
    </div>

    <!-- Table -->
    <.card>
      <.card_header>
        <.card_title>用户列表</.card_title>
      </.card_header>
      <.card_content>
        <.table>
          <.table_header>
            <.table_row>
              <.table_head>用户名</.table_head>
              <.table_head>邮箱</.table_head>
              <.table_head>状态</.table_head>
              <.table_head>操作</.table_head>
            </.table_row>
          </.table_header>
          <.table_body>
            <%= for user <- @users do %>
              <.table_row>
                <.table_cell><%= user.name %></.table_cell>
                <.table_cell><%= user.email %></.table_cell>
                <.table_cell>
                  <.badge variant={if user.status == "active", do: "default", else: "secondary"}>
                    <%= user.status %>
                  </.badge>
                </.table_cell>
                <.table_cell>
                  <div class="flex gap-2">
                    <.button variant="ghost" size="icon">
                      <.icon name="edit" class="w-4 h-4" />
                    </.button>
                    <.button variant="ghost" size="icon">
                      <.icon name="trash" class="w-4 h-4 text-red-600" />
                    </.button>
                  </div>
                </.table_cell>
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

### 布局组件

| 组件 | 用途 | 实现方式 |
|------|------|----------|
| Grid | 网格布局 | `<div class="grid grid-cols-{n} gap-{n}">` |
| Stack | 垂直堆叠 | `<div class="flex flex-col gap-{n}">` |
| Split | 分栏布局 | `<div class="grid grid-cols-[3fr_7fr] gap-6">` |
| Page | 页面容器 | `<div class="min-h-screen bg-background p-6">` |

### UI 组件

| 组件 | 用途 | 核心 Props |
|------|------|-----------|
| `.card` | 卡片容器 | `class` |
| `.card_header` | 卡片头部 | - |
| `.card_content` | 卡片内容 | `class` |
| `.card_title` | 卡片标题 | - |
| `.button` | 按钮 | `variant`, `size` |
| `.input` | 输入框 | `type`, `name`, `required` |
| `.label` | 标签 | - |
| `.table` | 表格 | - |
| `.table_header` | 表头 | - |
| `.table_body` | 表体 | - |
| `.table_row` | 表行 | - |
| `.table_head` | 表头单元格 | - |
| `.table_cell` | 表格单元格 | - |
| `.badge` | 徽章 | `variant` |
| `.icon` | 图标 | `name`, `class` |
| `.form` | 表单 | `for`, `phx-submit` |

---

## 一致性保障

当处理多页面任务（如 PPT、多页应用）时：

### Context 作为 Theme Key

同一 `context` 下的所有页面，使用同一套：
- 色板（主色、强调色、背景色）
- 圆角规范
- 字体和间距

### 序列感知

解析 `[Layout]` 中的序列标注：
- **"封面页"** → Hero 布局，可以更大胆
- **"中间页"** → 保持与前页一致
- **"结尾页"** → 呼应封面设计

### 组件库单例

同一会话中，所有 `Card`、`Button` 等组件映射到同一套样式定义，确保跨页面一致。

---

## 注意事项

1. **先解析再渲染**：必须先识别所有 `[标签]`，理解完整结构，再开始渲染
2. **语义色优先**：看到"成功/失败/警告"等语义词，自动映射到对应颜色
3. **图标必配**：规划层指定的图标必须渲染，不能省略
4. **响应式**：使用 Tailwind 的响应式类，如 `grid-cols-1 md:grid-cols-3`
5. **数据绑定**：动态内容使用 `@assigns`，如 `@users`, `@stats`

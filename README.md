# Stitch UI

JSON Schema 驱动的 UI 渲染引擎。一套 Schema，多端渲染。

![Demo](./artifacts/stitch-demo.png)

## 特性

- **一套 JSON Schema，两种渲染方式**
  - React 渲染器 → 导出静态 HTML
  - LiveView 渲染器 → 导出 HEEx 模板 + Phoenix 组件库
- **50+ 预置组件**：布局、表单、数据展示、反馈等
- **AI 友好**：结构化的 JSON 格式，便于 AI 生成和理解

## 项目结构

```
stitch/
├── src/
│   ├── components/ui/     # React 组件 (shadcn/ui)
│   ├── data/schemas/      # JSON Schema 示例
│   └── lib/renderer/      # React 渲染器
├── packages/
│   └── liveview/          # Elixir/LiveView 组件包
├── scripts/
│   └── export-static.tsx  # 静态 HTML 导出工具
└── docs/                  # 文档
```

---

## 方式一：React 渲染器（导出静态 HTML）

### 快速开始

```bash
git clone git@github.com:biantaishabi2/openstitch.git
cd openstitch
npm install

# 启动开发服务器预览
npm run dev

# 导出静态 HTML
npx tsx scripts/export-static.tsx
```

## 添加新页面

1. 在 `src/data/schemas/` 目录下创建 JSON 文件，例如 `my-page.json`
2. 运行导出命令生成静态 HTML

## 静态 HTML 导出

导出工具会自动扫描 `src/data/schemas/` 目录下的所有 JSON 文件。

```bash
# 导出所有页面
npx tsx scripts/export-static.tsx

# 查看所有可用的 schema
npx tsx scripts/export-static.tsx --list

# 只导出指定页面
npx tsx scripts/export-static.tsx ppt-cover

# 使用通配符导出
npx tsx scripts/export-static.tsx admin-*
```

导出的文件位于 `./output/` 目录。

---

## 方式二：LiveView 渲染器（Phoenix 项目）

### 安装组件包

在你的 Phoenix 项目的 `mix.exs` 中添加依赖：

```elixir
defp deps do
  [
    {:stitch_ui, git: "https://github.com/biantaishabi2/openstitch.git", sparse: "packages/liveview"}
  ]
end
```

然后运行：

```bash
mix deps.get
```

### 使用组件

```elixir
# 在你的 LiveView 或组件中
use StitchUI

# 然后就可以使用组件了
~H"""
<.card>
  <.card_header>
    <.card_title>标题</.card_title>
  </.card_header>
  <.card_content>
    <.text>内容</.text>
  </.card_content>
</.card>
"""
```

### 导出 JSON 为 HEEx

```bash
cd packages/liveview
mix stitch.export path/to/schema.json --output output.heex
```

这会把 JSON Schema 转换成使用 StitchUI 组件的 HEEx 模板。

---

## JSON Schema 格式

```json
{
  "type": "Card",
  "props": { "className": "p-4" },
  "children": [
    { "type": "Text", "children": "Hello World" }
  ]
}
```

### 支持的组件

**布局组件**: Flex, Stack, Grid, Container, Section, Page, Spacer, Div

**UI 组件**: Card, Button, Badge, Avatar, Input, Checkbox, Switch, Separator, Progress, Tabs, Dialog, Tooltip

**文本组件**: Text, Icon

**表格组件**: Table, TableHeader, TableBody, TableRow, TableHead, TableCell

## 示例 Schema

项目包含多个示例页面，位于 `src/data/schemas/` 目录：

| 示例 | 说明 |
|------|------|
| `ppt-cover.json` | PPT 封面页 |
| `admin-dashboard.json` | 后台管理仪表盘 |
| `admin-users.json` | 用户管理页面 |
| `tech-dashboard.json` | 技术监控面板 |
| `tech-roadmap.json` | 技术路线图 |
| `mobile-app.json` | 移动端应用页面 |
| `components-showcase.json` | 组件展示页 |

运行 `npx tsx scripts/export-static.tsx --list` 查看所有可用示例。

## 技术栈

**React 渲染器：**
- Next.js 15 + React 19
- shadcn/ui + Radix UI
- Tailwind CSS
- TypeScript

**LiveView 渲染器：**
- Elixir 1.14+
- Phoenix LiveView 1.0+
- Tailwind CSS

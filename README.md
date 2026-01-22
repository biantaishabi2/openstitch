# Stitch UI

JSON Schema 驱动的 UI 渲染引擎。一套 Schema，多端渲染。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3002/demo 查看 Demo 页面。

## 项目结构

```
stitch/
├── src/
│   ├── app/demo/          # Demo 页面
│   ├── components/ui/     # shadcn/ui 组件
│   ├── data/schemas/      # JSON Schema 文件
│   └── lib/renderer/      # 渲染器核心
├── scripts/
│   └── export-static.tsx  # 静态 HTML 导出工具
└── docs/                  # 文档
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

导出的文件位于 `/home/wangbo/document/zcpg/docs/stitch/`。

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

## 技术栈

- Next.js 15
- React 19
- shadcn/ui
- Tailwind CSS
- TypeScript

# Stitch 编译器测试策略

## 概述

编译器测试采用**分层测试金字塔**策略，确保每个组件在不同层级都有完整的测试覆盖。

```
┌─────────────────────────────────────────────────────────────┐
│                      测试金字塔                              │
├─────────────────────────────────────────────────────────────┤
│  E2E 测试      │  完整页面渲染（Dashboard Demo）            │
│                │  验证真实场景下的组件协作                   │
├─────────────────────────────────────────────────────────────┤
│  集成测试      │  组件组合测试（布局嵌套、插槽分发）         │
│                │  验证多组件协作、布局系统                   │
├─────────────────────────────────────────────────────────────┤
│  单元测试      │  单组件渲染测试（每个组件独立验证）         │
│                │  验证每个组件的基础渲染能力                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 组件分类

### 第一类：基础组件（直接渲染）

| 类型 | 组件 | 测试重点 |
|------|------|----------|
| 布局 | Section, Container, Grid, Flex, Spacer | 方向、间距、对齐、嵌套 |
| 内容 | Text, Image, Icon, Badge, Link | 内容渲染、样式应用 |
| 交互 | Button, Input | 属性透传、变体样式 |

### 第二类：复合组件（需要插槽分发）

| 组件 | 插槽 | 测试重点 |
|------|------|----------|
| Card | header/content/footer | 子元素自动分发到正确插槽 |
| Alert | title/description | 标题和描述分发 |
| Table | header/body | 表头渲染、表格结构 |
| Tabs | list/content | Tab 列表和内容分发 |
| Dialog | header/content/footer | 弹窗结构 |

### 第三类：映射组件（类型转换 + 特殊 props）

| DSL 类型 | 映射到 | 特殊 props | 测试重点 |
|----------|--------|-----------|----------|
| Sidebar | Stack | direction:'col', 深色背景 | 垂直布局、深色样式 |
| Header | Flex | justify:'between', 边框 | 水平布局、边框样式 |
| Footer | Flex | py-4, mt-auto | 底部定位 |
| Nav | Flex | direction:'col' | 导航垂直排列 |
| Heading | Text | variant:'title', as:'h2' | 标题样式 |
| Form | Stack | direction:'col', gap:4 | 表单布局 |
| Quote | Text | blockquote 样式 | 引用样式 |

---

## 测试文件结构

```
src/lib/compiler/__tests__/
├── unit/                           # 单元测试
│   ├── components/                 # 单组件渲染测试
│   │   ├── basic.test.ts          # 基础组件 (Text, Button, Icon...)
│   │   ├── layout.test.ts         # 布局组件 (Grid, Flex, Section...)
│   │   ├── composite.test.ts      # 复合组件 (Card, Alert, Table...)
│   │   └── mapped.test.ts         # 映射组件 (Sidebar, Header, Nav...)
│   └── logic/                      # 逻辑单元测试
│       ├── parser.test.ts         # Parser 解析测试
│       ├── semantic.test.ts       # 语义验证测试
│       └── type-map.test.ts       # 类型映射测试
│
├── integration/                    # 集成测试
│   ├── layout-nesting.test.ts     # 布局嵌套测试
│   ├── slot-distribution.test.ts  # 插槽分发测试
│   └── props-flow.test.ts         # Props 流转测试
│
└── e2e/                            # 端到端测试
    ├── dashboard-demo.test.ts     # Dashboard 页面
    ├── form-page.test.ts          # 表单页面
    └── showcase.test.ts           # 组件展示页面
```

---

## 组件 Showcase 测试

创建一个包含所有组件的 DSL 文件，用于系统性测试：

```dsl
[SECTION: showcase]

  [HEADING: h1] CONTENT: "组件 Showcase"

  // ===== 基础组件 =====
  [GRID: basic_components]
    { Columns: 3, Gap: "16px" }

    [CARD: text_demo]
      ATTR: Title("Text 组件")
      [TEXT: t1] CONTENT: "普通文本"
      [TEXT: t2] ATTR: Size("lg") CONTENT: "大号文本"

    [CARD: button_demo]
      ATTR: Title("Button 组件")
      [BUTTON: btn1] CONTENT: "默认按钮"
      [BUTTON: btn2] ATTR: Variant("outline") CONTENT: "轮廓按钮"

    [CARD: icon_demo]
      ATTR: Title("Icon 组件")
      [FLEX: icons]
        { Gap: "8px" }
        [ICON: i1] ATTR: Icon("Home")
        [ICON: i2] ATTR: Icon("Settings")
        [ICON: i3] ATTR: Icon("User")

  // ===== 布局组件 =====
  [HEADING: h2] CONTENT: "布局组件"

  [GRID: layout_demo]
    { Columns: 2, Gap: "16px" }

    [CARD: grid_demo]
      ATTR: Title("Grid 布局")
      [GRID: g1]
        { Columns: 2, Gap: "8px" }
        [TEXT: gt1] CONTENT: "格子1"
        [TEXT: gt2] CONTENT: "格子2"
        [TEXT: gt3] CONTENT: "格子3"
        [TEXT: gt4] CONTENT: "格子4"

    [CARD: flex_demo]
      ATTR: Title("Flex 布局")
      [FLEX: f1]
        { Direction: "Row", Gap: "8px", Justify: "Between" }
        [TEXT: ft1] CONTENT: "左"
        [TEXT: ft2] CONTENT: "中"
        [TEXT: ft3] CONTENT: "右"

  // ===== 复合组件 =====
  [HEADING: h3] CONTENT: "复合组件"

  [GRID: composite_demo]
    { Columns: 2, Gap: "16px" }

    [CARD: alert_demo]
      ATTR: Title("Alert 组件")
      [ALERT: a1]
        [HEADING: at] CONTENT: "警告标题"
        [TEXT: ad] CONTENT: "这是警告描述"

    [CARD: table_demo]
      ATTR: Title("Table 组件")
      [TABLE: tb1]
        [TEXT: th1] CONTENT: "列1"
        [TEXT: th2] CONTENT: "列2"
        [TEXT: th3] CONTENT: "列3"

  // ===== 映射组件 =====
  [HEADING: h4] CONTENT: "映射组件"

  [FLEX: mapped_demo]
    { Direction: "Row", Gap: "16px" }

    [SIDEBAR: sb1]
      [NAV: nav1]
        [TEXT: n1] CONTENT: "导航项1"
        [TEXT: n2] CONTENT: "导航项2"

    [SECTION: main]
      [HEADER: hd1]
        [HEADING: title] CONTENT: "页面标题"
        [BUTTON: action] CONTENT: "操作"

      [FORM: form1]
        [INPUT: inp1] ATTR: Placeholder("输入框1")
        [INPUT: inp2] ATTR: Placeholder("输入框2")
        [BUTTON: submit] CONTENT: "提交"

      [FOOTER: ft1]
        [TEXT: copyright] CONTENT: "© 2024"
```

---

## 测试验证点

### 单组件测试验证点

| 组件 | 验证点 |
|------|--------|
| Text | 文本内容、字体大小、变体样式 |
| Button | 文本、变体、禁用状态 |
| Icon | 图标名称映射、尺寸 |
| Badge | 文本、变体样式 |
| Input | placeholder、类型 |
| Image | src、alt |
| Link | href、文本 |

### 布局测试验证点

| 组件 | 验证点 |
|------|--------|
| Grid | 列数、间距、子元素排列 |
| Flex | 方向、对齐、间距 |
| Section | 布局模式、padding |
| Container | 最大宽度、居中 |
| Spacer | 高度/宽度 |

### 复合组件测试验证点

| 组件 | 验证点 |
|------|--------|
| Card | 标题分发到 header、内容分发到 content、按钮分发到 footer |
| Alert | 标题分发到 title、文本分发到 description |
| Table | TEXT 子元素分发到 header、正确的表格结构 |
| Tabs | Tab 触发器和内容面板 |

### 映射组件测试验证点

| 组件 | 验证点 |
|------|--------|
| Sidebar | 渲染为 Stack、direction:col、深色背景样式 |
| Header | 渲染为 Flex、justify:between、边框样式 |
| Nav | 渲染为 Flex、direction:col |
| Heading | 渲染为 Text、h2 标签、title 变体 |
| Form | 渲染为 Stack、direction:col、gap:4 |

---

## 运行测试

```bash
# 运行所有编译器测试
npx vitest run src/lib/compiler

# 运行单组件测试
npx vitest run src/lib/compiler/__tests__/unit/components

# 运行集成测试
npx vitest run src/lib/compiler/__tests__/integration

# 运行 E2E 测试
npx vitest run src/lib/compiler/__tests__/e2e

# 运行组件 Showcase 测试
npx vitest run src/lib/compiler/__tests__/showcase.test.ts
```

---

## 测试覆盖目标

| 层级 | 覆盖目标 |
|------|----------|
| 单组件 | 100% 组件类型覆盖 |
| 布局组合 | 常见嵌套模式覆盖 |
| 插槽分发 | 所有复合组件插槽规则验证 |
| E2E | 至少 3 个完整页面场景 |

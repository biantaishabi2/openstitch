# Stitch UI 编译器架构设计

## 概述

Stitch 不是一个简单的"JSON 转 HTML"渲染器，而是一个完整的 **UI 编译器**。

它的职责是：将 AI 产出的非结构化意图，编译为工程级可交付的 Web 资源。

```
AI 意图 (模糊、带幻觉)  →  编译器  →  工程级代码 (精确、可用)
```

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           输入层 (Input Layer)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ session_id  │  │  context    │  │ description │  │   schema    │    │
│  │ 会话标识    │  │ 语义种子    │  │ 自然语言指令 │  │ 结构化数据  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend Layer)                           │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    1. 词法分析器 (Lexer)                          │   │
│  │    解析 [Layout] [Theme] [Content] 等标签，生成 Token 流          │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    2. 语法分析器 (Parser)                         │   │
│  │    将 Token 流构建为抽象语法树 (AST)                              │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    3. 语义分析器 (Semantic Analyzer)              │   │
│  │    校验组件嵌套合法性、必填属性、类型匹配                          │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │ AST
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        中端层 (Middle Layer)                             │
│                                                                          │
│  ┌─────────────────────────────────┐  ┌──────────────────────────────┐  │
│  │  4. 设计系统合成器               │  │  5. 幻觉校对器                │  │
│  │     (Design System Synthesizer) │  │     (Hallucination Checker)  │  │
│  │                                 │  │                              │  │
│  │  context + session_id           │  │  比对 AI 输出与原始输入      │  │
│  │         ↓                       │  │  检测并修正胡编内容          │  │
│  │  getOrCreateDesignSystem()      │  │  强制截断溢出文本            │  │
│  │         ↓                       │  │                              │  │
│  │  Design Tokens (CSS Variables)  │  │                              │  │
│  └────────────────┬────────────────┘  └──────────────┬───────────────┘  │
│                   │                                  │                   │
│                   └──────────────┬───────────────────┘                   │
│                                  ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    6. IR 生成器 (IR Generator)                    │   │
│  │    AST + Tokens → 中间表示 (Intermediate Representation)          │   │
│  │    UINode JSON 就是我们的 IR                                      │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    7. 优化器 (Optimizer)                          │   │
│  │    - 样式去重 (CSS Deduplication)                                 │   │
│  │    - 组件合并 (Component Folding)                                 │   │
│  │    - 死代码消除 (Dead Code Elimination)                           │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │ Optimized IR
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        后端层 (Backend Layer)                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    8. 代码生成器 (Code Generator)                 │   │
│  │                                                                   │   │
│  │    IR → 目标代码，支持多种后端：                                   │   │
│  │                                                                   │   │
│  │    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │    │ React 后端  │  │ HTML 后端   │  │ HEEx 后端   │             │   │
│  │    │ (实时预览)  │  │ (静态导出)  │  │ (Phoenix)   │             │   │
│  │    └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    9. 资源打包器 (Bundler)                        │   │
│  │    - CSS 提取与压缩                                               │   │
│  │    - 图标/字体内联                                                │   │
│  │    - 临界 CSS 注入                                                │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           输出层 (Output Layer)                          │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  React DOM  │  │ HTML 文件   │  │  PNG/PDF    │  │  HEEx 代码  │    │
│  │  (Canvas)   │  │ (下载)      │  │  (快照)     │  │  (Phoenix)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 模块详解

### 1. 词法分析器 (Lexer)

**职责**：将 description 中的自然语言指令解析为 Token 流。

**输入**：
```
[Layout] Dashboard 布局，顶部统计卡片
[Content - Header] 标题"用户管理"，按钮"新增"
[Theme] 企业风格，主色蓝色
```

**输出**：
```
[LAYOUT_TAG, "Dashboard 布局，顶部统计卡片"]
[CONTENT_TAG, "Header", "标题"用户管理"，按钮"新增""]
[THEME_TAG, "企业风格，主色蓝色"]
```

---

### 2. 语法分析器 (Parser)

**职责**：将 Token 流构建为抽象语法树 (AST)。

**输出 AST**：
```
PageNode
├── LayoutNode (type: "dashboard")
├── ThemeNode (style: "enterprise", primary: "blue")
└── ContentNode
    ├── HeaderNode
    │   ├── TitleNode (text: "用户管理")
    │   └── ButtonNode (text: "新增")
    └── ...
```

---

### 3. 语义分析器 (Semantic Analyzer)

**职责**：校验 AST 的合法性。

**检查项**：
- 组件嵌套是否合法（Table 不能直接放在 Button 里）
- 必填属性是否存在（StatisticCard 必须有 label 和 value）
- 类型是否匹配（columns 必须是数字）
- 引用是否存在（icon="xxx" 必须是合法的图标名）

**输出**：校验通过的 AST，或错误列表。

---

### 4. 设计系统合成器 (Design System Synthesizer)

**职责**：根据 context 和 session_id 生成 Design Tokens。

**核心机制**：
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   context = "医疗健康App，专业可信"                      │
│                 │                                       │
│                 ▼                                       │
│   ┌─────────────────────────────┐                      │
│   │  1. 语义约束 (Semantic)     │                      │
│   │     "医疗" → 蓝绿色相区间   │                      │
│   │     "专业" → 低饱和度范围   │                      │
│   └─────────────┬───────────────┘                      │
│                 ▼                                       │
│   ┌─────────────────────────────┐                      │
│   │  2. Hash 定位 (Hashing)     │                      │
│   │     hash(context) = 0x3A7F  │                      │
│   │     hue = 150 + (hash % 50) │                      │
│   └─────────────┬───────────────┘                      │
│                 ▼                                       │
│   ┌─────────────────────────────┐                      │
│   │  3. 色阶生成 (Scale Gen)    │                      │
│   │     primary-50 ~ primary-950│                      │
│   └─────────────┬───────────────┘                      │
│                 ▼                                       │
│   ┌─────────────────────────────┐                      │
│   │  4. Session 锁定 (Lock)     │                      │
│   │     存入 SessionState       │                      │
│   │     后续页面强制继承        │                      │
│   └─────────────────────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**输出**：Design Tokens (CSS Variables)
```css
:root {
  --primary: hsl(178, 52%, 43%);
  --primary-50: hsl(178, 52%, 95%);
  --primary-100: hsl(178, 52%, 85%);
  ...
  --radius: 8px;
  --spacing-unit: 4px;
}
```

---

### 5. 幻觉校对器 (Hallucination Checker)

**职责**：检测并修正 AI 胡编的内容。

**检查项**：
- **文本比对**：AI 生成的文案是否与用户原始输入相符
- **数值合理性**：统计数字是否在合理范围内
- **布局溢出**：文本是否会撑爆容器

**处理方式**：
- 发现胡编 → 标记警告，请求 AI 重新生成
- 发现溢出 → 强制截断，添加省略号

---

### 6. IR 生成器 (IR Generator)

**职责**：将 AST + Design Tokens 转换为中间表示 (IR)。

我们的 **UINode JSON 就是 IR**：
```json
{
  "type": "Layout",
  "props": { "direction": "column" },
  "style": { "theme": "medical", "tokens": {...} },
  "children": [...]
}
```

---

### 7. 优化器 (Optimizer)

**职责**：优化 IR，减少冗余。

**优化项**：
- **样式去重**：多个组件用同一颜色，只定义一次 CSS 变量
- **组件合并**：连续的 Text 节点合并为一个
- **死代码消除**：移除 `display: none` 的组件

---

### 8. 代码生成器 (Code Generator)

**职责**：将 IR 转换为目标代码。

**支持的后端**：

| 后端 | 用途 | 输出 |
|------|------|------|
| React | 实时预览 | React 组件树 |
| HTML | 静态导出 | HTML + CSS 文件 |
| HEEx | Phoenix 集成 | HEEx 模板代码 |
| Image | 快照导出 | PNG/PDF |

---

### 9. 资源打包器 (Bundler)

**职责**：打包最终资源。

**功能**：
- CSS 提取与压缩
- 临界 CSS 内联到 `<head>`
- 图标 SVG 内联
- 字体子集化

---

## 增量编译 (Edit Design)

当用户修改设计时，不需要全量重新编译：

```
Edit 指令: [Edit - Table] 新增一列"登录时间"
                │
                ▼
        ┌───────────────┐
        │  Diff 计算器   │  比对新旧 AST
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  增量更新      │  只更新 Table 节点
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  Patch 生成    │  生成最小化补丁
        └───────────────┘
```

---

## 目录结构

```
src/lib/compiler/
├── frontend/                 # 前端层
│   ├── lexer.ts             # 词法分析器
│   ├── parser.ts            # 语法分析器
│   ├── semantic.ts          # 语义分析器
│   └── ast.ts               # AST 类型定义
│
├── middle/                   # 中端层
│   ├── synthesizer.ts       # 设计系统合成器
│   ├── session.ts           # Session State 管理
│   ├── hallucination.ts     # 幻觉校对器
│   ├── ir.ts                # IR 生成器
│   └── optimizer.ts         # 优化器
│
├── backend/                  # 后端层
│   ├── codegen/
│   │   ├── react.tsx        # React 后端
│   │   ├── html.ts          # HTML 后端
│   │   └── heex.ts          # HEEx 后端
│   └── bundler.ts           # 资源打包器
│
├── themes/                   # 主题系统（已有）
│   ├── tokens.ts
│   ├── presets.ts
│   └── override.ts
│
└── index.ts                  # 编译器入口
```

---

## API 设计

```typescript
// 编译器入口
const compiler = new StitchCompiler();

// 完整编译
const result = await compiler.compile({
  sessionId: "sess_001",
  context: "医疗健康App，专业可信",
  description: "[Layout] Dashboard... [Content] ...",
  schema: {...},
});

// 增量编译
const patch = await compiler.patch({
  sessionId: "sess_001",
  screenId: "screen_001",
  edits: "[Edit - Table] 新增一列",
});

// 导出
await compiler.export(result, { format: "html" });
await compiler.export(result, { format: "png", scale: 2 });
```

---

## 与渲染器的区别

| 维度 | 渲染器 (Renderer) | 编译器 (Compiler) |
|------|------------------|------------------|
| 输入 | 结构化 JSON | 非结构化意图 + JSON |
| 分析 | 无 | 词法/语法/语义分析 |
| 优化 | 无 | 样式去重/组件合并 |
| 状态 | 无状态 | Session State |
| 校验 | 无 | 幻觉检测/内容校对 |
| 输出 | 单一格式 | 多后端支持 |
| 增量 | 全量渲染 | 增量编译 |

---

## 补充机制

### Session State 继承（第二级约束）

在设计系统合成器中，需要实现会话级状态锁定：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Session State Manager                         │
│                                                                  │
│  首次渲染:                                                        │
│    sessionStore.has(sessionId) == false                          │
│         ↓                                                        │
│    theme = matchTheme(context)                                   │
│         ↓                                                        │
│    sessionStore.set(sessionId, { theme, context, lockedAt })     │
│         ↓                                                        │
│    返回 theme（新创建）                                           │
│                                                                  │
│  后续渲染:                                                        │
│    sessionStore.has(sessionId) == true                           │
│         ↓                                                        │
│    返回 sessionStore.get(sessionId).theme（强制继承）             │
│         ↓                                                        │
│    忽略传入的 context（即使有差异）                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**作用**：即使规划层传入的 context 有微小差异（空格、大小写），也能保证同一 Session 下的所有页面使用相同主题。

---

### AST Diff 计算（增量编译）

处理 `[Edit - xxx]` 指令时，不重新编译整个页面：

```
┌─────────────────────────────────────────────────────────────────┐
│                      AST Diff Engine                             │
│                                                                  │
│  输入:                                                           │
│    - 旧 AST (从 screen_xxx.json 读取)                            │
│    - Edit 指令 ([Edit - Table] 新增一列)                          │
│                                                                  │
│  处理:                                                           │
│    1. 定位目标节点 (type == "Table")                              │
│    2. 解析修改意图 (新增列)                                       │
│    3. 生成 Patch 对象                                            │
│                                                                  │
│  输出:                                                           │
│    {                                                             │
│      "op": "add",                                                │
│      "path": "/children/2/props/columns/-",                      │
│      "value": { "key": "lastLogin", "label": "最后登录" }        │
│    }                                                             │
│                                                                  │
│  应用:                                                           │
│    applyPatch(oldAST, patch) → newAST                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 错误恢复机制

编译器遇到错误时的降级策略：

| 阶段 | 错误类型 | 处理方式 |
|------|---------|---------|
| 词法分析 | 标签不识别 | 跳过该标签，记录警告，继续解析 |
| 语法分析 | 结构不完整 | 尝试自动补全，插入空节点 |
| 语义分析 | 组件嵌套非法 | 自动调整为合法结构（如 Button 包 Table → 提升 Table） |
| 设计合成 | 主题匹配失败 | 降级到默认主题 (tech) |
| 幻觉校对 | 内容不匹配 | 标记警告，请求 AI 重新生成 |
| 代码生成 | 组件未注册 | 渲染为占位符 + 错误提示 |

---

### Platform 分支处理

在 Component Factory 层，根据 platform 执行不同的编排逻辑：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Platform Adapter                              │
│                                                                  │
│  if platform == "web":                                           │
│    - 允许 Grid 多列布局                                          │
│    - 允许侧边栏导航                                              │
│    - 屏幕比例 16:9                                               │
│                                                                  │
│  if platform == "mobile":                                        │
│    - 强制垂直 Stack 布局                                         │
│    - 注入底部 TabBar（如果 mobile_navigation 存在）              │
│    - 屏幕比例 9:16                                               │
│    - 调整间距比例（更紧凑）                                      │
│    - 字体稍大（触控友好）                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 规划层与编译器的协作

### 核心架构："单脑多手"

这是一个**"集权规划，分权渲染"**的架构：

- **规划层（AI）**：唯一的"大脑"，一次性规划所有页面，输出 DSL
- **编译器（代码）**：多个并行的"翻译机器"，确定性地把 DSL 变成页面

```
┌─────────────────────────────────────────────────────────────────┐
│  用户输入                                                        │
│  "做一个 5 页的技术分享 PPT"                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  规划层 AI（单个大脑）                                            │
│                                                                  │
│  一次性思考，输出 5 份 JSON（每份包含一页的 DSL）：                │
│                                                                  │
│  [                                                               │
│    {                                                             │
│      "title": "封面",                                            │
│      "context": "技术分享PPT，企业风格",                          │
│      "description": "[Layout] Hero 布局\n[Content] 标题'架构'..."│
│    },                                                            │
│    {                                                             │
│      "title": "第2页",                                           │
│      "context": "技术分享PPT，企业风格",  ← 同样的 context        │
│      "description": "[Layout] 两栏布局\n[Content - Left]..."    │
│    },                                                            │
│    ... (共 5 份)                                                 │
│  ]                                                               │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  分发层（调度器）                                                 │
│                                                                  │
│  接收 5 份 JSON，分发给 5 个编译器实例并行处理                    │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  编译器层（纯代码，不是 AI）                                      │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │编译器 1 │ │编译器 2 │ │编译器 3 │ │编译器 4 │ │编译器 5 │   │
│  │ P1.json │ │ P2.json │ │ P3.json │ │ P4.json │ │ P5.json │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       ↓           ↓           ↓           ↓           ↓         │
│    P1.html    P2.html    P3.html    P4.html    P5.html         │
│                                                                  │
│  因为不思考，所以极速并行                                        │
│  因为不思考，所以绝对忠诚（色号一致、风格统一）                   │
└─────────────────────────────────────────────────────────────────┘
```

### 为什么不用"多个 AI Agent 并行"？

| 方案 | 问题 |
|------|------|
| 5 个 AI 分头写 | 风格会打架（AI 有随机性） |
| 5 个 AI 分头写 | 成本高、速度慢 |
| 5 个 AI 分头写 | 逻辑断层（不理解整体起承转合） |
| **1 个 AI + 5 个编译器** | ✅ 风格统一、极速、确定性 |

### 数据流详解

```
┌─────────────────────────────────────────────────────────────────┐
│  规划层 AI 输出的 JSON 结构                                      │
│                                                                  │
│  {                                                               │
│    "function_call": "generate_design",                          │
│    "arguments": {                                                │
│      "title": "用户管理",                                        │
│      "context": "医疗健康App，企业风格",    ← Hash 种子          │
│      "description": "..."                   ← DSL 在这里        │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  JSON 是"壳"，DSL 是"核"                                        │
│  - title/context：元信息，告诉编译器"用哪套主题"                 │
│  - description：真正的布局图纸                                   │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  description 字段里的 DSL（标签化格式）                          │
│                                                                  │
│  [Layout] Dashboard 布局，顶部统计卡片，下方数据表格              │
│  [Theme] 企业风格，主色调蓝色                                    │
│  [Content - Header] 标题"用户管理"，右侧"新增用户"按钮           │
│  [Content - Stats] 三个统计卡片：用户总数、活跃用户、新增用户     │
│  [Content - Table] 用户列表，列：用户名、邮箱、状态、操作         │
│                                                                  │
│  这是规划层 AI 输出的格式                                        │
│  标签是结构化的，内容是半自然语言                                │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  编译器内部：Zod 转换为 INTENT/ENTITY/ATTR 结构                  │
│                                                                  │
│  编译器用 Zod 把标签化 DSL 转成结构化的中间表示：                 │
│                                                                  │
│  {                                                               │
│    intent: "CREATE",                                             │
│    root: {                                                       │
│      type: "PAGE",                                               │
│      attrs: { layout: "DASHBOARD", theme: "ENTERPRISE_BLUE" },  │
│      children: [                                                 │
│        {                                                         │
│          type: "HEADER",                                         │
│          children: [                                             │
│            { type: "TITLE", attrs: { text: "用户管理" } },       │
│            { type: "BUTTON", attrs: { text: "新增用户" } }       │
│          ]                                                       │
│        },                                                        │
│        { type: "STATS", attrs: { items: [...] } },              │
│        { type: "TABLE", attrs: { columns: [...] } }             │
│      ]                                                           │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  INTENT/ENTITY/ATTR 是编译器内部的中间表示                       │
│  不是 AI 输出的，是 Zod 转换出来的                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### DSL 的两层结构

| 层级 | 格式 | 谁生成 | 用途 |
|------|------|--------|------|
| **外层** | `[Layout] xxx\n[Content - Header] xxx` | 规划层 AI | 给编译器的输入 |
| **内层** | `INTENT/ENTITY/ATTR` 结构 | 编译器（Zod） | 编译器内部的 AST |

AI 输出标签化 DSL（容错性高），编译器转成结构化 AST（确定性高）。

### 逻辑综合层的"语义收敛"

编译器用 Zod 处理三种语义收敛：

```
┌─────────────────────────────────────────────────────────────────┐
│                    语义收敛 (Semantic Convergence)               │
│                                                                  │
│  输入：[Content - Header] 标题"用户管理"，右侧"新增用户"按钮     │
│                                                                  │
│  1. 解析标签 (Chevrotain)                                        │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ { type: "content", param: "Header",                 │     │
│     │   content: "标题'用户管理'，右侧'新增用户'按钮" }    │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                  │
│  2. 内容解析 + 结构化 (Zod)                                      │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ {                                                   │     │
│     │   type: "HEADER",                                   │     │
│     │   children: [                                       │     │
│     │     { type: "TITLE", attrs: { text: "用户管理" } }, │     │
│     │     { type: "BUTTON", attrs: {                      │     │
│     │       text: "新增用户",                             │     │
│     │       position: "RIGHT"    ← 从"右侧"推断          │     │
│     │     }}                                              │     │
│     │   ]                                                 │     │
│     │ }                                                   │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                  │
│  3. 别名映射 + 默认值补全 (Zod transform)                        │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ BUTTON 没指定 color → 默认 "primary"               │     │
│     │ BUTTON 没指定 size  → 默认 "md"                    │     │
│     │ position: "RIGHT"   → className: "ml-auto"         │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 技术选型：语义收敛

### 为什么用 Zod 而不是 NLP 库

| 对比项 | Compromise/Natural (NLP) | Zod |
|--------|--------------------------|-----|
| **设计目标** | 处理自然语言文本 | 处理结构化数据 |
| **输入** | "我要一个蓝色按钮" | `{ color: "BLUE" }` |
| **输出** | 概率性（可能识别错） | 确定性（转换规则明确） |
| **性能** | 较慢（需要分词、标注） | 快（直接查表） |
| **依赖** | 较重（词典、模型文件） | 轻量（纯 JS） |
| **类型安全** | 无 | 完美 TypeScript 支持 |

**核心原因**：规划层 AI 输出的已经是结构化 DSL，不是自然语言。

```
自然语言: "我要一个蓝色按钮"     ← 需要 NLP 理解（规划层做）
结构化:   ATTR: COLOR(BLUE)      ← 只需要 Map 查表（编译器做）
```

对于结构化输入，用 NLP 是**杀鸡用牛刀**。

---

## 视觉引擎版本规划

### V1：静态别名映射（当前实现）

简单的查表映射，快速可用：

```typescript
import { z } from "zod";

// ============================================
// V1: 静态别名映射
// ============================================

const colorAliases: Record<string, string> = {
  // 蓝色系
  "blue": "blue-600",
  "ocean_blue": "blue-600",
  "sky": "blue-400",
  "navy": "blue-800",
  // 绿色系
  "green": "green-600",
  "teal": "teal-600",
  "medical": "teal-600",
  // 红色系
  "red": "red-600",
  "danger": "red-600",
  "error": "red-600",
};

const ColorAttr = z.string().transform((val) => {
  const key = val.toLowerCase();
  return colorAliases[key] || key;
});

// V1 使用示例
const input = { color: "OCEAN_BLUE" };
const result = ColorAttr.parse(input.color);  // → "blue-600"
```

**V1 特点**：
- ✅ 简单、快速、可预测
- ✅ 易于调试和维护
- ❌ 不够灵活，只有有限的预设组合
- ❌ 不支持场景感知

---

### V2：场景感知 + 可计算设计（目标架构）

设计变得"可计算"，同一语义在不同场景产出不同视觉：

```
┌─────────────────────────────────────────────────────────────────┐
│                      V2 视觉引擎输入                             │
│                                                                  │
│  1. 语义属性: COLOR(BLUE), SIZE(LARGE)                          │
│  2. 场景上下文: CONTEXT("技术调研") / CONTEXT("儿童教育")        │
│  3. Hash 种子: hash(session_id + context)                       │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   场景感知的颜色映射                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  COLOR(BLUE) + CONTEXT("技术调研")                       │   │
│  │    场景特征: 深邃、专业、可信                             │   │
│  │    色相区间: [210, 240]                                  │   │
│  │    饱和度: 60-80%                                        │   │
│  │    明度: 25-40%                                          │   │
│  │    → #1E40AF (深邃蓝)                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  COLOR(BLUE) + CONTEXT("儿童教育")                       │   │
│  │    场景特征: 活泼、明亮、友好                             │   │
│  │    色相区间: [200, 220]                                  │   │
│  │    饱和度: 70-90%                                        │   │
│  │    明度: 55-70%                                          │   │
│  │    → #60A5FA (天空蓝)                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  COLOR(BLUE) + CONTEXT("医疗健康")                       │   │
│  │    场景特征: 可信、清洁、专业                             │   │
│  │    色相区间: [180, 200]                                  │   │
│  │    饱和度: 50-70%                                        │   │
│  │    明度: 40-55%                                          │   │
│  │    → #0891B2 (青蓝)                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**V2 核心算法**：

```typescript
// ============================================
// V2: 场景感知 + Hash 确定性
// ============================================

interface ContextConstraints {
  hueRange: [number, number];
  satRange: [number, number];
  lightRange: [number, number];
  radiusScale: number;      // 圆角系数
  spacingScale: number;     // 间距系数
  fontScale: number;        // 字体系数
  shadowIntensity: number;  // 阴影强度
}

// 场景 → 约束范围
const contextConstraints: Record<string, ContextConstraints> = {
  "技术调研": {
    hueRange: [210, 240],
    satRange: [60, 80],
    lightRange: [25, 40],
    radiusScale: 0.5,       // 较小圆角，硬朗
    spacingScale: 1.0,      // 标准间距
    fontScale: 1.0,         // 标准字体
    shadowIntensity: 0.3,   // 轻阴影
  },
  "儿童教育": {
    hueRange: [200, 220],
    satRange: [70, 90],
    lightRange: [55, 70],
    radiusScale: 1.5,       // 大圆角，柔和
    spacingScale: 1.2,      // 宽松间距
    fontScale: 1.1,         // 稍大字体
    shadowIntensity: 0.5,   // 明显阴影
  },
  "医疗健康": {
    hueRange: [180, 200],
    satRange: [50, 70],
    lightRange: [40, 55],
    radiusScale: 0.75,      // 中等圆角
    spacingScale: 1.1,      // 舒适间距
    fontScale: 1.0,         // 标准字体
    shadowIntensity: 0.2,   // 极轻阴影，干净
  },
  "金融商务": {
    hueRange: [220, 250],
    satRange: [40, 60],
    lightRange: [20, 35],
    radiusScale: 0.25,      // 极小圆角，严肃
    spacingScale: 0.9,      // 紧凑间距
    fontScale: 0.95,        // 稍小字体
    shadowIntensity: 0.4,   // 中等阴影
  },
};

// Hash 函数（确定性）
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// V2 颜色计算
function computeColor(
  semanticColor: string,
  context: string,
  sessionId: string
): string {
  const constraints = contextConstraints[context] || contextConstraints["技术调研"];
  const seed = hashCode(sessionId + context + semanticColor);

  const [hueMin, hueMax] = constraints.hueRange;
  const [satMin, satMax] = constraints.satRange;
  const [lightMin, lightMax] = constraints.lightRange;

  const hue = hueMin + (seed % (hueMax - hueMin));
  const sat = satMin + ((seed >> 8) % (satMax - satMin));
  const light = lightMin + ((seed >> 16) % (lightMax - lightMin));

  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

// V2 完整 Design Tokens 生成
function generateDesignTokens(
  context: string,
  sessionId: string
): Record<string, string> {
  const constraints = contextConstraints[context] || contextConstraints["技术调研"];
  const baseUnit = 8;

  return {
    // 颜色
    "--primary-color": computeColor("PRIMARY", context, sessionId),
    "--secondary-color": computeColor("SECONDARY", context, sessionId),
    "--background": computeColor("BACKGROUND", context, sessionId),
    "--foreground": computeColor("FOREGROUND", context, sessionId),

    // 空间（受场景影响）
    "--base-unit": `${baseUnit}px`,
    "--spacing-sm": `${baseUnit * constraints.spacingScale}px`,
    "--spacing-md": `${baseUnit * 2 * constraints.spacingScale}px`,
    "--spacing-lg": `${baseUnit * 3 * constraints.spacingScale}px`,

    // 圆角（受场景影响）
    "--radius-sm": `${4 * constraints.radiusScale}px`,
    "--radius-md": `${8 * constraints.radiusScale}px`,
    "--radius-lg": `${12 * constraints.radiusScale}px`,

    // 字体（受场景影响）
    "--font-scale": `${constraints.fontScale}`,
    "--font-size-base": `${16 * constraints.fontScale}px`,

    // 阴影（受场景影响）
    "--shadow-sm": `0 1px 2px rgba(0,0,0,${constraints.shadowIntensity * 0.5})`,
    "--shadow-md": `0 4px 6px rgba(0,0,0,${constraints.shadowIntensity})`,
    "--shadow-lg": `0 10px 15px rgba(0,0,0,${constraints.shadowIntensity * 1.5})`,
  };
}

// 使用示例
const tokens = generateDesignTokens("儿童教育", "sess_001");
// {
//   "--primary-color": "hsl(208, 78%, 62%)",  // 天空蓝
//   "--base-unit": "8px",
//   "--spacing-md": "19.2px",                  // 1.2x 宽松
//   "--radius-md": "12px",                     // 1.5x 大圆角
//   "--font-size-base": "17.6px",              // 1.1x 稍大
//   "--shadow-md": "0 4px 6px rgba(0,0,0,0.5)" // 明显阴影
// }
```

**V2 确定性保证**：

```
┌─────────────────────────────────────────────────────────────────┐
│                      Hash 确定性                                 │
│                                                                  │
│  输入相同 → 输出相同                                             │
│                                                                  │
│  第一次生成:                                                     │
│    generateDesignTokens("儿童教育", "sess_001")                  │
│    → "--primary-color": "hsl(208, 78%, 62%)"                    │
│                                                                  │
│  第二次生成（同样输入）:                                         │
│    generateDesignTokens("儿童教育", "sess_001")                  │
│    → "--primary-color": "hsl(208, 78%, 62%)"  ✓ 相同            │
│                                                                  │
│  不同 Session:                                                   │
│    generateDesignTokens("儿童教育", "sess_002")                  │
│    → "--primary-color": "hsl(212, 82%, 65%)"  ✗ 不同            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### V1 → V2 升级路径

```
┌─────────────────────────────────────────────────────────────────┐
│                       升级路径                                   │
│                                                                  │
│  V1 (当前)                      V2 (目标)                       │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  静态别名映射                   场景感知映射                     │
│  colorAliases["blue"]          computeColor("BLUE", context)    │
│       ↓                              ↓                          │
│  "blue-600"                    "hsl(208, 78%, 62%)"             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  固定 Preset                    可计算设计                       │
│  presets.tech                   generateDesignTokens(context)   │
│  presets.medical                     +                          │
│  presets.edu                    Hash 确定性种子                  │
│  (12种)                         (无限组合)                       │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  渲染器 (Renderer)              编译器 (Compiler)                │
│  JSON → React                   DSL → AST → IR → 多后端         │
│  无状态                         Session State                    │
│  无校验                         幻觉检测 + 语义校验              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 拼写纠错（V1/V2 通用）

如果 AI 输出有拼写错误，用 Levenshtein 距离做模糊匹配：

```typescript
import { distance } from "fastest-levenshtein";

function fuzzyMatch(input: string, candidates: string[]): string | null {
  const threshold = 2;
  for (const candidate of candidates) {
    if (distance(input.toLowerCase(), candidate) <= threshold) {
      return candidate;
    }
  }
  return null;
}

// 使用
fuzzyMatch("BLUEE", ["blue", "red", "green"]);  // → "blue"
```

---

## 存储策略

### 核心原则

- **DSL 是源代码**，要持久化
- **AST 是编译产物**，不需要存（随时可从 DSL 重新编译）
- **Design Tokens 实时计算**，不需要持久化（只在导出时固化）

### 什么要存，什么不存

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ✅ 要持久化：DSL 源文件                                         │
│                                                                  │
│     DSL 是用户意图的"源代码"。                                   │
│     用户要改文字、改布局，都是在 DSL 层面修改，                   │
│     改完重新编译。                                               │
│                                                                  │
│     存储位置：                                                   │
│     project/screens/                                             │
│     ├── screen_001.dsl.json                                     │
│     ├── screen_002.dsl.json                                     │
│     └── ...                                                      │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ❌ 不需要存：AST                                                │
│                                                                  │
│     AST 是从 DSL 编译出来的中间产物。                            │
│     只要 DSL 在，随时可以重新编译出 AST。                        │
│     存 AST 是冗余的。                                            │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ❌ 不需要持久化：Design Tokens                                  │
│                                                                  │
│     设计过程中，用户会不断调整：换颜色、改间距、试风格。          │
│     每次调整，context 或参数变了，Hash 就变了，Tokens 值跟着变。 │
│                                                                  │
│     但名字不变：                                                 │
│       --primary-color    ← 名字固定                             │
│       #0891B2 → #1E40AF  ← 值随调整变化                         │
│                                                                  │
│     Tokens 实时计算，不存。                                      │
│     只在导出时才固化成 CSS 文件。                                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ✅ 导出时才生成：最终产物                                       │
│                                                                  │
│     用户点击"导出"的那一刻：                                     │
│     1. 根据当前 context + session_id 计算 Design Tokens          │
│     2. 编译所有 DSL → AST → IR → 目标代码                       │
│     3. 把 Tokens 写入 design-tokens.css                         │
│     4. 打包输出                                                  │
│                                                                  │
│     输出位置：                                                   │
│     dist/                                                        │
│     ├── design-tokens.css   ← 导出时生成                        │
│     ├── index.html                                               │
│     └── ...                                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 修改流程

用户要改按钮文字"提交"→"确认"：

1. 读取 `screen_001.dsl.json`（DSL 源文件）
2. 找到 BUTTON 节点，把 `ATTR: TEXT("提交")` 改成 `ATTR: TEXT("确认")`
3. 保存 DSL 文件
4. 重新编译：DSL → AST → 渲染预览
5. Design Tokens 不用管，实时计算，context 没变，值就一样

### 导出流程

用户点击"导出"：

1. 读取当前 context 和 session_id
2. 计算 Design Tokens（此时才固化值）
3. 遍历所有 DSL 文件，编译成目标代码（HTML/React/HEEx）
4. 把 Tokens 写入 `design-tokens.css`
5. 打包所有文件到 `dist/` 目录

### 为什么 Design Tokens 不存？

因为设计是迭代的。用户今天觉得蓝色好，明天可能想试试绿色。如果把 Tokens 持久化了，每次调整都要改文件，很麻烦。

实时计算的好处：
- 用户改 context，Tokens 自动变
- 用户改参数，Tokens 自动变
- 只要输入一样，输出就一样（Hash 确定性）
- 导出时才固化，之前随便调

---

## 云端存储架构

### 为什么用文件系统而不是数据库

Stitch 是云端版本，但 DSL 存在服务器文件系统，不用数据库。原因：

**简单可靠**
- 不需要维护数据库
- 文件系统天然支持目录隔离
- 每个用户/项目一个目录，互不干扰

**可以用 Git 版本控制**
- 服务器上可以给每个项目初始化 Git 仓库
- 自动记录修改历史
- 用户可以回滚到任意版本

**容易备份和迁移**
- 直接打包目录就能备份
- 可以用对象存储（S3、OSS）做异地同步
- 迁移服务器只需要复制文件夹

**符合编译器的工作方式**
- 编译器读写文件是最自然的
- 不需要序列化/反序列化到数据库
- 文件路径就是资源定位符

### 服务器目录结构

```
/data/stitch/
│
├── users/
│   └── {user_id}/
│       └── projects/
│           │
│           ├── {project_id}/                    # 项目 A
│           │   ├── stitch.config.json           # 项目配置
│           │   │   {
│           │   │     "name": "医疗健康App",
│           │   │     "context": "医疗健康，专业可信",
│           │   │     "sessionId": "sess_001",
│           │   │     "createdAt": "2024-01-15",
│           │   │     "platform": "web"
│           │   │   }
│           │   │
│           │   ├── screens/                     # DSL 源文件
│           │   │   ├── home.dsl.json           # 首页
│           │   │   ├── user-list.dsl.json      # 用户列表
│           │   │   ├── user-detail.dsl.json    # 用户详情
│           │   │   └── settings.dsl.json       # 设置页
│           │   │
│           │   ├── assets/                      # 静态资源
│           │   │   ├── logo.svg
│           │   │   └── ...
│           │   │
│           │   ├── .git/                        # Git 版本控制（可选）
│           │   │
│           │   └── dist/                        # 编译输出
│           │       ├── design-tokens.css
│           │       ├── index.html
│           │       └── ...
│           │
│           └── {project_id}/                    # 项目 B
│               └── ...
│
└── tmp/                                         # 临时文件（编译中间产物）
    └── ...
```

### 文件说明

| 文件/目录 | 作用 | 持久化 |
|----------|------|--------|
| `stitch.config.json` | 项目配置（context、session_id） | ✅ |
| `screens/*.dsl.json` | DSL 源文件，用户意图的源代码 | ✅ |
| `assets/` | 用户上传的图片、图标等 | ✅ |
| `.git/` | 版本历史（可选） | ✅ |
| `dist/` | 编译输出，导出时生成 | 可选（可重新生成） |
| `tmp/` | 编译临时文件 | ❌ 用完即删 |

### 读写流程

**用户打开项目**：
1. 根据 user_id 和 project_id 定位目录
2. 读取 `stitch.config.json` 获取配置
3. 列出 `screens/` 目录下所有 DSL 文件
4. 根据 context 实时计算 Design Tokens
5. 编译 DSL → 渲染预览

**用户修改页面**：
1. 修改内存中的 DSL 结构
2. 保存到 `screens/xxx.dsl.json`
3. 重新编译该页面
4. 更新预览

**用户导出项目**：
1. 读取当前配置，计算 Design Tokens
2. 编译所有 DSL 文件
3. 生成 `dist/` 目录下的文件
4. 打包下载或部署

---

## DSL 解析与 AST 构建

### 编译器处理流程

```
┌─────────────────────────────────────────────────────────────────┐
│  规划层 AI 输出的 JSON                                           │
│  {                                                               │
│    "title": "用户管理",                                          │
│    "context": "企业后台",                                         │
│    "description": "[Layout] Dashboard...\n[Content - Header]..." │
│  }                                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Chevrotain 解析标签                                     │
│                                                                  │
│  输入："[Layout] Dashboard 布局\n[Content - Header] 标题..."    │
│  输出：                                                          │
│  [                                                               │
│    { type: "layout", content: "Dashboard 布局..." },            │
│    { type: "content", param: "Header", content: "标题..." },    │
│    { type: "content", param: "Stats", content: "..." },         │
│  ]                                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Zod 内容解析 + 结构化                                   │
│                                                                  │
│  把每个标签的 content 转成 ENTITY/ATTR 结构：                    │
│                                                                  │
│  "标题'用户管理'，右侧'新增用户'按钮"                            │
│       ↓ Zod 解析                                                 │
│  {                                                               │
│    type: "HEADER",                                               │
│    children: [                                                   │
│      { type: "TITLE", attrs: { text: "用户管理" } },            │
│      { type: "BUTTON", attrs: { text: "新增用户", pos: "RIGHT" }}│
│    ]                                                             │
│  }                                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: 组装完整 AST                                            │
│                                                                  │
│  {                                                               │
│    intent: "CREATE",                                             │
│    root: {                                                       │
│      type: "PAGE",                                               │
│      attrs: { layout: "DASHBOARD" },                            │
│      children: [                                                 │
│        { type: "HEADER", children: [...] },                     │
│        { type: "STATS", children: [...] },                      │
│        { type: "TABLE", children: [...] }                       │
│      ]                                                           │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Chevrotain 解析标签

解析 AI 输出的标签化 DSL：

```typescript
// ============================================
// lexer.ts - 解析 [Layout] [Content - xxx] 等标签
// ============================================

import { createToken, Lexer } from "chevrotain";

export const LayoutTag = createToken({
  name: "LayoutTag",
  pattern: /\[Layout\]/
});

export const ThemeTag = createToken({
  name: "ThemeTag",
  pattern: /\[Theme\]/
});

export const ContentTag = createToken({
  name: "ContentTag",
  pattern: /\[Content\s*-\s*([^\]]+)\]/
});

export const EditTag = createToken({
  name: "EditTag",
  pattern: /\[Edit\s*-\s*([^\]]+)\]/
});

export const DetailsTag = createToken({
  name: "DetailsTag",
  pattern: /\[Details\]/
});

export const TextContent = createToken({
  name: "TextContent",
  pattern: /[^\[]+/,
});

export const allTokens = [
  LayoutTag, ThemeTag, ContentTag, EditTag, DetailsTag, TextContent,
];

export const StitchLexer = new Lexer(allTokens);
```

### Step 2: Zod 内容解析

把标签内容（半自然语言）转成结构化的 ENTITY/ATTR：

```typescript
// ============================================
// content-parser.ts - Zod 解析标签内容
// ============================================

import { z } from "zod";

// 内容解析规则
const contentPatterns = {
  // 标题模式：标题"xxx" 或 标题'xxx'
  title: /标题[\"']([^\"']+)[\"']/,

  // 按钮模式：xxx按钮 或 "xxx"按钮
  button: /[\"']([^\"']+)[\"']按钮|(\S+)按钮/,

  // 位置模式：右侧、左侧、顶部、底部
  position: /(右侧|左侧|顶部|底部)/,

  // 图标模式：图标xxx 或 icon:xxx
  icon: /图标[:\s]*(\S+)|icon[:\s]*(\S+)/i,
};

// Header 内容解析器
const HeaderContentSchema = z.string().transform((content) => {
  const result: any = { type: "HEADER", children: [] };

  // 提取标题
  const titleMatch = content.match(contentPatterns.title);
  if (titleMatch) {
    result.children.push({
      type: "TITLE",
      attrs: { text: titleMatch[1] }
    });
  }

  // 提取按钮
  const buttonMatch = content.match(contentPatterns.button);
  if (buttonMatch) {
    const buttonText = buttonMatch[1] || buttonMatch[2];
    const posMatch = content.match(contentPatterns.position);

    result.children.push({
      type: "BUTTON",
      attrs: {
        text: buttonText,
        position: posMatch ? posMatch[1] : "RIGHT"
      }
    });
  }

  return result;
});

// Stats 内容解析器
const StatsContentSchema = z.string().transform((content) => {
  // 提取统计项：三个统计卡片：用户总数、活跃用户、新增用户
  const itemsMatch = content.match(/[:：](.+)/);
  if (itemsMatch) {
    const items = itemsMatch[1].split(/[,，、]/).map(s => s.trim());
    return {
      type: "STATS",
      attrs: { items }
    };
  }
  return { type: "STATS", attrs: { items: [] } };
});

// Table 内容解析器
const TableContentSchema = z.string().transform((content) => {
  // 提取列：列：用户名、邮箱、状态
  const columnsMatch = content.match(/列[:：](.+)/);
  if (columnsMatch) {
    const columns = columnsMatch[1].split(/[,，、]/).map(s => s.trim());
    return {
      type: "TABLE",
      attrs: { columns }
    };
  }
  return { type: "TABLE", attrs: { columns: [] } };
});

// 根据标签类型选择解析器
export function parseContent(tagType: string, param: string | null, content: string) {
  switch (param?.toUpperCase()) {
    case "HEADER":
      return HeaderContentSchema.parse(content);
    case "STATS":
      return StatsContentSchema.parse(content);
    case "TABLE":
      return TableContentSchema.parse(content);
    default:
      return { type: param || "UNKNOWN", attrs: { raw: content } };
  }
}
```

### Step 3: 组装 AST

```typescript
// ============================================
// ast-builder.ts - 组装完整 AST
// ============================================

import { StitchLexer } from "./lexer";
import { parseContent } from "./content-parser";

export interface ASTNode {
  type: string;
  attrs: Record<string, any>;
  children: ASTNode[];
}

export interface StitchAST {
  intent: "CREATE" | "EDIT";
  root: ASTNode;
}

export function compile(input: {
  title: string;
  context: string;
  description: string;
}): StitchAST {
  // 1. 解析标签
  const lexResult = StitchLexer.tokenize(input.description);

  // 2. 提取指令列表
  const instructions = extractInstructions(lexResult.tokens);

  // 3. 构建 AST
  const root: ASTNode = {
    type: "PAGE",
    attrs: {
      title: input.title,
      context: input.context,
      layout: "DEFAULT"
    },
    children: []
  };

  for (const inst of instructions) {
    if (inst.type === "layout") {
      // 解析布局
      root.attrs.layout = parseLayout(inst.content);
    } else if (inst.type === "content") {
      // 解析内容块
      const node = parseContent(inst.type, inst.param, inst.content);
      root.children.push(node);
    }
  }

  return {
    intent: "CREATE",
    root
  };
}

function parseLayout(content: string): string {
  if (content.includes("Dashboard")) return "DASHBOARD";
  if (content.includes("三栏") || content.includes("三列")) return "THREE_COLUMN";
  if (content.includes("两栏") || content.includes("分栏")) return "TWO_COLUMN";
  return "DEFAULT";
}
```

### 完整编译流程示例

```typescript
// 输入：规划层 AI 的 JSON
const input = {
  title: "用户管理",
  context: "企业后台，专业风格",
  description: `
[Layout] Dashboard 布局，顶部统计卡片，下方数据表格
[Theme] 企业风格，主色调蓝色
[Content - Header] 标题"用户管理"，右侧"新增用户"按钮
[Content - Stats] 三个统计卡片：用户总数、活跃用户、新增用户
[Content - Table] 用户列表，列：用户名、邮箱、状态、操作
`
};

// 编译
const ast = compile(input);

// 输出：结构化 AST
console.log(JSON.stringify(ast, null, 2));
// {
//   "intent": "CREATE",
//   "root": {
//     "type": "PAGE",
//     "attrs": {
//       "title": "用户管理",
//       "context": "企业后台，专业风格",
//       "layout": "DASHBOARD"
//     },
//     "children": [
//       {
//         "type": "HEADER",
//         "children": [
//           { "type": "TITLE", "attrs": { "text": "用户管理" } },
//           { "type": "BUTTON", "attrs": { "text": "新增用户", "position": "RIGHT" } }
//         ]
//       },
//       {
//         "type": "STATS",
//         "attrs": { "items": ["用户总数", "活跃用户", "新增用户"] }
//       },
//       {
//         "type": "TABLE",
//         "attrs": { "columns": ["用户名", "邮箱", "状态", "操作"] }
//       }
//     ]
//   }
// }
```

---

## 技术选型：AST 解析

### 为什么不用 Tree-sitter

Tree-sitter 是为**编程语言**设计的解析器生成器（TypeScript、Python、Go 等），具有以下特点：

- 处理复杂的上下文无关文法
- 支持增量解析
- 需要编写 grammar.js 语法定义
- 运行时依赖 WASM/Native 模块

**Stitch 不需要 Tree-sitter**，因为：

1. 我们的语法很简单：`INTENT`、`ENTITY`、`ATTR`
2. 不是传统编程语言，而是结构化的 DSL
3. Tree-sitter 引入的复杂度和依赖不值得

---

### 推荐方案：Chevrotain

**Chevrotain** 是 TypeScript 生态中最适合 Stitch 的选择：

| 特性 | 说明 |
|------|------|
| TypeScript 原生 | 用 TS 编写，类型支持完美 |
| 无代码生成 | 直接在运行时定义语法，无需构建步骤 |
| 高性能 | 比 PEG.js 快 3-10 倍 |
| 错误恢复 | 内置错误恢复机制，适合容错编译 |
| 零运行时依赖 | 纯 JS，不依赖 WASM 或 Native |

**安装**：
```bash
npm install chevrotain
```

---

### 备选方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **Chevrotain** ⭐ | 结构化 DSL | TS 原生、快、错误恢复好 | 学习曲线稍陡 |
| **Peggy (PEG.js)** | 简单语法 | 语法直观、易上手 | 需代码生成步骤 |
| **Nearley + Moo** | 歧义语法 | 处理歧义能力强 | 两个库配合使用 |
| **手写正则** | 极简场景 | 零依赖 | 难扩展、难维护 |
| **Tree-sitter** | 编程语言 | 增量解析强 | 过度工程、依赖重 |

---

### Chevrotain 实现示例

#### 1. Token 定义 (lexer.ts)

```typescript
import { createToken, Lexer } from "chevrotain";

// 标签 Token
export const LayoutTag = createToken({
  name: "LayoutTag",
  pattern: /\[Layout\]/
});

export const ThemeTag = createToken({
  name: "ThemeTag",
  pattern: /\[Theme\]/
});

export const ContentTag = createToken({
  name: "ContentTag",
  pattern: /\[Content\s*-\s*([^\]]+)\]/
});

export const EditTag = createToken({
  name: "EditTag",
  pattern: /\[Edit\s*-\s*([^\]]+)\]/
});

export const DetailsTag = createToken({
  name: "DetailsTag",
  pattern: /\[Details\]/
});

// 文本内容（直到下一个标签或结束）
export const TextContent = createToken({
  name: "TextContent",
  pattern: /[^\[]+/,
});

// 换行
export const Newline = createToken({
  name: "Newline",
  pattern: /\r?\n/,
  group: Lexer.SKIPPED,
});

// 空白
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED,
});

// Token 列表（顺序重要，优先匹配具体的）
export const allTokens = [
  WhiteSpace,
  Newline,
  LayoutTag,
  ThemeTag,
  ContentTag,
  EditTag,
  DetailsTag,
  TextContent,
];

export const StitchLexer = new Lexer(allTokens);
```

#### 2. Parser 定义 (parser.ts)

```typescript
import { CstParser } from "chevrotain";
import { allTokens, LayoutTag, ThemeTag, ContentTag, TextContent } from "./lexer";

class StitchParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  // 顶层规则：指令列表
  public instructions = this.RULE("instructions", () => {
    this.MANY(() => {
      this.SUBRULE(this.instruction);
    });
  });

  // 单条指令
  private instruction = this.RULE("instruction", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.layoutInstruction) },
      { ALT: () => this.SUBRULE(this.themeInstruction) },
      { ALT: () => this.SUBRULE(this.contentInstruction) },
    ]);
  });

  // Layout 指令
  private layoutInstruction = this.RULE("layoutInstruction", () => {
    this.CONSUME(LayoutTag);
    this.OPTION(() => this.CONSUME(TextContent));
  });

  // Theme 指令
  private themeInstruction = this.RULE("themeInstruction", () => {
    this.CONSUME(ThemeTag);
    this.OPTION(() => this.CONSUME(TextContent));
  });

  // Content 指令
  private contentInstruction = this.RULE("contentInstruction", () => {
    this.CONSUME(ContentTag);
    this.OPTION(() => this.CONSUME(TextContent));
  });
}

export const parser = new StitchParser();
```

#### 3. AST 转换 (ast.ts)

```typescript
import { parser } from "./parser";
import { StitchLexer } from "./lexer";

export interface InstructionNode {
  type: "layout" | "theme" | "content" | "edit" | "details";
  param?: string;     // Content/Edit 的参数，如 "Header"
  content: string;    // 标签后的文本内容
}

export interface StitchAST {
  instructions: InstructionNode[];
}

export function parse(input: string): StitchAST {
  // 1. 词法分析
  const lexResult = StitchLexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    console.warn("Lexer errors:", lexResult.errors);
  }

  // 2. 语法分析
  parser.input = lexResult.tokens;
  const cst = parser.instructions();

  if (parser.errors.length > 0) {
    console.warn("Parser errors:", parser.errors);
  }

  // 3. CST → AST 转换
  return cstToAst(cst);
}

function cstToAst(cst: any): StitchAST {
  // CST visitor 实现...
  // 将 Chevrotain 的 CST 转换为我们的 AST 结构
}
```

#### 4. 使用示例

```typescript
import { parse } from "./compiler/frontend/ast";

const input = `
[Layout] Dashboard 布局，顶部统计卡片，下方数据表格
[Theme] 企业蓝，专业简洁
[Content - Header] 标题"用户管理"，右侧"新增用户"按钮
[Content - Stats] 四个统计卡片：总用户数、活跃用户、新增用户、付费用户
[Content - Table] 用户列表表格，列：头像、姓名、邮箱、状态、操作
`;

const ast = parse(input);
// {
//   instructions: [
//     { type: "layout", content: "Dashboard 布局，顶部统计卡片，下方数据表格" },
//     { type: "theme", content: "企业蓝，专业简洁" },
//     { type: "content", param: "Header", content: "标题"用户管理"..." },
//     { type: "content", param: "Stats", content: "四个统计卡片..." },
//     { type: "content", param: "Table", content: "用户列表表格..." },
//   ]
// }
```

---

### 语法扩展性

Chevrotain 的优势在于语法定义是**运行时代码**，扩展非常方便：

```typescript
// 添加新标签只需：
// 1. 定义新 Token
export const InteractionTag = createToken({
  name: "InteractionTag",
  pattern: /\[Interaction\]/
});

// 2. 加入 Token 列表
allTokens.push(InteractionTag);

// 3. 添加 Parser 规则
private interactionInstruction = this.RULE("interactionInstruction", () => {
  this.CONSUME(InteractionTag);
  this.OPTION(() => this.CONSUME(TextContent));
});
```

无需重新生成代码，无需额外构建步骤。

---

## 下一步

1. **安装 Chevrotain**：`npm install chevrotain`
2. **实现词法分析器**：解析 `[Layout]` `[Content]` 等标签
3. **实现设计系统合成器**：Hash 种子 + Session State
4. **实现幻觉校对器**：基础的文本比对
5. **重构现有渲染器**：作为 React 后端集成到编译器中

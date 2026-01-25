# Specification: Stitch UI 编译器

## Overview

实现 Stitch UI 编译器，将 AI 产出的 DSL 指令编译为工程级可交付的 Web 资源（React 组件 / 静态 HTML）。

## Workflow Type

feature

## Task Scope

**In scope**：
- 逻辑引擎（并行）：词法分析(Chevrotain)、语法分析(Chevrotain)、语义收敛(Zod) → AST
- 视觉引擎（并行）：5 维度 Design Tokens 生成、Session State 管理
- 组件工厂（汇合点）：IR 生成、优化器、Props 归一化、插槽分发、事件桩函数、Context 注入
- SSR 引擎：代码生成器（React/HTML/HEEx）、资源打包器、脱水渲染、样式萃取、资源固化

**Out of scope**：
- 规划层 AI（由 Gemini 等外部 AI 负责）
- 数据库存储（使用文件系统）
- 用户认证/权限

## Success Criteria

- DSL 输入能正确解析为 AST
- 同一 context 生成的 Design Tokens 完全一致（Hash 确定性）
- 组件工厂输出的 React 树可正常渲染
- SSR 引擎输出的 HTML 为单文件、零依赖、可离线运行
- CSS 萃取后体积 < 10KB

## Source Document

所有设计细节以此文档为唯一来源：

**`docs/compiler-architecture.md`**

### 章节索引

| 章节 | 行号 | 内容 |
|------|------|------|
| 概述 | L3 | 编译器定位与职责 |
| 整体架构 | L15 | 逻辑引擎 ∥ 视觉引擎 → 组件工厂 → SSR 引擎 |
| 模块详解 | L106 | 各模块详细职责 |
| 增量编译 | L265 | Edit Design 的 Diff 机制 |
| 目录结构 | L290 | `src/lib/compiler/` 目录规划 |
| API 设计 | L323 | `StitchCompiler` 接口 |
| 与渲染器的区别 | L351 | 编译器 vs 渲染器对比 |
| 补充机制 | L365 | Session State、AST Diff、错误恢复、Platform 分支 |
| 规划层与编译器的协作 | L469 | "单脑多手"架构、DSL 两层结构 |
| 技术选型：语义收敛 | L651 | Zod vs NLP 库 |
| 视觉引擎架构 | L675 | 5 个控制维度（空间/字体/形状/装饰/语义映射） |
| 组件工厂层 | L943 | 4 大职责（Props归一化/插槽分发/事件桩函数/Context注入） |
| SSR 引擎层 | L1394 | 脱水渲染/样式萃取/资源固化 |
| 视觉引擎版本规划 | L1689 | V1 静态映射 / V2 场景感知 |
| 存储策略 | L2002 | DSL持久化、AST不存、Tokens实时计算 |
| 云端存储架构 | L2220 | 文件系统目录结构 |
| DSL 解析与 AST 构建 | L2323 | Chevrotain + Zod 实现 |
| 技术选型：AST 解析 | L2652 | Chevrotain vs 其他方案 |

## Requirements

- TypeScript 实现
- 依赖：Chevrotain（词法/语法分析）、Zod（语义收敛）、PurgeCSS（样式萃取）
- React 19 + Next.js 16
- 文件系统存储 DSL

## Files to Modify

### 新建文件

```
src/lib/compiler/
├── logic/                        # 逻辑引擎（并行）
│   ├── lexer.ts                  # 词法分析器 (Chevrotain)
│   ├── parser.ts                 # 语法分析器 (Chevrotain)
│   ├── semantic.ts               # 语义收敛器 (Zod)
│   └── ast.ts                    # AST 类型定义
├── visual/                       # 视觉引擎（并行）
│   ├── synthesizer.ts            # 设计系统合成器
│   └── session.ts                # Session State 管理
├── factory/                      # 组件工厂（汇合点）
│   ├── component-factory.tsx     # 组件工厂
│   ├── ir.ts                     # IR 生成器（AST + Tokens → UINode）
│   ├── optimizer.ts              # 优化器
│   ├── props-normalizer.ts       # Props 归一化
│   ├── slot-distributor.ts       # 插槽分发
│   └── event-stubs.ts            # 事件桩函数
├── ssr/                          # SSR 引擎
│   ├── codegen/
│   │   ├── react.tsx             # React 后端
│   │   ├── html.ts               # HTML 后端
│   │   └── heex.ts               # HEEx 后端
│   ├── bundler.ts                # 资源打包器
│   └── renderer.ts               # 脱水渲染
└── index.ts                      # 编译器入口
```

### 修改文件

- `src/lib/renderer/renderer.tsx` - 重构为 SSR 引擎的 React 后端 (`ssr/codegen/react.tsx`)

## Files to Reference

- `docs/compiler-architecture.md` - 唯一设计来源
- `.claude/skills/stitch-planner.md` - 规划层 DSL 格式
- `.claude/skills/stitch-renderer.md` - 现有渲染器实现

## QA Acceptance Criteria

### 逻辑引擎测试 (Chevrotain + Zod)

#### TC-LEXER-01: 词法分析 (Chevrotain)

- **操作**：输入 DSL
  ```
  [SECTION: Execution_Flow]
    { Gutter: "32px", Align: "Center" }
    [CARD: node_opencode]
      ATTR: Title("OpenCode 接口调用"), Icon("Terminal")
  ```
- **预期**：生成正确的 Token 流
- **验证**：`[SECTION_TAG, COLON, ID, LBRACE, KEY, STRING, ..., CARD_TAG, COLON, ID, ATTR, ...]`

#### TC-PARSER-01: 语法分析 (Chevrotain)

- **操作**：Token 流输入 Parser
- **预期**：生成 CST（具体语法树）
- **验证**：
  ```json
  {
    "tag": "SECTION", "id": "Execution_Flow",
    "layoutProps": { "Gutter": "32px", "Align": "Center" },
    "children": [
      { "tag": "CARD", "id": "node_opencode",
        "attrs": [{ "key": "Title", "value": "OpenCode 接口调用" }, ...] }
    ]
  }
  ```

#### TC-ZOD-01: 语义收敛 - 属性转换 (Zod)

- **操作**：输入 CST 中的 `ATTR: Title("OpenCode 接口调用"), Icon("Terminal")`
- **预期**：转换为标准化 props
- **验证**：
  ```json
  {
    "type": "Card",
    "id": "node_opencode",
    "props": { "title": "OpenCode 接口调用", "icon": "Terminal" }
  }
  ```

#### TC-ZOD-02: 语义收敛 - 别名映射 (Zod)

- **操作**：输入 `Variant("Outline")` 和 `Align("Center")`
- **预期**：映射为标准枚举值
- **验证**：输出 `variant: "outline"`, `align: "center"`（全小写）

#### TC-ZOD-03: 语义收敛 - 默认值补全 (Zod)

- **操作**：输入 Button 节点，未指定 variant 和 size
- **预期**：补全默认值
- **验证**：输出 `props` 包含 `"variant": "primary"`, `"size": "md"`

#### TC-ZOD-04: 语义收敛 - 嵌套校验 (Zod)

- **操作**：输入非法嵌套（Button 包含 Table）
- **预期**：报错或自动修正（提升 Table）
- **验证**：错误列表包含嵌套非法警告，或 Table 被提升到 Button 外部

#### TC-ZOD-05: 完整 AST 输出 (Zod)

- **操作**：输入完整 DSL
  ```
  [SECTION: Execution_Flow]
    { Gutter: "32px", Align: "Center" }
    [CARD: node_opencode]
      ATTR: Title("OpenCode 接口调用"), Icon("Terminal")
      CONTENT: "执行层通过 handle_opencode_call/7 订阅 SSE 事件"
      [BUTTON: "运行调试"]
        ATTR: Variant("Outline"), Size("Small")
  ```
- **预期**：输出标准化 AST
- **验证**：
  ```json
  {
    "type": "Root",
    "children": [{
      "id": "Execution_Flow",
      "type": "Section",
      "props": { "gutter": "32px", "align": "center" },
      "children": [{
        "id": "node_opencode",
        "type": "Card",
        "props": { "title": "OpenCode 接口调用", "icon": "Terminal", "content": "执行层通过 handle_opencode_call/7 订阅 SSE 事件" },
        "children": [
          { "id": "button_1", "type": "Button", "props": { "text": "运行调试", "variant": "outline", "size": "sm" } }
        ]
      }]
    }]
  }
  ```
- **说明**：CONTENT 作为 props.content，插槽分发由组件工厂 (TC-FACTORY-02) 负责

### 视觉引擎测试

#### TC-TOKENS-01: Design Tokens 确定性

- **操作**：相同 context + session_id 调用两次 `generateDesignTokens()`
- **预期**：两次输出完全一致
- **验证**：`JSON.stringify(tokens1) === JSON.stringify(tokens2)`

#### TC-TOKENS-02: 不同 context 产生不同 Tokens

- **操作**：context="技术调研" 和 context="儿童教育" 分别生成 Tokens
- **预期**：两套 Tokens 的色相、圆角、间距不同
- **验证**：`tokens1["--primary-color"] !== tokens2["--primary-color"]`

#### TC-TOKENS-03: 5 维度完整性

- **操作**：生成 Design Tokens
- **预期**：包含空间/字体/形状/装饰/语义 5 个维度
- **验证**：Tokens 包含 `--spacing-*`, `--font-*`, `--radius-*`, `--pattern-*`, `--primary-*`

### 组件工厂测试

#### TC-FACTORY-01: Props 归一化

- **操作**：输入 `{ size: "large", spacing: "compact" }`
- **预期**：转换为具体 CSS 类名或像素值
- **验证**：输出包含 `className="text-lg p-4"` 或等效样式

#### TC-FACTORY-02: 插槽分发

- **操作**：输入 Card 组件，children 包含 TITLE 和 BUTTON
- **预期**：TITLE 分发到 header 插槽，BUTTON 分发到 footer 插槽
- **验证**：渲染结果中 TITLE 在 CardHeader 内，BUTTON 在 CardFooter 内

#### TC-FACTORY-03: 空插槽不渲染

- **操作**：输入 Card 组件，无 BUTTON 类子节点
- **预期**：footer 插槽不渲染
- **验证**：输出 HTML 不包含 CardFooter 元素

#### TC-FACTORY-04: 事件桩函数注入

- **操作**：渲染包含 Button 的页面
- **预期**：Button 有 onClick 事件绑定
- **验证**：点击 Button 触发桩函数（console.log 或状态变化）

#### TC-FACTORY-05: Context 注入

- **操作**：渲染组件树
- **预期**：顶层包裹 ThemeProvider，深层组件可获取 Tokens
- **验证**：深层 Button 使用 `--primary-color` 渲染正确颜色

### 渲染器测试

渲染器负责将 IR (UINode) 转换为实际的 React 组件。测试确保所有组件类型正确渲染，props 正确传递，slots 正确分发。

#### TC-RENDERER-01: 基础组件渲染

- **操作**：渲染 Button、Text、Input 等基础组件
- **预期**：组件正确渲染，props 正确传递
- **验证**：
  - Button 渲染 `<button>` 元素，文本可见
  - Text 渲染文本内容
  - Input 渲染 `<input>` 元素，placeholder 正确

#### TC-RENDERER-02: Card 组件 Slots 渲染

- **操作**：渲染带 title、content、footer 的 Card
- **预期**：各 slot 内容正确分发到对应位置
- **验证**：
  - title 渲染在 CardHeader 内
  - content 渲染在 CardContent 内
  - Button 子节点渲染在 CardFooter 内
  - **不能出现** `slots="[object Object]"` 属性

#### TC-RENDERER-03: Alert 组件 Slots 渲染

- **操作**：渲染带 title、description 的 Alert
- **预期**：title 渲染为 AlertTitle，description 渲染为 AlertDescription
- **验证**：HTML 包含 AlertTitle 和 AlertDescription 结构

#### TC-RENDERER-04: Dialog 组件 Slots 渲染

- **操作**：渲染带 header、content、footer 的 Dialog
- **预期**：各 slot 正确分发
- **验证**：DialogHeader、DialogContent、DialogFooter 结构正确

#### TC-RENDERER-05: Tabs 组件渲染

- **操作**：渲染带 items 的 Tabs 组件
- **预期**：TabsList + TabsTrigger + TabsContent 正确渲染
- **验证**：每个 tab item 生成对应的 trigger 和 content

#### TC-RENDERER-06: Table 组件渲染

- **操作**：渲染带 columns 和 data 的 Table
- **预期**：TableHeader + TableBody + TableRow + TableCell 正确渲染
- **验证**：列头和数据行正确显示

#### TC-RENDERER-07: 嵌套组件渲染

- **操作**：渲染 Section 包含多个 Card，Card 包含 Button
- **预期**：嵌套结构正确渲染
- **验证**：HTML 结构反映正确的嵌套关系

#### TC-RENDERER-08: Props 类型正确性

- **操作**：渲染组件并传递各类型 props (string, boolean, object)
- **预期**：props 正确传递，不出现 `[object Object]` 字符串
- **验证**：
  - 字符串 props 正确显示
  - 布尔 props 正确影响渲染
  - 对象 props（如 slots）正确处理而非序列化

#### TC-RENDERER-09: 事件桩函数渲染

- **操作**：渲染带事件桩的 Button
- **预期**：onClick 事件正确绑定
- **验证**：渲染的元素包含事件处理器

#### TC-RENDERER-10: 未知组件类型降级

- **操作**：渲染未知类型的 IR 节点
- **预期**：降级为 div 或报错提示
- **验证**：不崩溃，给出合理的降级渲染

### SSR 引擎测试

#### TC-SSR-01: 脱水渲染

- **操作**：React 组件树调用 `renderToString()`
- **预期**：生成 HTML 字符串
- **验证**：输出为有效 HTML，包含预期标签结构

#### TC-SSR-02: 样式萃取

- **操作**：编译页面并萃取 CSS
- **预期**：CSS 仅包含页面实际使用的类名
- **验证**：CSS 体积 < 10KB，不包含未使用的 Tailwind 类

#### TC-SSR-03: 资源固化

- **操作**：导出 HTML 文件
- **预期**：单文件 HTML，无外部依赖
- **验证**：HTML 包含内联 CSS 和 Base64 图片，双击可在浏览器正常显示

### 并行执行测试

#### TC-PARALLEL-01: AST 和 Tokens 并行生成

- **操作**：同时启动逻辑解析和视觉引擎
- **预期**：两者独立完成，无阻塞
- **验证**：Promise.all([parseAST(), generateTokens()]) 成功返回

### 集成测试

#### TC-E2E-01: 完整编译流程

- **操作**：输入完整 DSL，执行端到端编译
- **预期**：DSL → AST → Tokens → React → HTML 全链路通过
- **验证**：输出 HTML 可正常渲染，样式正确

#### TC-E2E-02: 增量编译

- **操作**：修改 DSL 中的按钮文字，重新编译
- **预期**：仅更新相关节点，其他部分不变
- **验证**：Diff 结果仅包含 Button 节点变更

## Step-by-step Validation

### 0. 安装依赖 ✅
- 做什么：`npm install chevrotain purgecss`
- 验证：`npm ls chevrotain` 显示版本

### 1. 逻辑引擎 - 词法分析器 ✅
- 文件：`logic/lexer.ts`
- 做什么：解析 `[TAG: id]`、`{ key: "value" }`、`ATTR:`、`CONTENT:` 等标签
- 验证：测试用例 TC-LEXER-01 通过，Token 流正确
- 参考：`docs/compiler-architecture.md` L2323-L2400

### 2. 逻辑引擎 - 语法分析器 ✅
- 文件：`logic/parser.ts`
- 做什么：将 Token 流构建为 CST（具体语法树）
- 验证：测试用例 TC-PARSER-01 通过，CST 结构正确
- 参考：`docs/compiler-architecture.md` L2400-L2500

### 3. 逻辑引擎 - 语义收敛器 ✅
- 文件：`logic/semantic.ts`
- 做什么：用 Zod 将 CST 转换为标准化 AST（`type`/`id`/`props`/`children`）
- 职责：属性收敛、别名映射、默认值补全、ID 自动生成、嵌套校验
- 注意：视觉相关决策（如根据 context 决定配色）由视觉引擎负责，逻辑引擎不处理
- 验证：测试用例 TC-ZOD-01 ~ TC-ZOD-05 通过
- 参考：`docs/compiler-architecture.md` L663-L710

### 4. 视觉引擎 - 设计系统合成器 ✅
- 文件：`visual/synthesizer.ts`、`visual/session.ts`、`visual/types.ts`
- 做什么：context + Hash 种子 + Session State → Design Tokens (5 维度)
- 5 维度：空间尺度、字体排版、形状边框、装饰纹理、语义颜色
- 场景感知：技术/金融/医疗/教育/创意/企业 6 种场景自动识别
- 验证：测试用例 TC-TOKENS-01 ~ TC-TOKENS-03 通过 (22 个测试)
- 参考：`docs/compiler-architecture.md` L675-L942

### 5. 组件工厂 ✅
- 文件：
  ```
  factory/
  ├── types.ts              # IR 类型定义 (UINode)
  ├── type-map.ts           # AST type → component-map key 映射
  ├── ir-generator.ts       # AST → IR (UINode) 转换
  ├── props-normalizer.ts   # Props 归一化 (size→className)
  ├── slot-distributor.ts   # 插槽分发 (children→slots)
  ├── event-stubs.ts        # 事件桩函数注入
  ├── theme-provider.tsx    # ThemeProvider + useTheme
  ├── component-factory.tsx # 组件工厂主入口
  └── index.ts              # 导出
  ```
- 做什么：AST + Tokens → IR (UINode JSON) → React 组件树
- 复用：使用现有 `src/lib/renderer/` 的组件注册表和渲染逻辑
- 验证：组件树可正常渲染，测试用例 TC-FACTORY-01 ~ TC-FACTORY-05 通过 (33 个测试)
- 参考：`docs/compiler-architecture.md` L943-L1393

#### 组件类型映射

AST ComponentType (26 种) → component-map (70+ 组件) 的映射关系：

| AST 类型 | component-map | 备注 |
|----------|---------------|------|
| Section | Section | 直接映射 |
| Card | Card | 复合组件，需插槽分发 |
| Button | Button | 需事件桩 |
| Text | Text | 直接映射 |
| Input | Input | 需事件桩 |
| Table | Table | 复合组件，需处理 columns/rows |
| Modal | Dialog | 名称映射 |
| Divider | Separator | 名称映射 |
| Code | CodeBlock | 名称映射 |
| ... | ... | 其余直接映射 |

#### 复合组件插槽分发规则

| 组件 | 子组件结构 | 分发规则 |
|------|-----------|---------|
| Card | CardHeader, CardContent, CardFooter | title/icon→Header, content→Content, Button→Footer |
| Alert | AlertTitle, AlertDescription | title→AlertTitle, content→AlertDescription |
| Dialog | DialogHeader, DialogContent, DialogFooter | 同 Card |
| Tabs | TabsList, TabsTrigger, TabsContent | 需解析 tabs 数组定义 |
| Table | TableHeader, TableBody, TableRow, TableCell | 需处理 columns + data |

#### 事件桩函数配置

| 组件 | 事件 | 桩函数 |
|------|------|-------|
| Button | onClick | `() => console.log('Button clicked', id)` |
| Input | onChange | `(e) => console.log('Input changed', e.target.value)` |
| Checkbox | onCheckedChange | `(v) => console.log('Checked', v)` |
| Switch | onCheckedChange | `(v) => console.log('Switch', v)` |
| Tabs | onValueChange | `(v) => console.log('Tab changed', v)` |
| Dialog | onOpenChange | `(v) => console.log('Dialog', v ? 'opened' : 'closed')` |

### 6. SSR 引擎（已完成）
- 文件：`ssr/dehydrator.ts`、`ssr/css-purger.ts`、`ssr/solidifier.ts`、`ssr/renderer.ts`
- 做什么：React 树 → 单文件 HTML
- 验证：HTML 可离线运行，CSS < 10KB，测试用例 TC-SSR-01 ~ TC-SSR-03 通过 (35 个测试)
- 参考：`docs/compiler-architecture.md` L1394-L1688

#### SSR 文件结构

```
ssr/
├── types.ts          # SSR 类型定义
├── dehydrator.ts     # 脱水渲染 (React → HTML 字符串)
├── css-purger.ts     # 样式萃取 (PurgeCSS)
├── solidifier.ts     # 资源固化 (内联 CSS/JS/图片)
├── renderer.ts       # SSR 主入口
└── index.ts          # 导出
```

### 7. 渲染器测试 ✅
- 文件：`src/lib/renderer/__tests__/renderer.test.tsx`
- 做什么：验证所有组件类型正确渲染，slots 正确分发
- 验证：测试用例 TC-RENDERER-01 ~ TC-RENDERER-10 通过 (41 个测试)
- 重点：复合组件（Card、Alert、Dialog）的 slots 渲染
- 修复：创建 SlottedCard、SlottedAlert 包装组件处理 slots prop

### 8. 集成测试 ✅
- 做什么：端到端测试完整编译流程
- 验证：DSL → AST → Tokens → React → HTML 全链路通过，测试用例 TC-E2E-01 ~ TC-E2E-02 通过 (28 个测试)

## Notes

- 所有设计决策以 `docs/compiler-architecture.md` 为准
- 遇到设计问题，先查阅文档对应章节
- 修改架构时同步更新文档

## Progress

- [x] 安装依赖 (Chevrotain, Zod, PurgeCSS)
- [x] 逻辑引擎 (logic/): Chevrotain 词法/语法 + Zod 语义收敛 → AST (38 个测试)
- [x] 视觉引擎 (visual/): Design Tokens 生成 + Session State (42 个测试)
- [x] 组件工厂 (factory/): IR 生成 + Props归一化/插槽分发/事件桩函数/Context注入 (51 个测试)
- [x] SSR 引擎 (ssr/): 脱水渲染/样式萃取/资源固化 (57 个测试)
- [x] 集成测试 (e2e.test.ts): 端到端编译流程 (29 个测试)
- [x] 渲染器测试 (renderer/): 组件渲染验证 + slots 分发 (41 个测试)

## 测试统计

| 模块 | 测试数 | 状态 |
|------|--------|------|
| 逻辑引擎 (logic/) | 38 | ✅ |
| 视觉引擎 (visual/) | 42 | ✅ |
| 组件工厂 (factory/) | 51 | ✅ |
| SSR 引擎 (ssr/) | 57 | ✅ |
| 集成测试 (e2e) | 29 | ✅ |
| 渲染器 (renderer/) | 41 | ✅ |
| **总计** | **258** | ✅ |

## Next

- 所有测试通过
- 可以开始使用编译器生成页面

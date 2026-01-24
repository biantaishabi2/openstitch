# Specification: Stitch UI 编译器

## Overview

实现 Stitch UI 编译器，将 AI 产出的 DSL 指令编译为工程级可交付的 Web 资源（React 组件 / 静态 HTML）。

## Workflow Type

feature

## Task Scope

**In scope**：
- 前端层：词法分析、语法分析、语义分析
- 中端层：设计系统合成器、IR 生成器、优化器
- 后端层：代码生成器（React/HTML/HEEx）、资源打包器
- 视觉引擎：5 维度 Design Tokens 生成
- 组件工厂：Props 归一化、插槽分发、事件桩函数、Context 注入
- SSR 引擎：脱水渲染、样式萃取、资源固化

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
| 整体架构 | L15 | 输入层→前端层→中端层→后端层→输出层 |
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
├── frontend/
│   ├── lexer.ts              # 词法分析器
│   ├── parser.ts             # 语法分析器
│   ├── semantic.ts           # 语义分析器
│   └── ast.ts                # AST 类型定义
├── middle/
│   ├── synthesizer.ts        # 设计系统合成器
│   ├── session.ts            # Session State 管理
│   ├── ir.ts                 # IR 生成器
│   └── optimizer.ts          # 优化器
├── backend/
│   ├── codegen/
│   │   ├── react.tsx         # React 后端
│   │   ├── html.ts           # HTML 后端
│   │   └── heex.ts           # HEEx 后端
│   ├── bundler.ts            # 资源打包器
│   └── ssr.ts                # SSR 引擎
├── factory/
│   ├── component-factory.tsx # 组件工厂
│   ├── props-normalizer.ts   # Props 归一化
│   ├── slot-distributor.ts   # 插槽分发
│   └── event-stubs.ts        # 事件桩函数
└── index.ts                  # 编译器入口
```

### 修改文件

- `src/lib/renderer/renderer.tsx` - 重构为 React 后端

## Files to Reference

- `docs/compiler-architecture.md` - 唯一设计来源
- `.claude/skills/stitch-planner.md` - 规划层 DSL 格式
- `.claude/skills/stitch-renderer.md` - 现有渲染器实现

## QA Acceptance Criteria

### 前端层测试

#### TC-LEXER-01: 词法分析

- **操作**：输入 `[Layout] Dashboard 布局\n[Content - Header] 标题"用户管理"`
- **预期**：生成正确的 Token 流
- **验证**：`[LAYOUT_TAG, TEXT, CONTENT_TAG("Header"), TEXT]`

#### TC-PARSER-01: 语法分析

- **操作**：Token 流输入 Parser
- **预期**：生成正确的 AST 结构
- **验证**：AST 包含 PAGE → HEADER → TITLE 节点层级

#### TC-SEMANTIC-01: 语义校验

- **操作**：输入非法嵌套（Button 包含 Table）
- **预期**：报错或自动修正
- **验证**：错误列表包含嵌套非法警告

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

### 0. 安装依赖（待做）
- 做什么：`npm install chevrotain purgecss`
- 验证：`npm ls chevrotain` 显示版本

### 1. 实现词法分析器（待做）
- 做什么：解析 `[Layout]` `[Content - xxx]` 等标签
- 验证：测试用例通过，Token 流正确
- 参考：`docs/compiler-architecture.md` L2323-L2400

### 2. 实现语法分析器（待做）
- 做什么：将 Token 流构建为 CST/AST
- 验证：测试用例通过，AST 结构正确
- 参考：`docs/compiler-architecture.md` L2400-L2500

### 3. 实现设计系统合成器（待做）
- 做什么：Hash 种子 + Session State → Design Tokens
- 验证：同样输入产出同样 Tokens
- 参考：`docs/compiler-architecture.md` L675-L942

### 4. 实现组件工厂（待做）
- 做什么：AST + Tokens → React 组件树
- 验证：组件树可正常渲染
- 参考：`docs/compiler-architecture.md` L943-L1393

### 5. 实现 SSR 引擎（待做）
- 做什么：React 树 → 单文件 HTML
- 验证：HTML 可离线运行，CSS < 10KB
- 参考：`docs/compiler-architecture.md` L1394-L1688

### 6. 集成测试（待做）
- 做什么：端到端测试完整编译流程
- 验证：DSL → AST → Tokens → React → HTML 全链路通过

## Notes

- 所有设计决策以 `docs/compiler-architecture.md` 为准
- 遇到设计问题，先查阅文档对应章节
- 修改架构时同步更新文档

## Progress

- [ ] 安装依赖
- [ ] 前端层（词法/语法/语义分析）
- [ ] 中端层（设计合成器/IR生成器/优化器）
- [ ] 组件工厂层
- [ ] SSR 引擎层
- [ ] 后端层（代码生成器/打包器）
- [ ] 集成测试

## Next

- 安装 Chevrotain 依赖
- 实现词法分析器

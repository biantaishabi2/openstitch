# Specification: Figma Frontend (Figma 前端)

## Overview

扩展 Stitch 编译器，新增 **Figma 前端**，将 Figma 设计稿（包括不规范的文件）编译为工程级代码。

核心思路：**两路并行推断，各自容错，汇合出货**。

> **关键洞察**：现实中的 Figma 文件往往不规范——没有 Local Styles、图层命名混乱、布局靠手拖。
> 不仅结构需要推断，**视觉也需要推断**。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Figma Frontend                                   │
│                                                                          │
│  Figma File（可能不规范）                                                │
│      │                                                                   │
│      ├─────────────────────────────────────────────┐                    │
│      ▼                                             ▼                    │
│  ┌─────────────────────────┐         ┌─────────────────────────┐        │
│  │   视觉推断器             │         │   结构推断器             │        │
│  │   (Visual Inferrer)     │         │   (Structure Inferrer)  │        │
│  │                         │         │                         │        │
│  │   Styles → 统计 → 规范化 │  并行   │   规则 → 启发式 → AI     │        │
│  │   三层容错              │  ════   │   三层容错              │        │
│  └───────────┬─────────────┘         └───────────┬─────────────┘        │
│              │                                   │                      │
│              ▼                                   ▼                      │
│        Design Tokens                        推断的 DSL                  │
│        (规范化后)                            (带置信度)                  │
│              │                                   │                      │
└──────────────┼───────────────────────────────────┼──────────────────────┘
               │                                   │
               │                                   ▼
               │                        ┌─────────────────────┐
               │                        │ 现有逻辑引擎         │
               │                        │ (Chevrotain + Zod)  │
               │                        └──────────┬──────────┘
               │                                   │
               │                                   ▼ AST
               │                                   │
               └───────────────┬───────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ 现有组件工厂 + SSR   │
                    │ (100% 复用)         │
                    └──────────┬──────────┘
                               ▼
                         工程级代码
```

## Workflow Type

feature

## Task Scope

**In scope**：
- 视觉提取器 (Visual Extractor)：Figma API → Design Tokens
- 结构推断器 (Structure Inferrer)：Figma Nodes → DSL
- 资产提取器 (Asset Extractor)：Icons/Images → 资源库
- Figma Frontend 入口：整合三个提取器 + 现有编译器

**Out of scope**：
- Figma Plugin（当前使用 REST API）
- 实时同步（当前是一次性提取）
- 用户认证/OAuth（使用 Personal Access Token）

## Success Criteria

### 功能性指标

- Figma 提取的 Design Tokens 与现有格式 100% 兼容（通过 Zod schema 校验）
- 结构推断准确率 > 80%（按组件类型统计，规则层 > 95%，启发式层 > 70%）
- 不规范 Figma 文件（图层混乱）也能产出可用代码（降级为 div + 绝对定位）
- 端到端流程：Figma File ID → HTML 单文件（< 30 秒）

### 性能指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| Figma API 调用 | < 5 次/文件 | 日志统计 |
| 视觉提取耗时 | < 10 秒 | performance.now() |
| 结构推断耗时 | < 20 秒 | performance.now() |
| 最终 HTML 体积 | < 100KB (gzip) | fs.stat() |
| CSS 萃取后体积 | < 15KB | fs.stat() |

### 质量指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 测试覆盖率 | > 80% | Vitest coverage |
| 规则识别准确率 | > 95% | 测试用例统计 |
| 启发式识别准确率 | > 70% | 测试用例统计 |
| AI 调用次数 | < 10 次/文件 | 日志统计 |

---

## Dev Environment

| 配置 | 值 |
|------|-----|
| 端口 | 4025 |
| Worktree | .worktrees/002-figma-frontend |

启动命令：
```bash
cd .worktrees/002-figma-frontend && PORT=4025 npm run dev
```

---

## Files to Reference

### 现有编译器实现

| 文件路径 | 说明 |
|----------|------|
| `src/lib/compiler/index.ts` | 编译器主入口，复用其 compile() 函数 |
| `src/lib/compiler/logic/lexer.ts` | Chevrotain 词法分析器 |
| `src/lib/compiler/logic/parser.ts` | Chevrotain 语法分析器 |
| `src/lib/compiler/logic/semantic.ts` | Zod 语义收敛器 |
| `src/lib/compiler/logic/ast.ts` | AST 类型定义 |
| `src/lib/compiler/visual/synthesizer.ts` | Design Tokens 合成器 |
| `src/lib/compiler/visual/types.ts` | Tokens 类型定义（Figma 提取需兼容） |
| `src/lib/compiler/factory/ir-generator.ts` | IR 生成器 |
| `src/lib/compiler/factory/slot-distributor.ts` | 插槽分发逻辑 |
| `src/lib/compiler/ssr/renderer.ts` | SSR 渲染器 |

### 设计文档

| 文件路径 | 说明 |
|----------|------|
| `docs/compiler-architecture.md` | 编译器整体架构文档 |
| `docs/figma-visual-extraction.md` | 视觉提取清单（Figma API 字段映射） |
| `docs/figma-frontend-architecture.md` | **架构设计文档**（三层容错、推断算法） |
| `docs/compiler-testing.md` | 测试策略文档 |
| `docs/compiler-component-gap.md` | 组件差距分析 |

### Spec 参考

| 文件路径 | 说明 |
|----------|------|
| `docs/specs/001-stitch-compiler/spec.md` | 编译器 Spec（格式参考） |

---

## Architecture: 两路并行

### 核心原则

| 路径 | 输入 | 输出 | 性质 | 处理方式 |
|------|------|------|------|----------|
| **视觉路径** | Figma Styles + 图层属性 | Design Tokens | 可信、确定性 | 直接提取 + 标准化 |
| **结构路径** | Figma Nodes 树 | DSL → AST | 不可信、需推断 | 规则 + 启发式 + AI |

### 为什么两路并行

```
传统方案（串行）：
  Figma → 完整解析 → 代码
  问题：结构混乱时整体失败

我们的方案（并行）：
  Figma ─┬─→ 视觉（可信）───────→ Tokens ─┐
         │                                 ├─→ 组件工厂 → 代码
         └─→ 结构（推断）→ DSL → AST ─────┘

优势：
  - 视觉提取不受结构混乱影响
  - 结构推断失败可降级（人工 DSL）
  - 两路独立测试、独立迭代
```

---

## Module 1: 视觉推断器 (Visual Inferrer)

### 职责

从 Figma 文件**推断**视觉属性，生成与现有编译器兼容的 `DesignTokens`。

> **关键变化**：不再假设"视觉可信"。蹩脚设计师的 Figma 文件可能没有 Local Styles、颜色值有微小差异、字号间距不规范。

### 三层容错架构

```
┌───────────────────────────────────────────────────────────────────┐
│  第一层：Local Styles 提取（如果有）                               │
│  → 置信度 1.0，最可信                                              │
└────────────────────────────────┬──────────────────────────────────┘
                                 │ 如果没有 Styles
                                 ▼
┌───────────────────────────────────────────────────────────────────┐
│  第二层：统计 + 聚类                                               │
│  - 采样所有图层的颜色/字号/间距                                     │
│  - 聚类合并相近值（#2563eb ≈ #2564eb）                             │
│  - 按使用频率排序，最高频 → primary                                │
│  → 置信度 0.8                                                      │
└────────────────────────────────┬──────────────────────────────────┘
                                 │ 如果值太杂乱
                                 ▼
┌───────────────────────────────────────────────────────────────────┐
│  第三层：强制规范化 + 默认值                                        │
│  - 字号对齐：15px → 14px, 17px → 16px                              │
│  - 间距对齐：7px → 8px (4px 栅格)                                   │
│  - 颜色：使用默认色板                                               │
│  → 置信度 0.5，需人工复核                                          │
└───────────────────────────────────────────────────────────────────┘
```

### 蹩脚设计师的典型问题

| 应该做的 | 蹩脚做法 | 后果 |
|----------|----------|------|
| 用 Local Styles 定义色板 | 颜色直接写死在图层 | #2563eb、#2564eb、#2562ea 三个版本 |
| 用 Text Styles 定义字体 | 每次手动输入字号 | 15px、17px、19px 随意用 |
| 用 Auto Layout 布局 | 手动拖拽定位 | 7px、9px、11px 乱七八糟 |
| 用 Effect Styles 定义阴影 | 每次手动加阴影 | blur 4px、5px、6px 各不相同 |

### 输入/输出

```typescript
// 输入
interface VisualExtractorInput {
  fileId: string;              // Figma File ID
  accessToken: string;         // Figma API Token
  options?: {
    preferLocalStyles: boolean; // 优先使用 Local Styles (默认 true)
    normalizeToGrid: number;    // 栅格对齐基数 (默认 4)
  };
}

// 输出
interface VisualInferrerOutput {
  tokens: DesignTokens;        // 与现有格式 100% 兼容
  assets: AssetLibrary;        // 图标/图片资源
  confidence: number;          // 整体置信度 0-1
  sources: {                   // 各维度的推断来源
    colors: 'styles' | 'sampled' | 'default';
    typography: 'styles' | 'sampled' | 'default';
    spacing: 'autolayout' | 'sampled' | 'default';
    shapes: 'styles' | 'sampled' | 'default';
  };
  warnings: string[];          // 推断警告
  meta: {
    fileId: string;
    fileName: string;
    extractedAt: string;
  };
}
```

### 子模块

| 子模块 | 职责 | 详细设计 |
|--------|------|----------|
| ColorExtractor | 色彩系统提取 | [figma-visual-extraction.md#一色彩系统](../figma-visual-extraction.md) |
| TypographyExtractor | 排版系统提取 | [figma-visual-extraction.md#二排版系统](../figma-visual-extraction.md) |
| SpacingExtractor | 空间系统提取 | [figma-visual-extraction.md#三空间系统](../figma-visual-extraction.md) |
| ShapeExtractor | 形状系统提取 | [figma-visual-extraction.md#四形状系统](../figma-visual-extraction.md) |
| EffectExtractor | 效果系统提取 | [figma-visual-extraction.md#五效果系统](../figma-visual-extraction.md) |
| AssetExtractor | 资源资产提取 | [figma-visual-extraction.md#七资源资产](../figma-visual-extraction.md) |

### 文件结构

```
src/lib/figma/
├── visual/                      # 视觉提取器
│   ├── index.ts                 # 导出
│   ├── extractor.ts             # 主入口
│   ├── color-extractor.ts       # 色彩提取
│   ├── typography-extractor.ts  # 排版提取
│   ├── spacing-extractor.ts     # 空间提取
│   ├── shape-extractor.ts       # 形状提取
│   ├── effect-extractor.ts      # 效果提取
│   ├── asset-extractor.ts       # 资源提取
│   └── utils/
│       ├── color-utils.ts       # 颜色转换工具
│       ├── normalize.ts         # 标准化工具
│       └── figma-api.ts         # Figma API 封装
└── __tests__/
    └── visual/
        ├── color-extractor.test.ts
        ├── typography-extractor.test.ts
        └── ...
```

---

## Module 2: 结构推断器 (Structure Inferrer)

### 职责

从 Figma 节点树推断 UI 结构，生成 DSL（可被现有逻辑引擎解析）。

### 输入/输出

```typescript
// 输入
interface StructureInferrerInput {
  nodes: FigmaNode[];           // Figma 节点树
  options?: {
    aiModel?: 'gemini' | 'claude';  // AI 模型选择
    confidenceThreshold?: number;    // 置信度阈值 (默认 0.7)
    maxAiCalls?: number;             // 最大 AI 调用次数
  };
}

// 输出
interface StructureInferrerOutput {
  dsl: string;                  // 生成的 DSL
  confidence: number;           // 整体置信度 0-1
  nodeMapping: Map<string, {    // Figma 节点 → DSL 节点映射
    figmaId: string;
    dslPath: string;
    inferenceMethod: 'rule' | 'heuristic' | 'ai';
    confidence: number;
  }>;
  warnings: string[];           // 推断警告
}
```

### 三层推断架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  第一层：规则引擎 (Rule Engine) - 确定性，优先级最高                      │
│                                                                          │
│  输入：Figma 节点                                                        │
│  规则：                                                                  │
│    - Component Instance → 直接映射（Button、Card 等）                    │
│    - TEXT 节点 + 大字号 → Heading                                        │
│    - TEXT 节点 + 小字号 → Text                                           │
│    - RECTANGLE + 输入框命名 → Input                                      │
│    - Auto Layout (VERTICAL) → Section/Stack                              │
│    - Auto Layout (HORIZONTAL) → Row/Flex                                 │
│  输出：已识别节点 + 剩余节点                                              │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ 剩余节点
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  第二层：启发式推断 (Heuristic) - 基于视觉特征                           │
│                                                                          │
│  输入：剩余节点                                                          │
│  启发式规则：                                                            │
│    - 圆角矩形 + 居中文本 + 点击区域 → Button (置信度 0.8)                 │
│    - 圆角矩形 + 阴影 + 多子节点 → Card (置信度 0.85)                      │
│    - 矩形 + 边框 + placeholder → Input (置信度 0.75)                     │
│    - 等宽列 + 重复行结构 → Table (置信度 0.7)                             │
│    - 水平排列的矩形组 → Tabs (置信度 0.6)                                 │
│  输出：推断结果（带置信度）+ 仍有歧义的节点                               │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ 歧义节点（置信度 < 阈值）
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  第三层：AI 推断 (AI Inference) - 多模态理解                             │
│                                                                          │
│  输入：节点截图 + 节点元数据                                             │
│  Prompt：                                                                │
│    "这是一个 UI 区域的截图，尺寸 {width}x{height}。                       │
│     节点名称：{name}                                                     │
│     子节点数量：{childCount}                                             │
│     请识别这是什么 UI 组件，并用以下 DSL 格式表示：                        │
│     [ComponentType: id] ATTR: ... [/ComponentType]"                      │
│  输出：DSL 片段 + 置信度                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 组件识别规则表

| 组件类型 | 规则层识别条件 | 启发式特征 | 置信度 |
|----------|----------------|------------|--------|
| **Button** | Component name 包含 "button" | 圆角矩形 + 居中文本 + 固定尺寸 | 0.85 |
| **Card** | Component name 包含 "card" | 圆角 + 阴影 + padding + 多子节点 | 0.9 |
| **Input** | Component name 包含 "input/field" | 矩形 + 边框 + placeholder 文本 | 0.8 |
| **Heading** | TEXT + fontSize >= 24px | - | 0.95 |
| **Text** | TEXT + fontSize < 24px | - | 0.95 |
| **Image** | RECTANGLE + 图片填充 | - | 0.95 |
| **Icon** | VECTOR + 16-48px 尺寸 | 命名含 "icon" | 0.9 |
| **Section** | FRAME + layoutMode="VERTICAL" | 包含多个子容器 | 0.85 |
| **Table** | - | 等宽列 + 重复行 | 0.7 |
| **Tabs** | - | 水平排列矩形 + 状态变体 | 0.6 |
| **Modal/Dialog** | Component name 包含 "modal/dialog" | 居中 + 遮罩 + 阴影 | 0.8 |

### 布局推断规则

```typescript
interface LayoutInference {
  type: 'flex' | 'grid' | 'stack' | 'absolute';
  direction?: 'row' | 'column';
  gap?: string;
  align?: string;
  justify?: string;
}

// 从 Figma Auto Layout 推断
function inferLayout(node: FigmaNode): LayoutInference {
  if (node.layoutMode === 'HORIZONTAL') {
    return {
      type: 'flex',
      direction: 'row',
      gap: `${node.itemSpacing}px`,
      align: mapAlignment(node.counterAxisAlignItems),
      justify: mapJustify(node.primaryAxisAlignItems),
    };
  }

  if (node.layoutMode === 'VERTICAL') {
    return {
      type: 'flex',
      direction: 'column',
      gap: `${node.itemSpacing}px`,
      align: mapAlignment(node.counterAxisAlignItems),
    };
  }

  // 无 Auto Layout，分析子节点位置
  return inferLayoutFromPositions(node.children);
}

// 从位置关系推断布局
function inferLayoutFromPositions(children: FigmaNode[]): LayoutInference {
  // 检查是否水平排列
  const sortedByX = [...children].sort((a, b) => a.x - b.x);
  const horizontalGaps = calculateGaps(sortedByX, 'x');
  if (isConsistent(horizontalGaps)) {
    return { type: 'flex', direction: 'row', gap: `${avg(horizontalGaps)}px` };
  }

  // 检查是否垂直排列
  const sortedByY = [...children].sort((a, b) => a.y - b.y);
  const verticalGaps = calculateGaps(sortedByY, 'y');
  if (isConsistent(verticalGaps)) {
    return { type: 'flex', direction: 'column', gap: `${avg(verticalGaps)}px` };
  }

  // 检查是否网格排列
  if (isGridPattern(children)) {
    return { type: 'grid' };
  }

  // 降级为绝对定位
  return { type: 'absolute' };
}
```

### 文件结构

```
src/lib/figma/
├── structure/                   # 结构推断器
│   ├── index.ts                 # 导出
│   ├── inferrer.ts              # 主入口
│   ├── rule-engine.ts           # 第一层：规则引擎
│   ├── heuristic-engine.ts      # 第二层：启发式
│   ├── ai-engine.ts             # 第三层：AI 推断
│   ├── layout-inferrer.ts       # 布局推断
│   ├── dsl-generator.ts         # DSL 生成
│   └── rules/
│       ├── component-rules.ts   # 组件识别规则
│       ├── layout-rules.ts      # 布局识别规则
│       └── naming-rules.ts      # 命名规则
└── __tests__/
    └── structure/
        ├── rule-engine.test.ts
        ├── heuristic-engine.test.ts
        └── integration.test.ts
```

---

## Module 3: Figma Frontend 入口

### 主函数

```typescript
/**
 * Figma 前端主入口
 *
 * 完整流程：Figma File → Design Tokens + DSL → AST → React → HTML
 */
export async function compileFromFigma(
  fileId: string,
  options: FigmaCompileOptions = {}
): Promise<CompileResult> {
  const {
    accessToken = process.env.FIGMA_ACCESS_TOKEN,
    nodeIds,              // 可选：只处理部分节点
    aiModel = 'gemini',
    debug = false,
  } = options;

  // 1. 获取 Figma 文件
  const figmaFile = await figmaApi.getFile(fileId, accessToken);

  // 2. 过滤有效节点
  const validNodes = filterValidNodes(figmaFile.document, nodeIds);

  // 3. 两路并行提取
  const [visualResult, structureResult] = await Promise.all([
    // 视觉路径：Figma → Design Tokens
    visualExtractor.extract({
      fileId,
      accessToken,
      nodes: validNodes,
    }),

    // 结构路径：Figma → DSL
    structureInferrer.infer({
      nodes: validNodes,
      options: { aiModel },
    }),
  ]);

  // 4. 进入现有编译器流程
  //    DSL → AST (逻辑引擎) → React (组件工厂) → HTML (SSR)
  const result = await compile(structureResult.dsl, {
    tokens: visualResult.tokens,  // 使用 Figma 提取的 Tokens
    ssr: {
      title: figmaFile.name,
      inlineAssets: true,
    },
    debug,
  });

  // 5. 附加元信息
  return {
    ...result,
    figma: {
      fileId,
      fileName: figmaFile.name,
      visualCoverage: visualResult.meta.coverage,
      structureConfidence: structureResult.confidence,
      nodeMapping: structureResult.nodeMapping,
      warnings: structureResult.warnings,
    },
  };
}
```

### 文件结构

```
src/lib/figma/
├── index.ts                     # Figma Frontend 主入口
├── types.ts                     # Figma 相关类型定义
├── api/                         # Figma API 封装
│   ├── client.ts                # API 客户端
│   ├── types.ts                 # Figma API 类型
│   └── cache.ts                 # 请求缓存
├── visual/
│   └── ...
├── structure/
│   └── ...
└── __tests__/
    ├── visual/
    ├── structure/
    └── integration/
        └── e2e.test.ts          # 端到端测试
```

---

## Tokens 兼容性矩阵

Figma 提取的 Tokens 必须与现有编译器 `DesignTokens` 类型 100% 兼容。

### 必需字段映射

| 现有 Tokens 字段 | Figma 提取源 | 转换规则 | 验证方法 |
|------------------|--------------|----------|----------|
| `colors.primary` | Local Styles "Primary/*" | 取 500 色阶 | Zod schema |
| `colors.secondary` | Local Styles "Secondary/*" | 取 500 色阶 | Zod schema |
| `colors.background` | Local Styles "Background" | 直接映射 | Zod schema |
| `colors.foreground` | Local Styles "Foreground" | 直接映射 | Zod schema |
| `colors.muted` | 从 background 计算 | HSL lightness +10% | Zod schema |
| `typography.fontFamily` | Text Styles | 取最常用字体 | Zod schema |
| `typography.scale` | Text Styles 字号比 | 检测 1.067~1.618 | Zod schema |
| `spacing.base` | Auto Layout itemSpacing | 取众数，对齐 4px | Zod schema |
| `spacing.scale` | 分析间距分布 | 计算比率 | Zod schema |
| `radius.base` | cornerRadius 属性 | 取众数，对齐 4px | Zod schema |
| `shadow.sm/md/lg` | Effect Styles | 按 blur 分级 | Zod schema |

### 降级策略

| 场景 | 降级方案 |
|------|----------|
| 无 Local Styles | 从图层属性采样生成 |
| 字体不可用 | 降级为系统字体栈 |
| 间距不规范 | 强制对齐到 4px 栅格 |
| 无阴影定义 | 使用默认阴影集 |

---

## QA Acceptance Criteria

### 视觉提取器测试

#### TC-VE-01: 色彩提取完整性
- **操作**：提取包含 Local Styles 的 Figma 文件
- **预期**：生成完整色阶 (primary-50 ~ primary-900)
- **验证**：所有 ColorTokens 字段非空

#### TC-VE-02: 排版提取准确性
- **操作**：提取包含 Text Styles 的 Figma 文件
- **预期**：检测正确的字阶比率
- **验证**：`--font-scale` 值在 1.067~1.618 范围内

#### TC-VE-03: 间距栅格对齐
- **操作**：提取含非标准间距 (7px, 15px) 的文件
- **预期**：自动对齐到 4px 栅格
- **验证**：所有 `--spacing-*` 值为 4 的倍数

#### TC-VE-04: Tokens 格式兼容性
- **操作**：提取的 Tokens 传入现有组件工厂
- **预期**：组件正常渲染
- **验证**：无类型错误，渲染结果正确

#### TC-VE-05: 资产提取
- **操作**：提取包含图标和图片的文件
- **预期**：图标为 SVG，图片为 WebP
- **验证**：资源文件有效，可正常显示

### 结构推断器测试

#### TC-SI-01: 规则层识别 - Button
- **操作**：输入 Figma Button 组件实例
- **预期**：识别为 Button，置信度 > 0.9
- **验证**：DSL 包含 `[Button: ...]`

#### TC-SI-02: 规则层识别 - Card
- **操作**：输入 Figma Card 组件实例
- **预期**：识别为 Card，含正确的子结构
- **验证**：DSL 包含嵌套的 title/content/footer

#### TC-SI-03: 启发式识别 - 无命名组件
- **操作**：输入未命名的圆角矩形（视觉特征像 Button）
- **预期**：启发式识别为 Button
- **验证**：置信度 0.7~0.9

#### TC-SI-04: 布局推断 - Auto Layout
- **操作**：输入带 Auto Layout 的 Frame
- **预期**：正确推断 flex/direction/gap
- **验证**：DSL 包含正确的布局属性

#### TC-SI-05: 布局推断 - 无 Auto Layout
- **操作**：输入手动排列的元素
- **预期**：从位置关系推断布局
- **验证**：能识别行/列排列

#### TC-SI-06: AI 降级
- **操作**：输入无法规则/启发式识别的节点
- **预期**：触发 AI 推断
- **验证**：返回 DSL + 置信度

#### TC-SI-07: 整体置信度阈值
- **操作**：设置 confidenceThreshold=0.8
- **预期**：低于阈值的推断标记警告
- **验证**：warnings 数组包含低置信度节点

### 错误处理测试

#### TC-ERR-01: 无效 Figma Token
- **前置**：使用过期或无效的 accessToken
- **操作**：调用 `compileFromFigma(fileId, { accessToken: 'invalid' })`
- **预期**：抛出 `FigmaAuthError`，包含明确错误信息
- **验证**：
  ```typescript
  expect(error.code).toBe('FIGMA_AUTH_ERROR');
  expect(error.message).toContain('Invalid access token');
  ```

#### TC-ERR-02: 文件不存在
- **前置**：使用有效 Token
- **操作**：调用 `compileFromFigma('non-existent-file-id')`
- **预期**：抛出 `FigmaFileNotFoundError`
- **验证**：
  ```typescript
  expect(error.code).toBe('FIGMA_FILE_NOT_FOUND');
  expect(error.fileId).toBe('non-existent-file-id');
  ```

#### TC-ERR-03: API 限流
- **前置**：模拟 429 响应
- **操作**：连续调用多次
- **预期**：自动重试 3 次后抛出 `FigmaRateLimitError`
- **验证**：错误包含 `retryAfter` 字段

#### TC-ERR-04: 网络超时
- **前置**：模拟网络超时
- **操作**：调用 API
- **预期**：10 秒后抛出 `FigmaTimeoutError`
- **验证**：错误包含超时时间

#### TC-ERR-05: AI 服务不可用
- **前置**：AI 服务返回 503
- **操作**：触发 AI 推断
- **预期**：降级为 div + 绝对定位，记录警告
- **验证**：
  ```typescript
  expect(result.warnings).toContain('AI service unavailable, using fallback');
  expect(result.dsl).toContain('position: absolute');
  ```

### 边界条件测试

#### TC-EDGE-01: 空 Figma 文件
- **前置**：Figma 文件无任何节点
- **操作**：调用 `compileFromFigma(emptyFileId)`
- **预期**：返回空 HTML 骨架
- **验证**：
  ```typescript
  expect(result.html).toContain('<!DOCTYPE html>');
  expect(result.ast.children).toHaveLength(0);
  ```

#### TC-EDGE-02: 超深嵌套（10+ 层）
- **前置**：Figma 文件包含 15 层嵌套节点
- **操作**：调用 `compileFromFigma(deepNestedFileId)`
- **预期**：正常处理，超过 10 层的节点扁平化
- **验证**：
  ```typescript
  expect(getMaxDepth(result.ast)).toBeLessThanOrEqual(10);
  expect(result.warnings).toContain('Flattened nodes beyond depth 10');
  ```

#### TC-EDGE-03: 超大文件（1000+ 节点）
- **前置**：Figma 文件包含 2000 个节点
- **操作**：调用 `compileFromFigma(largeFileId)`
- **预期**：30 秒内完成，启用分批处理
- **验证**：
  ```typescript
  expect(result.meta.processingTime).toBeLessThan(30000);
  expect(result.meta.batchCount).toBeGreaterThan(1);
  ```

#### TC-EDGE-04: 特殊字符处理
- **前置**：节点名含特殊字符 `<Button "Primary">`
- **操作**：调用 `compileFromFigma(specialCharsFileId)`
- **预期**：正确转义，不破坏 DSL/HTML
- **验证**：
  ```typescript
  expect(result.dsl).not.toContain('<Button "');
  expect(result.html).toContain('&lt;');
  ```

#### TC-EDGE-05: 混合语言内容
- **前置**：节点包含中英日混排文本
- **操作**：调用 `compileFromFigma(multiLangFileId)`
- **预期**：正确保留所有文字，编码正确
- **验证**：
  ```typescript
  expect(result.html).toContain('你好');
  expect(result.html).toContain('Hello');
  expect(result.html).toContain('こんにちは');
  ```

### 集成测试

#### TC-INT-01: 端到端 - 规范 Figma 文件
- **操作**：输入规范的 Figma 文件 ID
- **预期**：生成可用的 HTML
- **验证**：HTML 渲染正确，样式匹配设计稿

#### TC-INT-02: 端到端 - 不规范 Figma 文件
- **操作**：输入图层混乱的 Figma 文件
- **预期**：仍能生成代码，标记警告
- **验证**：HTML 可渲染，warnings 包含问题描述

#### TC-INT-03: 两路并行验证
- **操作**：同时触发视觉提取和结构推断
- **预期**：互不阻塞，独立完成
- **验证**：Promise.all 成功，无竞态问题

---

## Step-by-step Validation

### 0. 环境准备（待做）
- 做什么：安装 `sharp` 依赖，配置 Figma Access Token
- 验证：
  ```bash
  npm ls sharp
  echo $FIGMA_ACCESS_TOKEN | head -c 10
  ```

### 1. Figma API 客户端（待做）
- 文件：`src/lib/figma/api/client.ts`
- 做什么：封装 Figma REST API，支持 getFile/getImage/getStyles
- 验证：测试用例通过，能获取测试文件数据
- 参考：Figma REST API 文档

### 2. 视觉提取器 - 色彩提取（待做）
- 文件：`src/lib/figma/visual/color-extractor.ts`
- 做什么：从 Local Styles 提取色彩，生成完整色阶
- 验证：TC-VE-01 通过

### 3. 视觉提取器 - 排版提取（待做）
- 文件：`src/lib/figma/visual/typography-extractor.ts`
- 做什么：从 Text Styles 提取字体族和字阶
- 验证：TC-VE-02 通过

### 4. 视觉提取器 - 空间提取（待做）
- 文件：`src/lib/figma/visual/spacing-extractor.ts`
- 做什么：从 Auto Layout 提取间距，对齐到 4px 栅格
- 验证：TC-VE-03 通过

### 5. 视觉提取器 - 整合（待做）
- 文件：`src/lib/figma/visual/extractor.ts`
- 做什么：整合所有子提取器，输出兼容的 DesignTokens
- 验证：TC-VE-04 通过，Tokens 能传入现有组件工厂

### 6. 结构推断器 - 规则引擎（待做）
- 文件：`src/lib/figma/structure/rule-engine.ts`
- 做什么：实现基于命名和类型的确定性规则
- 验证：TC-SI-01, TC-SI-02 通过

### 7. 结构推断器 - 启发式引擎（待做）
- 文件：`src/lib/figma/structure/heuristic-engine.ts`
- 做什么：实现基于视觉特征的启发式推断
- 验证：TC-SI-03 通过

### 8. 结构推断器 - 布局推断（待做）
- 文件：`src/lib/figma/structure/layout-inferrer.ts`
- 做什么：从 Auto Layout 和位置关系推断布局
- 验证：TC-SI-04, TC-SI-05 通过

### 9. 结构推断器 - AI 引擎（待做）
- 文件：`src/lib/figma/structure/ai-engine.ts`
- 做什么：实现多模态 AI 推断降级
- 验证：TC-SI-06, TC-SI-07 通过

### 10. 结构推断器 - DSL 生成（待做）
- 文件：`src/lib/figma/structure/dsl-generator.ts`
- 做什么：将推断结果转换为标准 DSL
- 验证：生成的 DSL 能被现有 Lexer/Parser 解析

### 11. Figma Frontend 入口（待做）
- 文件：`src/lib/figma/index.ts`
- 做什么：整合视觉提取 + 结构推断 + 现有编译器
- 验证：TC-INT-01 通过

### 12. 错误处理与边界条件（待做）
- 做什么：实现错误类型和边界条件处理
- 验证：TC-ERR-01 ~ TC-ERR-05, TC-EDGE-01 ~ TC-EDGE-05 通过

### 13. CLI 集成（待做）
- 文件：`src/cli/figma.ts`
- 做什么：添加 `stitch figma <file-id>` 命令
- 验证：命令行能正常调用，输出 HTML

### 14. 文档更新（待做）
- 做什么：更新 README 和 API 文档
- 验证：文档包含 Figma Frontend 使用说明

---

## Implementation Plan

### Phase 1: 视觉提取器 (Week 1)

| 任务 | 文件 | 工作量 |
|------|------|--------|
| Figma API 封装 | `api/client.ts` | 0.5d |
| 色彩提取 | `visual/color-extractor.ts` | 1d |
| 排版提取 | `visual/typography-extractor.ts` | 0.5d |
| 空间提取 | `visual/spacing-extractor.ts` | 0.5d |
| 形状/效果提取 | `visual/shape-extractor.ts`, `effect-extractor.ts` | 0.5d |
| 资产提取 | `visual/asset-extractor.ts` | 1d |
| 整合 + 测试 | `visual/extractor.ts`, tests | 1d |

### Phase 2: 结构推断器 (Week 2-3)

| 任务 | 文件 | 工作量 |
|------|------|--------|
| 规则引擎 | `structure/rule-engine.ts` | 2d |
| 组件识别规则 | `structure/rules/*.ts` | 1d |
| 启发式引擎 | `structure/heuristic-engine.ts` | 2d |
| 布局推断 | `structure/layout-inferrer.ts` | 1d |
| AI 引擎 | `structure/ai-engine.ts` | 2d |
| DSL 生成 | `structure/dsl-generator.ts` | 1d |
| 整合 + 测试 | `structure/inferrer.ts`, tests | 2d |

### Phase 3: 集成 (Week 4)

| 任务 | 文件 | 工作量 |
|------|------|--------|
| Figma Frontend 入口 | `figma/index.ts` | 1d |
| 端到端测试 | `__tests__/integration/` | 2d |
| CLI 集成 | `cli/figma.ts` | 1d |
| 文档更新 | `docs/` | 1d |

---

## Files to Create

```
src/lib/figma/
├── index.ts                     # Figma Frontend 主入口
├── types.ts                     # Figma 相关类型定义
├── api/
│   ├── client.ts                # Figma API 客户端
│   ├── types.ts                 # Figma API 类型
│   └── cache.ts                 # 请求缓存
├── visual/
│   ├── index.ts
│   ├── extractor.ts             # 视觉提取器主入口
│   ├── color-extractor.ts
│   ├── typography-extractor.ts
│   ├── spacing-extractor.ts
│   ├── shape-extractor.ts
│   ├── effect-extractor.ts
│   ├── asset-extractor.ts
│   └── utils/
│       ├── color-utils.ts
│       └── normalize.ts
├── structure/
│   ├── index.ts
│   ├── inferrer.ts              # 结构推断器主入口
│   ├── rule-engine.ts
│   ├── heuristic-engine.ts
│   ├── ai-engine.ts
│   ├── layout-inferrer.ts
│   ├── dsl-generator.ts
│   └── rules/
│       ├── component-rules.ts
│       ├── layout-rules.ts
│       └── naming-rules.ts
└── __tests__/
    ├── visual/
    │   ├── color-extractor.test.ts
    │   ├── typography-extractor.test.ts
    │   └── ...
    ├── structure/
    │   ├── rule-engine.test.ts
    │   ├── heuristic-engine.test.ts
    │   └── ...
    └── integration/
        └── e2e.test.ts
```

---

## Dependencies

```json
{
  "dependencies": {
    // 现有
    "chevrotain": "^11.x",
    "zod": "^3.x",
    "purgecss": "^6.x",
    // 新增
    "sharp": "^0.33.x"       // 图片处理（WebP 转换）
  },
  "devDependencies": {
    // 测试用
    "msw": "^2.x"            // Mock Figma API
  }
}
```

---

## Notes

- 视觉提取器和结构推断器**完全独立**，可并行开发
- 视觉提取器输出格式**必须与现有 DesignTokens 100% 兼容**
- 结构推断器失败时，可降级为**人工编写 DSL + Figma Tokens**
- AI 推断调用应有**速率限制**和**成本控制**

---

## Progress

- [ ] 环境准备
- [ ] Figma API 客户端
- [ ] 视觉提取器 - 色彩
- [ ] 视觉提取器 - 排版
- [ ] 视觉提取器 - 空间
- [ ] 视觉提取器 - 整合
- [ ] 结构推断器 - 规则引擎
- [ ] 结构推断器 - 启发式引擎
- [ ] 结构推断器 - 布局推断
- [ ] 结构推断器 - AI 引擎
- [ ] 结构推断器 - DSL 生成
- [ ] Figma Frontend 入口
- [ ] 错误处理与边界条件
- [ ] CLI 集成
- [ ] 文档更新

## Next

- 开始 Step 0: 环境准备

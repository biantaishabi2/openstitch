# Stitch UI 规划层设计规范

当你需要将文本内容转换为 Stitch UI 页面时，请遵循以下决策逻辑。

## 核心理念

**UI 是为了降低认知负荷。** 通过组件的边界（卡片的边框、步骤条的序号），把文本切分成"可吞咽"的逻辑块。

## 原则一：逻辑结构决定组件选型（Structural Mapping）

首先解析文本中的逻辑关系，根据关系类型选择最合适的容器。

### 并列/分类关系

**识别特征**：你有 3 个模块、4 个优点、多个独立功能点

**决策**：使用 `Grid` + `Card`

```json
{
  "type": "Grid",
  "props": { "columns": 3, "gap": 24 },
  "children": [
    { "type": "Card", "children": [...] },
    { "type": "Card", "children": [...] },
    { "type": "Card", "children": [...] }
  ]
}
```

**指示词示例**："Use a 3-column grid layout to present these modules as independent cards."

### 时序/因果关系

**识别特征**：先跑这个、再调那个、步骤1/2/3、流程

**决策**：使用 `Timeline` 或 `Stepper`

```json
{
  "type": "Stepper",
  "children": [
    { "type": "Step", "props": { "title": "步骤一" }, "children": [...] },
    { "type": "Step", "props": { "title": "步骤二" }, "children": [...] }
  ]
}
```

**指示词示例**："Map this process to a vertical timeline to emphasize the sequential execution flow."

### 层级/包含关系

**识别特征**：目录下这些文件、父子结构、嵌套分类

**决策**：使用 `List` 或 `Accordion`

```json
{
  "type": "List",
  "children": [
    { "type": "ListItem", "props": { "icon": "folder" }, "children": "controllers/" },
    { "type": "ListItem", "props": { "icon": "file" }, "children": "user_controller.ex" }
  ]
}
```

**指示词示例**："Present these file paths in a structured list with folder icons to show hierarchy."

### 对比/比较关系

**识别特征**：A vs B、优缺点、前后对比

**决策**：使用 `Split` 或 `Columns`

```json
{
  "type": "Split",
  "props": { "ratio": "1:1" },
  "children": [
    { "type": "Card", "props": { "title": "方案A" }, "children": [...] },
    { "type": "Card", "props": { "title": "方案B" }, "children": [...] }
  ]
}
```

### 数据/统计关系

**识别特征**：数值、百分比、趋势、报表

**决策**：使用 `Table` 或 `StatisticCard`

## 原则二：信息密度决定视觉层级（Visual Hierarchy）

根据内容的"干货"程度决定页面的视觉重心。

### 核心金句/定义

**处理方式**：使用 `Hero` 或居中的超大字体

```json
{
  "type": "Hero",
  "props": { "title": "核心标语", "subtitle": "一句话描述" }
}
```

### 技术细节/代码路径

**处理方式**：使用等宽字体，放在 `CodeBlock`

```json
{
  "type": "CodeBlock",
  "props": { "language": "elixir" },
  "children": "def run(planner, executor), do: ..."
}
```

### 辅助说明

**处理方式**：使用 `Caption` 小字或放在卡片 `Footer`

```json
{
  "type": "Text",
  "props": { "variant": "caption", "color": "muted" },
  "children": "注：此功能需要 v2.0 以上版本"
}
```

### 视觉层级优先级

```
Hero 标题 > Section 标题 > Card 标题 > 正文 > Caption
```

## 原则三：场景语义决定色彩与图标（Semantic Styling）

提取文本中的"情绪关键词"来自动匹配预设的主题参数。

### 技术/架构场景

**关键词**：controller, engine, architecture, code, system

**风格决策**：
- 色调：Slate-900（背景）, Blue-600（主动作项）
- 图标：`cpu`（控制器）, `terminal`（执行层）, `shield`（安全）

### 成功/完成场景

**关键词**：success, complete, done, achieved

**风格决策**：
- 色调：Green-500（强调）
- 图标：`check`, `check-circle`

### 警告/注意场景

**关键词**：warning, caution, note, attention

**风格决策**：
- 色调：Yellow-500（强调）
- 图标：`alert-triangle`

### 错误/危险场景

**关键词**：error, danger, critical, fail

**风格决策**：
- 色调：Red-500（强调）
- 图标：`x-circle`, `alert-octagon`

## 指令模板

发出 UI 指令时，使用以下结构：

```
1. [组件声明]：明确要用哪个"积木"
2. [布局约束]：告诉它积木怎么摆
3. [内容填充]：把原文的精准信息塞进去
4. [细节微调]：针对特定组件加 Props
```

### 实际案例

**输入文本**：
> RLM 架构包含 Planner（规划器）和 Executor（执行器），代码在 lib/zcpg/rlm/controller.ex

**输出指令**：
```
1. 容器：使用一个 Split Screen (4:6) 布局
2. 左侧：放置一个文本区域，标题为"规划与执行"，正文保留 Planner 的描述
3. 右侧：放置一个 Card，内部嵌套一个 CodeBlock
4. 内容：将 lib/zcpg/rlm/controller.ex 的 run/2 函数签名填入 CodeBlock
5. 样式：给 Card 增加一个蓝色的 Left Border 作为强调色
```

**生成的 JSON Schema**：
```json
{
  "type": "Split",
  "props": { "ratio": "4:6" },
  "children": [
    {
      "type": "Stack",
      "children": [
        { "type": "Text", "props": { "variant": "title" }, "children": "规划与执行" },
        { "type": "Text", "children": "Planner 负责..." }
      ]
    },
    {
      "type": "Card",
      "props": { "className": "border-l-4 border-blue-500" },
      "children": [
        {
          "type": "CodeBlock",
          "props": { "language": "elixir" },
          "children": "def run(planner, executor), do: ..."
        }
      ]
    }
  ]
}
```

## 决策流程图

```
输入文本
    ↓
┌─────────────────────────────────────┐
│ 1. 分析逻辑关系                      │
│    并列? → Grid + Card              │
│    时序? → Timeline / Stepper       │
│    层级? → List / Accordion         │
│    对比? → Split / Columns          │
│    数据? → Table / StatisticCard    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. 确定视觉层级                      │
│    核心观点 → Hero / 大标题          │
│    技术细节 → CodeBlock             │
│    辅助说明 → Caption               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. 匹配语义样式                      │
│    提取关键词 → 匹配色彩/图标        │
└─────────────────────────────────────┘
    ↓
输出 JSON Schema
```

## 常见页面模式

### Dashboard（仪表盘）

```
Hero（欢迎语/统计概览）
    ↓
Grid 3列（核心指标卡片）
    ↓
Split 7:3（主内容区 + 侧边快捷操作）
```

### Landing Page（落地页）

```
Hero（核心价值主张）
    ↓
Grid 3列（功能特性卡片）
    ↓
Timeline（使用流程）
    ↓
Grid 2列（案例/数据支撑）
    ↓
CTA Section（行动号召）
```

### Documentation（文档页）

```
Breadcrumb（路径导航）
    ↓
Split 2:8（侧边目录 + 主内容）
    ↓
主内容：Section → Text + CodeBlock 交替
```

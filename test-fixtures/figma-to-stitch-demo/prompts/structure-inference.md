# 结构推断提示词

> 用于 Workflow 步骤 3: AI 验证/修正区域划分

## 任务

程序已经通过 **absoluteBoundingBox 几何计算** 初步划分了页面区域。你的任务是：

1. **验证**程序的区域划分是否合理
2. **修正**明显的错误（如遗漏的容器、错误的归属）
3. **补充**语义化的区域名称和类型

**注意：你不是在看截图，而是在分析 JSON 数据中的几何关系。**

---

## 输入数据

### 1. 程序计算的区域划分结果

```json
{
  "areas": [
    {
      "id": "area_1",
      "anchorNode": "Rectangle 1",
      "bounds": { "x": 0, "y": 88, "width": 375, "height": 180 },
      "childNodes": ["Ellipse 4", "xkyy0325", "今日步数", "Group 1"],
      "inferredLayout": "row"
    }
  ]
}
```

### 2. 关键节点信息（用于验证）

- 名称：{{name}}
- 类型：{{type}}
- 尺寸：{{width}}x{{height}}px
- 位置：({{x}}, {{y}})
- 子节点数量：{{childCount}}

---

## 验证要点

### 1. 区域是否合理

- **锚点选择**：这个节点适合作为区域容器吗？
- **元素归属**：子节点真的都属于这个区域吗？
- **边界判断**：区域范围是否过大/过小？

### 2. 布局推断是否正确

| 程序推断 | 验证点 |
|----------|--------|
| Grid | 行列数是否正确？间距是否均匀？ |
| Row | 是否真的是横向排列？ |
| Column | 是否真的是纵向排列？ |

### 3. 语义命名

根据区域内容，给出语义化的名称：
- ❌ `area_1`, `Group 1`
- ✅ `userProfile`, `functionGrid`, `newsSection`

---

## 常见错误模式（需要修正）

| 错误 | 示例 | 修正 |
|------|------|------|
| 遗漏背景容器 | Header 元素散开，没有统一容器 | 创建虚拟容器包含所有 Header 元素 |
| 过度拆分 | 一个卡片被拆成多个区域 | 合并为单个卡片区域 |
| 布局误判 | 3x3 网格被识别为 Row | 改为 Grid(3x3) |
| 包含错误 | 装饰元素被包含进功能区域 | 排除纯装饰节点 |

---

## 返回格式

```json
{
  "validation": {
    "correct": false,
    "issues": ["Header 缺少统一容器", "功能卡片应为 Grid(3x3)"]
  },
  "correctedAreas": [
    {
      "name": "header",
      "type": "section",
      "description": "顶部个人信息区",
      "bounds": { "x": 0, "y": 88, "width": 375, "height": 180 },
      "childNodes": ["Rectangle 1", "Ellipse 4", "xkyy0325", ...],
      "layout": "row"
    }
  ]
}
```

---

## 参考图片（辅助理解）

如需直观理解设计，可查看：
- 路径：`reference/figma-design.png`

**但主要依据仍是 JSON 的几何数据。**

## 节点信息

- 名称：{{name}}
- 类型：{{type}}
- 尺寸：{{width}}x{{height}}px
- 子节点数量：{{childCount}}
- 子节点类型：{{childTypes}}
- 布局模式：{{layoutMode}}

## 派生结构特征（程序计算）

- 名称提示：{{nameHint}}
- 宽高比：{{aspectRatio}}
- 尺寸等级：{{sizeBucket}}
- 文本子节点数：{{textChildCount}}
- 非文本子节点数：{{nonTextChildCount}}
- 仅包含文本子节点：{{hasOnlyTextChild}}
- 是否有描边：{{hasStroke}}
- 描边宽度：{{strokeWeight}}
- 是否有填充：{{hasFill}}
- 填充类型：{{fillTypes}}
- 圆角半径：{{cornerRadius}}
- 是否有阴影：{{hasShadow}}
- 是否有模糊：{{hasBlur}}
- 文本预览：{{textPreview}}
- 疑似占位符文本：{{placeholderHint}}

## 位置推断布局线索（即使没有 auto layout）

- 可见子节点数（排除背景层）：{{layoutChildCount}}
- 背景装饰层数：{{backgroundChildCount}}
- 位置推断布局：{{inferredLayout}}
- 位置推断间距：{{inferredGap}}
- 位置推断内边距（top/right/bottom/left）：{{inferredPadding}}
- 位置推断对齐：{{inferredAlignment}}
- 子节点超出父容器边界数量：{{overflowChildCount}}

## 可选类型

请从以下类型中选择最匹配的：

- **Button** - 按钮，可点击的交互元素
- **Card** - 卡片，包含相关信息的容器
- **Input** - 输入框，用户文本输入区域
- **Heading** - 标题，大号文字
- **Text** - 文本，普通文字内容
- **Image** - 图片，图像内容
- **Icon** - 图标，小型矢量图形
- **Section** - 区块，垂直布局的内容区域
- **Row** - 行，水平布局的内容区域
- **Container** - 容器，通用布局容器

如果不确定，请返回 `Container`，不要返回其它未列出的类型。

## 重要判别提示（尤其是 Input vs Button）

- **Input 更可能**：
  - 有描边（hasStroke = yes）且描边宽度 > 0
  - 宽高比很大（aspectRatio >= 4）
  - 高度常见区间 36-56
  - 文本像占位符（placeholderHint = yes）
- **Button 更可能**：
  - 没有描边或描边不明显
  - 只有一个短文本标签且更像动作词（如 Submit / 保存 / 确定）
  - 宽高比中等（通常 1.5-4）

## 负约束（避免误判为 Button）

- 出现以下任一情况时，不要选择 `Button`：
  - `textChildCount = 0`
  - 没有任何文本预览（`textPreview = none` 或为空）
  - 尺寸很大（例如 `width >= 240` 或 `height >= 80`）且没有文本
  - 主要由多个非文本子节点组成（`nonTextChildCount >= 2`）且没有文本
- 满足下列特征时，优先考虑 `Container / Section / Row`：
  - 没有文本子节点（`textChildCount = 0`）
  - 主要是布局壳（多个 `FRAME/GROUP/RECTANGLE` 子节点）
  - 节点尺寸偏大（`sizeBucket = large` 或 `xlarge`）

## 低质量 Figma 设计补充规则（务必参考）

- **INSTANCE / COMPONENT / COMPONENT_SET**：
  - 名字可能是 `Button/Primary`、`Icon/Settings`、`ic_24/outline/home` 这类分层命名。
  - 请解析名字中的关键词（`button/card/input/icon/image/section/row`）作为强提示。
  - 如果是小尺寸正方形且含 `icon/logo`，优先 `Icon`。

- **容器缺失或图层结构不规范**：
  - 即使 `layoutMode = none`，只要位置推断布局明显（vertical/horizontal）且子节点数量足够，
    仍应优先 `Section/Row`。
  - `overflowChildCount > 0` 表示子节点坐标超出父容器边界，可能是图层摆放不规范，
    仍要使用这些子节点推断布局，而不是直接判为 `Container`。

- **绝对间距 / 非等距间距**：
  - 间距和内边距可能是不等值的硬编码（例如 12/16/20），
    但只要整体呈“竖向堆叠”或“横向排列”，仍应判为 `Section/Row`。

- **网格状布局但没有 Auto Layout**：
  - 若 `inferredLayout = grid-like-from-positions`，且无明确语义，
    优先 `Container`（除非名字提示为 `Section/Row`）。
- 如果你选择 `Button`，请确保理由里明确提到“存在文本子节点且文本像动作词”。

## 结构判别补充（Section vs Card，Row vs Button）

- **Section 更可能**：
  - `layoutMode = VERTICAL`
  - 文本子节点较多（例如 `textChildCount >= 2`）
  - 更像内容区块而非单个信息卡片
- **Card 更可能**：
  - 有明显“卡片装饰”：例如 `hasShadow = yes`、圆角更强、或像单个信息块
  - 常见为一个主要容器承载少量关键内容（如标题 + 数值/描述）
  - `backgroundChildCount >= 1` 且 `hasFill = yes`，并且有文本内容（`textChildCount >= 1`）
  - 子节点数量不多（例如 `childCount <= 6`）但内部内容聚合为一个信息块
  - **注意**：卡片装饰常在“子矩形背景层”上，父节点本身可能 `hasFill = no` / `hasShadow = no`。
    只要 `backgroundChildCount >= 1` 且 `childTypes` 含 `RECTANGLE`，并有文本（`textChildCount >= 2`），依然优先 `Card`
- 避免把 Section 误判成 Card：
  - 如果是竖向布局（`layoutMode = VERTICAL`）且文本较多，
    且没有明显卡片装饰（`hasShadow = no` 且没有强描边），优先 `Section`

- **避免把 Card 误判成 Container（非常重要）**：
  - 只要满足以下任一组合，就不要选 `Container`，优先 `Card`：
    - `hasShadow = yes` 且 `textChildCount >= 1`
    - `backgroundChildCount >= 1` 且 `hasFill = yes` 且 `cornerRadius` 明显不为 0
    - `childCount` 较少（<= 6）且包含标题/数值等文本（`textChildCount >= 1`）
    - `backgroundChildCount >= 1` 且 `childTypes` 含 `RECTANGLE`，并有多个文本（`textChildCount >= 2`）

- **Section vs Container（非常重要，尤其是表单/页面区块）**：
  - 如果 `layoutMode = VERTICAL`，且 `childCount >= 3`，
    即使 `textChildCount` 不多（例如只有 1 个标题文本），也优先 `Section`
  - 如果是“标题 + 多个子块/字段/面板”的结构（常见于表单、设置页、内容区块），优先 `Section`
  - 如果 `layoutMode = none`，但“位置推断布局”显示为 `vertical-from-positions`，
    且 `layoutChildCount >= 3`，仍然优先 `Section`
  - 不要把“有明确布局模式（VERTICAL/HORIZONTAL）”的区块随意归为 `Container`
    - `Container` 更像“没有明确布局模式（layoutMode = none）的通用壳”
  - `Container` 更可能：
    - `layoutMode = none`
    - `textChildCount = 0`
    - 大尺寸且主要由多个非文本子节点组成
    - “位置推断布局”是 unknown/mixed，或更像纯壳
  - 如果 `backgroundChildCount >= 1`，优先把这些背景层当作装饰，不要因为它们影响布局判断

- **Row 更可能**：
  - `layoutMode = HORIZONTAL`
  - 子节点数量 >= 2（例如 图标 + 文本，或多个子块）
  - 更像“排布容器/行”而非单个交互控件
- 避免把 Row 误判成 Button：
  - 如果 `layoutMode = HORIZONTAL` 且 `childCount >= 2`，
    且文本不像动作词（更像名词/描述），优先 `Row`
  - 如果 `layoutMode = none`，但“位置推断布局”为 `horizontal-from-positions`，
    且 `layoutChildCount >= 2`，也优先 `Row`
  - 如果是“图标 + 文本”的组合（`nonTextChildCount >= 1` 且 `textChildCount >= 1`），
    且文本不是动作词（例如 "Profile settings"），优先 `Row`
  - `Button` 通常是单一交互元素；若判为 Button，请在理由中说明其“动作词文本”

## 返回格式（必须严格遵守）

请严格按照以下 JSON 格式返回（注意字段名必须是 componentType）：

```json
{
  "componentType": "Input",
  "confidence": 0.92,
  "reasoning": "有描边+大宽高比+占位符文本",
  "dsl": "[INPUT: Frame_99]\\n  ATTR: Placeholder(\"Enter your email...\")"
}
```

重要要求（非常关键）：
- 只返回 JSON，不要额外解释，不要使用 Markdown 代码块
- 字段名必须是 `componentType`（不是 `type`）
- `componentType` 的值必须是上面列出的类型之一（不确定就用 `Container`）
- `dsl` 是必须字段，且必须是"可编译的 DSL 字符串"

## DSL 严格约束（否则会编译失败）

你输出的 `dsl` 必须满足：

1) 只允许单个节点（不要子节点、不要额外标签）

2) 结构必须是以下模板之一：

模板 A（只有标签）：

`[TAG: id]`

模板 B（标签 + ATTR）：

`[TAG: id]\n  ATTR: Key("value"), Key2("value")`

模板 C（标签 + CONTENT）：

`[TAG: id]\n  CONTENT: "text"`

模板 D（标签 + ATTR + CONTENT）：

`[TAG: id]\n  ATTR: Key("value"), Key2("value")\n  CONTENT: "text"`

模板 E（标签 + CSS 覆盖默认样式）：

`[TAG: id]\n  CSS: "rounded-none shadow-none"\n  ATTR: Key("value")\n  CONTENT: "text"`

模板 F（标签 + 布局属性 + CSS）：

`[TAG: id]\n  { ClassName: "w-full h-40" }\n  CSS: "rounded-none"\n  CONTENT: "text"`

3) `TAG` 必须全大写，且只能是下列之一：

`BUTTON, CARD, INPUT, HEADING, TEXT, IMAGE, ICON, SECTION, ROW, CONTAINER`

4) `id` 只能包含字母、数字、下划线（不要空格和其他符号）

5) `ATTR:` 只能出现一次
- 如果有多个属性，必须写在同一行，用逗号分隔

6) 只使用以下安全属性（不要发明新属性）：

`Text, Placeholder, Title, Variant, Size, ClassName, Style, Icon, Width, Height, Gap, Align, Justify, Direction, Padding, Margin, Src, Alt`

7) **CSS 样式覆盖**（覆盖 CARD 等组件的默认样式）：

- 使用 `CSS: "tailwind-classes"` 覆盖 shadcn/ui 默认样式
- 例如：`CSS: "rounded-none shadow-none"` 移除圆角和阴影
- CSS 属性可以在 `{ ClassName }`、`ATTR`、`CONTENT` 之后任意位置
- 如果需要完全控制样式，可以用 `SECTION` 替代 `CARD`

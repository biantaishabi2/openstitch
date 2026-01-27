# Figma 到 Stitch 编译流程

## 概述

从 Figma 设计稿到 Stitch 编译输出的完整工作流程。

## 两种工作模式

### 模式一：AI 生成（推荐用于新设计）

```
AI 提示词 → DSL → 编译 → HTML
```

适用于 AI 从零开始生成界面设计。

### 模式二：Figma 还原（用于还原设计稿）

```
Figma JSON → 提取颜色 + 结构 → DSL → 编译 → HTML
```

适用于从 Figma 设计稿还原为可运行代码。

## 完整工作流程（推荐）

```
┌─────────────────────────────────────────────────────────────────┐
│  步骤 1: 获取 Figma 资源                                          │
│  - Figma JSON（API）                                             │
│  - 缩略图（用于预览）                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤 2: 结构推断 → DSL                                           │
│  - 遍历节点树，识别布局结构                                        │
│  - 生成 Stitch DSL 代码                                          │
│  - 输出: dsl 字段                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤 3: AI 检查/调整 DSL                                         │
│  - 检查 DSL 语法是否正确                                          │
│  - 检查组件命名是否合理                                           │
│  - 检查布局结构是否符合设计意图                                    │
│  - 调整: 更新 dsl 字段                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤 4: Design Tokens 提取                                       │
│  - 采集颜色（fills/strokes）                                      │
│  - 颜色聚类（LAB 色彩空间）                                        │
│  - 语义分配（primary/accent/background等）                        │
│  - 输出: tokens 字段                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤 5: AI 调整颜色分配                                          │
│  - 检查颜色实际用途（看截图）                                      │
│  - 合并同色系相近颜色                                             │
│  - 修正不符合设计的颜色分配                                        │
│  - 调整: 更新 tokens 字段                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤 6: 编译 → HTML                                              │
│  - 读取 screens[].dsl                                            │
│  - 读取 screens[].tokens                                         │
│  - 编译为静态 HTML                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤 7: 样式覆盖（可选）                                          │
│  - 如需微调，在 screens[].overrides 中定义                         │
│  - 编译器会自动应用覆盖                                           │
└─────────────────────────────────────────────────────────────────┘
```

## JSON 配置格式

```json
{
  "context": "页面名称",
  "platform": "mobile",
  "screens": [
    {
      "screen_id": "home",
      "title": "首页",
      "dsl": "[SECTION: home]...",

      "tokens": {
        "--primary-color": "#0098ff",
        "--accent-color": "#ff9d00",
        "--background": "#ffffff",
        "--foreground": "#000000"
      },

      "overrides": {
        "--primary": "#00B5FF"
      }
    }
  ]
}
```

| 字段 | 必需 | 说明 |
|------|------|------|
| `screens[].dsl` | ✅ | Stitch DSL 代码 |
| `screens[].tokens` | ✅ | Design Tokens（从 Figma 提取） |
| `screens[].overrides` | ❌ | 样式覆盖（可选） |

## 编译示例

```typescript
import { compile } from './src/lib/compiler';
import type { StitchConfig } from './types';

async function compileFromConfig(config: StitchConfig) {
  const screen = config.screens[0];

  const result = await compile(screen.dsl, {
    tokens: screen.tokens,
    tokenOverrides: screen.overrides,
    ssr: {
      title: screen.title,
      lang: 'zh-CN',
    },
  });

  return result.ssr.html;
}
```

## Figma 还原流程（重点）

### 第一步：获取 Figma 资源

```bash
# 获取 Figma JSON（包含完整节点树）
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY" > figma.json

# 获取设计缩略图（用于预览）
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?format=png" > thumbnail.png
```

### 第二步：Figma Adapter 提取

使用 `convertFigmaToStitch()` 函数从 Figma JSON 提取：

1. **颜色** → Design Tokens（从节点 fills/strokes 提取，聚类后分配语义）
2. **结构** → DSL（根据节点树生成组件结构）
3. **资产** → 图片路径（从 imageRef 映射）

```typescript
import { convertFigmaToStitch } from './src/figma/adapter/figma-adapter';

const figmaJson = JSON.parse(fs.readFileSync('figma.json', 'utf-8'));

const result = await convertFigmaToStitch(figmaJson, {
  context: '页面名称',  // 仅用于 DSL 命名，不用于推断颜色
});

// 输出：
// - result.dsl: 生成的 DSL 代码
// - result.tokens: Design Tokens（从 Figma 提取的颜色）
// - result.visuals: 颜色聚类结果
// - result.structure: 结构推断结果
```

### 第三步：编译 DSL 为 HTML

编译器支持两种模式：

#### 模式 A：跳过自动生成（推荐用于 Figma 还原）

直接把 Figma Adapter 的 Design Tokens 传入，跳过 `generateDesignTokens()` 步骤。

```typescript
import { compile } from './src/lib/compiler';

const result = await compile(figmaResult.dsl, {
  tokens: figmaResult.tokens,  // 直接使用 Figma 提取的 tokens
  ssr: { title: '页面标题' },
});
```

#### 模式 B：使用 tokenOverrides 覆盖

如果只需要覆盖部分颜色，可以使用 `tokenOverrides`：

```typescript
const result = await compile(figmaResult.dsl, {
  context: '页面名称',
  tokenOverrides: {
    '--primary': '#0098ff',
    '--accent': '#ff9d00',
  },
  ssr: { title: '页面标题' },
});
```

### 完整示例

```typescript
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from './src/figma/adapter/figma-adapter';
import { compile } from './src/lib/compiler';

async function figmaToHtml(filePath: string) {
  // 1. 读取 Figma JSON
  const figmaJson = JSON.parse(readFileSync(filePath, 'utf-8'));

  // 2. 提取 Design Tokens + DSL
  const figmaResult = await convertFigmaToStitch(figmaJson, {
    context: '页面名称',
  });

  // 3. 编译 DSL（跳过自动生成 tokens）
  const compileResult = await compile(figmaResult.dsl, {
    tokens: figmaResult.tokens,  // 直接使用 Figma 提取的 tokens
    ssr: { title: '页面标题', lang: 'zh-CN' },
  });

  return compileResult.ssr.html;
}
```

### 第四步：颜色覆盖（可选）

如果需要微调颜色，在 JSON 配置中覆盖：

```json
{
  "context": "页面名称",
  "platform": "mobile",
  "tokenOverrides": {
    "--primary": "#0098ff",
    "--accent": "#ff9d00",
    "--background": "#ffffff",
    "--foreground": "#000000"
  }
}
```

## Design Tokens 提取原理

### 颜色提取

```
Figma 节点 → 采集 fills/strokes → 聚类（LAB 色彩空间）→ 语义分配
```

1. **采集**：遍历所有节点，收集填充色、描边色、阴影色
2. **聚类**：将相近颜色（ΔE < 3）归为一组
3. **语义分配**：
   - 最高频的彩色 → primary
   - 次高频且色相不同 → accent
   - 中性色按亮度分配 → background/foreground/muted/border

### 两种编译模式

编译器支持传入 `tokens` 选项，有两种工作模式：

| 模式 | 输入 | 适用场景 |
|------|------|----------|
| **自动生成** | context | AI 从零生成，根据 context 推断视觉风格 |
| **直接使用** | tokens | Figma 还原，跳过自动生成，直接使用提取的颜色 |

```typescript
// 模式 A：自动生成（AI 场景）
await compile(dsl, { context: '医疗系统' });

// 模式 B：直接使用（Figma 还原场景）
await compile(dsl, { tokens: figmaResult.tokens });
```

### 注意事项

- **不要根据 context 推断行业生成颜色**
- Design Tokens 应该**完全从 Figma 提取**
- context 仅用于 DSL 命名，不影响颜色生成
- 如果聚类结果不符合预期，可通过 `tokenOverrides` 手动覆盖

## 完整示例

```typescript
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from './src/figma/adapter/figma-adapter';
import { compile } from './src/lib/compiler';

async function figmaToHtml(filePath: string) {
  // 1. 读取 Figma JSON
  const figmaJson = JSON.parse(readFileSync(filePath, 'utf-8'));

  // 2. 提取 Design Tokens + DSL
  const figmaResult = await convertFigmaToStitch(figmaJson, {
    context: '页面名称',
  });

  // 3. 编译 DSL
  const compileResult = await compile(figmaResult.dsl, {
    ssr: { title: '页面标题' },
  });

  return compileResult.ssr.html;
}
```

## 常见问题

### Q: 聚类结果不正确（如两个蓝色都被识别）

A: 这种情况需要 AI 介入调整。提示词模板：

```
分析 Figma 颜色聚类结果，看这些颜色实际用在哪里：
1. primary 应该是用在最多地方的彩色
2. 如果一个颜色只用在少数元素，它可能不是品牌色
3. 把同色系的相近颜色合并
4. secondary 应该是与 primary 色相不同的次要品牌色

根据元素的实际用途分配语义，不是按频率。
```

### Q: 提取的颜色和 Figma 不完全一致

A: 可能原因：
1. Figma 使用了局部变量（Variable），Adapter 需要解析变量引用
2. 颜色透明度被忽略
3. 渐变颜色需要特殊处理

### Q: 如何覆盖组件默认样式

A: 使用 CSS 属性或 SECTION 替代 CARD：

```dsl
# 方案 A: CSS 属性覆盖（任意顺序）
[CARD: welfare]
  CSS: "rounded-none shadow-none"
  { ClassName: "bg-white p-3" }
  [TEXT: text] CONTENT: "福利平台"

# 方案 B: 用 SECTION 替代 CARD
[SECTION: welfare]
  { ClassName: "bg-white p-3" }
  [TEXT: text] CONTENT: "福利平台"
```

**注意**: CSS 属性可以在 `{ ClassName }`、`ATTR`、`CONTENT` 之后任意位置，不影响子元素解析。

### Q: 如何查看提取的 Design Tokens

```typescript
const result = await convertFigmaToStitch(figmaJson, { context: '页面' });
console.log(Object.entries(result.tokens)
  .filter(([k]) => k.startsWith('--') && !k.includes('spacing') && !k.includes('font'))
);
```

## 文件位置

| 功能 | 路径 |
|------|------|
| Figma Adapter | `src/figma/adapter/figma-adapter.ts` |
| 颜色推断器 | `src/figma/inferrers/color-inferrer.ts` |
| 结构推断器 | `src/figma/inferrers/structure-inferrer.ts` |
| 编译器 | `src/lib/compiler/index.ts` |

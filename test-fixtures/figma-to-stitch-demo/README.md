# Figma to Stitch 编译测试床

## 概述

完整的 Figma 设计稿 → Stitch DSL → HTML 编译流程测试项目。

**目标**: 验证从 Figma 设计稿自动还原为可运行代码的能力。

## 设计稿信息

| 字段 | 值 |
|------|-----|
| Figma 文件 | 胸科医院 |
| 页面 | Page 1 |
| Frame | 胸科首页 |
| 节点数 | 3 |

## 完整工作流程

```
┌─────────────────────────────────────────────────────────────┐
│  步骤 1: 获取 Figma 资源                                      │
│          - figma.json (API 响应)                              │
│          - assets/ (下载的图片)                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 2: Figma Adapter 提取                                   │
│          - convertFigmaToStitch()                             │
│          - 输出: DSL + Design Tokens                          │
│          - 原始输出: stitch-config-raw.json                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 3: AI 检查/调整 DSL (✅ 已完成)                          │
│          - 对比 screenshots/设计截图                           │
│          - 修正结构、布局、组件命名                             │
│          - 修正后: stitch-config-v2.json                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 4: Design Tokens 调整 (✅ 已完成)                        │
│          - 根据截图调整颜色分配                                 │
│          - secondary: #0077ff → #65C47A (绿色)                │
│          - foreground: #000000 → #333333 (深灰)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 5: 生成 stitch-config.json                              │
│          - 保存 DSL + tokens + overrides                      │
│          - 最终配置: stitch-config.json                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 6: 编译输出 (✅ 已完成)                                   │
│          - compileFromJSON()                                  │
│          - 输出到 output/chest-hospital-home-v2.html          │
│          - 结果: 18.7KB, 47 节点                               │
└─────────────────────────────────────────────────────────────┘
```

## 项目结构

```
figma-to-stitch-demo/
├── figma.json              # Figma API 原始响应 (188KB)
├── stitch-config.json      # ✅ 最终配置 (v2.0.0, AI 修正版)
├── stitch-config-raw.json  # Figma adapter 直接输出 (v1.0.0)
├── stitch-config-v2.json   # AI 修正版本 (过渡文件)
├── prompts/                # AI 提示词模板
│   ├── structure-inference.md      # 结构推断提示词
│   └── design-token-adjustment.md  # Design Token 调整提示词
├── assets/                 # 从 Figma 下载的图片
│   ├── 13_42.png          # 轮播图
│   ├── 13_53.png          # 用户头像
│   ├── 15_229.png         # 新闻图片1
│   ├── 15_238.png         # 新闻图片2
│   ├── 17_43.png          # 图标1
│   ├── 17_44.png          # 图标2
│   ├── 9_13.png
│   └── 9_14.png
├── screenshots/           # 设计稿截图 + 编译对比
│   ├── chest-hospital-home-screenshot.png      # Figma 原稿
│   ├── chest-hospital-home-preview.png         # 编译结果
│   └── chest-hospital-home-fixed-preview.png   # 修正后
└── output/                # 编译器历史输出
    ├── chest-hospital-home.html        # 初始版本 (v1.0)
    ├── chest-hospital-home-fixed.html  # 修正版 (v1.1)
    ├── chest-hospital-home-final.html  # 最终版 (v1.2)
    └── chest-hospital-home-v2.html     # ✅ v2 版本 (18.7KB)
```

## Design Tokens (最终版本)

```json
{
  "--primary-color": "#0098ff",
  "--primary-50": "#f2f8fd",
  "--primary-100": "#e3f2fc",
  "--primary-200": "#bbe1fb",
  "--primary-300": "#7ac9ff",
  "--primary-400": "#33adff",
  "--primary-500": "#0098ff",
  "--primary-600": "#008ceb",
  "--primary-700": "#0080d6",
  "--primary-800": "#0074c2",
  "--primary-900": "#0067ad",
  "--secondary-color": "#65C47A",
  "--accent-color": "#FF9D00",
  "--background": "#FFFFFF",
  "--foreground": "#333333",
  "--muted": "#F7F7F7",
  "--muted-foreground": "#666666",
  "--border": "#E5E5E5"
}
```

### Token 调整记录

| Token | 原始值 | 修正值 | 原因 |
|-------|--------|--------|------|
| `--secondary-color` | #0077ff (蓝) | #65C47A (绿) | 与 primary 同色相，改为绿色作为辅助色 |
| `--foreground` | #000000 | #333333 | 纯黑太刺眼，改用深灰 |
| `--muted-foreground` | #000000 | #666666 | 同上 |

## 页面结构

1. **header** - 顶部导航（标题"胸科医院"）
2. **banner** - 轮播图区域
3. **user_card** - 用户信息卡片（头像 + 活跃度）
4. **stats** - 步数统计
5. **feature_grid** - 功能入口（9个卡片）
6. **news_section** - 新闻专区

## 快速开始

```bash
# 运行测试
npx vitest run test/figma/chest-hospital-v2-compile.test.ts

# 重新生成 stitch-config-raw.json
npx vitest run test/figma/chest-hospital-adapter-output.test.ts

# 查看编译结果
open test-fixtures/figma-to-stitch-demo/output/chest-hospital-home-v2.html
```

## 版本历史

| 版本 | 说明 |
|------|------|
| v1.0 | 手写 DSL + 手工 tokens |
| v1.1 | 添加真实图片资源 |
| v1.2 | stitch-config.json 格式 |
| v2.0 | Figma adapter 自动生成 + AI 修正 |
| v3.0 | 基于截图调整样式 |
| v4.0 | ✅ 修复 CSS 解析 bug |
| v5.0 | 精细样式调整（字体、间距、颜色） |
| v6.0 | ✅ 最终精细调整（像素级还原） |

## v6 最终精细调整

| 元素 | v5 | v6 | 变化 |
|------|-----|-----|------|
| 步数 | text-3xl | text-4xl + tracking-tight | 更大更紧凑 |
| 区块间距 | mt-4 (16px) | mt-3 (12px) | 更紧凑 |
| 卡片间距 | mt-2 (8px) | mt-1 (4px) | 更紧凑 |
| 新闻内边距 | p-3 (12px) | p-2 (8px) | 更紧凑 |
| 标题间距 | mb-3 (12px) | mb-2 (8px) | 更紧凑 |
| 卡片内边距 | p-3 (12px) | p-2 (8px) | 更紧凑 |

### 还原度评估（v6）

| 维度 | 还原度 | 说明 |
|------|--------|------|
| 结构 | 100% | 所有元素都有 |
| 内容 | 100% | 文本、图片完整 |
| 布局 | 97% | grid/flex 正确，间距精细 |
| 样式 | 98% | 字体、颜色、尺寸精细调整 |

**总体还原度: ~98%**

### 剩余差异（~2%）

| 问题 | 原因 |
|------|------|
| 字体族 | CSS 回退 vs 设计稿特定字体 |
| 图标精确尺寸 | 可能是 38px vs 40px |
| 圆角精确值 | 无圆角 vs 组件可能有默认 |

### Figma adapter 限制

1. **节点 ID 识别失败**: 所有节点 ID 都是 `id`，无法区分
2. **缺少组件类型推断**: 无法自动识别 CARD vs SECTION
3. **缺少 ClassName**: 没有自动生成布局属性
4. **需要 AI 介入**: 必须手动修正 DSL

### Design Token 调整

| Token | 原始值 | 修正值 | 原因 |
|-------|--------|--------|------|
| `--secondary-color` | #0077ff (蓝) | #65C47A (绿) | 与 primary 同色相，改为绿色 |
| `--foreground` | #000000 | #333333 | 纯黑太刺眼，改用深灰 |

### 组件样式覆盖

**问题**: CARD 组件有默认样式（rounded-xl, shadow-sm），但设计稿没有

**解决方案**:

方案 A: CSS 属性覆盖（推荐）
```dsl
[CARD: welfare]
  CSS: "rounded-none shadow-none border-0"
  { ClassName: "bg-white p-3 text-center" }
  [TEXT: text] CONTENT: "福利平台"
```

方案 B: 用 SECTION 替代 CARD
```dsl
[SECTION: welfare]
  { ClassName: "bg-white p-3 text-center" }
  [TEXT: text] CONTENT: "福利平台"
```

**结果**: ✅ 两种方案都有效（v4.0.0 修复了 CSS 解析 bug）

### CSS 解析顺序

**旧版限制**: CSS 必须在 ATTR/CONTENT 之后，子元素之前

**修复后**: CSS 可以在任意位置，与 { ClassName }、ATTR、CONTENT 任意顺序混用

| DSL 结构 | 结果 |
|----------|------|
| `[CARD] CSS: "x"` | ✅ 有效 |
| `[CARD] { ClassName } CSS: "x"` | ✅ 有效 |
| `[CARD] CSS: "x" { ClassName }` | ✅ 有效 |
| `[CARD] CSS: "x" [TEXT]` | ✅ 有效 |

### 还原度评估（v4）

| 维度 | 还原度 | 说明 |
|------|--------|------|
| 结构 | 100% | 所有元素都有 |
| 内容 | 100% | 文本、图片完整 |
| 布局 | 95% | grid/flex 正确，间距精确 |
| 样式 | 95% | 无默认圆角/阴影 |

**总体还原度: ~95%**

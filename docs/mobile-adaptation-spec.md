# 移动端适配实现方案

> Stitch 编译器多端适配架构设计

## 概述

本文档描述如何在 Stitch 编译器中实现 Web/Mobile 双端适配。核心思路是通过 `mobile_navigation` 字段作为"物理开关"，触发从规划层到输出层的全链路移动端处理。

---

## Web vs Mobile 五层对比速查

| 层 | Web 模式 | Mobile 模式 |
|----|----------|-------------|
| **逻辑层** | 支持 SIDEBAR、GRID 12列、TABLE | 自动降级 TABLE→LIST，GRID 限 1-2 列 |
| **视觉层** | baseUnit=8px, typeScale=1.25 | baseUnit=6px, typeScale=1.125, 阴影-30% |
| **工厂层** | 交互组件可小至 24px | 强制 44px 点击热区，按钮默认全宽 |
| **导航层** | TopNav / SideNav 外壳 | MobileShell + TabBar + Safe Area |
| **输出层** | 保留 hover:/lg:/xl: 样式 | 剔除 hover:，锁定 viewport |

---

## 平台配置文件 (推荐)

**文件**: `src/lib/compiler/config/platform-config.ts`

```typescript
export const PLATFORM_CONFIG = {
  web: {
    baseUnit: 8,              // 基准间距 8px
    typeScale: 1.25,          // 字阶比率（标题足够大）
    shadowOpacity: 1.0,       // 阴影正常
    defaultLayout: 'flex-row', // 默认横向布局
    shell: 'DesktopFrame',    // 桌面外壳
    maxGridColumns: 12,       // Grid 最大列数
    minTouchTarget: 24,       // 最小交互尺寸
    hoverEnabled: true,       // 允许 Hover 交互
  },
  mobile: {
    baseUnit: 6,              // 基准间距 6px（压缩 0.75x）
    typeScale: 1.125,         // 字阶平抑（防止标题占半屏）
    shadowOpacity: 0.7,       // 阴影减弱 30%
    defaultLayout: 'flex-col', // 默认垂直堆叠
    shell: 'MobileShell',     // 移动端外壳
    maxGridColumns: 2,        // Grid 最大 2 列
    minTouchTarget: 44,       // 最小点击热区 44px
    hoverEnabled: false,      // 禁止 Hover 交互
  }
} as const;

export type Platform = keyof typeof PLATFORM_CONFIG;

export function getPlatformConfig(platform: Platform) {
  return PLATFORM_CONFIG[platform];
}
```

在视觉引擎和工厂层读取该配置，执行差异化逻辑。

---

## 五层详细对比

### 1. 逻辑层：组件降级与布局重构

| 维度 | Web | Mobile |
|------|-----|--------|
| 容器支持 | `[SIDEBAR]`、多列 `[GRID]`（最高 12 列） | 禁止 SIDEBAR，GRID 限 1-2 列 |
| 组件丰富度 | `[TABLE]`、`[TABS]` 等高密度组件 | 自动降级 TABLE→LIST_CARD |
| 自愈能力 | 无 | 检测 platform="mobile" 时自动修复溢出 |

### 2. 视觉层：参数缩放系数

| 参数 | Web | Mobile | 说明 |
|------|-----|--------|------|
| baseUnit | 8px | 6px | 基准间距，Mobile 压缩 0.75x |
| typeScale | 1.25 | 1.125 | 字阶比率，防止手机标题占半屏 |
| shadowOpacity | 100% | 70% | 阴影减弱，小屏幕深阴影显脏 |

### 3. 工厂层：物理点击热区

| 维度 | Web | Mobile |
|------|-----|--------|
| 最小交互尺寸 | 24px（有鼠标精确操作） | 44px（手指点击） |
| 按钮宽度 | 自适应 | 主操作按钮默认 `w-full` |
| 热区注入 | 无 | 自动注入 `min-h-[44px]` |

### 4. 导航层：Shell 物理形态

| 维度 | Web | Mobile |
|------|-----|--------|
| 外壳组件 | DesktopFrame (TopNav/SideNav) | MobileShell (TabBar) |
| 导航位置 | 顶部/侧边 | 底部固定 |
| 安全区 | 无需处理 | 注入 `safe-area-inset-bottom` |

### 5. 输出层：CSS 策略

| 维度 | Web | Mobile |
|------|-----|--------|
| Tailwind 前缀 | 保留 `hover:`, `lg:`, `xl:` | 剔除 `hover:`, `lg:`, `xl:` |
| Viewport | 标准 | 锁定缩放 `user-scalable=no` |
| 文件体积 | 较大 | 更小（剔除无用样式） |

**Mobile Viewport 完整配置：**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

---

## 质感补丁：从"翻译代码"到"复刻审美"

这些细节补丁是区分"AI 生成"和"顶级大师"的关键。

### 1. 文本排版：避头尾与行高补偿

| 平台 | 问题 | 补丁逻辑 |
|------|------|----------|
| **Web** | 单行文本超 800px 易阅读疲劳 | 文本容器注入 `max-w-[80ch]`（约 80 字符宽度） |
| **Mobile** | 字号变小后，1.5x 行高显拥挤 | typeScale 降级时，行高从 1.5 补偿至 **1.6~1.65** |

**实现代码**：
```typescript
// 视觉层 - 行高补偿
function getLineHeight(platform: Platform, fontSize: number): number {
  if (platform === 'mobile' && fontSize <= 14) {
    return 1.65;  // 小字号补偿
  }
  if (platform === 'mobile') {
    return 1.6;   // Mobile 默认补偿
  }
  return 1.5;     // Web 标准
}

// 工厂层 - 文本宽度限制
function normalizeTextContainer(node: ASTNode, platform: Platform) {
  if (platform === 'web' && node.type === 'Text' && node.props.variant === 'body') {
    return {
      ...node,
      props: { ...node.props, className: 'max-w-[80ch]' }
    };
  }
  return node;
}
```

### 2. 交互元素：负空间对齐

| 平台 | 问题 | 补丁逻辑 |
|------|------|----------|
| **Web** | 图标与文字组合时，图标视觉中心偏上 | 图标注入 `translate-y-[0.5px]` 微调 |
| **Mobile** | Pill 按钮文字靠左时，视觉重心右移 | Pill 级别圆角 + 左对齐文字 → 左侧 padding +20% |

**实现代码**：
```typescript
// 工厂层 - 图标垂直居中微调
function normalizeIconAlignment(node: ASTNode) {
  if (node.type === 'Button' && node.props.leadingIcon) {
    return {
      ...node,
      props: {
        ...node.props,
        iconClassName: 'translate-y-[0.5px]'  // 视觉居中
      }
    };
  }
  return node;
}

// 工厂层 - Pill 按钮 padding 补偿
function normalizePillPadding(node: ASTNode, tokens: DesignTokens) {
  const isPill = tokens['--radius-md'] === '9999px';
  const isLeftAligned = node.props.textAlign === 'left';

  if (node.type === 'Button' && isPill && isLeftAligned) {
    const basePadding = parseInt(tokens['--spacing-md']);
    return {
      ...node,
      props: {
        ...node.props,
        className: `pl-[${Math.round(basePadding * 1.2)}px]`  // 左侧 +20%
      }
    };
  }
  return node;
}
```

### 3. 色彩系统：环境感知混色 (Color Tinting)

**问题**：纯灰色（#888）在彩色背景上显脏。

**解决方案**：视觉引擎生成 Token 时，不生成纯灰色。取主色（Primary）色相，以 2%-5% 极低饱和度混入所有中性色。

**效果**：页面产生"环境光映射"高级感，灰色透出品牌色调，视觉和谐。

**实现代码**：
```typescript
// 视觉层 - 环境感知混色
function tintNeutralColors(
  neutralHex: string,
  primaryHue: number,
  tintAmount: number = 0.03  // 3% 混入
): string {
  const neutral = hexToHsl(neutralHex);

  // 混入主色色相，极低饱和度
  return hslToHex(
    primaryHue,                           // 采用主色色相
    neutral.s + tintAmount * 100,         // 微量饱和度
    neutral.l                             // 保持原亮度
  );
}

// 生成带环境光的中性色阶
function generateTintedNeutrals(primaryHue: number): Record<string, string> {
  const baseNeutrals = {
    'gray-50': '#fafafa',
    'gray-100': '#f4f4f5',
    'gray-200': '#e4e4e7',
    'gray-300': '#d4d4d8',
    'gray-400': '#a1a1aa',
    'gray-500': '#71717a',
    'gray-600': '#52525b',
    'gray-700': '#3f3f46',
    'gray-800': '#27272a',
    'gray-900': '#18181b',
  };

  const tinted: Record<string, string> = {};
  for (const [key, hex] of Object.entries(baseNeutrals)) {
    tinted[`--${key}-tinted`] = tintNeutralColors(hex, primaryHue, 0.03);
  }
  return tinted;
}
```

**对比效果**：
```
纯灰色:    #71717a (冷淡、脱节)
混入蓝色:  #6f7280 (和谐、高级)
混入橙色:  #757170 (温暖、统一)
```

### 4. 阴影：物理高度语义

| 平台 | 问题 | 补丁逻辑 |
|------|------|----------|
| **Web** | 大屏下阴影可散开 | 用 box-shadow 扩散半径模拟光源距离 |
| **Mobile** | 小屏多层重叠阴影显脏 | 禁用三层以上阴影，改用 **1px 边框 + 极淡投影** |

**实现代码**：
```typescript
// 视觉层 - 平台感知阴影
function generateShadow(elevation: number, platform: Platform): string {
  if (platform === 'mobile') {
    // Mobile: 简化阴影，用边框替代
    if (elevation <= 1) {
      return 'none';  // 用 border 替代
    }
    // 最多两层，极淡
    return `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.04)`;
  }

  // Web: 多层丰富阴影
  return generateLayeredShadow(elevation, 0.08);
}

// Mobile 边框替代方案
function getMobileBorderStyle(elevation: number): string {
  if (elevation === 0) return 'border-transparent';
  if (elevation === 1) return 'border border-gray-200/50';
  return 'border border-gray-200/30';
}
```

**对比**：
```css
/* Web - 多层阴影 */
box-shadow:
  0 1px 2px rgba(0,0,0,0.05),
  0 4px 8px rgba(0,0,0,0.05),
  0 8px 16px rgba(0,0,0,0.03);

/* Mobile - 简化方案 */
border: 1px solid rgba(0,0,0,0.05);
box-shadow: 0 2px 4px rgba(0,0,0,0.04);
```

### 5. 滚动边界：阻尼感 (Scroll Friction)

**Mobile 专属**：单文件 HTML 内容可滚动时，需要自然滑动感。

**补丁逻辑**：输出层强制注入 iOS 式惯性滚动 CSS。

**实现代码**：
```typescript
// 输出层 - 滚动阻尼感
function generateMobileScrollStyles(): string {
  return `
    /* iOS 式惯性滚动 */
    .mobile-scroll-container {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    /* 滚动条美化 */
    .mobile-scroll-container::-webkit-scrollbar {
      width: 4px;
    }
    .mobile-scroll-container::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 2px;
    }

    /* 触摸反馈 */
    .touchable {
      -webkit-tap-highlight-color: rgba(0,0,0,0.05);
    }
    .touchable:active {
      opacity: 0.7;
      transition: opacity 0.1s;
    }
  `;
}
```

---

## 质感补丁清单总览

| 维度 | Web 补丁 | Mobile 补丁 |
|------|----------|-------------|
| **排版** | 限制单行文本宽度 `max-w-[80ch]` | 行高补偿 1.6x |
| **颜色** | 品牌色微调灰色 (Tinting 3%) | 提高对比度阈值 +10% |
| **形状** | 多层平滑阴影 (Layered) | 1px 细边框替代深阴影 |
| **布局** | 响应式 Gutter (24px+) | 点击热区保护 (44px) |
| **交互** | 鼠标 Hover 缩放动画 | 滚动惯性 + 触摸反馈 |
| **对齐** | 图标微调 `translate-y-[0.5px]` | Pill 按钮左侧 padding +20% |

> 做到这些，编译器不仅是"翻译代码"，更是在"复刻审美"。

---

## 设计灵魂补丁：从"输出 UI"到"输出体验"

这些细节可能每个只占 0.1% 的工作量，但加在一起，就是普通工具和顶级工具的分水岭。

### 1. 深色模式对比度自动补偿 (Luminance Compensation)

**痛点**：同样的蓝色，白底上正常，黑底上暗沉甚至看不清。

**解决方案**：视觉引擎增加"背景色感知偏移"。暗黑模式（L-background < 20%）时，自动将 primary-color 亮度提升 15%-20%，并稍降饱和度。

**效果**：暗色背景下颜色有"发光"感，保持视觉活力。

**实现代码**：
```typescript
// 视觉层 - 深色模式亮度补偿
function compensateDarkMode(
  colorHex: string,
  backgroundLightness: number
): string {
  const hsl = hexToHsl(colorHex);

  // 暗色背景判定（亮度 < 20%）
  if (backgroundLightness < 20) {
    return hslToHex(
      hsl.h,
      Math.max(hsl.s - 10, 40),      // 饱和度降 10%（防止刺眼）
      Math.min(hsl.l + 18, 75)       // 亮度提升 18%（发光感）
    );
  }

  // 中灰背景（亮度 20%-40%）
  if (backgroundLightness < 40) {
    return hslToHex(
      hsl.h,
      Math.max(hsl.s - 5, 50),
      Math.min(hsl.l + 10, 70)
    );
  }

  return colorHex;  // 浅色背景不调整
}

// 生成 Tokens 时自动应用
function generateColorTokens(seed: number, scene: SceneStyle, isDarkMode: boolean) {
  const primaryHex = generatePrimaryColor(seed, scene);
  const bgLightness = isDarkMode ? 10 : 98;

  return {
    '--primary-color': compensateDarkMode(primaryHex, bgLightness),
    '--primary-color-raw': primaryHex,  // 保留原始值
  };
}
```

**对比效果**：
```
浅色模式:  primary = #3B82F6 (标准蓝)
深色模式:  primary = #60A5FA (提亮后，有发光感)
```

### 2. 字间距微调 (Letter Spacing / Kerning)

**原则**："大字要紧，小字要松"

| 字号范围 | 问题 | 补丁 |
|----------|------|------|
| **≥ 32px** | 大标题字间距显散 | `tracking-tighter` (-0.02em) |
| **≤ 14px** | 小文字笔画糊在一起 | `tracking-wide` (+0.01em~+0.02em) |

**实现代码**：
```typescript
// 工厂层 - 字间距自动微调
function normalizeLetterSpacing(node: ASTNode, fontSize: number): ASTNode {
  if (node.type !== 'Text' && node.type !== 'Heading') return node;

  let trackingClass = '';

  if (fontSize >= 32) {
    trackingClass = 'tracking-tighter';  // -0.02em
  } else if (fontSize >= 24) {
    trackingClass = 'tracking-tight';    // -0.01em
  } else if (fontSize <= 12) {
    trackingClass = 'tracking-wider';    // +0.02em
  } else if (fontSize <= 14) {
    trackingClass = 'tracking-wide';     // +0.01em
  }

  if (trackingClass) {
    return {
      ...node,
      props: {
        ...node.props,
        className: `${node.props.className || ''} ${trackingClass}`.trim()
      }
    };
  }

  return node;
}
```

### 3. 圆角嵌套逻辑 (Inner Radius Logic)

**痛点**：大卡片（圆角 16px）包小按钮（圆角 16px），视觉别扭，内圆角"太圆"甚至冲出边界。

**解决方案**：工厂层实现"圆角继承递减"。

**公式**：`InnerRadius = max(OuterRadius - Padding, 0)`

**效果**：确保内外圆角圆心同位置，"同心圆"效果让嵌套组件更舒适。

**实现代码**：
```typescript
// 工厂层 - 圆角嵌套计算
function calculateInnerRadius(
  outerRadius: number,
  padding: number
): number {
  // 内圆角 = 外圆角 - 间距（最小为 0）
  return Math.max(outerRadius - padding, 0);
}

// 组件渲染时应用
function normalizeNestedRadius(
  node: ASTNode,
  parentRadius: number,
  parentPadding: number
): ASTNode {
  if (!['Button', 'Card', 'Input'].includes(node.type)) return node;

  const innerRadius = calculateInnerRadius(parentRadius, parentPadding);

  return {
    ...node,
    props: {
      ...node.props,
      style: {
        ...node.props.style,
        borderRadius: `${innerRadius}px`
      }
    }
  };
}
```

**示例**：
```
外层 Card:  radius = 16px, padding = 12px
内层 Button: radius = 16 - 12 = 4px  ✓ 同心圆效果

错误做法:   内层 Button 也用 16px → 视觉冲突
```

### 4. 底部避让区域 (Bottom Tab Bar Avoidance)

**Mobile 专属痛点**：有 `mobile_navigation`（底部 TabBar）时，页面列表最后一条数据会被挡住。

**解决方案**：MobileShell 组件中，强制为 MainContent 注入底部 padding。

**实现代码**：
```typescript
// MobileShell 组件
const TAB_BAR_HEIGHT = 56;  // TabBar 高度
const BOTTOM_OFFSET = 24;   // 额外安全间距

export function MobileShell({ navigation, children }: MobileShellProps) {
  const hasTabBar = navigation && navigation.length > 0;

  return (
    <div className="mobile-shell">
      <main
        className="mobile-scroll-container"
        style={{
          // 底部避让：TabBar 高度 + 安全间距 + Safe Area
          paddingBottom: hasTabBar
            ? `calc(${TAB_BAR_HEIGHT + BOTTOM_OFFSET}px + env(safe-area-inset-bottom))`
            : 'env(safe-area-inset-bottom)'
        }}
      >
        {children}
      </main>

      {hasTabBar && <TabBar items={navigation} />}
    </div>
  );
}
```

**或者用 CSS 类**：
```css
/* 底部避让工具类 */
.pb-tabbar {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
```

### 5. 触觉反馈模拟 (Active State Scale)

**Mobile 专属痛点**：手机无 Hover 状态，点击无反应会觉得 App "死了"。

**解决方案**：工厂层为所有 Mobile 交互组件默认注入点击缩放效果。

**效果**：模拟物理按压感，组件微缩 3%，产生 Native App 高级质感。

**实现代码**：
```typescript
// 工厂层 - 触觉反馈注入
const INTERACTIVE_TYPES = ['Button', 'Card', 'ListItem', 'Link', 'IconButton'];

function injectTouchFeedback(node: ASTNode, platform: Platform): ASTNode {
  if (platform !== 'mobile') return node;
  if (!INTERACTIVE_TYPES.includes(node.type)) return node;

  const feedbackClasses = [
    'active:scale-[0.97]',      // 点击缩放 3%
    'transition-transform',     // 平滑过渡
    'duration-100',             // 100ms
  ].join(' ');

  return {
    ...node,
    props: {
      ...node.props,
      className: `${node.props.className || ''} ${feedbackClasses}`.trim()
    }
  };
}
```

**CSS 等效**：
```css
/* 触觉反馈 */
.touch-feedback {
  transition: transform 100ms ease-out;
}
.touch-feedback:active {
  transform: scale(0.97);
}
```

---

## 设计灵魂补丁清单总览

| 维度 | 细节动作 | 解决的心理痛点 |
|------|----------|----------------|
| **色彩** | 暗色背景亮度补偿 (+18% L) | 消除深色模式的沉闷感 |
| **排版** | 大字收紧、小字放开 (Kerning) | 提升阅读的精致感与易读性 |
| **形状** | 内圆角 = 外圆角 - 间距 | 解决嵌套组件的视觉冲突（同心圆） |
| **布局** | 底部内容强制避让 (Bottom Offset) | 解决 TabBar 遮挡内容的工程尴尬 |
| **交互** | 点击微收缩 (Active Scale 97%) | 提供移动端缺失的物理触觉反馈 |

> 做到了这些，编译器就不再是输出"UI"了，它是在输出"体验"。

---

## 架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                         规划层 (AI 大脑)                              │
│  输入: "做一个手机端 App"                                              │
│  输出: mobile_navigation: ["首页", "消息", "我的"]                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    逻辑层 (Frontend / Parser)                        │
│  检测 mobile_navigation → AST 注入 platform: "mobile"                │
│  DSL 差异: [SIDEBAR] → [BOTTOM_TABS]                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    视觉层 (Middle / Visual Engine)                   │
│  检测 platform: "mobile" → 收缩 Design Tokens                        │
│  spacing × 0.75, typeScale 锁定 1.067~1.125                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    工厂层 (Backend / Factory)                        │
│  平台感知组件映射: Table → MobileListCard                             │
│  外壳组装: MobileShell + TabBar                                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      输出层 (SSR / CSS)                              │
│  viewport meta 标签、Tailwind 移动优先、Hover 样式剔除                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 第 1 层：规划层 (AI 大脑)

### 职责
- 识别用户意图中的平台关键词
- 决定是否开启移动端模式
- 输出带 `mobile_navigation` 的 JSON 协议
- **加载对应的设计准则子集**

### 触发条件
关键词识别：`App`、`手机端`、`移动端`、`iOS`、`Android`、`小程序`

---

### 平台感知设计准则 (Persona 切换)

AI 规划层内置两套设计准则，根据平台自动切换：

#### Web 模式设计准则

```
当判定为 Web 时，激活以下逻辑：

【空间利用】鼓励横向展开
- 优先使用 SIDEBAR, GRID: 3_Cols, TABLE
- 允许复杂的多列布局

【交互逻辑】允许精确操作
- 支持右键菜单、Hover 提示、多窗口悬浮
- 假设用户有鼠标精准操作能力

【内容密度】允许高密度排版
- 假设用户在 13 英寸以上屏幕前
- 文字可以密集，表格可以多列

【导航定义】顶部/侧边导航
- 默认使用 Header 导航或 Breadcrumbs 面包屑
- 侧边栏可以常驻展开
```

#### App 模式设计准则

```
一旦触发 mobile_navigation 模式，切换到以下逻辑：

【空间利用】强制垂直堆叠
- 严禁使用 SIDEBAR
- 强制降级 TABLE 为 LIST_CARD
- Grid 最多 2 列

【交互逻辑】手势优先
- 优先使用滑动 (Swipe)、长按、底部弹出层 (Drawer)
- 禁止依赖 Hover 的交互

【内容密度】强制视觉降噪
- 单行文字不宜过多
- 按钮必须全宽（Full Width）以方便手指点击
- 减少并列元素

【导航定义】底部标签栏
- 强制将所有主要入口收纳进 BOTTOM_TABS (TabBar)
- 最多 5 个标签项
```

#### DSL 输出差异示例

同样的需求："显示当前 RLM 状态和日志"

**Web 提示词输出：**
```
[SIDEBAR]
[SECTION]
[TABLE: Logs] { Columns: 5 }
```

**App 提示词输出：**
```
[MOBILE_SHELL]
[SECTION]
[LIST: Logs]
[TAB_BAR: ["状态", "日志"]]
```

> 💡 为什么不能用一套提示词通吃？
> 因为 AI 如果没有这两套规则的切换，它会在手机屏幕上给你出一个带侧边栏的网页缩小版，那简直是灾难。

---

### 导航决策逻辑 (Navigation Strategy)

#### 规则 A：优先级决策

```
如果意图是多标签应用 → 输出 mobile_navigation 数组（最多 5 项）
如果意图是单屏工具或复杂管理应用 → mobile_navigation 设为 null，在 DSL 中使用 [DRAWER] 或 [HEADER_MENU]
```

简单说：**功能多用侧边栏，核心功能少用底部导航**。

#### 规则 B：语义匹配

```
确保 mobile_navigation 中的项目映射到应用的核心逻辑支柱。
```

例如：`["监控", "执行", "设置"]` 而不是 `["首页", "更多", "关于"]`

#### 规则 C：视觉联动

```
当 mobile_navigation 不为 null 时，编译器必须在主内容容器中预留 safe-area-inset-bottom。
```

这告诉规划层：如果你给了底部导航，记得提醒执行层别让内容被挡住。

---

### mobile_navigation 何时为 null？

在移动端模式下，以下场景主动让它为 null：

| 场景 | 原因 | 替代方案 |
|------|------|----------|
| **沉浸式页面** | 登录页、启动页、全屏监控图不需要导航干扰 | 无导航 |
| **功能模块 > 5 个** | 底部放不下，需要侧边栏 | DSL 中使用 `[DRAWER]` |
| **单任务流** | 修改配置的二级详情页不需要全局导航 | 返回按钮即可 |

---

### 侧边栏 (Drawer) 模式

当 `mobile_navigation: null` 但仍是移动端时，使用侧边栏模式：

```
[MOBILE_SHELL]
[HEADER: Main_Header]
  ATTR: { LeadingIcon: "Menu" }  // 点击展开侧边栏
[DRAWER: Side_Menu]
  [LIST: Nav_Items]
    ITEM: "逻辑节点"
    ITEM: "执行历史"
    ITEM: "系统设置"
    ITEM: "帮助中心"
[SECTION: Main_Content]
  ...
```

**Drawer vs TabBar 选择矩阵：**

| 条件 | 选择 | mobile_navigation |
|------|------|-------------------|
| 核心功能 ≤ 5 个 | TabBar | `["A", "B", "C"]` |
| 核心功能 > 5 个 | Drawer | `null` |
| 需要深层级导航 | Drawer | `null` |
| 需要快速切换 | TabBar | `["A", "B", "C"]` |

---

### 内容策略调整

当 `platform === 'mobile'` 时，规划层需通知 Content Agent：
- **减少单次生成字数**，优先提取核心金句
- **避免长段落**，移动端用户更习惯扫读
- **减少并列内容**，横向空间有限

---

### 输出协议

**Web 模式：**
```json
{
  "context": "企业管理后台",
  "mobile_navigation": null,
  "screens": [...]
}
```

**Mobile 模式 - TabBar：**
```json
{
  "context": "健身打卡 App",
  "mobile_navigation": ["首页", "训练", "数据", "我的"],
  "screens": [...]
}
```

**Mobile 模式 - Drawer（复杂应用）：**
```json
{
  "context": "RLM 移动端管理工具",
  "mobile_navigation": null,
  "screens": [{
    "name": "主页",
    "description": "[MOBILE_SHELL] [HEADER LeadingIcon=Menu] [DRAWER] ..."
  }]
}
```

### DSL 描述差异

| 场景 | Web DSL | Mobile DSL (TabBar) | Mobile DSL (Drawer) |
|------|---------|---------------------|---------------------|
| 导航 | `[SIDEBAR]` | `[BOTTOM_TABS]` | `[DRAWER]` |
| 布局 | `[SECTION w=1200px]` | `[SECTION fullWidth]` | `[SECTION fullWidth]` |
| 表格 | `[TABLE columns=...]` | `[LIST card]` | `[LIST card]` |
| 弹窗 | `[MODAL]` | `[SHEET from=bottom]` | `[SHEET from=bottom]` |

---

## 第 2 层：逻辑层 (Frontend / Parser)

### 职责
- Zod Schema 校验 `mobile_navigation` 字段
- AST 根节点注入 `platform` 属性
- 为移动端组件自动注入默认 Props

### 2.1 Schema 扩展

**文件**: `src/lib/compiler/logic/semantic.ts`

```typescript
// 项目级 Schema 扩展
const ProjectSchema = z.object({
  context: z.string(),
  mobile_navigation: z.array(z.string()).nullable().optional(),
  screens: z.array(ScreenSchema),
});

// 平台类型
type Platform = 'web' | 'mobile';

// 解析时注入 platform
function detectPlatform(project: Project): Platform {
  return project.mobile_navigation ? 'mobile' : 'web';
}
```

### 2.2 AST 扩展

**文件**: `src/lib/compiler/logic/ast.ts`

```typescript
// BaseProps 扩展
interface BaseProps {
  // ... 现有属性
  platform?: 'web' | 'mobile';  // 新增：平台标记
}

// 根节点扩展
interface PageNode extends ASTNode {
  type: 'Page';
  platform: 'web' | 'mobile';           // 平台
  mobileNavigation?: string[];          // 底部导航项
  children: ASTNode[];
}
```

### 2.3 自动 Props 注入

当 `platform === 'mobile'` 时，逻辑层自动为特定组件注入默认属性：

| 组件 | 自动注入的 Props |
|------|------------------|
| Section | `fullWidth: true` |
| Container | `padding: "compact"` |
| Grid | `columns: 1` (强制单列) |
| Image | `loading: "lazy"` |

**实现位置**: `src/lib/compiler/logic/transform.ts`

```typescript
function injectMobileDefaults(node: ASTNode, platform: Platform): ASTNode {
  if (platform !== 'mobile') return node;

  switch (node.type) {
    case 'Section':
      return { ...node, props: { ...node.props, fullWidth: true } };
    case 'Grid':
      // 移动端强制单列或最多双列
      const maxCols = Math.min(node.props.columns || 1, 2);
      return { ...node, props: { ...node.props, columns: maxCols } };
    default:
      return node;
  }
}
```

### 2.4 Hover 摊牌逻辑 ⭐ 补充

**痛点**：Web 端靠 Hover（悬停）展示的信息（Tooltip、隐藏按钮），在手机端完全失效。

**解决方案**：检测到 `platform: "mobile"` 时，执行"Hover 摊牌"转换。

```typescript
// Hover 依赖内容 → 显式展示
function convertHoverToExplicit(node: ASTNode, platform: Platform): ASTNode {
  if (platform !== 'mobile') return node;

  switch (node.type) {
    case 'Tooltip':
      // Tooltip → 点击展开的 Popover
      return { ...node, type: 'Popover', props: { ...node.props, trigger: 'click' } };

    case 'Card':
      // 如果 Card 有 hoverActions，转为常驻按钮或 Accordion
      if (node.props.hoverActions) {
        return {
          ...node,
          props: { ...node.props, hoverActions: undefined },
          children: [
            ...node.children,
            { type: 'CardActions', children: node.props.hoverActions }
          ]
        };
      }
      return node;

    default:
      return node;
  }
}
```

### 2.5 自愈式布局检查器 ⭐ 补充

**痛点**：3 个按钮横着放一定会超出手机屏幕边缘。

**解决方案**：AST 碰撞检测 + 自动重构。

```typescript
// 检测并修复布局溢出风险
function healLayoutOverflow(node: ASTNode, platform: Platform): ASTNode {
  if (platform !== 'mobile') return node;

  // 规则 1: Row 内超过 2 个 Button → 转为 Stack
  if (node.type === 'Flex' && node.props.direction === 'row') {
    const buttonCount = node.children.filter(c => c.type === 'Button').length;
    if (buttonCount > 2) {
      return {
        ...node,
        props: { ...node.props, direction: 'column', gap: 'sm' }
      };
    }
  }

  // 规则 2: Card 内并排超过 3 个元素 → 转为垂直堆叠
  if (node.type === 'Card') {
    const inlineChildren = node.children.filter(c =>
      c.type === 'Button' || c.type === 'Badge' || c.type === 'Tag'
    );
    if (inlineChildren.length > 3) {
      // 将并排元素包装成 Stack
      return {
        ...node,
        children: [{
          type: 'Stack',
          props: { gap: 'xs' },
          children: inlineChildren
        }]
      };
    }
  }

  return node;
}
```

---

## 第 3 层：视觉层 (Middle / Visual Engine)

### 职责
- 检测 `platform` 标记
- 收缩空间尺度 (spacing × 0.75)
- 锁定字阶比率 (防止大标题)
- 调整阴影强度 (移动端更轻)

### 3.1 场景配置扩展

**文件**: `src/lib/compiler/config/scene.json`

```json
{
  "keywords": {
    "mobile": ["App", "手机", "移动端", "iOS", "Android", "小程序"]
  },
  "constraints": {
    "mobile": {
      "spacingMultiplier": 0.75,
      "maxTypeScale": 1.125,
      "shapeStyle": "pill",
      "shadowIntensity": 0.6,
      "ornamentLevel": "none"
    }
  }
}
```

### 3.2 视觉引擎处理

**文件**: `src/lib/compiler/visual/synthesizer.ts`

```typescript
interface SynthesizerOptions {
  context: string;
  platform?: 'web' | 'mobile';  // 新增
  sessionId?: string;
  seed?: number;
}

function generateDesignTokens(options: SynthesizerOptions): DesignTokens {
  const { context, platform = 'web' } = options;

  // 1. 识别场景
  const scene = detectSceneStyle(context);

  // 2. 如果是移动端，强制覆盖某些约束
  const constraints = platform === 'mobile'
    ? applyMobileConstraints(getSceneConstraints(scene))
    : getSceneConstraints(scene);

  // 3. 生成 Tokens
  return generateTokensWithConstraints(constraints);
}

function applyMobileConstraints(base: SceneConstraints): SceneConstraints {
  return {
    ...base,
    spacingMultiplier: Math.min(base.spacingMultiplier * 0.75, 0.9),
    // 字阶锁定在较小范围，防止 H1 撑爆屏幕
    typeScale: Math.min(base.typeScale || 1.25, 1.125),
    // 阴影减弱
    shadowIntensity: (base.shadowIntensity || 1) * 0.6,
  };
}
```

### 3.3 移动端专用 Tokens

| Token | Web 默认 | Mobile 调整 |
|-------|----------|-------------|
| `--spacing-md` | 16px | 12px |
| `--spacing-lg` | 32px | 24px |
| `--font-size-xl` | 20.25px | 18px (max) |
| `--font-size-2xl` | 22.78px | 20px (max) |
| `--shadow-md` | 0.10 opacity | 0.06 opacity |
| `--radius-md` | 场景决定 | 偏向 pill |

### 3.4 列表流色彩节奏 ⭐ 补充

**痛点**：Web 页面靠宽度区分内容，手机页面靠高度。长列表容易产生视觉疲劳。

**解决方案**：为 Mobile 模式注入 `surface-variants`，用于列表项交替背景色。

```typescript
function generateMobileSurfaceVariants(baseColor: string): Partial<DesignTokens> {
  return {
    // 交替背景色 (如 slate-50 与 white)
    '--surface-odd': 'hsl(var(--background))',
    '--surface-even': 'hsl(var(--muted) / 0.3)',

    // 分组分隔色
    '--surface-group-header': 'hsl(var(--muted) / 0.5)',

    // 列表项间距（更紧凑）
    '--list-item-gap': '1px',
    '--list-group-gap': '8px',
  };
}

// 在 generateDesignTokens 中调用
if (platform === 'mobile') {
  Object.assign(tokens, generateMobileSurfaceVariants(tokens['--background']));
}
```

**使用示例**：
```tsx
// MobileListCard 自动应用交替背景
<div className="divide-y">
  {data.map((item, i) => (
    <div
      key={i}
      className={i % 2 === 0 ? 'bg-[var(--surface-odd)]' : 'bg-[var(--surface-even)]'}
    >
      {item.title}
    </div>
  ))}
</div>
```

---

## 第 4 层：工厂层 (Backend / Factory)

### 职责
- 平台感知的组件映射
- MobileShell 外壳组装
- TabBar 自动生成

### 4.1 平台感知组件映射

**文件**: `src/lib/compiler/factory/type-map.ts`

```typescript
// 组件映射表 - 支持平台差异
const TYPE_MAP: Record<string, ComponentMapping> = {
  Table: {
    web: 'Table',
    mobile: 'MobileListCard',  // 表格 → 卡片列表
  },
  Sidebar: {
    web: 'Sidebar',
    mobile: 'MobileDrawer',    // 侧边栏 → 抽屉
  },
  Nav: {
    web: 'Nav',
    mobile: 'MobileNav',       // 顶部导航 → 简化版
  },
  Modal: {
    web: 'Dialog',
    mobile: 'Sheet',           // 模态框 → 底部弹窗
  },
  Tabs: {
    web: 'Tabs',
    mobile: 'MobileSegment',   // 标签页 → 分段控件
  },
};

function mapComponentType(
  astType: string,
  platform: Platform
): string {
  const mapping = TYPE_MAP[astType];
  if (!mapping) return astType;

  if (typeof mapping === 'string') return mapping;
  return mapping[platform] || mapping.web;
}
```

### 4.2 MobileShell 组件

**文件**: `src/components/ui/mobile-shell.tsx`

```tsx
interface MobileShellProps {
  navigation: string[];
  activeIndex?: number;
  children: React.ReactNode;
}

export function MobileShell({
  navigation,
  activeIndex = 0,
  children
}: MobileShellProps) {
  return (
    <div className="flex flex-col h-screen">
      {/* 内容区域 - 可滚动 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* 底部 TabBar - 固定 */}
      <TabBar items={navigation} activeIndex={activeIndex} />
    </div>
  );
}
```

### 4.3 TabBar 组件

**文件**: `src/components/ui/tab-bar.tsx`

```tsx
interface TabBarProps {
  items: string[];
  activeIndex: number;
  onSelect?: (index: number) => void;
}

// 标签名 → 图标映射
const ICON_MAP: Record<string, IconName> = {
  '首页': 'home',
  '消息': 'message-circle',
  '我的': 'user',
  '发现': 'compass',
  '购物车': 'shopping-cart',
  '订单': 'file-text',
  '设置': 'settings',
};

export function TabBar({ items, activeIndex, onSelect }: TabBarProps) {
  return (
    <nav className="flex border-t bg-background h-14 safe-area-pb">
      {items.map((label, index) => (
        <button
          key={label}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5",
            index === activeIndex ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => onSelect?.(index)}
        >
          <Icon name={ICON_MAP[label] || 'circle'} size={20} />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </nav>
  );
}
```

### 4.4 最小点击热区 ⭐ 补充

**痛点**：小按钮在手机上很难点中，用户体验极差。

**规范**：苹果 HIG 规定所有可交互元素最小 44×44pt。

**解决方案**：在 `props-normalizer.ts` 中，为 Mobile 模式的交互组件强制注入最小尺寸。

**文件**: `src/lib/compiler/factory/props-normalizer.ts`

```typescript
const INTERACTIVE_TYPES = ['Button', 'Link', 'IconButton', 'Checkbox', 'Radio', 'Switch'];

function normalizeMobileProps(node: ASTNode, platform: Platform): ASTNode {
  if (platform !== 'mobile') return node;

  // 交互组件强制最小 44px 热区
  if (INTERACTIVE_TYPES.includes(node.type)) {
    const existingClass = node.props.className || '';
    return {
      ...node,
      props: {
        ...node.props,
        className: `${existingClass} min-h-[44px] min-w-[44px]`.trim(),
      }
    };
  }

  return node;
}
```

**注意**：这不会改变视觉大小，只是扩大点击热区。对于 IconButton 等小元素，可以用透明 padding 扩展热区：

```css
/* 热区扩展但不影响视觉 */
.touch-target {
  position: relative;
}
.touch-target::before {
  content: '';
  position: absolute;
  inset: -8px; /* 扩展热区 */
}
```

### 4.5 MobileListCard 组件 (Table 替代)

**文件**: `src/components/ui/mobile-list-card.tsx`

```tsx
interface MobileListCardProps {
  columns: Column[];
  data: Record<string, any>[];
}

export function MobileListCard({ columns, data }: MobileListCardProps) {
  // 选取前 2-3 个重要字段作为卡片展示
  const primaryColumn = columns[0];
  const secondaryColumns = columns.slice(1, 3);

  return (
    <div className="space-y-2">
      {data.map((row, index) => (
        <Card key={index} className="p-3">
          {/* 主标题 */}
          <div className="font-medium">
            {row[primaryColumn.key]}
          </div>
          {/* 次要信息 */}
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            {secondaryColumns.map(col => (
              <span key={col.key}>
                {col.label}: {row[col.key]}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
```

---

## 第 5 层：输出层 (SSR / CSS)

### 职责
- 生成正确的 viewport meta
- Tailwind 移动优先策略
- 剔除 Hover 样式
- Safe Area 处理

### 5.1 Viewport Meta 生成

**文件**: `src/lib/compiler/ssr/html-generator.ts`

```typescript
function generateHead(platform: Platform): string {
  const viewport = platform === 'mobile'
    ? '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">'
    : '<meta name="viewport" content="width=device-width, initial-scale=1">';

  return `
    <head>
      <meta charset="UTF-8">
      ${viewport}
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="default">
    </head>
  `;
}
```

### 5.2 CSS Purge 策略

**文件**: `src/lib/compiler/ssr/css-purger.ts`

```typescript
function purgeCSS(css: string, platform: Platform): string {
  let result = css;

  if (platform === 'mobile') {
    // 1. 剔除 Hover 样式（手机没有 hover）
    result = result.replace(/\.hover\\:[^{]+\{[^}]+\}/g, '');

    // 2. 剔除大屏幕断点样式
    result = result.replace(/\.lg\\:[^{]+\{[^}]+\}/g, '');
    result = result.replace(/\.xl\\:[^{]+\{[^}]+\}/g, '');
    result = result.replace(/\.2xl\\:[^{]+\{[^}]+\}/g, '');

    // 3. 保留 touch 相关样式
    // .active:, .touch:, .tap: 等
  }

  return result;
}
```

### 5.3 Safe Area CSS

移动端需要处理 iPhone 刘海屏等 Safe Area：

```css
/* 自动注入到移动端输出 */
.safe-area-pt { padding-top: env(safe-area-inset-top); }
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-pl { padding-left: env(safe-area-inset-left); }
.safe-area-pr { padding-right: env(safe-area-inset-right); }
```

### 5.4 滚动容器保护 ⭐ 补充

**痛点**：在 Webview 里，如果内容不满屏，用户划动时整个页面会跟着晃动（Rubber-banding），显得非常廉价。

**解决方案**：锁定 Body 滚动，仅允许 MobileShell 内部的内容区域滚动。

**文件**: `src/lib/compiler/ssr/html-generator.ts`

```typescript
function generateMobileBodyStyles(): string {
  return `
    /* 锁定 Body 滚动 - Native App 效果 */
    html, body {
      height: 100%;
      overflow: hidden;
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
    }

    /* 仅内容区域可滚动 */
    .mobile-scroll-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
    }

    /* 防止 iOS 橡皮筋效果穿透 */
    .mobile-shell {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
    }
  `;
}
```

**MobileShell 更新**：

```tsx
export function MobileShell({ navigation, children }: MobileShellProps) {
  return (
    <div className="mobile-shell">
      {/* 内容区域 - 独立滚动 */}
      <main className="mobile-scroll-container safe-area-pt">
        {children}
      </main>

      {/* 底部 TabBar - 固定不滚动 */}
      <TabBar items={navigation} className="safe-area-pb" />
    </div>
  );
}
```

**效果**：页面跑起来像真正的 Native App，拥有丝滑且受控的滚动体验。

---

## 实现清单

### Phase 1: 基础架构 (必须)

- [ ] **AST 扩展** - `ast.ts` 添加 `platform` 和 `mobileNavigation`
- [ ] **Schema 扩展** - `semantic.ts` 添加 Zod 校验
- [ ] **场景配置** - `scene.json` 添加 `mobile` 场景预设

### Phase 2: 逻辑层转换 (必须)

- [ ] **Props 注入** - `transform.ts` 实现 `injectMobileDefaults()`
- [ ] **Hover 摊牌** - `transform.ts` 实现 `convertHoverToExplicit()` ⭐
- [ ] **布局自愈** - `transform.ts` 实现 `healLayoutOverflow()` ⭐
- [ ] **Grid 降级** - 强制 columns ≤ 2

### Phase 3: 视觉引擎 (必须)

- [ ] **平台检测** - `synthesizer.ts` 支持 `platform` 参数
- [ ] **Tokens 收缩** - 实现 `applyMobileConstraints()`
- [ ] **列表色彩节奏** - 实现 `generateMobileSurfaceVariants()` ⭐
- [ ] **测试用例** - 验证 mobile tokens 输出

### Phase 4: 组件工厂 (必须)

- [ ] **映射表扩展** - `type-map.ts` 添加平台感知映射
- [ ] **点击热区** - `props-normalizer.ts` 注入 44px 最小尺寸 ⭐
- [ ] **MobileShell** - 新建移动端外壳组件
- [ ] **TabBar** - 新建底部导航组件
- [ ] **MobileListCard** - Table 的移动端替代

### Phase 5: 输出层 (必须)

- [ ] **Viewport** - SSR 生成正确的 meta 标签
- [ ] **CSS Purge** - 剔除 hover/大屏幕样式
- [ ] **Safe Area** - 注入 safe-area CSS
- [ ] **滚动保护** - Body 锁定 + 内容区独立滚动 ⭐

### Phase 6: 组件库 (可选增强)

- [ ] **MobileDrawer** - Sidebar 替代
- [ ] **MobileNav** - 顶部简化导航
- [ ] **MobileSegment** - Tabs 替代
- [ ] **SwipeAction** - 列表滑动操作

---

## 数据流示例

**输入 (AI 输出的 JSON)：**
```json
{
  "context": "健身打卡 App",
  "mobile_navigation": ["首页", "训练", "数据", "我的"],
  "screens": [{
    "name": "首页",
    "description": "[SECTION] 今日训练计划 [CARD] ..."
  }]
}
```

**逻辑层输出 (AST)：**
```typescript
{
  type: 'Page',
  platform: 'mobile',
  mobileNavigation: ['首页', '训练', '数据', '我的'],
  children: [{
    type: 'Section',
    props: { fullWidth: true },  // 自动注入
    children: [...]
  }]
}
```

**视觉层输出 (Design Tokens)：**
```css
:root {
  --spacing-md: 12px;      /* 原 16px × 0.75 */
  --spacing-lg: 24px;      /* 原 32px × 0.75 */
  --font-size-xl: 18px;    /* 锁定上限 */
  --shadow-md: 0 4px 6px rgba(0,0,0,0.06);  /* 减弱 */
}
```

**工厂层输出 (React)：**
```tsx
<MobileShell navigation={['首页', '训练', '数据', '我的']}>
  <section className="w-full px-4">
    <Card>...</Card>
  </section>
</MobileShell>
```

**最终输出 (HTML)：**
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <style>
    /* 已剔除 hover:*, lg:*, xl:* */
    /* 已注入 safe-area-* */
  </style>
</head>
<body>
  <div class="flex flex-col h-screen">
    <main class="flex-1 overflow-auto">...</main>
    <nav class="flex border-t h-14 safe-area-pb">...</nav>
  </div>
</body>
</html>
```

---

## 测试策略

### 单元测试
- `platform` 检测逻辑
- Tokens 收缩计算
- 组件映射表
- Hover 摊牌转换
- 布局碰撞检测

### 集成测试
- 同一 DSL，Web vs Mobile 输出对比
- MobileShell + TabBar 渲染
- 44px 点击热区验证

### E2E 测试
- 模拟 375×667 视口
- 验证无 hover 样式
- 验证 safe-area 生效
- 验证滚动容器保护（无 rubber-banding）

---

## 完整数据流

```
mobile_navigation 有值
  → 规划层: Content Agent 减少字数
    → 逻辑层: AST.platform = "mobile"
      → 逻辑层: Grid 强制单栏，Hover 摊牌，按钮碰撞修复
        → 视觉层: Tokens 收缩 0.75x + 列表背景色差
          → 工厂层: Table→List，注入 44px 点击热区
            → 工厂层: 包 MobileShell + TabBar
              → 输出层: viewport + safe-area + 锁定 Body 滚动
```

---

## 补充细节汇总 ⭐

| 层 | 补充点 | 解决的问题 |
|----|--------|------------|
| 规划层 | Content Agent 减少字数 | 移动端用户扫读习惯 |
| 逻辑层 | Hover 摊牌逻辑 | 手机没有鼠标悬停 |
| 逻辑层 | 自愈式布局检查器 | 3 个按钮横排必溢出 |
| 视觉层 | 列表流色彩节奏 | 长列表视觉疲劳 |
| 工厂层 | 44px 最小点击热区 | 小按钮点不中 |
| 输出层 | 滚动容器保护 | Webview 橡皮筋廉价感 |

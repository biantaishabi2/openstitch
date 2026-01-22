# Stitch UI 引擎设计资源清单

本文档整理了 Stitch UI 引擎可用的设计资源，包括风格预设、主题、布局组件等，供组装时参考。

---

## 一、风格词库 (Style Word Bank)

组装时可使用以下风格关键词来定义视觉语言。

### 1.1 Layout & Structure 布局结构

| 风格 | 描述 | 可用资源 | 安装方式 |
|------|------|----------|----------|
| **Bento Grid** | 模块化、盒状、卡片式布局，将内容组织成网格层级 | [Aceternity UI](https://ui.aceternity.com/components/bento-grid)、[Magic UI](https://magicui.design/docs/components/bento-grid)、[Kokonut UI](https://kokonutui.com/docs/components/bento-grid)、[shadcnblocks](https://www.shadcnblocks.com/blocks/bento) | `npx shadcn@latest add @aceternity/bento-grid` |
| **Editorial** | 高端杂志感，大号衬线标题、充裕留白、不对称图片布局 | [Banter](https://tailawesome.gumroad.com/l/banter)、[Tailnews](https://www.tailwindawesome.com/resources/tailnews) (免费) | 模板下载 |
| **Swiss Style** | 客观清晰，严格网格系统、无衬线字体、左对齐文本 | [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) | `npm install @tailwindcss/typography` |
| **Split-Screen** | 垂直分割，一侧纯色块，一侧全出血图像 | Tailwind Grid 原生支持 | 内置 |

### 1.2 Texture & Depth 质感深度

| 风格 | 描述 | 可用资源 | 安装方式 |
|------|------|----------|----------|
| **Glassmorphism** | 半透明、背景模糊、微妙白边，"磨砂玻璃"效果 | [glasscn-ui](https://github.com/itsjavi/glasscn-ui)、[shadcn-glass-ui](https://github.com/Yhooi2/shadcn-glass-ui-library) (57组件，3主题) | `npm install glasscn-ui` |
| **Claymorphism** | 柔软膨胀的3D形状，内阴影，友好触感 | [tailwindcss-claymorphism](https://github.com/dulltackle/tailwindcss-claymorphism) | `npm install tailwindcss-claymorphism` |
| **Skeuomorphic** | 拟真纹理（皮革、纸张、金属），仿物理控件 | [UIverse.io](https://uiverse.io/elements?search=skeuomorphism) 89+ 元素 | 复制代码 |
| **Grainy/Noise** | 胶片颗粒或纹理叠加，减少"数码感"增加温度 | CSS filter + SVG noise | 自定义实现 |
| **Neumorphism** | 新拟物化，柔和的凸起/凹陷效果 | [neumorphism.io](https://neumorphism.io/) 生成器 | CSS 生成 |

### 1.3 Atmosphere & Era 氛围时代

| 风格 | 描述 | 可用资源 | 安装方式 |
|------|------|----------|----------|
| **Brutalist** | 原始、未修饰、系统默认字体、高对比、硬边缘，"丑酷" | [neobrutalism.dev](https://www.neobrutalism.dev/) 基于 shadcn | 复制组件 |
| **Cyberpunk** | 深色背景、霓虹强调色（青/品红）、故障效果、科技感 | [daisyUI cyberpunk](https://daisyui.com/docs/themes/)、[shadcn.io Cyberpunk](https://www.shadcn.io/theme/cyberpunk) | `npm install daisyui` |
| **Y2K** | 90年代末/2000年代初乐观主义，铬纹理、泡泡字、明亮蓝粉、药丸按钮 | [@y2k-tech/ui](https://github.com/ZenithResearch/y2k-ui) | `npm install @y2k-tech/ui` |
| **Retro-Futurism** | 80年代合成波，日落、线框网格、VHS美学、发光线条 | [daisyUI synthwave/retro](https://daisyui.com/docs/themes/)、[tailwind-retro-colors](https://jackbister.github.io/tailwind-retro-colors/) | `npm install daisyui` |
| **Vaporwave** | 粉紫渐变、希腊雕塑、日文文字、怀旧数字感 | daisyUI + 自定义配色 | 自定义实现 |

### 1.4 Color & Contrast 颜色对比

| 风格 | 描述 | 可用资源 | 安装方式 |
|------|------|----------|----------|
| **Duotone** | 整个UI由两种对比色（及其色阶）组成 | [tweakcn.com](https://tweakcn.com/) 主题编辑器 | 生成配置 |
| **Monochromatic** | 单一基础色调的统一品牌外观 | [ui.jln.dev](https://ui.jln.dev/) 10000+ 主题 | 复制 CSS 变量 |
| **Pastel Goth** | 柔和粉彩色搭配黑色字体和边框 | [Catppuccin](https://github.com/catppuccin/tailwindcss) 柔和色系 | `npm install @catppuccin/tailwindcss` |
| **Dark Mode OLED** | 真黑背景 (#000000)，高对比度，屏幕省电 | [daisyUI black](https://daisyui.com/docs/themes/)、shadcn 原生 | 内置支持 |
| **High Contrast** | 极高对比度，无障碍友好 | shadcn + 自定义 | 自定义实现 |

---

## 二、主题生成器与编辑器

| 工具 | 描述 | 链接 |
|------|------|------|
| **tweakcn** | shadcn/ui 交互式主题编辑器，实时预览 | https://tweakcn.com/ |
| **ui.jln.dev** | 10000+ shadcn/ui 主题预设 | https://ui.jln.dev/ |
| **Shadcn Studio** | AI 辅助主题生成 | https://shadcnstudio.com/ |
| **daisyUI Theme Generator** | daisyUI 主题生成器 | https://daisyui.com/theme-generator/ |
| **UI Colors** | Tailwind 配色生成器 | https://uicolors.app/ |
| **Realtime Colors** | 实时预览配色方案 | https://www.realtimecolors.com/ |

---

## 三、原子设计规范 (Foundation & Atoms)

### 3.1 网格系统 (The 8pt Grid)

```
规则: 所有间距、组件高度、图标大小必须符合 n × 8px
作用: 消除视觉杂讯，实现精准对齐

常用值:
- 8px   (xs)  - 紧凑间距
- 16px  (sm)  - 小间距
- 24px  (md)  - 中间距
- 32px  (lg)  - 大间距
- 48px  (xl)  - 超大间距
- 64px  (2xl) - 区块间距
```

### 3.2 排版层级 (Typography Scale)

| 层级 | 用途 | 建议字号 | 字重 |
|------|------|----------|------|
| **Display** | 超大展示标题 | 48-72px | Bold |
| **Headline** | 页面主标题 | 32-40px | Bold |
| **Title** | 模块标题 | 24-28px | Semibold |
| **Subtitle** | 二级标题 | 18-20px | Medium |
| **Body** | 正文内容 | 14-16px | Regular |
| **Caption** | 辅助说明 | 12px | Regular |
| **Button** | 按钮文字 | 14px | Medium |

**字体堆栈:**
- 界面: `system-ui, -apple-system, sans-serif`
- 代码: `ui-monospace, 'Fira Code', monospace`

### 3.3 色彩系统 (Color Architecture)

**品牌色:**
```
Primary     - 主品牌色 (行动按钮、链接、强调)
Secondary   - 次品牌色 (次要按钮、辅助元素)
Tertiary    - 辅助色 (装饰、背景点缀)
```

**中性色 (10级灰度):**
```
neutral-50   #fafafa   - 最浅背景
neutral-100  #f5f5f5   - 浅背景
neutral-200  #e5e5e5   - 边框、分割线
neutral-300  #d4d4d4   - 禁用状态
neutral-400  #a3a3a3   - 占位符文字
neutral-500  #737373   - 辅助文字
neutral-600  #525252   - 次要文字
neutral-700  #404040   - 正文
neutral-800  #262626   - 标题
neutral-900  #171717   - 最深文字
neutral-950  #0a0a0a   - 纯黑
```

**语义色:**
```
Success  - 绿色系 (#22c55e) - 成功、完成、正确
Info     - 蓝色系 (#3b82f6) - 信息、提示、链接
Warning  - 黄色系 (#eab308) - 警告、注意、待处理
Error    - 红色系 (#ef4444) - 错误、失败、危险
```

### 3.4 形态规则 (Shapes & Borders)

**圆角规范:**
```
4px   (sm)   - 小组件 (Badge, Chip, 输入框)
8px   (md)   - 标准容器 (Card, 按钮, 列表项)
16px  (lg)   - 大容器 (弹窗, 侧边栏)
999px (full) - 胶囊按钮、圆形头像
```

**边框规范:**
```
默认: 1px solid neutral-200
聚焦: 2px solid primary
错误: 1px solid error
```

---

## 四、组件行为规范 (Component Behaviors)

### 4.1 容器类 (Containers)

| 组件 | 描述 | 插槽/属性 |
|------|------|----------|
| **Surface** | 带阴影的基础层，所有内容必须承载于此 | shadow, padding |
| **Section** | 页面垂直分割单元，自带内边距 | padding, background |
| **Card** | 最灵活容器 | Media, Header, Body, Footer |
| **Dialog/Modal** | 弹出层 | Header, Body, Footer, Close |

### 4.2 导航类 (Navigation)

| 组件 | 描述 | 固定布局 |
|------|------|----------|
| **Navbar/Header** | 顶部导航 | Logo 左 + 菜单/操作 右 |
| **Sidebar** | 侧边导航 | 一级菜单 + 折叠二级 + 底部用户信息 |
| **Tabs** | 标签切换 | 激活态明确标识 |
| **Breadcrumb** | 面包屑 | 层级路径 + 分隔符 |
| **Pagination** | 分页 | 上一页 + 页码 + 下一页 |

### 4.3 展示类 (Data Display)

| 组件 | 描述 | 变体 |
|------|------|------|
| **Badge** | 角标/标签 | default, secondary, destructive, outline |
| **Avatar** | 头像 | 图片, 文字, 图标 |
| **List Item** | 列表项 | 前置图标 + 文本 + 后置操作 |
| **Table** | 数据表格 | 排序, 筛选, 分页 |
| **Statistic** | 数据统计 | 数值 + 标签 + 趋势 |
| **Timeline** | 时间线 | 垂直, 交替 |

### 4.4 反馈类 (Feedback)

| 组件 | 描述 | 语义色绑定 |
|------|------|----------|
| **Alert** | 提示条 | success, info, warning, error |
| **Toast** | 轻提示 | 自动消失 |
| **Progress** | 进度条 | 线性, 圆形 |
| **Skeleton** | 骨架屏 | 加载占位 |
| **Empty State** | 空状态 | 图标 + 文字 + 操作按钮 |

### 4.5 交互状态规范

所有可交互组件必须定义以下状态:

```
Default   - 默认状态
Hover     - 悬停 (仅 Web)
Active    - 激活/按下
Focus     - 聚焦 (键盘导航)
Disabled  - 禁用 (降低 60% 不透明度)
Loading   - 加载中
```

---

## 五、布局逻辑规范 (Layout Patterns)

### 5.1 Grid Layout (12列网格)

```
Col-12  100%    全宽
Col-6   50%     半宽
Col-4   33.33%  三分之一
Col-3   25%     四分之一
Col-2   16.67%  六分之一

响应式断点:
- sm  (640px)   移动端
- md  (768px)   平板
- lg  (1024px)  桌面
- xl  (1280px)  大屏
- 2xl (1536px)  超大屏
```

### 5.2 Stack Layout (堆叠布局)

**Vertical Stack:**
```
内容自上而下流动
间距: 8px / 16px / 24px / 32px
对齐: stretch (默认), start, center, end
```

**Horizontal Stack (Flex):**
```
内容横向排列
对齐: space-between, center, start, end
换行: wrap, nowrap
间距: gap-2 / gap-4 / gap-6 / gap-8
```

### 5.3 页面模板 (Page Templates)

**Dashboard 仪表盘:**
```
┌─────────────────────────────────────┐
│ Header (Logo + Search + User)       │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content Area        │
│ (Nav)    │ ┌─────────┬─────────┐   │
│          │ │ Card    │ Card    │   │
│          │ ├─────────┴─────────┤   │
│          │ │ Table / Chart     │   │
│          │ └───────────────────┘   │
└──────────┴──────────────────────────┘
```

**Landing Page 落地页:**
```
┌─────────────────────────────────────┐
│ Navbar                              │
├─────────────────────────────────────┤
│ Hero Section (主视觉 + CTA)         │
├─────────────────────────────────────┤
│ Features Grid (功能网格)            │
├─────────────────────────────────────┤
│ Social Proof (案例/数据)            │
├─────────────────────────────────────┤
│ CTA Section (行动召唤)              │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Presentation 演示页:**
```
┌─────────────────────────────────────┐
│                                     │
│         Full-screen Content         │
│         (居中, 高对比度)             │
│                                     │
└─────────────────────────────────────┘
```

---

## 六、语义映射规则 (Semantic Mapping)

### 6.1 关键词 → 组件映射

| 关键词 | 推荐组件 |
|--------|----------|
| 数据、趋势、监控、统计、报表 | Table, Chart |
| 第一步、流程、步骤、然后、依次 | Steps, Timeline |
| 列表、清单、汇总、合集 | List |
| 分类、标签、状态 | Badge, Chip |
| 提示、通知、提醒 | Alert, Toast |
| 进度、加载、上传、下载 | Progress |
| 用户、成员、人员 | Avatar, Card |
| 设置、配置、选项 | Form, Switch, Select |

### 6.2 关键词 → 图标映射

| 关键词 | 图标 |
|--------|------|
| Settings / 设置 | `cog` / `settings` |
| Search / 搜索 | `magnifying-glass` / `search` |
| Analysis / 分析 | `chart-line` / `trending-up` |
| Add / 添加 | `plus` |
| Delete / 删除 | `trash` |
| Edit / 编辑 | `pencil` |
| Save / 保存 | `save` / `check` |
| Back / 返回 | `arrow-left` |
| Next / 下一步 | `arrow-right` |
| Success / 成功 | `check-circle` |
| Error / 错误 | `x-circle` |
| Warning / 警告 | `alert-triangle` |
| Info / 信息 | `info` |
| User / 用户 | `user` |
| Home / 首页 | `home` |
| Menu / 菜单 | `menu` |

---

## 七、一致性检查规则 (Integrity Checks)

### 7.1 必须通过的检查项

| 检查项 | 规则 |
|--------|------|
| **AA 对比度** | 文本与背景对比度 ≥ 4.5:1 (正文)，≥ 3:1 (大文本) |
| **8pt 网格** | 所有间距、尺寸必须是 8 的倍数 |
| **空状态** | 无数据时必须渲染 Empty State |
| **加载状态** | 异步操作必须有加载指示 |
| **错误状态** | 操作失败必须有错误提示 |
| **禁用状态** | 不可用元素必须有视觉区分 |

### 7.2 响应式适配

| 断点 | 布局调整 |
|------|----------|
| Mobile (< 768px) | 单列布局，Sidebar 折叠，Tabs 转下拉 |
| Tablet (768-1024px) | 2列布局，Sidebar 图标模式 |
| Desktop (> 1024px) | 多列布局，完整 Sidebar |

### 7.3 平台适配

| 平台 | 交互差异 |
|------|----------|
| Web | Hover 效果，鼠标操作 |
| Mobile | 无 Hover，Tap 区域 ≥ 48px，手势支持 |

---

## 八、推荐安装的 npm 包

### 核心依赖

```bash
# shadcn/ui 基础
npx shadcn@latest init

# 主题系统
npm install daisyui @catppuccin/tailwindcss

# 布局组件
npx shadcn@latest add @aceternity/bento-grid
npm install @kokonutui/bento-grid

# 风格预设
npm install glasscn-ui
npm install tailwindcss-claymorphism
npm install @y2k-tech/ui

# 排版
npm install @tailwindcss/typography
```

### tailwind.config.js 配置示例

```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 8pt 网格间距
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
      },
      // 圆角规范
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'full': '999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-claymorphism'),
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light', 'dark', 'cyberpunk', 'synthwave', 'retro'],
  },
}
```

---

## 九、参考资源

### 官方文档
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)

### 组件库
- [Aceternity UI](https://ui.aceternity.com/)
- [Magic UI](https://magicui.design/)
- [Kokonut UI](https://kokonutui.com/)

### 主题工具
- [tweakcn](https://tweakcn.com/)
- [ui.jln.dev](https://ui.jln.dev/)
- [Shadcn Studio](https://shadcnstudio.com/)

### 设计参考
- [neobrutalism.dev](https://www.neobrutalism.dev/)
- [UIverse.io](https://uiverse.io/)
- [FreeFrontend](https://freefrontend.com/)

---

*文档版本: v1.0*
*最后更新: 2025-01*

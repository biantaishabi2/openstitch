# Stitch UI 引擎设计资源清单

本文档整理了 Stitch UI 引擎可用的设计资源，包括风格预设、主题、布局组件等，供组装时参考。

---

## 〇、Vibe 形容词库 (Adjective Bank)

Stitch 通过形容词来定义应用的整体感觉，影响颜色、字体、图像风格。

### 0.1 情绪氛围 (Mood)

| 形容词 | 中文 | 配色倾向 | 字体倾向 | 适用场景 |
|--------|------|----------|----------|----------|
| **Vibrant** | 活力的 | 高饱和、多彩 | 粗体无衬线 | 健身、社交、游戏 |
| **Minimalist** | 极简的 | 黑白灰、单色 | 细体无衬线 | 工具、效率、冥想 |
| **Warm** | 温暖的 | 橙黄红棕 | 圆润字体 | 餐饮、家居、社区 |
| **Cool** | 冷静的 | 蓝绿紫 | 几何字体 | 科技、金融、医疗 |
| **Elegant** | 优雅的 | 金黑白、低饱和 | 衬线字体 | 奢侈品、时尚、艺术 |
| **Playful** | 活泼的 | 明亮、对比强 | 圆体、手写体 | 儿童、娱乐、创意 |
| **Professional** | 专业的 | 深蓝、灰白 | 正式无衬线 | 企业、B2B、法律 |
| **Friendly** | 友好的 | 柔和、粉彩 | 圆润无衬线 | 教育、医疗、客服 |
| **Bold** | 大胆的 | 高对比、黑白 | 粗体、全大写 | 时尚、运动、媒体 |
| **Calm** | 平静的 | 米色、浅蓝绿 | 细体、宽松 | 冥想、健康、阅读 |
| **Luxurious** | 奢华的 | 金、深紫、黑 | 衬线、细体 | 珠宝、酒店、汽车 |
| **Trustworthy** | 可信的 | 蓝、白、灰 | 稳重无衬线 | 银行、保险、政府 |
| **Energetic** | 充满活力 | 橙红黄、渐变 | 斜体、动感 | 运动、音乐、派对 |
| **Sophisticated** | 精致的 | 深色、单色 | 细衬线 | 葡萄酒、艺术、建筑 |
| **Fresh** | 清新的 | 绿、白、浅蓝 | 轻盈无衬线 | 有机食品、环保、户外 |
| **Retro** | 复古的 | 棕橙米、做旧 | 复古字体 | 咖啡、唱片、vintage |
| **Futuristic** | 未来的 | 霓虹、深色底 | 几何、科技感 | AI、太空、游戏 |
| **Cozy** | 舒适的 | 暖棕、米白 | 圆润、手写 | 咖啡店、书店、家居 |

### 0.2 设计风格 (Style)

| 形容词 | 中文 | 视觉特征 |
|--------|------|----------|
| **Flat** | 扁平的 | 无阴影、纯色块、简洁图标 |
| **Gradient** | 渐变的 | 颜色过渡、光泽感 |
| **Glassmorphism** | 毛玻璃 | 半透明、模糊背景、白边 |
| **Neumorphism** | 新拟物 | 柔和凸起/凹陷、浅色背景 |
| **Skeuomorphic** | 拟物的 | 真实纹理、3D效果 |
| **Brutalist** | 野兽派 | 粗边框、系统字体、原始感 |
| **Material** | 材质感 | 卡片阴影、层级分明 |
| **Organic** | 有机的 | 不规则形状、自然曲线 |
| **Geometric** | 几何的 | 规则形状、直线、网格 |
| **Editorial** | 杂志感 | 大标题、留白、图文混排 |

### 0.3 组合示例

```
"vibrant and encouraging" → 健身App：高饱和橙色、粗体字、活力图片
"minimalist and focused" → 冥想App：黑白灰、细体字、留白多
"warm and cozy" → 咖啡店：棕色系、圆润字体、温馨图片
"professional and trustworthy" → 银行App：深蓝白、稳重字体、简洁布局
"playful and colorful" → 儿童教育：多彩、圆体字、卡通图片
"elegant and luxurious" → 奢侈品：黑金、衬线字体、大图留白
"fresh and organic" → 健康食品：绿白、轻盈字体、自然图片
"bold and futuristic" → 科技产品：霓虹色、几何字体、深色背景
```

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

## 九、行业场景预设 (Industry Presets)

每个行业对应推荐的 Vibe 组合、配色、字体风格。

### 9.1 科技/SaaS

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | professional, futuristic, minimalist |
| **主色** | 深蓝 `#1e3a8a`、紫 `#7c3aed`、青 `#06b6d4` |
| **配色** | 深色模式优先，霓虹强调色 |
| **字体** | 几何无衬线 (Inter, Geist) |
| **圆角** | 中等 (8px) |
| **风格** | Flat, Glassmorphism |
| **布局** | Dashboard, Bento Grid |

### 9.2 金融/银行

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | trustworthy, professional, sophisticated |
| **主色** | 深蓝 `#1e40af`、深绿 `#166534`、金 `#ca8a04` |
| **配色** | 保守、低饱和、白底 |
| **字体** | 稳重无衬线 (IBM Plex Sans) |
| **圆角** | 小 (4px) |
| **风格** | Flat, Material |
| **布局** | Dashboard, 数据表格 |

### 9.3 电商/零售

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | vibrant, friendly, energetic |
| **主色** | 橙 `#ea580c`、红 `#dc2626`、绿 `#16a34a` |
| **配色** | 明亮、CTA突出、促销感 |
| **字体** | 易读无衬线 (Nunito, Poppins) |
| **圆角** | 中等 (8px) |
| **风格** | Flat, 卡片阴影 |
| **布局** | Card Grid, 产品列表 |

### 9.4 教育/学习

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | friendly, playful, calm |
| **主色** | 蓝 `#2563eb`、绿 `#22c55e`、紫 `#8b5cf6` |
| **配色** | 柔和、易读、不刺眼 |
| **字体** | 圆润无衬线 (Quicksand, Comfortaa) |
| **圆角** | 大 (12-16px) |
| **风格** | Flat, 友好插画 |
| **布局** | 卡片、进度追踪、时间线 |

### 9.5 医疗/健康

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | trustworthy, calm, fresh |
| **主色** | 青 `#0891b2`、蓝 `#3b82f6`、绿 `#10b981` |
| **配色** | 干净、白底、蓝绿强调 |
| **字体** | 清晰无衬线 (Source Sans, Open Sans) |
| **圆角** | 中等 (8px) |
| **风格** | Flat, 干净简洁 |
| **布局** | 表单、预约、数据图表 |

### 9.6 餐饮/美食

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | warm, cozy, fresh |
| **主色** | 橙 `#f97316`、红 `#ef4444`、棕 `#92400e` |
| **配色** | 暖色调、食欲色 |
| **字体** | 圆润或手写风 (Poppins, Pacifico) |
| **圆角** | 大 (12px) |
| **风格** | 温馨、大图片 |
| **布局** | 菜单卡片、图片网格 |

### 9.7 时尚/奢侈品

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | elegant, luxurious, sophisticated |
| **主色** | 黑 `#000000`、金 `#d4af37`、米 `#f5f5dc` |
| **配色** | 黑白金、低饱和、高级感 |
| **字体** | 细衬线 (Playfair Display, Cormorant) |
| **圆角** | 无或极小 (0-2px) |
| **风格** | Editorial, 大留白 |
| **布局** | 全屏图片、杂志排版 |

### 9.8 健身/运动

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | vibrant, energetic, bold |
| **主色** | 橙 `#f97316`、红 `#ef4444`、绿 `#22c55e` |
| **配色** | 高对比、深色底、霓虹强调 |
| **字体** | 粗体无衬线 (Oswald, Anton) |
| **圆角** | 小 (4px) 或胶囊 |
| **风格** | Bold, 动感 |
| **布局** | 数据卡片、进度环、时间线 |

### 9.9 游戏/娱乐

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | playful, futuristic, bold |
| **主色** | 紫 `#a855f7`、青 `#06b6d4`、粉 `#ec4899` |
| **配色** | 深色底、霓虹、渐变 |
| **字体** | 科幻/游戏风 (Orbitron, Press Start) |
| **圆角** | 中等或硬边 |
| **风格** | Cyberpunk, Glassmorphism |
| **布局** | Bento Grid, 卡片堆叠 |

### 9.10 房产/家居

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | elegant, warm, cozy |
| **主色** | 棕 `#78716c`、绿 `#4d7c0f`、米 `#fef3c7` |
| **配色** | 自然色、木质感、舒适 |
| **字体** | 优雅无衬线 (Lato, Raleway) |
| **圆角** | 中等 (8px) |
| **风格** | 大图片、Japandi |
| **布局** | 图片画廊、列表卡片 |

### 9.11 社交/社区

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | friendly, playful, vibrant |
| **主色** | 蓝 `#3b82f6`、粉 `#ec4899`、渐变 |
| **配色** | 明亮、多彩、年轻 |
| **字体** | 现代无衬线 (Inter, DM Sans) |
| **圆角** | 大 (12-16px) |
| **风格** | Flat, 渐变 |
| **布局** | Feed流、卡片、头像网格 |

### 9.12 新闻/媒体

| 属性 | 推荐值 |
|------|--------|
| **Vibe** | professional, bold, trustworthy |
| **主色** | 红 `#dc2626`、黑 `#171717`、白 |
| **配色** | 高对比、黑白为主、红色强调 |
| **字体** | 衬线标题 + 无衬线正文 (Georgia + Inter) |
| **圆角** | 小 (4px) |
| **风格** | Editorial, Swiss Style |
| **布局** | 杂志排版、网格、时间线 |

---

## 十、预设清单汇总

### 需要准备的预设数量

| 维度 | 数量 | 说明 |
|------|------|------|
| **Vibe 形容词** | 18+ | 情绪氛围词 |
| **设计风格** | 10 | Flat, Glass, Brutalist 等 |
| **布局模板** | 10-15 | Dashboard, Landing, Editorial 等 |
| **行业预设** | 12 | 科技、金融、电商等 |
| **配色主题** | 20-30 | 从 ui.jln.dev 精选 |
| **字体组合** | 8-10 | 标题+正文配对 |
| **圆角风格** | 4 | sharp/small/medium/pill |

### 预设映射关系

```
用户输入: "A vibrant fitness app for marathon runners"
         ↓ 解析
Vibe: vibrant, energetic
行业: 健身/运动
         ↓ 映射
配色: 深色底 + 橙色强调
字体: Oswald (粗体)
圆角: 4px
风格: Bold
布局: Dashboard + 数据卡片
```

---

## 十二、三层架构说明

Stitch 采用**三层架构**管理视觉系统，确保一致性的同时保留灵活性。

### 12.1 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    AI 生成的 JSON Schema                     │
│  { "type": "Card", "style": { "override": { "bg": "red" }}}│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Override（覆盖机制）—— AI 局部微调                │
│  优先级最高，可覆盖任何预设                                  │
│  示例: { "background": "red-500", "borderRadius": "lg" }    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Presets（主题预设）—— 场景触发                    │
│  12 种预设主题，根据上下文关键词自动选择                     │
│  示例: tech, minimalist, dark, warm, elegant, cyberpunk     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Tokens（基础规格）—— 强制执行                     │
│  颜色阶梯、间距、圆角、阴影、字体等原子级规范                │
│  所有值必须来自 Tokens，保证视觉一致性                       │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Layer 1: Tokens（基础规格）

**文件位置**: `src/lib/themes/tokens.ts`

所有组件必须基于这些 Token 进行渲染：

| Token 类型 | 说明 | 示例值 |
|-----------|------|--------|
| **颜色阶梯** | 50-950 级色板 | `blue-600`, `neutral-200` |
| **间距** | 4px 为基准 | `xs(8px)`, `sm(16px)`, `md(24px)`, `lg(32px)` |
| **圆角** | 5 档预设 | `sm(4px)`, `md(8px)`, `lg(12px)`, `full(9999px)` |
| **阴影** | 6 档预设 | `sm`, `md`, `lg`, `xl`, `2xl`, `inner` |
| **字体** | 3 种字体栈 | `sans`, `serif`, `mono` |

**代码示例**:
```typescript
import { colors, spacing, borderRadius } from '@/lib/themes/tokens';

// 使用 Token
const style = {
  background: colors.blue[600],    // #2563eb
  padding: spacing[4],              // 16px
  borderRadius: borderRadius.md,    // 8px
};
```

### 12.3 Layer 2: Presets（主题预设）

**文件位置**: `src/lib/themes/presets.ts`

| 主题 | 触发关键词 | 主色 | 适用场景 |
|------|-----------|------|----------|
| **tech** | 技术、saas、dashboard | 蓝 `#2563eb` | SaaS、后台管理 |
| **minimalist** | 极简、干净、工具 | 黑 `#171717` | 工具、笔记 |
| **dark** | 暗色、开发者、代码 | 蓝 `#3b82f6` | 开发工具、监控 |
| **warm** | 温暖、餐饮、社区 | 橙 `#f97316` | 餐饮、教育 |
| **elegant** | 优雅、奢华、高端 | 黑 `#171717` + 金 | 奢侈品、时尚 |
| **vibrant** | 活力、运动、健身 | 橙 `#f97316` | 健身、音乐 |
| **cyberpunk** | 赛博朋克、游戏、霓虹 | 青 `#22d3ee` | 游戏、科幻 |
| **fresh** | 清新、自然、健康 | 绿 `#16a34a` | 健康、环保 |
| **trustworthy** | 专业、金融、银行 | 深蓝 `#1e40af` | 金融、保险 |
| **playful** | 活泼、童趣、儿童 | 紫 `#a855f7` | 儿童、创意 |
| **glass** | 毛玻璃、透明、ios | 蓝 `#3b82f6` | 现代、科技 |
| **brutalist** | 野兽派、艺术、原始 | 黑 `#000000` | 艺术、实验 |

**自动选择示例**:
```typescript
import { matchTheme } from '@/lib/themes/presets';

// AI 描述：一个健身追踪应用
const theme = matchTheme('健身追踪应用');
// 返回 vibrant 主题
```

### 12.4 Layer 3: Override（覆盖机制）

**文件位置**: `src/lib/themes/override.ts`

AI 可以在 JSON Schema 中使用 `style.override` 覆盖任何预设：

```json
{
  "type": "Card",
  "props": {
    "title": "特别提醒"
  },
  "style": {
    "theme": "tech",
    "override": {
      "background": "red-500",
      "borderRadius": "lg",
      "padding": 24
    }
  }
}
```

**覆盖优先级**: `override > theme preset > tokens`

**支持的覆盖属性**:
- 颜色: `background`, `color`, `borderColor`
- 间距: `padding`, `margin`, `gap`
- 尺寸: `width`, `height`, `minWidth`, `maxWidth`
- 边框: `borderRadius`, `borderWidth`
- 阴影: `shadow`, `boxShadow`
- 字体: `fontSize`, `fontWeight`, `fontFamily`, `textAlign`
- 布局: `display`, `flexDirection`, `justifyContent`, `alignItems`

---

## 十三、已安装依赖清单

### 13.1 主题与样式

| 包名 | 版本 | 用途 |
|------|------|------|
| `daisyui` | ^5.5.14 | 29+ 预设主题 (cyberpunk, synthwave 等) |
| `@catppuccin/tailwindcss` | ^1.0.0 | 柔和色系主题 |
| `@tailwindcss/typography` | ^0.5.19 | 排版插件 |
| `glasscn-ui` | ^0.7.1 | 毛玻璃风格组件 |

### 13.2 动画与可视化

| 包名 | 版本 | 用途 |
|------|------|------|
| `framer-motion` | ^12.29.0 | 动画库 |
| `recharts` | ^2.15.4 | 数据可视化图表 |
| `tw-animate-css` | ^1.4.0 | Tailwind 动画 |
| `cobe` | - | 3D 地球组件 |

### 13.3 UI 组件

**已安装 85 个组件**，包括：

**基础组件 (shadcn/ui)**:
```
accordion, alert, aspect-ratio, avatar, badge, breadcrumb, button,
calendar, card, carousel, chart, checkbox, code-block, collapsible,
command, context-menu, dialog, drawer, dropdown-menu, empty-state,
form, hero, hover-card, icon, input, input-otp, label, layout, list,
menubar, navigation-menu, pagination, popover, progress, radio-group,
resizable, scroll-area, select, separator, sheet, sidebar, skeleton,
slider, sonner, statistic, stepper, switch, table, tabs, textarea,
timeline, toggle, toggle-group, tooltip
```

**Magic UI 布局与动画组件**:
```
animated-beam, animated-grid-pattern, animated-shiny-text,
avatar-circles, bento-grid, blur-fade, border-beam, confetti,
dock, dot-pattern, globe, grid-pattern, hero-video-dialog,
hyper-text, icon-cloud, magic-card, marquee, meteors,
number-ticker, orbiting-circles, particles, rainbow-button,
retro-grid, ripple, safari, shimmer-button, shine-border,
text-reveal, typing-animation, word-rotate
```

### 13.4 表单与验证

| 包名 | 版本 | 用途 |
|------|------|------|
| `react-hook-form` | ^7.71.1 | 表单状态管理 |
| `@hookform/resolvers` | ^5.2.2 | 表单验证解析器 |
| `zod` | ^4.3.5 | Schema 验证 |
| `input-otp` | ^1.4.2 | OTP 输入组件 |

### 13.5 其他工具

| 包名 | 版本 | 用途 |
|------|------|------|
| `html2canvas` | ^1.4.1 | 截图/导出 PNG |
| `sonner` | ^2.0.7 | Toast 通知 |
| `cmdk` | ^1.1.1 | 命令面板 |
| `vaul` | ^1.1.2 | 抽屉组件 |
| `embla-carousel-react` | ^8.6.0 | 轮播组件 |
| `react-day-picker` | ^9.13.0 | 日期选择器 |
| `date-fns` | ^4.1.0 | 日期工具库 |
| `shiki` | ^3.21.0 | 代码高亮 |
| `lucide-react` | ^0.562.0 | 图标库 |

### 13.6 未安装（不兼容）

| 包名 | 原因 |
|------|------|
| `tailwindcss-claymorphism` | 需要 Tailwind v3，当前 v4 |
| `@y2k-tech/ui` | npm 上不存在 |

---

## 十四、主题系统文件结构

```
src/lib/themes/
├── index.ts          # 入口文件，导出所有模块
├── tokens.ts         # Layer 1: 基础规格（颜色、间距、圆角、阴影、字体）
├── presets.ts        # Layer 2: 12 个场景主题预设
├── override.ts       # Layer 3: 覆盖机制
├── daisyui-themes.ts # daisyUI 33 个主题映射（26 内置 + 7 自定义）
└── layouts.ts        # 14 个布局预设（7 页面级 + 7 组件级）
```

### 主题统计

| 类型 | 数量 | 说明 |
|------|------|------|
| **自定义场景主题** | 12 | tech, minimalist, dark, warm, elegant 等 |
| **daisyUI 内置主题** | 26 | cyberpunk, synthwave, retro, nord 等 |
| **daisyUI 自定义主题** | 7 | tech, warm, elegant, fresh 等 |
| **布局预设** | 14 | dashboard, landing, bento-grid 等 |
| **总计** | **45+ 主题，14 布局** |

### 主题分类

**按场景**:
- 科技/SaaS: tech, cyberpunk, dracula, nord
- 金融/商务: business, trustworthy, luxury
- 餐饮/生活: warm, coffee, autumn, retro
- 娱乐/创意: synthwave, valentine, fantasy, acid
- 自然/健康: garden, forest, fresh, aqua

**按明暗**:
- 浅色 (Light): 16 个
- 深色 (Dark): 17 个

---

## 十四、参考资源

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

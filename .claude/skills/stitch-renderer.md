# Stitch UI 执行层渲染规范

当你需要实现 Stitch UI 组件渲染、样式处理或布局组装时，请遵循以下规范。

## 一、原子设计规范（Foundation & Atoms）

### 1.1 网格系统（8pt Grid）

所有元素的间距、组件高度、图标尺寸、边距必须满足 **n × 8px**（n为正整数）。

```
有效值: 8px, 16px, 24px, 32px, 40px, 48px...
```

### 1.2 排版层级（Typography Scale）

7级固定字体层级：

| 层级 | 用途 |
|------|------|
| Display | 超大字号，页面核心视觉标题 |
| Headline | 大字号，页面主标题 |
| Title | 中大号，模块/区域标题 |
| Subtitle | 中号，模块内二级标题 |
| Body | 基础字号，主要文本内容 |
| Caption | 小字号，辅助说明、备注 |
| Button | 按钮专属字号 |

- 界面主体：无衬线字体
- 代码路径：等宽字体

### 1.3 色彩系统

**品牌色**：Primary、Secondary、Tertiary（各需深/浅色变体，适配交互状态和深色模式）

**中性色**：#000000 到 #FFFFFF 的 10 级灰色梯度

**语义色**（固定含义）：
- Success（绿）：操作成功、完成状态
- Info（蓝）：普通信息、中性通知
- Warning（黄）：风险提示、待处理状态
- Error（红）：操作失败、错误提示

### 1.4 圆角规范（固定四级）

| 圆角值 | 适用场景 |
|--------|----------|
| 4px | 小组件（按钮、输入框、Badge、Chip） |
| 8px | 标准容器（Card、列表项、弹窗模块） |
| 16px | 大容器（弹窗主体、侧边栏） |
| 999px | 胶囊按钮、完全圆角组件 |

### 1.5 边框规范

默认 **1px 实线**，颜色使用中性色梯度固定值。

## 二、组件行为规范

### 2.1 容器类

**Surface**：所有界面信息必须承载在 Surface 之上，不得直接在页面背景上放置内容。

**Section**：页面最大垂直切割单元，自带固定左右内边距（符合8pt）。

### 2.2 导航类

**Navbar/Header**：Logo居左，导航/操作居右，支持吸顶和移动端汉堡菜单。

**Sidebar**：一级菜单 + 二级折叠菜单 + 底部用户信息，支持收起/展开。

**Tabs**：移动端超出3个时自动转为下拉选择器。

### 2.3 展示类

**Card** 固定4个插槽：
- Media（媒体区）
- Header（卡片头）
- Body（卡片主体）
- Footer（卡片底）

**List Item** 固定3个区域：
- 前置图标/媒体区
- 中间文本区
- 后置操作区

### 2.4 反馈类

**Alert**：绑定语义色（Success/Info/Warning/Error），支持手动关闭或自动消失。

**Progress**：圆形（加载状态）或长条形（进度展示），全局统一使用，禁止自定义加载动画。

### 2.5 通用交互状态

所有组件必须实现：
1. **正常**：默认样式
2. **悬停（Hover）**：轻微视觉变化（仅Web端）
3. **激活/选中**：明确视觉标识（品牌色背景/边框加粗）
4. **禁用**：60%不透明度，禁止所有交互
5. **点击反馈**：轻微按压动画

## 三、布局逻辑规范

### 3.1 12列网格布局

```
Col-12: 全宽 (100%)
Col-6:  半宽 (50%)
Col-4:  1/3宽 (33.33%)
Col-3:  1/4宽 (25%)
```

### 3.2 堆叠布局

**Vertical Stack**：内容自上而下，间距符合8pt（如16px、24px）。

**Horizontal Stack**：内容自左向右，对齐方式：
- Space-between（两端对齐）
- Center（居中）
- Start（左对齐）
- End（右对齐）

### 3.3 响应式断点（固定四级）

| 级别 | 宽度范围 | 网格列数 | 特殊处理 |
|------|----------|----------|----------|
| XL（大屏） | ≥1440px | 12列 | 侧边栏展开 |
| L（标准桌面） | 1024-1439px | 12列 | - |
| M（平板） | 768-1023px | 8列 | 侧边栏折叠，Navbar转汉堡 |
| S（移动端） | ≤767px | 4列 | 横向布局转垂直，间距缩小 |

### 3.4 页面模板

**Dashboard**：侧边栏 + 顶部搜索/操作 + 主内容区

**Landing Page**：Hero屏 + 功能网格 + 案例/数据 + 底部信息

**Presentation**：全屏居中，高对比度，弱化导航

## 四、语义映射规则

### 4.1 文本 → 组件

| 关键词 | 强制使用组件 |
|--------|-------------|
| 数据、趋势、监控、统计、报表 | Table / Charts |
| 第一步、流程、步骤、然后、依次 | Steps / Timeline |
| 列表、清单、汇总、合集 | List Item |
| 分类、标签、状态 | Badge / Chip |
| 提示、通知、提醒 | Alert |
| 进度、加载、上传、下载 | Progress |

### 4.2 文本 → 图标

| 关键词 | 图标 |
|--------|------|
| Settings/设置 | cog |
| Search/搜索 | magnifying-glass |
| Analysis/分析 | chart-line |
| Add/添加 | plus |
| Delete/删除 | trash |
| Back/返回 | arrow-left |
| Next/下一步 | arrow-right |
| Save/保存 | save |
| Edit/编辑 | pencil |
| Success/成功 | check |
| Error/错误 | x |
| Info/信息 | info |
| Warning/警告 | alert-triangle |

## 五、一致性检查规则

渲染前必须通过以下校验：

### 5.1 AA 对比度检查

- 正文对比度 ≥ 4.5:1
- 大文本对比度 ≥ 3:1
- 未通过自动调整颜色

### 5.2 空状态处理

无数据时必须渲染 Empty State（图标 + 提示文本），禁止显示空白。

### 5.3 平台适配

- **Web端**：保留Hover效果，标准尺寸
- **移动端**：移除Hover，点击区域≥48px，适配手势操作

### 5.4 8pt 网格合规

所有尺寸/间距必须为8的倍数，否则自动校准。

### 5.5 异常处理

- **文本溢出**：单行省略号，多行最多3行后省略
- **组件溢出**：Web端滚动，移动端转垂直堆叠
- **加载失败**：Error色系图标 + "重试"按钮
- **弱网**：优先渲染核心内容，非核心显示占位符

## 六、组件清单与 Props

### 6.1 布局组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Page` | 页面根容器 | `className` |
| `Container` | 内容容器，限制最大宽度 | `className` |
| `Section` | 页面分区 | `className` |
| `Hero` | 主视觉区域 | `title`, `subtitle`, `className` |
| `Grid` | 网格布局 | `columns` (1-12), `gap`, `className` |
| `Columns` | 多列布局 | `columns`, `gap` |
| `Stack` | 垂直堆叠 | `gap`, `align`, `className` |
| `Flex` | 弹性布局 | `direction`, `justify`, `align`, `gap` |
| `Rows` | 行布局 | `gap` |
| `Split` | 分栏布局 | `ratio` (如 "4:6", "1:1") |
| `Center` | 居中容器 | `className` |
| `Spacer` | 间距占位 | `size` |
| `Div` | 通用容器 | `className` |
| `Span` | 行内容器 | `className` |

### 6.2 文本组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Text` | 文本 | `variant` (display/headline/title/subtitle/body/caption), `color`, `align` |
| `Link` | 链接 | `href`, `target` |
| `CodeBlock` | 代码块 | `language`, `showLineNumbers` |
| `InlineCode` | 行内代码 | - |

### 6.3 卡片组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Card` | 卡片容器 | `className` |
| `CardHeader` | 卡片头部 | - |
| `CardTitle` | 卡片标题 | - |
| `CardDescription` | 卡片描述 | - |
| `CardContent` | 卡片内容区 | - |
| `CardFooter` | 卡片底部 | - |

### 6.4 导航组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Tabs` | 标签页容器 | `defaultValue` |
| `TabsList` | 标签列表 | - |
| `TabsTrigger` | 标签按钮 | `value` |
| `TabsContent` | 标签内容 | `value` |
| `Breadcrumb` | 面包屑容器 | - |
| `BreadcrumbList` | 面包屑列表 | - |
| `BreadcrumbItem` | 面包屑项 | - |
| `BreadcrumbLink` | 面包屑链接 | `href` |
| `BreadcrumbPage` | 当前页 | - |
| `BreadcrumbSeparator` | 分隔符 | - |
| `Stepper` | 步骤条 | `activeStep` |
| `Step` | 步骤项 | `title`, `description` |

### 6.5 数据展示组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Table` | 表格容器 | - |
| `TableHeader` | 表头 | - |
| `TableBody` | 表体 | - |
| `TableRow` | 表格行 | - |
| `TableHead` | 表头单元格 | - |
| `TableCell` | 表格单元格 | - |
| `Timeline` | 时间线容器 | - |
| `TimelineItem` | 时间线项 | - |
| `TimelineHeader` | 时间线头部 | - |
| `TimelineTitle` | 时间线标题 | - |
| `TimelineDescription` | 时间线描述 | - |
| `TimelineTime` | 时间线时间 | - |
| `TimelineConnector` | 时间线连接线 | - |
| `List` | 列表容器 | - |
| `ListItem` | 列表项 | `icon` |
| `Accordion` | 折叠面板容器 | `type` (single/multiple) |
| `AccordionItem` | 折叠项 | `value` |
| `AccordionTrigger` | 折叠触发器 | - |
| `AccordionContent` | 折叠内容 | - |
| `Statistic` | 统计数值 | `value`, `label`, `prefix`, `suffix` |
| `StatisticCard` | 统计卡片 | `title`, `value`, `change`, `trend` |

### 6.6 表单组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Button` | 按钮 | `variant` (default/secondary/outline/ghost/link/destructive), `size` (sm/default/lg/icon) |
| `Input` | 输入框 | `type`, `placeholder`, `value`, `disabled` |
| `Label` | 标签 | `for` |
| `Checkbox` | 复选框 | `checked`, `disabled`, `onCheckedChange` |
| `RadioGroup` | 单选组 | `value`, `onValueChange` |
| `RadioGroupItem` | 单选项 | `value` |
| `Switch` | 开关 | `checked`, `disabled`, `onCheckedChange` |
| `Slider` | 滑块 | `value`, `min`, `max`, `step` |

### 6.7 反馈组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Alert` | 提示框 | `variant` (default/destructive) |
| `AlertTitle` | 提示标题 | - |
| `AlertDescription` | 提示描述 | - |
| `Badge` | 徽章 | `variant` (default/secondary/outline/destructive) |
| `Progress` | 进度条 | `value` (0-100) |
| `Dialog` | 对话框容器 | - |
| `DialogTrigger` | 对话框触发器 | - |
| `DialogContent` | 对话框内容 | - |
| `DialogHeader` | 对话框头部 | - |
| `DialogTitle` | 对话框标题 | - |
| `DialogDescription` | 对话框描述 | - |
| `DialogFooter` | 对话框底部 | - |
| `Tooltip` | 提示气泡容器 | - |
| `TooltipTrigger` | 提示触发器 | - |
| `TooltipContent` | 提示内容 | - |
| `Skeleton` | 骨架屏 | `className` |
| `EmptyState` | 空状态 | `icon`, `title`, `description` |

### 6.8 基础组件

| 组件 | 说明 | 核心 Props |
|------|------|-----------|
| `Icon` | 图标 | `name` (Lucide 图标名), `size`, `color` |
| `Avatar` | 头像容器 | - |
| `AvatarImage` | 头像图片 | `src`, `alt` |
| `AvatarFallback` | 头像占位 | - |
| `Image` | 图片 | `src`, `alt`, `aspectRatio` |
| `Separator` | 分隔线 | `orientation` (horizontal/vertical) |

## 七、核心原则

1. **一致性**：跨页面、跨终端视觉和交互一致
2. **易用性**：符合用户习惯，满足无障碍标准
3. **灵活性**：支持插槽配置和规则扩展
4. **可复用性**：模块化设计，支持一键复用
5. **响应式**：自动适配多终端
6. **可落地性**：明确异常处理，确保规范落地

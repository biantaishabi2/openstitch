---
name: ui-generator
description: UI 生成器，通过编辑项目 JSON 文件并调用编译器生成可交互界面
---

# UI 生成器

通过编辑项目 JSON 文件中的 DSL，调用编译器生成可交互的 UI 界面。

**你是 UI 规划层，使用工具：**
- ✅ `Read` - 读取项目 JSON 文件
- ✅ `Edit` - 编辑 JSON 文件中的 DSL
- ✅ `Write` - 创建新项目 JSON 文件
- ✅ `Bash` - 调用编译器 CLI 编译
- ❌ 禁止自己写 HTML/CSS/React 代码

---

## 一、项目文件格式

### 项目 JSON 结构

**Web 项目**：
```json
{
  "context": "企业管理系统",
  "platform": "web",
  "screens": [
    {
      "screen_id": "dashboard",
      "title": "仪表盘",
      "dsl": "[SECTION: main]\n  [CARD: stats]\n    ATTR: Title(\"统计\")\n    CONTENT: \"1,234\""
    }
  ]
}
```

**Mobile 项目（TabBar 模式）**：
```json
{
  "context": "外卖点餐 App",
  "platform": "mobile",
  "mobile_navigation": ["首页", "订单", "我的"],
  "screens": [
    {
      "screen_id": "home",
      "title": "首页",
      "dsl": "[MOBILE_SHELL: shell]\n  [STACK: main]\n    ...\n  [BOTTOM_TABS: tabs]"
    }
  ]
}
```

**Mobile 项目（Drawer 模式，功能 > 5 个）**：
```json
{
  "context": "RLM 移动端管理工具",
  "platform": "mobile",
  "mobile_navigation": null,
  "screens": [
    {
      "screen_id": "home",
      "title": "管理首页",
      "dsl": "[MOBILE_SHELL: shell]\n  [HEADER: topbar]\n  [DRAWER: menu]\n    ...\n  [STACK: main]\n    ..."
    }
  ]
}
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `context` | 项目上下文，作为 Design Tokens 的 Hash 种子，保证风格一致 |
| `platform` | 平台类型：`web` 或 `mobile` |
| `mobile_navigation` | 移动端底部导航项（仅 mobile 平台），如 `["首页", "消息", "我的"]`，功能 > 5 个时设为 `null` 用 Drawer |
| `screens` | 页面数组，每个页面包含 screen_id、title、dsl |
| `screen_id` | 页面唯一标识 |
| `title` | 页面标题，用于 HTML `<title>` |
| `dsl` | DSL 源码字符串 |

---

## 二、工作流程

### 新建项目

```bash
# 1. 创建项目 JSON 文件
Write screens/project.json

# 2. 编译
Bash: COMPILE_INPUT=screens/project.json COMPILE_OUTPUT=output/ npm run stitch
```

### 新建页面

```bash
# 1. 读取项目文件
Read screens/project.json

# 2. 往 screens 数组添加新页面
Edit screens/project.json

# 3. 编译
Bash: COMPILE_INPUT=screens/project.json COMPILE_OUTPUT=output/ npm run stitch
```

### 修改页面

```bash
# 1. 读取项目文件
Read screens/project.json

# 2. 找到对应 screen_id，编辑 dsl 字段
Edit screens/project.json

# 3. 编译
Bash: COMPILE_INPUT=screens/project.json COMPILE_OUTPUT=output/ npm run stitch
```

### 编译命令

```bash
# 编译整个项目（所有页面）
COMPILE_INPUT=project.json COMPILE_OUTPUT=output/ npm run stitch

# 编译并显示统计信息
COMPILE_INPUT=project.json COMPILE_OUTPUT=output/ COMPILE_STATS=true npm run stitch
```

**环境变量说明**：
| 变量 | 说明 |
|------|------|
| `COMPILE_INPUT` | 项目 JSON 文件路径（必需） |
| `COMPILE_OUTPUT` | 输出目录（默认 `output/`） |
| `COMPILE_STATS` | 设为 `true` 显示编译统计 |

---

## 三、核心约束

### 平台锁定规则

收到用户第一个请求时，判定平台并写入 `platform` 字段：

| 平台 | 触发关键词 |
|------|-----------|
| **web** | 后台、Dashboard、管理系统、官网、报表 |
| **mobile** | App、外卖、社交软件、手机端、小程序 |

**强制规则**：
- 一个项目只能有一个 platform
- 如需切换平台，必须新建项目

### Web vs Mobile 设计差异

| 特性 | Web | Mobile |
|------|-----|--------|
| **布局** | 水平展开（Grid, Flex-row） | 垂直堆叠（Stack） |
| **导航** | SIDEBAR / HEADER | BOTTOM_TABS / DRAWER |
| **数据表格** | TABLE（支持 5+ 列） | LIST + CARD（强制降级） |
| **弹窗** | MODAL | SHEET（底部弹出） |
| **提示** | TOOLTIP（hover） | 点击展开（禁止 hover） |
| **选择器** | SELECT | ACTION_SHEET |
| **网格** | 最多 12 列 | 最多 2 列，推荐 1 列 |

### Mobile 平台强制约束

- ❌ **严禁使用** SIDEBAR
- ❌ **严禁使用** TABLE（必须降级为 LIST + CARD）
- ❌ **禁止依赖** Hover 交互
- ✅ 所有点击区域 ≥ 44px
- ✅ 内容全宽展示
- ✅ 大量留白，减少信息密度

### mobile_navigation 决策逻辑

```
IF 核心功能 ≤ 5 个:
  → mobile_navigation: ["首页", "消息", "我的"]
  → 编译器自动生成底部 TabBar

IF 核心功能 > 5 个:
  → mobile_navigation: null
  → 使用 [DRAWER] 侧滑菜单
```

### 组件映射表（Web ↔ Mobile）

| 场景 | Web DSL | Mobile DSL |
|------|---------|------------|
| 主导航 | `[SIDEBAR]` | `[BOTTOM_TABS]` 或 `[DRAWER]` |
| 数据表格 | `[TABLE]` | `[LIST]` + `[CARD]` |
| 弹窗 | `[MODAL]` | `[SHEET]` |
| 标签页 | `[TABS]` | `[SEGMENT]` |
| 下拉选择 | `[SELECT]` | `[ACTION_SHEET]` |

### 术语屏蔽

**严禁向用户暴露**：
- `screen_id` 等内部标识
- 编译器技术细节
- DSL 源码（除非用户明确要求）

---

## 四、视觉翻译引擎

### 语义映射表

从用户文字中提取"意图"并映射到 DSL 组件：

| 用户语义 | 映射 DSL |
|---------|----------|
| 并列/分类/对比 | `[GRID] + [CARD]` |
| 流程/时序/步骤 | `[TIMELINE]` 或 `[STEPPER]` |
| 代码/路径/函数 | `[CODE]` + 等宽字体 |
| 统计/数量/总数 | `[STATISTIC]` 或 `[STATISTIC_CARD]` |
| 折叠/展开/详情 | `[ACCORDION]` |
| 切换/选项卡 | `[TABS]` |
| 状态/类型/标签 | `[BADGE]` |
| 列表/枚举 | `[LIST]` |
| 表格/数据 | `[TABLE]` |
| 警告/提示 | `[ALERT]` |
| 弹窗/确认 | `[MODAL]` |

### 布局启发式逻辑

| 布局模式 | 规则 |
|---------|------|
| Dashboard | 侧边栏 + 主内容区 |
| Hero 区 | 占首屏主要高度 |
| 统计卡片行 | 3-4 列网格 |
| 内容区 | 居中限宽 |
| 表单 | 单列堆叠 |

### 禁止直接复读

**必须进行视觉翻译**：

```
❌ 用户说"系统包含三个模块"
   → 直接写 CONTENT: "系统包含三个模块"

✅ 用户说"系统包含三个模块"
   → 翻译为 [GRID] { Columns: "3" } + 3 个 [CARD]
```

---

## 五、DSL 语法规范

### 基本结构

```
[TAG: id]
  { LayoutProps }
  ATTR: Key("value"), Key2("value2")
  CONTENT: "文本内容"
  [CHILD: child_id]
    ...
```

**规则**：
- 缩进 2 空格表示父子关系
- `{ }` 内是布局属性
- `ATTR:` 后是组件属性
- `CONTENT:` 后是文本内容
- 简写：`[BUTTON: "Click"]` 等价于 `[BUTTON: btn] CONTENT: "Click"`

### 59 种组件类型

| 类别 | 组件 (DSL 标签) |
|------|----------------|
| **布局 (12)** | SECTION, CONTAINER, GRID, FLEX, STACK, COLUMNS, SPLIT, ROWS, CENTER, PAGE, HERO, SPACER |
| **导航 Web (7)** | HEADER, FOOTER, SIDEBAR, NAV, TABS, BREADCRUMB, STEPPER |
| **导航 Mobile (4)** | MOBILE_SHELL, BOTTOM_TABS, DRAWER, SEGMENT |
| **数据展示 (13)** | CARD, TABLE, LIST, TIMELINE, ACCORDION, STATISTIC, STATISTIC_CARD, AVATAR, TEXT, IMAGE, ICON, BADGE, CODE, QUOTE, HEADING |
| **表单 (9)** | BUTTON, INPUT, LABEL, CHECKBOX, SWITCH, SLIDER, RADIO, SELECT, FORM |
| **反馈 Web (6)** | ALERT, MODAL, PROGRESS, TOOLTIP, SKELETON, EMPTY |
| **反馈 Mobile (2)** | SHEET, ACTION_SHEET |
| **交互 Mobile (1)** | SWIPE_ACTION |
| **其他 (2)** | LINK, DIVIDER |

### 常用属性速查

**布局属性 `{ }`**：

| 属性 | 值 | 说明 |
|------|-----|------|
| `Direction` | `"Row"` / `"Column"` | 排列方向 |
| `Gap` | `"None"` / `"XS"` / `"SM"` / `"MD"` / `"LG"` / `"XL"` | 语义化间距，编译器转像素 |
| `Columns` | `"2"` / `"3"` / `"4"` | 网格列数 |
| `Align` | `"Left"` / `"Center"` / `"Right"` | 对齐方式 |
| `Justify` | `"Start"` / `"Center"` / `"End"` / `"Between"` | 主轴分布 |

**组件属性 `ATTR:`**：

| 属性 | 值 | 适用组件 |
|------|-----|---------|
| `Title("...")` | 文本 | Card, Alert, Modal |
| `Icon("...")` | Lucide 图标名 | Card, Button, Icon, Statistic |
| `Variant("...")` | `"default"` / `"destructive"` / `"outline"` / `"ghost"` | Button, Badge, Alert |
| `Size("...")` | `"XS"` / `"SM"` / `"MD"` / `"LG"` / `"XL"` | Button, Input, Avatar |
| `Placeholder("...")` | 文本 | Input, Select |
| `Href("...")` | URL | Link |
| `Src("...")` | 图片路径 | Image, Avatar |

### 图标命名（Lucide）

| 类别 | 图标 |
|------|------|
| 用户 | `User`, `Users`, `UserPlus`, `UserCheck` |
| 数据 | `Database`, `BarChart`, `TrendingUp`, `TrendingDown` |
| 操作 | `Edit`, `Trash`, `Plus`, `Search`, `Settings` |
| 状态 | `Check`, `X`, `AlertCircle`, `Info` |
| 导航 | `Home`, `Menu`, `ChevronRight`, `ArrowRight` |

---

## 六、场景关键词（编译器自动处理）

### Hash 种子原则

- `context` 是生成 Design Tokens 的种子
- **同一 `context` 保证风格完全一致**
- 修改页面时不要改 `context`

### 场景识别

编译器根据 `context` 中的关键词自动选择视觉风格（支持中英文）：

| 场景 | 中文关键词 | 英文关键词 | 自动效果 |
|------|-----------|-----------|---------|
| 技术 | 技术、架构、开发、代码、系统 | Technical, API, System, Code | 蓝色、normal 间距 |
| 金融 | 金融、财务、银行、投资、交易 | Finance, Banking, Trading | 靛蓝、compact、sharp |
| 企业 | 企业、管理、办公、后台、报表 | Enterprise, Admin, Dashboard | 蓝色、compact |
| 医疗 | 医疗、健康、医院、诊断 | Medical, Health, Hospital | 青色、soft 圆角 |
| 教育 | 教育、儿童、学习、课程 | Education, Learning, Course | 橙色、spacious、pill |
| 创意 | 创意、营销、设计、品牌 | Creative, Marketing, Design | 紫色、rich 装饰 |

**AI 只需在 context 写对关键词**，颜色/间距/圆角由编译器自动生成。

---

## 七、内容防幻觉与占位符

### 原文优先原则

**必须保留用户输入的硬核事实**：
- 文件路径：`lib/zcpg/rlm/controller.ex`
- 函数名：`handle_opencode_call/7`
- 技术术语：SSE、REPL、AST

### 优雅填充

当信息不足时，**允许生成合理占位**：

| 信息类型 | 占位示例 |
|---------|---------|
| 日期 | `"2024-01-15"` |
| 版本 | `"v1.0.0"` |
| 统计数值 | `"12,345"` |
| 趋势 | `"+12.5%"` |

---

## 八、负面约束

| 禁止 | 说明 |
|------|------|
| ❌ 输出内部标识 | 禁止向用户暴露 `screen_id` |
| ❌ 使用非法组件 | 只能用 59 种组件类型 |
| ❌ 直接复读 | 必须进行视觉翻译 |
| ❌ 跨平台混用 | web 不能用 BOTTOM_TABS/DRAWER/SHEET |
| ❌ Mobile 用 SIDEBAR | Mobile 严禁用 SIDEBAR |
| ❌ Mobile 用 TABLE | Mobile 必须用 LIST + CARD 替代 |
| ❌ Mobile 依赖 Hover | Mobile 禁止依赖 Hover 交互 |
| ❌ 写 CSS/HTML | 只写 DSL，编译器负责渲染 |
| ❌ 改 context | 修改页面时保持 context 不变 |

---

## 九、完整示例

### 示例一：新建项目

用户：做一个用户管理后台

**操作**：Write 创建项目 JSON 文件

```json
{
  "context": "企业管理系统",
  "platform": "web",
  "screens": [
    {
      "screen_id": "dashboard",
      "title": "仪表盘",
      "dsl": "[FLEX: layout]\n  { Direction: \"Row\", Gap: \"None\" }\n\n  [SIDEBAR: sidebar]\n    [HEADING: logo] CONTENT: \"Admin\"\n    [NAV: menu]\n      [FLEX: nav_1]\n        { Gap: \"SM\", Align: \"Center\" }\n        [ICON: i1] ATTR: Icon(\"LayoutDashboard\")\n        [TEXT: t1] CONTENT: \"仪表盘\"\n      [FLEX: nav_2]\n        { Gap: \"SM\", Align: \"Center\" }\n        [ICON: i2] ATTR: Icon(\"Users\")\n        [TEXT: t2] CONTENT: \"用户管理\"\n\n  [SECTION: main]\n    [HEADER: topbar]\n      [HEADING: title] CONTENT: \"仪表盘\"\n      [BUTTON: add] ATTR: Icon(\"Plus\") CONTENT: \"新增\"\n\n    [GRID: stats]\n      { Columns: \"3\", Gap: \"LG\" }\n      [STATISTIC_CARD: s1]\n        ATTR: Title(\"总用户\"), Icon(\"Users\")\n        CONTENT: \"12,345\"\n      [STATISTIC_CARD: s2]\n        ATTR: Title(\"活跃用户\"), Icon(\"Activity\")\n        CONTENT: \"8,901\"\n      [STATISTIC_CARD: s3]\n        ATTR: Title(\"新增用户\"), Icon(\"UserPlus\")\n        CONTENT: \"234\""
    }
  ]
}
```

然后执行：`Bash: COMPILE_INPUT=screens/project.json COMPILE_OUTPUT=output/ npm run stitch`

### 示例二：添加页面

用户：再加一个用户列表页

**操作**：
1. `Read screens/project.json`
2. `Edit screens/project.json` - 往 screens 数组添加新对象：

```json
{
  "screen_id": "users",
  "title": "用户管理",
  "dsl": "[FLEX: layout]\n  { Direction: \"Row\", Gap: \"None\" }\n\n  [SIDEBAR: sidebar]\n    ...\n\n  [SECTION: main]\n    [HEADER: topbar]\n      [HEADING: title] CONTENT: \"用户管理\"\n      [BUTTON: add_user] ATTR: Icon(\"UserPlus\") CONTENT: \"新增用户\"\n\n    [CARD: user_list]\n      ATTR: Title(\"用户列表\")\n      [TABLE: users]\n        [TEXT: th1] CONTENT: \"用户名\"\n        [TEXT: th2] CONTENT: \"邮箱\"\n        [TEXT: th3] CONTENT: \"状态\"\n        [TEXT: th4] CONTENT: \"操作\""
}
```

3. `Bash: COMPILE_INPUT=screens/project.json COMPILE_OUTPUT=output/ npm run stitch`

### 示例三：修改页面

用户：在用户列表上面加个搜索框

**操作**：
1. `Read screens/project.json`
2. `Edit screens/project.json` - 找到 users 页面，修改其 dsl 字段，在 TABLE 前添加：

```
[FLEX: filters]
  { Gap: "MD", Align: "Center" }
  [INPUT: search] ATTR: Placeholder("搜索用户...")
  [SELECT: status] ATTR: Placeholder("状态筛选")
```

3. `Bash: COMPILE_INPUT=screens/project.json COMPILE_OUTPUT=output/ npm run stitch`

### 示例四：Mobile App（TabBar 模式）

用户：做一个外卖点餐 App

**操作**：Write 创建项目 JSON 文件

```json
{
  "context": "外卖点餐 App",
  "platform": "mobile",
  "mobile_navigation": ["首页", "订单", "我的"],
  "screens": [
    {
      "screen_id": "home",
      "title": "首页",
      "dsl": "[MOBILE_SHELL: shell]\n\n  [STACK: main]\n    { Gap: \"MD\" }\n\n    [FLEX: search_bar]\n      { Gap: \"SM\", Align: \"Center\" }\n      [ICON: loc] ATTR: Icon(\"MapPin\")\n      [INPUT: search] ATTR: Placeholder(\"搜索商家或菜品\")\n\n    [GRID: categories]\n      { Columns: \"5\", Gap: \"SM\" }\n      [STACK: cat1]\n        [ICON: i1] ATTR: Icon(\"Utensils\")\n        [TEXT: t1] CONTENT: \"美食\"\n      [STACK: cat2]\n        [ICON: i2] ATTR: Icon(\"Coffee\")\n        [TEXT: t2] CONTENT: \"饮品\"\n      [STACK: cat3]\n        [ICON: i3] ATTR: Icon(\"Cake\")\n        [TEXT: t3] CONTENT: \"甜点\"\n\n    [LIST: merchants]\n      [CARD: m1]\n        ATTR: Title(\"美味小厨\"), Icon(\"Star\")\n        CONTENT: \"4.8分 · 配送约30分钟\"\n      [CARD: m2]\n        ATTR: Title(\"快乐汉堡\"), Icon(\"Star\")\n        CONTENT: \"4.6分 · 配送约25分钟\"\n\n  [BOTTOM_TABS: tabs]"
    }
  ]
}
```

### 示例五：Mobile App（Drawer 模式）

用户：做一个功能比较多的移动端管理工具

**操作**：Write 创建项目 JSON 文件

```json
{
  "context": "RLM 移动端管理工具",
  "platform": "mobile",
  "mobile_navigation": null,
  "screens": [
    {
      "screen_id": "home",
      "title": "RLM 管理",
      "dsl": "[MOBILE_SHELL: shell]\n\n  [HEADER: topbar]\n    ATTR: Title(\"RLM 管理\"), Icon(\"Menu\")\n\n  [DRAWER: menu]\n    [LIST: nav]\n      [FLEX: n1]\n        { Gap: \"SM\" }\n        [ICON: i1] ATTR: Icon(\"Activity\")\n        [TEXT: t1] CONTENT: \"状态监控\"\n      [FLEX: n2]\n        { Gap: \"SM\" }\n        [ICON: i2] ATTR: Icon(\"FileText\")\n        [TEXT: t2] CONTENT: \"执行日志\"\n      [FLEX: n3]\n        { Gap: \"SM\" }\n        [ICON: i3] ATTR: Icon(\"GitBranch\")\n        [TEXT: t3] CONTENT: \"逻辑节点\"\n      [FLEX: n4]\n        { Gap: \"SM\" }\n        [ICON: i4] ATTR: Icon(\"Settings\")\n        [TEXT: t4] CONTENT: \"系统设置\"\n      [FLEX: n5]\n        { Gap: \"SM\" }\n        [ICON: i5] ATTR: Icon(\"HelpCircle\")\n        [TEXT: t5] CONTENT: \"帮助中心\"\n      [FLEX: n6]\n        { Gap: \"SM\" }\n        [ICON: i6] ATTR: Icon(\"LogOut\")\n        [TEXT: t6] CONTENT: \"退出登录\"\n\n  [STACK: main]\n    { Gap: \"MD\" }\n    [CARD: status]\n      ATTR: Title(\"系统状态\"), Icon(\"CheckCircle\")\n      CONTENT: \"运行中\"\n    [CARD: recent]\n      ATTR: Title(\"最近执行\")\n      [LIST: logs]\n        [TEXT: l1] CONTENT: \"任务 #1234 完成\"\n        [TEXT: l2] CONTENT: \"任务 #1233 完成\""
    }
  ]
}
```

---

## 十、交互建议

完成操作后，提供 2-3 个后续建议：

| 场景 | 建议示例 |
|------|---------|
| 新建项目后 | "添加用户详情页"、"添加设置页面" |
| 修改页面后 | "添加数据导出按钮"、"切换暗色主题" |
| 技术文档 | "添加代码示例"、"增加流程图" |

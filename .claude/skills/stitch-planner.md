# Stitch UI 规划层

当用户需要创建 UI 页面时，分析需求并输出布局意图描述。

## 输出格式

输出 **意图描述 JSON**，描述页面的逻辑结构和语义，不涉及具体组件。

```json
{
  "page_type": "dashboard | landing | form | detail | list",
  "sections": [
    {
      "intent": "hero | feature_grid | stats | form | table | steps | comparison",
      "title": "标题（可选）",
      "items": [...]
    }
  ]
}
```

## 意图类型

### hero - 主视觉区
```json
{
  "intent": "hero",
  "title": "主标题",
  "subtitle": "副标题",
  "cta": {"label": "按钮文字", "action": "..."}
}
```

### feature_grid - 功能/特性网格
```json
{
  "intent": "feature_grid",
  "columns": 3,
  "items": [
    {"title": "功能名", "description": "描述", "icon": "icon-name"}
  ]
}
```

### stats - 统计数据
```json
{
  "intent": "stats",
  "items": [
    {"label": "总用户", "value": "12,345", "trend": "up", "change": "+12%"}
  ]
}
```

### form - 表单
```json
{
  "intent": "form",
  "title": "表单标题",
  "fields": [
    {"name": "username", "label": "用户名", "type": "text", "required": true},
    {"name": "password", "label": "密码", "type": "password"}
  ],
  "actions": [
    {"label": "提交", "primary": true},
    {"label": "取消"}
  ]
}
```

### table - 数据表格
```json
{
  "intent": "table",
  "title": "表格标题",
  "columns": [
    {"key": "name", "label": "姓名"},
    {"key": "status", "label": "状态", "type": "badge"}
  ],
  "data_source": "描述数据来源"
}
```

### steps - 步骤流程
```json
{
  "intent": "steps",
  "items": [
    {"title": "步骤1", "description": "说明"},
    {"title": "步骤2", "description": "说明"}
  ]
}
```

### comparison - 对比
```json
{
  "intent": "comparison",
  "items": [
    {"title": "方案A", "points": ["优点1", "优点2"]},
    {"title": "方案B", "points": ["优点1", "优点2"]}
  ]
}
```

### content - 内容区块
```json
{
  "intent": "content",
  "layout": "single | split",
  "items": [
    {"type": "text", "content": "..."},
    {"type": "code", "language": "elixir", "content": "..."},
    {"type": "list", "items": ["item1", "item2"]}
  ]
}
```

### card_grid - 卡片网格
```json
{
  "intent": "card_grid",
  "columns": 2,
  "items": [
    {
      "title": "卡片标题",
      "description": "描述",
      "footer": {"actions": [{"label": "查看"}]}
    }
  ]
}
```

## 决策流程

```
用户输入
    ↓
1. 识别页面类型
   - 有统计数据? → dashboard
   - 有表单? → form
   - 产品介绍? → landing
   - 数据列表? → list
    ↓
2. 拆分内容区块，确定每个区块的 intent
    ↓
3. 提取每个区块的具体内容
    ↓
输出意图描述 JSON
```

## 示例

**用户输入**：
> 做一个用户管理页面，顶部显示用户总数、活跃用户、新增用户三个统计，下面是用户列表表格

**输出**：
```json
{
  "page_type": "dashboard",
  "sections": [
    {
      "intent": "stats",
      "items": [
        {"label": "用户总数", "value": "待填充", "trend": "up"},
        {"label": "活跃用户", "value": "待填充", "trend": "up"},
        {"label": "新增用户", "value": "待填充", "trend": "up"}
      ]
    },
    {
      "intent": "table",
      "title": "用户列表",
      "columns": [
        {"key": "name", "label": "用户名"},
        {"key": "email", "label": "邮箱"},
        {"key": "status", "label": "状态", "type": "badge"},
        {"key": "created_at", "label": "注册时间"}
      ],
      "data_source": "用户数据"
    }
  ]
}
```

## 注意事项

1. **只输出意图，不输出组件**：不要写 `Card`、`Grid` 等组件名
2. **保持语义化**：用业务语言描述，如 "stats"、"form"、"table"
3. **提取所有内容**：确保用户提供的信息都被捕获到 JSON 中
4. **标注数据源**：对于动态数据，说明数据从哪里来

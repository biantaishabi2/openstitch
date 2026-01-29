# AI DSL 调整提示词

> 用于 Workflow 步骤 3: AI 检查/调整 DSL

## 参考图片

请对比以下两张图片来检查 DSL 是否需要调整：
- Figma 设计原图：`reference/figma-design.png`
- 当前生成的 HTML 截图：`generated/screenshot.png`

## 当前 DSL

```dsl
{{CURRENT_DSL}}
```

## 任务

请对比 Figma 设计图和生成的截图，检查以下方面：

### 1. 布局结构
- [ ] 整体布局是否一致（网格、行列数）
- [ ] 元素间距是否正确
- [ ] 对齐方式是否匹配

### 2. 视觉样式
- [ ] 背景色是否一致
- [ ] 卡片圆角是否匹配
- [ ] 阴影效果是否一致
- [ ] 边框是否正确

### 3. 内容元素
- [ ] 图标是否正确显示
- [ ] 文字内容是否完整
- [ ] 文字颜色/大小是否匹配

### 4. 尺寸精度
- [ ] 整体尺寸是否接近
- [ ] 元素比例是否正确

## 输出格式

如果发现差异，请输出调整后的 DSL：

```json
{
  "hasIssues": true,
  "issues": [
    {
      "type": "layout",
      "element": "功能卡片网格",
      "problem": "缺少 grid 布局，卡片没有正确排列",
      "solution": "添加 grid grid-cols-3 gap-4"
    },
    {
      "type": "color", 
      "element": "卡片背景",
      "problem": "使用硬编码颜色 #ffffff",
      "solution": "改为 bg-white 或使用 token"
    }
  ],
  "adjustedDSL": "[SECTION: ...]"
}
```

如果没有问题：

```json
{
  "hasIssues": false,
  "issues": [],
  "adjustedDSL": "{{CURRENT_DSL}}"
}
```

## DSL 调整规则

### 布局类优先使用 Tailwind
- 网格: `grid grid-cols-3 gap-4`
- Flex: `flex flex-col items-center`
- 间距: `p-4`, `m-2`, `gap-4`
- 尺寸: `w-full`, `h-10`

### 颜色使用语义化
- 白色背景: `bg-white` 而不是 `bg-[#ffffff]`
- 主色: `text-primary` 或 `text-blue-500`
- 灰色: `text-gray-500` 而不是 `text-[#666666]`

### 命名语义化
- `Rectangle_1` → `banner`
- `Group_1` → `user_card`
- `1` → `welfare_card`

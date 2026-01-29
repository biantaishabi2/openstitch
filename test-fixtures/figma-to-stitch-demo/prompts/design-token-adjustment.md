# Design Token 调整提示词

> 用于 Workflow 步骤 5: AI 调整颜色分配

## 参考图片

请查看 Figma 设计原图来确认颜色实际用途：
- 路径：`reference/figma-design.png`

## 颜色聚类结果分析

## 颜色聚类结果分析

```
分析 Figma 颜色聚类结果，看这些颜色实际用在哪里：
1. primary 应该是用在最多地方的彩色
2. 如果一个颜色只用在少数元素，它可能不是品牌色
3. 把同色系的相近颜色合并
4. secondary 应该是与 primary 色相不同的次要品牌色

根据元素的实际用途分配语义，不是按频率。
```

## 颜色分配规则

### 语义分配优先级

| Token | 规则 |
|-------|------|
| `--primary` | 使用频率最高的彩色（品牌色） |
| `--secondary` | 次高频且色相与 primary 不同 |
| `--accent` | 高饱和度强调色（可与 primary 相同） |
| `--background` | 最浅的中性色（通常白色或极浅灰） |
| `--foreground` | 最深的中性色（通常黑色或深灰） |
| `--muted` | 浅灰背景（用于次要区域） |
| `--muted-foreground` | 中灰文本（用于次要文字） |
| `--border` | 边框灰色（用于分割线） |

### 常见问题处理

**Q: 两个蓝色都被识别为不同颜色？**

A: 把同色系的相近颜色合并，使用主蓝色。

**Q: 提取的颜色和 Figma 不完全一致？**

A: 可能原因：
1. Figma 使用了局部变量（Variable）
2. 颜色透明度被忽略
3. 渐变颜色需要特殊处理

**Q: 中性色分配不正确？**

A: 中性色按亮度分配：
- 最浅 → `--background`
- 最深 → `--foreground`
- 浅灰 → `--muted`
- 中灰 → `--muted-foreground`

## 输出格式

```json
{
  "tokens": {
    "--primary": "#00B5FF",
    "--secondary": "#65C47A",
    "--accent": "#FF9D00",
    "--background": "#FFFFFF",
    "--foreground": "#333333",
    "--muted": "#F7F7F7",
    "--muted-foreground": "#666666",
    "--border": "#E5E5E5"
  },
  "changes": [
    { "key": "--primary", "from": "#0098ff", "to": "#00B5FF", "reason": "更接近设计稿的品牌蓝" }
  ]
}
```

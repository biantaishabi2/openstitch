# Figma Adapter V1 设计文档

## 核心前提

```
┌─────────────────────────────────────────────────────────────────┐
│  设计师的 Figma（视觉正确，结构混乱）                              │
│  - 无 AutoLayout                                                │
│  - 命名混乱（Rectangle 4, Group 1）                              │
│  - 层级冗余（装饰节点多）                                         │
│  - 但：颜色、尺寸、间距、圆角都是设计师想要的                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │   Adapter V1    │
                    │  （提取 + 结构化） │
                    └─────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  规范的 DSL（结构清晰，保留视觉细节）                               │
│  - 正确的组件类型（CARD 而非 GROUP）                              │
│  - 规范的布局（grid-cols-3 gap-4）                               │
│  - 保留的视觉细节（精确的尺寸、颜色、圆角）                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │   AI 修正        │
                    │  （像素级还原）   │
                    └─────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  最终 HTML（还原度 > 95%）                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Adapter V1 的职责边界

### Adapter 做什么（提取 + 结构化）

| 任务 | 说明 | 示例 |
|------|------|------|
| **提取视觉细节** | 从混乱节点中提取设计师想要的视觉属性 | 白色背景 104x94、圆角 8px |
| **识别内容资产** | 识别文字、图片、图标 | "福利平台" 文字、40x40 图标 |
| **过滤纯装饰** | 移除不影响视觉的节点 | 小装饰条、重复背景 |
| **识别结构模式** | 从位置推断布局意图 | 9 个卡片等间距 → 3x3 grid |
| **生成规范 DSL** | 组合视觉细节 + 结构意图 | CARD + grid-cols-3 + 精确尺寸 |

### Adapter 不做什么（留给 AI）

| 任务 | 说明 | 原因 |
|------|------|------|
| **像素级微调** | 精确到 1px 的间距调整 | 需要对比截图 |
| **语义化命名** | primary/secondary 颜色命名 | 需要理解设计意图 |
| **响应式适配** | 不同屏幕尺寸的布局 | 需要设计判断 |
| **交互状态** | hover/active 样式 | 需要额外设计 |

## 核心算法设计

### 1. 视觉细节提取（Visual Detail Extraction）

```typescript
interface VisualDetails {
  // 尺寸（精确值）
  size: {
    width: number;
    height: number;
  };
  
  // 位置（用于计算间距）
  position: {
    x: number;
    y: number;
  };
  
  // 背景（从 fills 或背景子节点提取）
  background?: {
    type: 'solid' | 'image' | 'gradient';
    color?: string;
    imageRef?: string;
  };
  
  // 圆角
  borderRadius?: number;
  
  // 阴影
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  
  // 边框
  border?: {
    color: string;
    width: number;
  };
  
  // 文字样式
  typography?: {
    fontSize: number;
    fontWeight: number;
    color: string;
    lineHeight?: number;
  };
}

// 提取函数
function extractVisualDetails(node: FigmaNode): VisualDetails {
  const box = node.absoluteBoundingBox;
  
  return {
    size: {
      width: box?.width || 0,
      height: box?.height || 0,
    },
    position: {
      x: box?.x || 0,
      y: box?.y || 0,
    },
    background: extractBackground(node),
    borderRadius: node.cornerRadius,
    shadow: extractShadow(node),
    border: extractBorder(node),
    typography: node.type === 'TEXT' ? extractTypography(node) : undefined,
  };
}
```

### 2. 内容资产识别（Content Asset Recognition）

```typescript
interface ContentAssets {
  // 文字内容
  text?: {
    content: string;
    style: TextStyle;
  };
  
  // 图片
  image?: {
    ref: string;
    url?: string;
  };
  
  // 图标
  icon?: {
    name: string;
    // 简化后的图标路径或引用
    svg?: string;
  };
}

// 识别卡片内容
function recognizeCardContent(node: FigmaNode): ContentAssets {
  const children = node.children || [];
  
  // 1. 找文字（通常是 TEXT 节点）
  const textNode = children.find(c => c.type === 'TEXT');
  
  // 2. 找图标（Vector 或包含 Vector 的 FRAME，尺寸较小）
  const iconNode = children.find(c => {
    if (c.type === 'VECTOR') return true;
    if (c.type === 'FRAME' && c.absoluteBoundingBox) {
      const { width, height } = c.absoluteBoundingBox;
      return width <= 48 && height <= 48;
    }
    return false;
  });
  
  // 3. 找图片（IMAGE fill 的 RECTANGLE）
  const imageNode = children.find(c => hasImageFill(c));
  
  return {
    text: textNode ? {
      content: textNode.characters || '',
      style: extractTextStyle(textNode),
    } : undefined,
    icon: iconNode ? {
      name: sanitizeName(iconNode.name),
    } : undefined,
    image: imageNode ? {
      ref: extractImageRef(imageNode),
    } : undefined,
  };
}
```

### 3. 装饰节点过滤（Decoration Filtering）

```typescript
// 判断是否是纯装饰节点
function isPureDecoration(node: FigmaNode, context: Context): boolean {
  // 1. 面积极小（< 5px）
  const area = getNodeArea(node);
  if (area < 25) return true;
  
  // 2. 完全透明
  if (getOpacity(node) < 0.05) return true;
  
  // 3. 被父节点完全覆盖（重复背景）
  if (isDuplicateBackground(node, context.parent)) return true;
  
  // 4. 父节点是卡片，此节点是白色背景矩形且面积接近父节点
  if (isCardBackground(node, context.parent)) return true;
  
  return false;
}

// 判断是否是卡片的背景装饰
function isCardBackground(node: FigmaNode, parent: FigmaNode | null): boolean {
  if (!parent) return false;
  if (node.type !== 'RECTANGLE') return false;
  
  const nodeBox = node.absoluteBoundingBox;
  const parentBox = parent.absoluteBoundingBox;
  
  if (!nodeBox || !parentBox) return false;
  
  // 白色填充
  const fills = node.fills || [];
  if (fills.length === 0 || fills[0].type !== 'SOLID') return false;
  
  const color = fills[0].color;
  if (!color || color.r < 0.95 || color.g < 0.95 || color.b < 0.95) return false;
  
  // 面积接近父节点（80% 以上）
  const nodeArea = nodeBox.width * nodeBox.height;
  const parentArea = parentBox.width * parentBox.height;
  const ratio = nodeArea / parentArea;
  
  return ratio > 0.8 && ratio <= 0.98;
}
```

### 4. 结构模式识别（Pattern Recognition）

```typescript
// 识别结构模式
type StructurePattern = 
  | { type: 'card-grid'; cols: number; gap: number }
  | { type: 'list'; direction: 'horizontal' | 'vertical'; gap: number }
  | { type: 'flex-row'; justify: string; gap: number }
  | { type: 'flex-col'; gap: number }
  | { type: 'absolute' };

function detectStructurePattern(nodes: FigmaNode[]): StructurePattern {
  if (nodes.length < 2) return { type: 'absolute' };
  
  // 1. 检查是否是网格布局
  const gridPattern = detectGridPattern(nodes);
  if (gridPattern && gridPattern.cols >= 2) {
    return {
      type: 'card-grid',
      cols: gridPattern.cols,
      gap: gridPattern.gap,
    };
  }
  
  // 2. 检查是否是水平列表
  const horizontalPattern = detectHorizontalPattern(nodes);
  if (horizontalPattern.isHorizontal) {
    return {
      type: 'flex-row',
      justify: 'center',
      gap: horizontalPattern.gap,
    };
  }
  
  // 3. 检查是否是垂直列表
  const verticalPattern = detectVerticalPattern(nodes);
  if (verticalPattern.isVertical) {
    return {
      type: 'flex-col',
      gap: verticalPattern.gap,
    };
  }
  
  return { type: 'absolute' };
}

// 检测网格模式
function detectGridPattern(nodes: FigmaNode[]): { cols: number; gap: number } | null {
  if (nodes.length < 4) return null;
  
  // 获取所有节点的位置
  const positions = nodes
    .map(n => n.absoluteBoundingBox)
    .filter((b): b is NonNullable<typeof b> => b !== undefined);
  
  // 按 Y 坐标分组（找行）
  const yGroups = groupByY(positions);
  
  // 如果只有一行，不是网格
  if (yGroups.length < 2) return null;
  
  // 检查每行的列数是否一致
  const colCounts = yGroups.map(g => g.length);
  const allSameCols = colCounts.every(c => c === colCounts[0]);
  
  if (!allSameCols) return null;
  
  // 计算列间距
  const firstRow = yGroups[0];
  const gaps: number[] = [];
  for (let i = 1; i < firstRow.length; i++) {
    const prev = firstRow[i - 1];
    const curr = firstRow[i];
    gaps.push(curr.x - (prev.x + prev.width));
  }
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  
  return {
    cols: colCounts[0],
    gap: Math.round(avgGap / 4) * 4, // 对齐到 4px 栅格
  };
}
```

### 5. DSL 生成（保留视觉细节）

```typescript
// 生成 DSL
function generateDSL(processedItems: ProcessedItem[]): string {
  const lines: string[] = [];
  
  for (const item of processedItems) {
    lines.push(generateItemDSL(item, 0));
  }
  
  return lines.join('\n');
}

function generateItemDSL(item: ProcessedItem, depth: number): string {
  const indent = '  '.repeat(depth);
  const lines: string[] = [];
  
  const tag = mapComponentType(item.componentType);
  const id = item.semanticName;
  
  // 节点标签
  lines.push(`${indent}[${tag}: ${id}]`);
  
  // ClassName（保留视觉细节）
  const className = buildPreciseClassName(item.visualDetails);
  if (className) {
    lines.push(`${indent}  { ClassName: "${className}" }`);
  }
  
  // 文本内容
  if (item.content.text) {
    lines.push(`${indent}  CONTENT: "${escapeString(item.content.text.content)}"`);
  }
  
  // 图片资源
  if (item.content.image) {
    lines.push(`${indent}  ATTR: Src("${item.content.image.ref}"), Alt("${id}")`);
  }
  
  // 子节点
  for (const child of item.children) {
    lines.push(generateItemDSL(child, depth + 1));
  }
  
  return lines.join('\n');
}

// 构建精确的 ClassName（保留视觉细节）
function buildPreciseClassName(visual: VisualDetails): string | null {
  const classes: string[] = [];
  
  // 精确尺寸（使用任意值语法）
  if (visual.size.width) {
    classes.push(`w-[${visual.size.width}px]`);
  }
  if (visual.size.height) {
    classes.push(`h-[${visual.size.height}px]`);
  }
  
  // 背景
  if (visual.background?.type === 'solid' && visual.background.color) {
    classes.push(`bg-[${visual.background.color}]`);
  }
  
  // 圆角
  if (visual.borderRadius) {
    classes.push(`rounded-[${visual.borderRadius}px]`);
  }
  
  // 阴影（简化处理，AI 后续微调）
  if (visual.shadow) {
    classes.push('shadow-sm');
  }
  
  // 文字样式
  if (visual.typography) {
    classes.push(`text-[${visual.typography.fontSize}px]`);
    if (visual.typography.fontWeight >= 600) {
      classes.push('font-semibold');
    }
    if (visual.typography.color) {
      classes.push(`text-[${visual.typography.color}]`);
    }
  }
  
  return classes.length > 0 ? classes.join(' ') : null;
}
```

## 完整处理流程

```typescript
async function convertFigmaToStitchV1(
  figmaFile: FigmaFile,
  options: AdapterV1Options
): Promise<AdapterV1Result> {
  const logs: string[] = [];
  
  // 1. 提取有效节点
  const validNodes = extractValidNodes(figmaFile.document);
  logs.push(`[EXTRACT] ${validNodes.length} valid nodes`);
  
  // 2. 找到根节点
  const rootFrames = findRootFrames(validNodes);
  logs.push(`[ROOTS] ${rootFrames.length} root frames`);
  
  // 3. 处理每个根节点
  const processedItems: ProcessedItem[] = [];
  
  for (const root of rootFrames) {
    // 3.1 提取视觉细节
    const visual = extractVisualDetails(root);
    
    // 3.2 识别内容资产
    const content = recognizeCardContent(root);
    
    // 3.3 处理子节点（过滤装饰节点）
    const children: ProcessedItem[] = [];
    for (const child of root.children || []) {
      if (isPureDecoration(child, { parent: root, siblings: root.children || [] })) {
        logs.push(`[FILTER] ${child.name}: decoration`);
        continue;
      }
      
      const processedChild = await processNode(child, root, options, logs);
      children.push(processedChild);
    }
    
    // 3.4 识别结构模式
    const siblings = rootFrames.filter(r => r.id !== root.id);
    const pattern = detectStructurePattern(siblings);
    
    // 3.5 推断语义化名称
    const semanticName = inferSemanticName(root, content);
    
    processedItems.push({
      original: root,
      semanticName,
      componentType: pattern.type === 'card-grid' ? 'Card' : 'Section',
      visualDetails: visual,
      content,
      children,
      pattern,
    });
  }
  
  // 4. 生成 DSL
  const dsl = generateDSL(processedItems);
  logs.push(`[DSL] Generated ${dsl.split('\n').length} lines`);
  
  // 5. 提取 Design Tokens
  const tokens = extractDesignTokens(validNodes);
  
  return {
    dsl,
    tokens,
    processedItems,
    logs,
    stats: {
      totalNodes: validNodes.length,
      processedNodes: processedItems.length,
      filteredNodes: logs.filter(l => l.includes('[FILTER]')).length,
    },
  };
}
```

## 与 AI 的分工边界

| 阶段 | Adapter V1 | AI 修正 |
|------|-----------|---------|
| **输入** | Figma JSON | Adapter 输出的 DSL + Figma 截图 |
| **结构** | 识别并生成规范结构 | 验证并微调结构 |
| **视觉细节** | 提取精确的尺寸、颜色、圆角 | 像素级微调（±1-2px） |
| **命名** | 基于内容的语义化命名 | 优化为更语义化的命名 |
| **颜色** | 提取原始颜色值 | 映射到设计系统命名 |
| **响应式** | 基础布局（grid/flex） | 添加响应式断点 |
| **输出** | 规范的 DSL | 最终精确的 DSL |

## 预期效果

### 输入（混乱的 Figma）
```
1 (GROUP)
├── Rectangle 4 (RECTANGLE) 104x94 - 白色背景
├── 福利平台 (TEXT) - 文字
├── Rectangle 5 (RECTANGLE) 25x10 - 小装饰条
└── icon_弹性福利平台 1 (FRAME) 40x40 - 图标
```

### 输出（规范的 DSL）
```dsl
[CARD: 福利平台]
  { ClassName: "w-[104px] h-[94px] bg-[#ffffff] rounded-[8px]" }
  [ICON: 弹性福利平台]
    { ClassName: "w-[40px] h-[40px]" }
  [TEXT: 标题]
    { ClassName: "text-[14px] text-[#333333]" }
    CONTENT: "福利平台"
```

### AI 后续修正
```dsl
[CARD: 福利平台]
  { ClassName: "flex flex-col items-center p-4 bg-white rounded-lg shadow-sm" }
  [ICON: 福利]
    { ClassName: "w-10 h-10 text-primary" }
  [TEXT: 标题]
    { ClassName: "text-sm font-medium mt-2 text-gray-800" }
    CONTENT: "福利平台"
```

## 文件位置

```
src/figma/adapter-v1/
├── index.ts           # 主入口
├── types.ts           # 类型定义
├── node-processor.ts  # 节点处理（过滤、提取）
├── pattern-detector.ts # 模式识别
├── dsl-generator.ts   # DSL 生成
└── README.md          # 使用文档
```

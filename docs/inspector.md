# Stitch Inspector - 组件调试工具

## 概述

Stitch Inspector 是一个轻量级的调试工具，用于在导出的静态 HTML 页面上检查组件信息。

**核心功能：**
- 鼠标悬浮高亮组件边界
- 显示组件类型、路径、属性
- 一键复制组件信息（便于传给 AI 修改）
- 点击跳转到 JSON Schema 编辑器

## 使用场景

```
用户流程：
1. 在 React Demo 页面设计 UI
2. 导出静态 HTML（带 debug 模式）
3. 在 HTML 页面上悬浮查看组件
4. 复制组件信息给 AI："请把这个按钮改成红色"
5. AI 根据路径信息精准定位并修改 JSON Schema
```

## 架构设计

### 数据流

```
┌─────────────────────────────────────────────────────────────┐
│                      JSON Schema                            │
│  {                                                          │
│    "type": "Button",                                        │
│    "id": "hero-cta",           ← 可选的组件 ID              │
│    "props": { "variant": "primary" },                       │
│    "children": "开始使用"                                    │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   React 渲染器 (debug 模式)                  │
│  renderNode() 添加 data-stitch-* 属性                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      导出的 HTML                            │
│  <button                                                    │
│    data-stitch-type="Button"                                │
│    data-stitch-id="hero-cta"                                │
│    data-stitch-path="children.0.children.1"                 │
│    data-stitch-props='{"variant":"primary"}'                │
│  >                                                          │
│    开始使用                                                  │
│  </button>                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Inspector 脚本                            │
│  监听 hover → 解析 data 属性 → 显示浮层                      │
└─────────────────────────────────────────────────────────────┘
```

### data 属性规范

| 属性 | 说明 | 示例 |
|-----|------|------|
| `data-stitch-type` | 组件类型 | `Button`, `Card`, `Tabs` |
| `data-stitch-id` | 组件 ID（可选） | `hero-cta`, `main-nav` |
| `data-stitch-path` | 在 JSON Schema 中的路径 | `children.0.children.1` |
| `data-stitch-props` | 组件属性（JSON 字符串） | `{"variant":"primary"}` |
| `data-stitch-depth` | 嵌套深度 | `0`, `1`, `2` |

## 实现步骤

### 步骤 1: 扩展渲染器

修改 `src/lib/renderer/renderer.tsx`，在 debug 模式下添加更多属性：

```typescript
// 当前实现
if (context.config.debug) {
  finalProps['data-stitch-type'] = type;
  finalProps['data-stitch-depth'] = context.depth;
}

// 扩展后
if (context.config.debug) {
  finalProps['data-stitch-type'] = type;
  finalProps['data-stitch-depth'] = context.depth;

  // 新增：组件路径
  if (context.path) {
    finalProps['data-stitch-path'] = context.path;
  }

  // 新增：组件 ID
  if (id) {
    finalProps['data-stitch-id'] = id;
  }

  // 新增：组件属性（序列化）
  if (props && Object.keys(props).length > 0) {
    finalProps['data-stitch-props'] = JSON.stringify(props);
  }
}
```

同时更新 `RenderContext` 类型：

```typescript
interface RenderContext {
  depth: number;
  config: RendererConfig;
  parentType?: string;
  path?: string;  // 新增：当前路径
}
```

更新 `renderNode` 函数，传递路径：

```typescript
// 处理子节点时传递路径
if (Array.isArray(children)) {
  renderedChildren = children.map((child, index) => {
    const childContext: RenderContext = {
      ...context,
      depth: context.depth + 1,
      path: context.path ? `${context.path}.children.${index}` : `children.${index}`,
    };
    return renderNode(child, childContext);
  });
}
```

### 步骤 2: 创建 Inspector 脚本

创建 `src/lib/inspector/inspector.ts`：

```typescript
/**
 * Stitch Inspector - 组件调试工具
 */

interface StitchComponentInfo {
  type: string;
  id?: string;
  path?: string;
  props?: Record<string, any>;
  depth?: number;
  element: HTMLElement;
}

class StitchInspector {
  private overlay: HTMLDivElement | null = null;
  private tooltip: HTMLDivElement | null = null;
  private currentElement: HTMLElement | null = null;
  private enabled: boolean = false;

  constructor() {
    this.createOverlay();
    this.createTooltip();
    this.bindEvents();
  }

  /** 创建高亮覆盖层 */
  private createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'stitch-inspector-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      z-index: 99998;
      display: none;
      transition: all 0.1s ease;
    `;
    document.body.appendChild(this.overlay);
  }

  /** 创建信息提示框 */
  private createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'stitch-inspector-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: #1f2937;
      color: #f9fafb;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      z-index: 99999;
      display: none;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(this.tooltip);
  }

  /** 绑定事件 */
  private bindEvents() {
    // 鼠标移动
    document.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;

      const target = (e.target as HTMLElement).closest('[data-stitch-type]') as HTMLElement;
      if (target && target !== this.currentElement) {
        this.highlight(target);
        this.showTooltip(target, e);
      } else if (!target) {
        this.hide();
      }
    });

    // 点击复制
    document.addEventListener('click', (e) => {
      if (!this.enabled) return;

      const target = (e.target as HTMLElement).closest('[data-stitch-type]') as HTMLElement;
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        this.copyComponentInfo(target);
      }
    });

    // 快捷键切换
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + I 切换 Inspector
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.toggle();
      }
      // ESC 关闭
      if (e.key === 'Escape' && this.enabled) {
        this.disable();
      }
    });
  }

  /** 解析组件信息 */
  private parseComponentInfo(element: HTMLElement): StitchComponentInfo {
    return {
      type: element.dataset.stitchType || 'Unknown',
      id: element.dataset.stitchId,
      path: element.dataset.stitchPath,
      props: element.dataset.stitchProps
        ? JSON.parse(element.dataset.stitchProps)
        : undefined,
      depth: element.dataset.stitchDepth
        ? parseInt(element.dataset.stitchDepth)
        : undefined,
      element,
    };
  }

  /** 高亮元素 */
  private highlight(element: HTMLElement) {
    this.currentElement = element;
    const rect = element.getBoundingClientRect();

    if (this.overlay) {
      this.overlay.style.display = 'block';
      this.overlay.style.top = `${rect.top}px`;
      this.overlay.style.left = `${rect.left}px`;
      this.overlay.style.width = `${rect.width}px`;
      this.overlay.style.height = `${rect.height}px`;
    }
  }

  /** 显示提示框 */
  private showTooltip(element: HTMLElement, event: MouseEvent) {
    const info = this.parseComponentInfo(element);

    if (this.tooltip) {
      this.tooltip.innerHTML = this.renderTooltipContent(info);
      this.tooltip.style.display = 'block';

      // 定位
      const x = event.clientX + 15;
      const y = event.clientY + 15;

      // 防止超出屏幕
      const rect = this.tooltip.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 10;
      const maxY = window.innerHeight - rect.height - 10;

      this.tooltip.style.left = `${Math.min(x, maxX)}px`;
      this.tooltip.style.top = `${Math.min(y, maxY)}px`;
    }
  }

  /** 渲染提示框内容 */
  private renderTooltipContent(info: StitchComponentInfo): string {
    const lines: string[] = [];

    // 类型
    lines.push(`<div style="color: #60a5fa; font-weight: bold; font-size: 14px; margin-bottom: 8px;">
      &lt;${info.type} /&gt;
    </div>`);

    // ID
    if (info.id) {
      lines.push(`<div style="margin-bottom: 4px;">
        <span style="color: #9ca3af;">id:</span>
        <span style="color: #fbbf24;">"${info.id}"</span>
      </div>`);
    }

    // 路径
    if (info.path) {
      lines.push(`<div style="margin-bottom: 4px;">
        <span style="color: #9ca3af;">path:</span>
        <span style="color: #34d399;">${info.path}</span>
      </div>`);
    }

    // 属性
    if (info.props && Object.keys(info.props).length > 0) {
      lines.push(`<div style="margin-bottom: 4px;">
        <span style="color: #9ca3af;">props:</span>
      </div>`);
      for (const [key, value] of Object.entries(info.props)) {
        lines.push(`<div style="padding-left: 12px; color: #e5e7eb;">
          ${key}: <span style="color: #f472b6;">${JSON.stringify(value)}</span>
        </div>`);
      }
    }

    // 操作提示
    lines.push(`<div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #374151; color: #6b7280; font-size: 11px;">
      点击复制组件信息 | ESC 退出 | Ctrl+Shift+I 切换
    </div>`);

    return lines.join('');
  }

  /** 复制组件信息 */
  private copyComponentInfo(element: HTMLElement) {
    const info = this.parseComponentInfo(element);

    const text = `修改组件：${info.type}
${info.id ? `ID：${info.id}` : ''}
${info.path ? `路径：${info.path}` : ''}
当前配置：${JSON.stringify({
  type: info.type,
  ...(info.id && { id: info.id }),
  ...(info.props && { props: info.props }),
}, null, 2)}`;

    navigator.clipboard.writeText(text).then(() => {
      this.showCopyFeedback();
    });
  }

  /** 显示复制成功反馈 */
  private showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.textContent = '✓ 已复制组件信息';
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 100000;
      animation: fadeInOut 2s ease;
    `;

    // 添加动画样式
    if (!document.getElementById('stitch-inspector-styles')) {
      const style = document.createElement('style');
      style.id = 'stitch-inspector-styles';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  /** 隐藏 */
  private hide() {
    this.currentElement = null;
    if (this.overlay) this.overlay.style.display = 'none';
    if (this.tooltip) this.tooltip.style.display = 'none';
  }

  /** 启用 */
  enable() {
    this.enabled = true;
    document.body.style.cursor = 'crosshair';
    console.log('[Stitch Inspector] 已启用 - 悬浮查看组件，点击复制信息');
  }

  /** 禁用 */
  disable() {
    this.enabled = false;
    this.hide();
    document.body.style.cursor = '';
    console.log('[Stitch Inspector] 已禁用');
  }

  /** 切换 */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }
}

// 导出全局实例
export const inspector = new StitchInspector();

// 自动初始化
if (typeof window !== 'undefined') {
  (window as any).StitchInspector = inspector;
  console.log('[Stitch Inspector] 已加载 - 按 Ctrl+Shift+I 启用');
}
```

### 步骤 3: 生成独立脚本（相对引用）

将 Inspector 打包成独立文件，导出时以相对路径引入（单文件 HTML 也可选 inline）。

创建 `src/lib/inspector/inject.ts`（用于导出到静态 HTML）：

```typescript
/**
 * 生成带 Inspector 的 HTML（默认相对路径引用）
 */
export function injectInspector(
  html: string,
  options?: { scriptSrc?: string }
): string {
  const src = options?.scriptSrc ?? './inspector.min.js';
  const tag = `<script src="${src}" defer></script>`;
  return html.replace('</body>', `${tag}</body>`);
}
```

### 步骤 4: 更新导出脚本

修改 `scripts/export-static.tsx`，添加 inspector 注入选项：

```typescript
// 在 wrapHTML 函数中添加 inspector 脚本（相对路径）
function wrapHTML(content: string, title: string, options?: { inspector?: boolean }): string {
  const inspectorScript = options?.inspector
    ? '<script src="./inspector.min.js" defer></script>'
    : '';

  return `<!DOCTYPE html>
<html>
<head>...</head>
<body>
  ${content}
  ${inspectorScript}
</body>
</html>`;
}

// 导出时启用 debug 模式
function exportSchema(info: SchemaInfo): void {
  const element = render(schema, { debug: true });  // 启用 debug
  // ...
}

// 如果启用 inspector，同步拷贝打包产物到导出目录
// outputDir/inspector.min.js
```

### 步骤 5: 添加快捷启动按钮

在导出的 HTML 中添加一个浮动按钮：

```html
<button
  onclick="window.StitchInspector.toggle()"
  style="position:fixed;bottom:20px;right:20px;z-index:99997;
         background:#3b82f6;color:white;border:none;
         padding:10px 16px;border-radius:8px;cursor:pointer;
         font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"
>
  🔍 Inspector
</button>
```

## 使用方式

### 方式 1: 快捷键

```
Ctrl + Shift + I  →  启用/禁用 Inspector
ESC              →  关闭 Inspector
鼠标悬浮         →  查看组件信息
点击             →  复制组件信息
```

### 方式 2: 控制台

```javascript
// 启用
window.StitchInspector.enable()

// 禁用
window.StitchInspector.disable()

// 切换
window.StitchInspector.toggle()
```

### 方式 3: 浮动按钮

点击页面右下角的 "🔍 Inspector" 按钮。

## 复制的信息格式

点击组件后，剪贴板中的内容：

```
修改组件：Button
ID：hero-cta
路径：children.0.children.1.children.0
当前配置：{
  "type": "Button",
  "id": "hero-cta",
  "props": {
    "variant": "primary",
    "size": "lg"
  }
}
```

**传给 AI 的示例：**

```
请把下面这个按钮改成红色危险样式：

修改组件：Button
路径：children.0.children.1.children.0
当前配置：{
  "type": "Button",
  "props": { "variant": "primary" }
}
```

**AI 可以精准定位并修改：**

```json
// 修改 children[0].children[1].children[0]
{
  "type": "Button",
  "props": { "variant": "destructive" }  // primary → destructive
}
```

## 进阶功能（TODO）

### 双向编辑

```
Inspector 选中组件 → 弹出编辑面板 → 修改 props → 实时更新页面
```

### 组件树视图

```
侧边栏显示完整组件树，类似 React DevTools：

├── Page
│   ├── Hero
│   │   ├── Text (title)
│   │   └── Button (cta)  ← 当前选中
│   ├── Section
│   │   └── Grid
│   │       ├── Card
│   │       └── Card
```

### 与编辑器联动

```
点击组件 → 自动跳转到 JSON Schema 编辑器对应位置
```

## 实现路线图

- [ ] 步骤 1: 扩展渲染器，添加 path 追踪
- [ ] 步骤 2: 创建 Inspector 类
- [ ] 步骤 3: 打包为独立脚本
- [ ] 步骤 4: 集成到导出流程
- [ ] 步骤 5: 添加浮动按钮
- [ ] 进阶: 组件树视图
- [ ] 进阶: 双向编辑

## 验证步骤

### 步骤 1 验证：渲染器扩展

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 访问 demo 页面
open http://localhost:3002/demo

# 3. 打开浏览器开发者工具，检查元素
# 确认 HTML 元素上有以下属性：
#   - data-stitch-type="Button"
#   - data-stitch-path="children.0.children.1"
#   - data-stitch-props='{"variant":"primary"}'
```

**验证标准**：
- 所有 Stitch 组件都带有 `data-stitch-type` 属性
- 嵌套组件的 `data-stitch-path` 正确反映层级关系
- `data-stitch-props` 包含完整的 props JSON

### 步骤 2 验证：Inspector 类

```bash
# 1. 在浏览器控制台测试
window.StitchInspector.enable()   # 应显示 "已启用"
window.StitchInspector.disable()  # 应显示 "已禁用"

# 2. 启用后悬浮测试
# - 鼠标移到组件上应出现蓝色边框
# - 应显示组件信息浮层
# - 浮层应包含 type, path, props

# 3. 点击复制测试
# - 点击组件后应显示 "已复制" 提示
# - 粘贴到文本编辑器检查内容格式
```

**验证标准**：
- 快捷键 `Ctrl+Shift+I` 可切换 Inspector
- 悬浮高亮正确跟随鼠标
- 复制的内容格式正确，可直接传给 AI

### 步骤 3 验证：独立脚本

```bash
# 1. 打包脚本
pnpm build:inspector

# 2. 检查输出文件
ls -la dist/inspector.min.js

# 3. 在纯 HTML 页面测试
# 创建测试页面，引入 ./inspector.min.js，确认功能正常
```

**验证标准**：
- 打包后文件大小 < 10KB
- 可独立在任何 HTML 页面使用
- 无外部依赖

### 步骤 4 验证：导出集成

```bash
# 1. 导出带 Inspector 的 HTML
npx tsx scripts/export-static.tsx --inspector

# 2. 用浏览器打开导出的 HTML 文件
open /home/wangbo/document/zcpg/docs/stitch/tech-dashboard.html

# 3. 按 Ctrl+Shift+I 启用 Inspector
# 4. 悬浮检查组件信息
```

**验证标准**：
- 导出的 HTML 通过相对路径加载 Inspector 脚本
- 导出目录下存在 `inspector.min.js`
- 组件元素包含 data-stitch-* 属性
- Inspector 功能正常工作

### 步骤 5 验证：浮动按钮

```bash
# 1. 打开导出的 HTML
# 2. 检查右下角是否有 "🔍 Inspector" 按钮
# 3. 点击按钮切换 Inspector 状态
```

**验证标准**：
- 按钮位置固定在右下角
- 点击可切换 Inspector 开关
- 按钮样式与页面协调

## 端到端测试流程

```bash
# 完整流程验证

# 1. 创建测试 schema
cat > src/data/schemas/test-inspector.json << 'EOF'
{
  "type": "Card",
  "id": "test-card",
  "props": { "className": "p-4" },
  "children": [
    { "type": "Button", "id": "test-btn", "props": { "variant": "primary" }, "children": "测试按钮" }
  ]
}
EOF

# 2. 导出 HTML（带 Inspector）
npx tsx scripts/export-static.tsx test-inspector --inspector

# 3. 打开浏览器验证
open /home/wangbo/document/zcpg/docs/stitch/test-inspector.html

# 4. 启用 Inspector，点击按钮，检查复制内容：
# 预期输出：
# 修改组件：Button
# ID：test-btn
# 路径：children.0
# 当前配置：{
#   "type": "Button",
#   "id": "test-btn",
#   "props": { "variant": "primary" }
# }
```

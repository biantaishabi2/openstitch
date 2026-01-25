/**
 * Stitch 编译器 - 只输出 HTML
 */

import { compileDSL } from './src/lib/compiler/frontend/compiler-core.mjs';
import { synthesizeDesignTokens, tokensToCSSVariables } from './src/lib/compiler/middle/synthesizer.mjs';

// 复杂落地页 DSL
const complexPageDSL = `
[SECTION: Header]
  { Gutter: "24px", Align: "Center" }
  [CARD: hero]
    ATTR: Title("OpenCode 智能开发平台"), Icon("Code")
    CONTENT: "AI 驱动的下一代软件开发工具，让编程更高效、更智能"
    [BUTTON: "立即体验"]
      ATTR: Variant("Primary"), Size("Large")
    [BUTTON: "了解更多"]
      ATTR: Variant("Outline"), Size("Medium")

[SECTION: Features]
  { Gutter: "32px", Align: "Center" }
  ATTR: Title("核心功能")
  [CARD: f1]
    ATTR: Title("智能代码补全"), Icon("Lightbulb")
    CONTENT: "基于上下文的智能代码建议，提升开发效率 300%"
  [CARD: f2]
    ATTR: Title("自动化测试"), Icon("CheckCircle")
    CONTENT: "AI 自动生成测试用例，覆盖边界条件和异常场景"
  [CARD: f3]
    ATTR: Title("代码审查"), Icon("Eye")
    CONTENT: "实时代码质量检测，发现潜在问题和安全漏洞"
  [CARD: f4]
    ATTR: Title("文档生成"), Icon("FileText")
    CONTENT: "自动生成清晰的 API 文档和代码注释"

[SECTION: Stats]
  { Gutter: "24px", Align: "Center" }
  ATTR: Title("数据说话")
  [CARD: s1]
    ATTR: Title("50,000+")
    CONTENT: "活跃开发者"
  [CARD: s2]
    ATTR: Title("1,000,000+")
    CONTENT: "代码行已优化"
  [CARD: s3]
    ATTR: Title("99.9%")
    CONTENT: "服务可用率"

[SECTION: Testimonials]
  { Gutter: "32px" }
  ATTR: Title("用户评价")
  [CARD: t1]
    ATTR: Title("张工程师"), Icon("User")
    CONTENT: "OpenCode 让我的开发效率提升了 3 倍，再也不用担心重复性工作。"
  [CARD: t2]
    ATTR: Title("李架构师"), Icon("User")
    CONTENT: "代码审查功能帮我们团队发现了很多潜在问题，非常专业。"

[SECTION: CTA]
  { Align: "Center" }
  [CARD: cta_box]
    ATTR: Title("准备好开始了吗？")
    CONTENT: "立即注册，免费试用 14 天所有功能"
    [BUTTON: "免费注册"]
      ATTR: Variant("Primary"), Size("Large")
    [BUTTON: "联系销售"]
      ATTR: Variant("Ghost"), Size("Medium")

[SECTION: Footer]
  { Align: "Center" }
  [TEXT: copyright]
    CONTENT: "© 2024 OpenCode. 让编程更智能。"
`;

// 编译
const ast = compileDSL(complexPageDSL);
const tokens = synthesizeDesignTokens({ context: "技术开发平台", sessionId: "demo-complex" });
const cssVariables = tokensToCSSVariables(tokens);

// AST to HTML 渲染器
function renderNode(node, depth = 0) {
  switch (node.type) {
    case 'Section': return renderSection(node, depth);
    case 'Card': return renderCard(node, depth);
    case 'Button': return renderButton(node, depth);
    case 'Text': return renderText(node, depth);
    default: return '';
  }
}

function renderSection(node, depth) {
  const indent = '  '.repeat(depth);
  const props = node.props || {};
  const title = props.title || '';
  const align = props.align || 'center';
  const gutter = props.gutter || 'var(--gap-card)';
  let childrenHtml = node.children.map(child => renderNode(child, depth + 1)).join('\n');

  return `${indent}<section class="stitch-section" id="${node.id}" style="padding: var(--padding-section); display: flex; flex-direction: column; gap: ${gutter}; align-items: ${align};">
${title ? `${indent}  <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-primary); margin-bottom: var(--spacing-md);">${title}</h2>` : ''}
${indent}  <div style="display: flex; flex-wrap: wrap; gap: var(--gap-card); justify-content: center; max-width: 1200px; margin: 0 auto;">
${childrenHtml}
${indent}  </div>
${indent}</section>`;
}

function renderCard(node, depth) {
  const indent = '  '.repeat(depth);
  const props = node.props || {};
  const title = props.title || '';
  const icon = props.icon || '';
  const content = props.content || '';
  let childrenHtml = node.children.map(child => renderNode(child, depth + 1)).join('\n');

  return `${indent}<div class="stitch-card" id="${node.id}" style="background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-md); padding: var(--padding-card); max-width: 320px; min-width: 280px; flex: 1;">
${title ? `${indent}  <h3 style="margin: 0 0 12px 0; font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-primary);">${icon ? getIconEmoji(icon) + ' ' : ''}${title}</h3>` : ''}
${content ? `${indent}  <p style="margin: 0 0 16px 0; color: var(--color-text-muted); line-height: var(--line-height-body);">${content}</p>` : ''}
${childrenHtml ? `${indent}  <div style="display: flex; gap: 12px; flex-wrap: wrap;">\n${childrenHtml}\n${indent}  </div>` : ''}
${indent}</div>`;
}

function renderButton(node, depth) {
  const indent = '  '.repeat(depth);
  const props = node.props || {};
  const variant = props.variant || 'primary';
  const size = props.size || 'medium';
  const label = node.id;

  const sizeStyles = {
    small: 'padding: 6px 12px; font-size: var(--font-size-sm);',
    medium: 'padding: 10px 20px; font-size: var(--font-size-base);',
    large: 'padding: 14px 28px; font-size: var(--font-size-lg);',
  };
  const variantStyles = {
    primary: 'background: var(--color-primary); color: white; border: none;',
    outline: 'background: transparent; color: var(--color-primary); border: 2px solid var(--color-primary);',
    ghost: 'background: transparent; color: var(--color-text); border: none;',
  };

  return `${indent}<button class="stitch-button" style="${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.medium} border-radius: var(--radius-sm); cursor: pointer; font-weight: var(--font-weight-medium); transition: all 0.2s;">${label}</button>`;
}

function renderText(node, depth) {
  const indent = '  '.repeat(depth);
  const props = node.props || {};
  const content = props.content || '';
  return `${indent}<p id="${node.id}" style="color: var(--color-text-muted); line-height: var(--line-height-body);">${content}</p>`;
}

function getIconEmoji(iconName) {
  const icons = { Code: '💻', Lightbulb: '💡', CheckCircle: '✓', Eye: '👁️', FileText: '📄', User: '👤', Terminal: '⌨️', Star: '⭐' };
  return icons[iconName] || '🔹';
}

// 生成完整 HTML
const children = ast.children.map(child => renderNode(child, 1)).join('\n\n');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenCode - AI 智能开发平台</title>
  <style>
    ${cssVariables}

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--color-background);
      color: var(--color-text);
      line-height: 1.6;
    }

    .stitch-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stitch-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stitch-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .stitch-section + .stitch-section {
      border-top: 1px solid var(--color-border);
    }

    /* 首屏特殊样式 */
    #Header {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: white;
    }

    #Header .stitch-card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      max-width: 600px;
      text-align: center;
    }

    #Header .stitch-card h3,
    #Header .stitch-card p {
      color: rgba(255,255,255,0.95);
    }

    /* Stats 特殊样式 */
    #Stats .stitch-card h3 {
      font-size: var(--font-size-2xl);
      color: var(--color-primary);
    }

    #Stats .stitch-card {
      text-align: center;
      min-width: 180px;
    }

    /* CTA 特殊样式 */
    #CTA .stitch-card {
      max-width: 500px;
      text-align: center;
      background: var(--color-primary);
      color: white;
    }

    #CTA .stitch-card h3,
    #CTA .stitch-card p {
      color: white;
    }

    /* 响应式 */
    @media (max-width: 768px) {
      .stitch-card {
        min-width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
${children}

  <footer style="text-align: center; padding: 40px 20px; color: var(--color-text-muted); font-size: var(--font-size-sm); border-top: 1px solid var(--color-border);">
    <p>由 Stitch UI 编译器自动生成</p>
    <p style="margin-top: 8px;">Design Tokens: 主色 ${tokens.colors.primary} | 圆角 ${tokens.shape.radiusMd} | 字阶 ${tokens.typography.scale}</p>
  </footer>
</body>
</html>`;

console.log(html);

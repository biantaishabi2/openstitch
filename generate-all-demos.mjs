/**
 * Stitch 编译器 - 生成所有演示页面
 */

import { compileDSL } from './src/lib/compiler/frontend/compiler-core.mjs';
import { synthesizeDesignTokens, tokensToCSSVariables } from './src/lib/compiler/middle/synthesizer.mjs';
import { writeFileSync } from 'fs';

// 演示页面配置
const demos = [
  {
    name: 'compiler-tech',
    title: '📊 技术仪表盘',
    context: '技术架构',
    dsl: `
[SECTION: Dashboard]
  { Gutter: "24px", Align: "Center" }
  ATTR: Title("系统概览")
  [CARD: stats]
    ATTR: Title("数据概览"), Icon("Chart")
    CONTENT: "本月活跃用户增长 15.2%，转化率提升 3.8%"
    [BUTTON: "查看详情"]
      ATTR: Variant("Primary"), Size("Medium")
  [CARD: performance]
    ATTR: Title("性能监控"), Icon("Speed")
    CONTENT: "API 响应时间 < 100ms，系统可用率 99.99%"
    [BUTTON: "查看报告"]
      ATTR: Variant("Outline"), Size("Medium")
  [CARD: alerts]
    ATTR: Title("告警中心"), Icon("Bell")
    CONTENT: "今日无异常告警，系统运行正常"
    [BUTTON: "历史记录"]
      ATTR: Variant("Ghost"), Size("Small")
    `
  },
  {
    name: 'compiler-children',
    title: '🧒 儿童学习乐园',
    context: '儿童教育',
    dsl: `
[SECTION: Learning_Fun]
  { Gutter: "32px", Align: "Center" }
  ATTR: Title("趣味学习")
  [CARD: math_game]
    ATTR: Title("🎮 数学小游戏"), Icon("Calculator")
    CONTENT: "和小动物一起学习加减法！每答对一题就能得到一颗星星！"
    [BUTTON: "开始玩耍"]
      ATTR: Variant("Primary"), Size("Large")
  [CARD: story_time]
    ATTR: Title("📚 故事时间"), Icon("Book")
    CONTENT: "听有趣的童话故事，认识新的汉字朋友！"
    [BUTTON: "听故事"]
      ATTR: Variant("Primary"), Size("Large")
  [CARD: draw_fun]
    ATTR: Title("🎨 涂色乐园"), Icon("Palette")
    CONTENT: "用五彩缤纷的颜色，画出你心中的梦想世界！"
    [BUTTON: "开始画画"]
      ATTR: Variant("Primary"), Size("Large")
    `
  },
  {
    name: 'compiler-finance',
    title: '📈 财务分析仪表盘',
    context: '金融报表',
    dsl: `
[SECTION: Report]
  { Gutter: "20px", Align: "Center" }
  ATTR: Title("财务概览")
  [CARD: revenue]
    ATTR: Title("季度营收报告"), Icon("TrendingUp")
    CONTENT: "Q4 营收达到 ¥2.8 亿，同比增长 23.5%，超出预期 15%。"
    [BUTTON: "下载完整报告"]
      ATTR: Variant("Primary"), Size("Medium")
  [CARD: expense]
    ATTR: Title("成本分析"), Icon("PieChart")
    CONTENT: "运营成本占比 32%，研发投入同比增加 18%。"
    [BUTTON: "查看明细"]
      ATTR: Variant("Outline"), Size("Medium")
  [CARD: forecast]
    ATTR: Title("预测模型"), Icon("Target")
    CONTENT: "基于 AI 模型预测，下季度营收预计增长 15-20%。"
    [BUTTON: "调整参数"]
      ATTR: Variant("Ghost"), Size("Small")
    `
  }
];

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
  const content = props.content || '';
  let childrenHtml = node.children.map(child => renderNode(child, depth + 1)).join('\n');

  return `${indent}<div class="stitch-card" id="${node.id}" style="background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-md); padding: var(--padding-card); max-width: 350px; min-width: 280px; flex: 1;">
${title ? `${indent}  <h3 style="margin: 0 0 12px 0; font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-primary);">${title}</h3>` : ''}
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

function generateHTML(ast, tokens, cssVariables, title) {
  const children = ast.children.map(child => renderNode(child, 1)).join('\n\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${cssVariables}
    body { margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--color-background); }
    h1 { text-align: center; color: var(--color-primary); margin-bottom: 32px; }
    .stitch-card { transition: all 0.2s; }
    .stitch-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .stitch-button:hover { opacity: 0.9; }
    .meta { text-align: center; color: var(--color-text-muted); font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
${children}

  <div class="meta">
    Stitch UI 编译器生成 | 主色: ${tokens.colors.primary} | 圆角: ${tokens.shape.radiusMd} | 字阶: ${tokens.typography.scale}
  </div>
</body>
</html>`;
}

// 生成所有演示页面
const outputDir = '/home/wangbo/document/zcpg/priv/static/docs/stitch';

for (const demo of demos) {
  console.log(`编译 ${demo.name}...`);

  const ast = compileDSL(demo.dsl);
  const tokens = synthesizeDesignTokens({ context: demo.context, sessionId: demo.name });
  const cssVariables = tokensToCSSVariables(tokens);
  const html = generateHTML(ast, tokens, cssVariables, demo.title);

  const outputPath = `${outputDir}/${demo.name}.html`;
  writeFileSync(outputPath, html);

  console.log(`  ✅ 已保存到 ${outputPath}`);
  console.log(`  AST: ${ast.children.length} 个顶级节点, ${ast.children[0]?.children?.length || 0} 个子卡片`);
}

console.log('\n✅ 全部演示页面已重新编译！');

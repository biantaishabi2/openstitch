/**
 * 静态 HTML 导出脚本
 * 用法: npx tsx scripts/export-static.tsx
 */

import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { renderToString } from 'react-dom/server';

// 导入渲染器和组件
import { render } from '../src/lib/renderer/renderer';

// 输出目录
const OUTPUT_DIR = '/home/wangbo/document/zcpg/docs/stitch';

// 读取 JSON schemas
const SCHEMAS_DIR = path.join(__dirname, '../src/data/schemas');

interface SchemaInfo {
  id: string;
  name: string;
  file: string;
}

const schemas: SchemaInfo[] = [
  { id: 'tech-dashboard', name: 'Tech Dashboard', file: 'tech-dashboard.json' },
  { id: 'cyberpunk', name: 'Cyberpunk', file: 'cyberpunk.json' },
  { id: 'warm-food', name: '暖心食堂', file: 'warm-food.json' },
  { id: 'elegant', name: 'Elegant Brand', file: 'elegant.json' },
  { id: 'components-showcase', name: '组件展示', file: 'components-showcase.json' },
];

// HTML 模板
function wrapHTML(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stitch Demo - ${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
            primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
            secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
            muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
            accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
            destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
            border: 'hsl(var(--border))',
          },
        },
      },
    }
  </script>
  <style>
    :root {
      --background: 0 0% 100%;
      --foreground: 240 10% 3.9%;
      --card: 0 0% 100%;
      --card-foreground: 240 10% 3.9%;
      --primary: 240 5.9% 10%;
      --primary-foreground: 0 0% 98%;
      --secondary: 240 4.8% 95.9%;
      --secondary-foreground: 240 5.9% 10%;
      --muted: 240 4.8% 95.9%;
      --muted-foreground: 240 3.8% 46.1%;
      --accent: 240 4.8% 95.9%;
      --accent-foreground: 240 5.9% 10%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 240 5.9% 90%;
      --radius: 0.5rem;
    }
    * { border-color: hsl(var(--border)); }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${content}
  <div style="text-align: center; padding: 2rem; color: #999; font-size: 0.875rem;">
    <p>Stitch UI Rendering Engine</p>
    <p><a href="index.html" style="color: #3b82f6;">← 返回首页</a></p>
  </div>
</body>
</html>`;
}

// 导出单个 schema
function exportSchema(info: SchemaInfo): void {
  const schemaPath = path.join(SCHEMAS_DIR, info.file);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  // 渲染 React 组件
  const element = render(schema);
  const html = renderToString(element);

  // 包装成完整 HTML
  const fullHTML = wrapHTML(html, info.name);

  // 写入文件
  const outputPath = path.join(OUTPUT_DIR, `${info.id}.html`);
  fs.writeFileSync(outputPath, fullHTML);
  console.log(`✓ Exported: ${info.id}.html`);
}

// 生成首页
function generateIndex(): void {
  const links = schemas
    .map(
      (s) => `
      <a href="${s.id}.html" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
        <h3 class="text-lg font-semibold text-gray-900">${s.name}</h3>
        <p class="text-sm text-gray-500 mt-1">查看渲染效果 →</p>
      </a>`
    )
    .join('\n');

  const indexHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stitch Demo - JSON Schema UI 渲染引擎</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="max-w-4xl mx-auto p-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Stitch Demo</h1>
      <p class="text-xl text-gray-600">JSON Schema 驱动的 UI 渲染引擎</p>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${links}
    </div>
    <footer class="mt-12 text-center text-gray-500 text-sm">
      <p>点击卡片查看渲染效果</p>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHTML);
  console.log('✓ Generated: index.html');
}

// 主函数
async function main() {
  console.log('Exporting Stitch demos...\n');

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 导出所有 schema
  for (const info of schemas) {
    try {
      exportSchema(info);
    } catch (err) {
      console.error(`✗ Failed: ${info.id}`, err);
    }
  }

  // 生成首页
  generateIndex();

  console.log(`\nDone! Files exported to: ${OUTPUT_DIR}`);
}

main();

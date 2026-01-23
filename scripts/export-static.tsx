#!/usr/bin/env npx tsx
/**
 * 静态 HTML 导出脚本
 *
 * 用法:
 *   npx tsx scripts/export-static.tsx              # 导出所有 schemas
 *   npx tsx scripts/export-static.tsx ppt-cover    # 导出指定 schema
 *   npx tsx scripts/export-static.tsx --list       # 列出所有可用 schemas
 */

import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { renderToString } from 'react-dom/server';

// 导入渲染器
import { render } from '../src/lib/renderer/renderer';

// 默认输出目录
const OUTPUT_DIR = '/home/wangbo/document/zcpg/docs/stitch';

// schemas 目录
const SCHEMAS_DIR = path.join(__dirname, '../src/data/schemas');
const INSPECTOR_SOURCE = path.join(__dirname, '../public/inspector.min.js');

interface SchemaInfo {
  id: string;
  name: string;
  file: string;
}

// 自动扫描 schemas 目录，获取所有 JSON 文件
function scanSchemas(): SchemaInfo[] {
  const files = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.json'));

  return files.map(file => {
    const id = file.replace('.json', '');
    // 将 kebab-case 转换为标题格式
    const name = id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { id, name, file };
  });
}

// HTML 模板
function wrapHTML(
  content: string,
  title: string,
  options?: { inspector?: boolean; inspectorInline?: boolean; inspectorScript?: string }
): string {
  const inspectorScript = options?.inspector
    ? options.inspectorInline
      ? `<script>${options.inspectorScript ?? ''}</script>`
      : '<script src="./inspector.min.js" defer></script>'
    : '';
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
  ${inspectorScript}
  <div style="text-align: center; padding: 2rem; color: #999; font-size: 0.875rem;">
    <p>Stitch UI Rendering Engine</p>
    <p><a href="index.html" style="color: #3b82f6;">← 返回首页</a></p>
  </div>
</body>
</html>`;
}

// 导出单个 schema
function exportSchema(
  info: SchemaInfo,
  options?: { inspector?: boolean; inspectorInline?: boolean; inspectorScript?: string }
): void {
  const schemaPath = path.join(SCHEMAS_DIR, info.file);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  // 渲染 React 组件
  const element = render(schema, options?.inspector ? { debug: true } : undefined);
  const html = renderToString(element);

  // 包装成完整 HTML
  const fullHTML = wrapHTML(html, info.name, options);

  // 写入文件
  const outputPath = path.join(OUTPUT_DIR, `${info.id}.html`);
  fs.writeFileSync(outputPath, fullHTML);
  console.log(`✓ Exported: ${info.id}.html`);
}

// 生成首页
function generateIndex(schemas: SchemaInfo[]): void {
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
      <p class="text-sm text-gray-400 mt-2">${schemas.length} 个页面</p>
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

// 显示帮助
function showHelp(): void {
  console.log(`
Stitch 静态 HTML 导出工具

用法:
  npx tsx scripts/export-static.tsx [options] [schema-id...]

选项:
  --list, -l     列出所有可用的 schemas
  --help, -h     显示帮助信息
  --output, -o   指定输出目录 (默认: ${OUTPUT_DIR})
  --inspector    输出 Inspector 脚本并注入 HTML
  --inspector-inline  内联 Inspector 脚本到 HTML

示例:
  npx tsx scripts/export-static.tsx              # 导出所有 schemas
  npx tsx scripts/export-static.tsx ppt-cover    # 只导出 ppt-cover
  npx tsx scripts/export-static.tsx admin-*      # 导出所有 admin 开头的
  npx tsx scripts/export-static.tsx --list       # 列出所有可用 schemas
`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const inspectorEnabled = args.includes('--inspector') || args.includes('--inspector-inline');
  const inspectorInline = args.includes('--inspector-inline');
  const inspectorScript = inspectorInline
    ? fs.readFileSync(INSPECTOR_SOURCE, 'utf-8')
    : undefined;

  // 处理选项
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // 扫描所有 schemas
  const allSchemas = scanSchemas();

  if (args.includes('--list') || args.includes('-l')) {
    console.log('\n可用的 schemas:\n');
    allSchemas.forEach(s => console.log(`  ${s.id.padEnd(25)} ${s.name}`));
    console.log(`\n共 ${allSchemas.length} 个\n`);
    return;
  }

  // 确定要导出的 schemas
  let schemasToExport: SchemaInfo[];

  // 过滤掉选项参数
  const schemaIds = args.filter(a => !a.startsWith('-'));

  if (schemaIds.length === 0) {
    // 导出所有
    schemasToExport = allSchemas;
  } else {
    // 支持通配符匹配
    schemasToExport = allSchemas.filter(s => {
      return schemaIds.some(id => {
        if (id.includes('*')) {
          const regex = new RegExp('^' + id.replace('*', '.*') + '$');
          return regex.test(s.id);
        }
        return s.id === id;
      });
    });

    if (schemasToExport.length === 0) {
      console.error(`错误: 未找到匹配的 schema: ${schemaIds.join(', ')}`);
      console.log('使用 --list 查看所有可用的 schemas');
      process.exit(1);
    }
  }

  console.log(`\nExporting ${schemasToExport.length} schemas...\n`);

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (inspectorEnabled && !inspectorInline) {
    if (!fs.existsSync(INSPECTOR_SOURCE)) {
      throw new Error(`Inspector script not found: ${INSPECTOR_SOURCE}`);
    }
    fs.copyFileSync(INSPECTOR_SOURCE, path.join(OUTPUT_DIR, 'inspector.min.js'));
  }

  // 导出选定的 schemas
  for (const info of schemasToExport) {
    try {
      exportSchema(info, {
        inspector: inspectorEnabled,
        inspectorInline,
        inspectorScript,
      });
    } catch (err) {
      console.error(`✗ Failed: ${info.id}`, err);
    }
  }

  // 生成首页（包含所有 schemas）
  generateIndex(allSchemas);

  console.log(`\nDone! Files exported to: ${OUTPUT_DIR}`);
}

main();

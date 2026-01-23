/**
 * 导出 Demo HTML 文件到指定目录
 * 运行: npx tsx scripts/export-demos.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// 读取所有 JSON schemas
const schemasDir = path.join(__dirname, '../src/data/schemas');
const outputDir = '/home/wangbo/document/zcpg/docs/stitch';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 读取所有 JSON 文件
const jsonFiles = fs.readdirSync(schemasDir).filter((f) => f.endsWith('.json'));

console.log('Found schemas:', jsonFiles);

// 复制 JSON 文件
for (const file of jsonFiles) {
  const srcPath = path.join(schemasDir, file);
  const destPath = path.join(outputDir, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied: ${file}`);
}

// 生成简单的 HTML 包装器（因为完整渲染需要 React 环境）
const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stitch Demo - JSON Schema UI 渲染引擎</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .schema-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="max-w-6xl mx-auto p-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Stitch Demo</h1>
      <p class="text-xl text-gray-600">JSON Schema 驱动的 UI 渲染引擎</p>
      <p class="text-gray-500 mt-2">查看 JSON 文件了解 UI 描述格式，访问 <a href="http://localhost:3002/demo" class="text-blue-600 hover:underline">在线 Demo</a> 查看实时渲染效果</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${jsonFiles
        .map((file) => {
          const name = file.replace('.json', '');
          const displayName = {
            'tech-dashboard': 'Tech Dashboard',
            cyberpunk: 'Cyberpunk 赛博朋克',
            'warm-food': '暖心食堂',
            elegant: 'Elegant 优雅品牌',
            'components-showcase': '组件展示',
          }[name] || name;

          const description = {
            'tech-dashboard': '科技感的 SaaS 仪表盘界面',
            cyberpunk: '赛博朋克风格的监控面板',
            'warm-food': '温暖风格的外卖点餐界面',
            elegant: '高端优雅的奢侈品牌页面',
            'components-showcase': '展示所有可用组件的合集',
          }[name] || '';

          return `
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="schema-card p-6 text-white">
          <h3 class="text-xl font-bold">${displayName}</h3>
          <p class="text-white/80 text-sm mt-1">${description}</p>
        </div>
        <div class="p-4">
          <a href="${file}" download class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            下载 JSON Schema
          </a>
        </div>
      </div>`;
        })
        .join('')}
    </div>

    <footer class="mt-12 text-center text-gray-500 text-sm">
      <p>Stitch UI Rendering Engine</p>
      <p class="mt-1">JSON → React Components → HTML</p>
    </footer>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
console.log('Generated: index.html');

console.log(`\nAll files exported to: ${outputDir}`);
console.log('Files:', fs.readdirSync(outputDir));

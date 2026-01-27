/**
 * Stitch UI Compiler CLI
 *
 * 用法:
 *   npm run compile -- project.json -o output/
 *   npm run compile -- project.json --screen dashboard -o output/dashboard.html
 *   npm run compile -- project.json --stats
 */

import * as fs from 'fs';
import * as path from 'path';
import { compile, renderToHEEx } from '../src/lib/compiler';

// 项目 JSON 结构
interface ProjectScreen {
  screen_id: string;
  title: string;
  dsl: string;
}

interface ProjectJSON {
  context: string;
  platform: 'web' | 'mobile';
  screens: ProjectScreen[];
}

// 解析命令行参数
function parseArgs(args: string[]): {
  inputFile: string;
  outputDir: string;
  screenId?: string;
  showStats: boolean;
  target: 'html' | 'heex';
  help: boolean;
} {
  const result = {
    inputFile: '',
    outputDir: '',
    screenId: undefined as string | undefined,
    showStats: false,
    target: 'html' as const,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--heex') {
      result.target = 'heex';
    } else if (arg === '--stats' || arg === '-s') {
      result.showStats = true;
    } else if (arg === '-o' || arg === '--output') {
      result.outputDir = args[++i] || '';
    } else if (arg === '--screen') {
      result.screenId = args[++i];
    } else if (!arg.startsWith('-')) {
      if (!result.inputFile) {
        result.inputFile = arg;
      }
    }
  }

  return result;
}

// 显示帮助
function showHelp(): void {
  console.log(`
Stitch UI Compiler CLI

用法:
  npm run compile -- <input.json> [options]

选项:
  -o, --output <dir>      输出目录或文件 (默认: output/)
  --screen <id>           只编译指定的页面
  --stats                 显示编译统计信息
  --heex                  输出 HEEx 模板
  -h, --help              显示帮助信息

示例:
  npm run compile -- project.json -o output/
  npm run compile -- project.json --screen dashboard -o output/dashboard.html
  npm run compile -- project.json --stats

项目 JSON 格式:
  {
    "context": "企业管理系统",
    "platform": "web",
    "screens": [
      {
        "screen_id": "dashboard",
        "title": "仪表盘",
        "dsl": "[SECTION: main]\\n  [CARD: stats]\\n    ..."
      }
    ]
  }
`);
}

// 编译单个页面
async function compileScreen(
  screen: ProjectScreen,
  context: string,
  outputPath: string,
  showStats: boolean,
  target: 'html' | 'heex'
): Promise<void> {
  const startTime = Date.now();

  try {
    const result = await compile(screen.dsl, {
      context,
      ssr: {
        title: screen.title,
        lang: 'zh-CN',
      },
    });

    // 确保输出目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const outputContent = target === 'heex'
      ? renderToHEEx(result.factory.ir)
      : result.ssr.html;

    // 写入输出文件
    fs.writeFileSync(outputPath, outputContent);

    const elapsed = Date.now() - startTime;

    if (showStats) {
      console.log(`\n📊 编译统计 - ${screen.screen_id}:`);
      console.log(`   解析耗时: ${result.stats.parseTime.toFixed(2)}ms`);
      console.log(`   Token生成: ${result.stats.tokenGenTime.toFixed(2)}ms`);
      console.log(`   工厂处理: ${result.stats.factoryTime.toFixed(2)}ms`);
      console.log(`   SSR渲染: ${result.stats.ssrTime.toFixed(2)}ms`);
      console.log(`   总耗时: ${result.stats.totalTime.toFixed(2)}ms`);
      console.log(`   节点数量: ${result.stats.nodeCount}`);
      console.log(`   HTML大小: ${(result.stats.htmlSize / 1024).toFixed(2)}KB`);
      console.log(`   CSS压缩率: ${(result.stats.cssCompressionRatio * 100).toFixed(1)}%`);
    }

    console.log(`✅ ${screen.screen_id} → ${outputPath} (${elapsed}ms)`);
  } catch (error) {
    console.error(`❌ ${screen.screen_id} 编译失败:`, error);
    throw error;
  }
}

// 主函数
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.inputFile) {
    showHelp();
    return;
  }

  // 读取项目 JSON
  const inputPath = path.resolve(args.inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`文件不存在: ${inputPath}`);
    process.exit(1);
  }

  const projectJSON: ProjectJSON = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  // 确定输出目录
  const outputDir = args.outputDir || 'output';

  // 过滤要编译的页面
  let screensToCompile = projectJSON.screens;
  if (args.screenId) {
    screensToCompile = projectJSON.screens.filter(s => s.screen_id === args.screenId);
    if (screensToCompile.length === 0) {
      console.error(`未找到页面: ${args.screenId}`);
      console.log('可用页面:', projectJSON.screens.map(s => s.screen_id).join(', '));
      process.exit(1);
    }
  }

  console.log(`\n🔨 Stitch Compiler`);
  console.log(`   项目: ${projectJSON.context}`);
  console.log(`   平台: ${projectJSON.platform}`);
  console.log(`   页面: ${screensToCompile.length} 个\n`);

  // 编译所有页面
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  const extension = args.target === 'heex' ? 'heex' : 'html';

  for (const screen of screensToCompile) {
    const outputPath = args.screenId
      ? args.outputDir || path.join(outputDir, `${screen.screen_id}.${extension}`)
      : path.join(outputDir, `${screen.screen_id}.${extension}`);

    try {
      await compileScreen(screen, projectJSON.context, outputPath, args.showStats, args.target);
      successCount++;
    } catch {
      failCount++;
    }
  }

  const totalTime = Date.now() - startTime;

  console.log(`\n📦 编译完成`);
  console.log(`   成功: ${successCount} 个`);
  if (failCount > 0) {
    console.log(`   失败: ${failCount} 个`);
  }
  console.log(`   总耗时: ${totalTime}ms`);
  console.log(`   输出目录: ${path.resolve(outputDir)}\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

export { main };

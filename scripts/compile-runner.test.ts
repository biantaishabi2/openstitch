/**
 * CLI Runner - 通过 vitest 运行编译器
 *
 * 用法:
 *   npx vitest run scripts/compile-runner.test.ts
 *   COMPILE_INPUT=test-project.json COMPILE_OUTPUT=test-output/ npx vitest run scripts/compile-runner.test.ts
 */

import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../src/lib/compiler';

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

describe('Compile CLI', () => {
  it('runs compiler', async () => {
    const inputFile = process.env.COMPILE_INPUT;
    const outputDir = process.env.COMPILE_OUTPUT || 'output';
    const showStats = process.env.COMPILE_STATS === 'true';

    if (!inputFile) {
      console.log('\n使用环境变量运行编译器:');
      console.log('  COMPILE_INPUT=project.json COMPILE_OUTPUT=output/ npx vitest run scripts/compile-runner.test.ts');
      console.log('  COMPILE_INPUT=project.json COMPILE_STATS=true npx vitest run scripts/compile-runner.test.ts\n');
      return;
    }

    // 读取项目 JSON
    const inputPath = path.resolve(inputFile);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`文件不存在: ${inputPath}`);
    }

    const projectJSON: ProjectJSON = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

    console.log(`\n🔨 Stitch Compiler`);
    console.log(`   项目: ${projectJSON.context}`);
    console.log(`   平台: ${projectJSON.platform}`);
    console.log(`   页面: ${projectJSON.screens.length} 个\n`);

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 编译所有页面
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    for (const screen of projectJSON.screens) {
      const outputPath = path.join(outputDir, `${screen.screen_id}.html`);

      try {
        const result = await compile(screen.dsl, {
          context: projectJSON.context,
          ssr: {
            title: screen.title,
            lang: 'zh-CN',
          },
        });

        // 写入 HTML 文件
        fs.writeFileSync(outputPath, result.ssr.html);

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

        console.log(`✅ ${screen.screen_id} → ${outputPath}`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${screen.screen_id} 编译失败:`, error);
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
  });
});

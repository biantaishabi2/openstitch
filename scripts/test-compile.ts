/**
 * 测试编译器脚本
 */

import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../src/lib/compiler';

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

async function main() {
  // 读取测试项目
  const projectPath = path.resolve(__dirname, '../test-demos.json');
  const project: ProjectJSON = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

  console.log(`\n🔨 Stitch Compiler Test`);
  console.log(`   项目: ${project.context}`);
  console.log(`   页面: ${project.screens.length} 个\n`);

  // 确保输出目录存在
  const outputDir = path.resolve(__dirname, '../test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 编译每个页面
  for (const screen of project.screens) {
    console.log(`📝 编译 ${screen.screen_id}...`);

    try {
      const result = await compile(screen.dsl, {
        context: project.context,
        ssr: {
          title: screen.title,
          lang: 'zh-CN',
        },
      });

      const outputPath = path.join(outputDir, `${screen.screen_id}.html`);
      fs.writeFileSync(outputPath, result.ssr.html);

      console.log(`   ✅ 成功 → ${outputPath}`);
      console.log(`      节点: ${result.stats.nodeCount}, 耗时: ${result.stats.totalTime.toFixed(1)}ms`);
      console.log(`      大小: ${(result.stats.htmlSize / 1024).toFixed(1)}KB\n`);
    } catch (error) {
      console.error(`   ❌ 失败:`, error);
    }
  }

  console.log('✨ 编译完成\n');
}

main().catch(console.error);

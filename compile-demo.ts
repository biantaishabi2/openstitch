/**
 * 编译 DSL 演示脚本
 *
 * 运行: npx tsx compile-demo.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { compile, compileToHTML } from './src/lib/compiler/index';

async function main() {
  // 读取 DSL 文件
  const dslPath = path.join(__dirname, 'demo-compiler-architecture.dsl');
  const dsl = fs.readFileSync(dslPath, 'utf-8');

  console.log('=== DSL 源码 ===');
  console.log(dsl);
  console.log('');

  try {
    // 编译
    const result = await compile(dsl, {
      context: 'Stitch Compiler Architecture Demo',
      ssr: {
        title: 'Stitch Compiler - Architecture',
        lang: 'zh-CN',
      },
    });

    console.log('=== 编译统计 ===');
    console.log(`解析耗时: ${result.stats.parseTime.toFixed(2)}ms`);
    console.log(`Token生成: ${result.stats.tokenGenTime.toFixed(2)}ms`);
    console.log(`工厂处理: ${result.stats.factoryTime.toFixed(2)}ms`);
    console.log(`SSR渲染: ${result.stats.ssrTime.toFixed(2)}ms`);
    console.log(`总耗时: ${result.stats.totalTime.toFixed(2)}ms`);
    console.log(`节点数量: ${result.stats.nodeCount}`);
    console.log(`HTML大小: ${result.stats.htmlSize} bytes`);
    console.log('');

    console.log('=== AST 结构 ===');
    console.log(JSON.stringify(result.ast, null, 2).slice(0, 500) + '...');
    console.log('');

    // 写入 HTML 文件
    const outputPath = path.join(__dirname, 'demo-compiler-output.html');
    fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

    console.log(`=== 输出文件 ===`);
    console.log(`HTML 已保存到: ${outputPath}`);
    console.log('');
    console.log('用浏览器打开查看效果！');

  } catch (error) {
    console.error('编译错误:', error);
  }
}

main();

/**
 * 编译器演示测试
 *
 * 运行: npx vitest run src/lib/compiler/__tests__/demo.test.ts
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';

describe('Compiler Demo', () => {
  it('should compile architecture page and save HTML', async () => {
    // DSL: Stitch 编译器架构展示
    const dsl = `
[SECTION: main]
  [CARD: header] ATTR: Title("Stitch UI Compiler") CONTENT: "DSL to HTML Compilation Pipeline"
  [CARD: logic] ATTR: Title("Logic Engine"), Icon("cpu") CONTENT: "DSL Tokenize Parser Semantic AST"
  [CARD: visual] ATTR: Title("Visual Engine"), Icon("palette") CONTENT: "Design Tokens Color Spacing Typography"
  [CARD: factory] ATTR: Title("Component Factory"), Icon("layers") CONTENT: "AST + Tokens IR React Components"
  [CARD: ssr] ATTR: Title("SSR Engine"), Icon("code") CONTENT: "React to Static HTML CSS Purge"
  [BUTTON: "View Source"]
    `.trim();

    console.log('\n=== DSL 源码 ===');
    console.log(dsl);

    // 编译
    const result = await compile(dsl, {
      context: 'Stitch Compiler Architecture Demo',
      ssr: {
        title: 'Stitch Compiler - Architecture',
        lang: 'zh-CN',
      },
    });

    console.log('\n=== 编译统计 ===');
    console.log(`解析耗时: ${result.stats.parseTime.toFixed(2)}ms`);
    console.log(`Token生成: ${result.stats.tokenGenTime.toFixed(2)}ms`);
    console.log(`工厂处理: ${result.stats.factoryTime.toFixed(2)}ms`);
    console.log(`SSR渲染: ${result.stats.ssrTime.toFixed(2)}ms`);
    console.log(`总耗时: ${result.stats.totalTime.toFixed(2)}ms`);
    console.log(`节点数量: ${result.stats.nodeCount}`);
    console.log(`HTML大小: ${result.stats.htmlSize} bytes`);

    console.log('\n=== AST 结构 ===');
    console.log(JSON.stringify(result.ast, null, 2).slice(0, 800) + '...');

    // 保存 HTML
    const outputPath = path.join(__dirname, '../../../../demo-compiler-output.html');
    fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

    console.log('\n=== 输出文件 ===');
    console.log(`HTML 已保存到: ${outputPath}`);

    // 验证
    expect(result.ast.children.length).toBeGreaterThan(0);
    expect(result.ssr.html).toContain('<!DOCTYPE html>');
    expect(result.ssr.html).toContain('Stitch Compiler');
  });
});

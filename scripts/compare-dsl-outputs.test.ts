/**
 * 对比两个 DSL 版本的编译输出
 */
import { describe, it } from 'vitest';
import * as fs from 'fs';
import { compile } from '../src/lib/compiler';

describe('Compare DSL Outputs', () => {
  it('compiles both DSL sources and compares', async () => {
    // 读取 JSON 配置（获取统一的 context）
    const jsonData = JSON.parse(fs.readFileSync('test-dsl-components-showcase.json', 'utf-8'));
    const unifiedContext = jsonData.context; // "Stitch 组件展示 (DSL 版本)"
    const unifiedTitle = jsonData.screens[0].title; // "Stitch 组件库"

    // 创建统一的 session（确保 Design Tokens 完全一致）
    const { createSession } = await import('../src/lib/compiler/visual');
    const unifiedSession = createSession();

    // 1. 编译 .dsl 文件（使用统一的 context 和 session）
    const dslFile = fs.readFileSync('test-dsl-components-showcase.dsl', 'utf-8');
    const result1 = await compile(dslFile, {
      context: unifiedContext,
      session: unifiedSession,
      ssr: { title: unifiedTitle, lang: 'zh-CN' },
    });

    // 2. 编译 JSON 中的 DSL（使用相同的 context 和 session）
    const dslFromJson = jsonData.screens[0].dsl;
    const result2 = await compile(dslFromJson, {
      context: unifiedContext,
      session: unifiedSession,
      ssr: { title: unifiedTitle, lang: 'zh-CN' },
    });

    console.log('\n=== 编译结果对比 ===');
    console.log(`DSL 文件: ${result1.ssr.html.length} 字节, ${result1.stats.nodeCount} 节点`);
    console.log(`JSON DSL: ${result2.ssr.html.length} 字节, ${result2.stats.nodeCount} 节点`);

    // 写入文件
    fs.writeFileSync('test-dsl-from-file.html', result1.ssr.html);
    fs.writeFileSync('test-dsl-from-json.html', result2.ssr.html);

    console.log('\n输出文件:');
    console.log('  - test-dsl-from-file.html');
    console.log('  - test-dsl-from-json.html');

    // 简单对比
    if (result1.ssr.html.length === result2.ssr.html.length) {
      console.log('\n✅ 两个版本的 HTML 长度相同');
    } else {
      const diff = Math.abs(result1.ssr.html.length - result2.ssr.html.length);
      console.log(`\n⚠️  长度差异: ${diff} 字节`);
    }
  });
});

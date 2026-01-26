/**
 * 编译 Components Showcase DSL
 */
import { describe, it } from 'vitest';
import * as fs from 'fs';
import { compile } from '../src/lib/compiler';

describe('Compile Components Showcase', () => {
  it('compiles DSL components showcase', async () => {
    // 读取 DSL 文件和 JSON 配置
    const dsl = fs.readFileSync('test-dsl-components-showcase.dsl', 'utf-8');
    const jsonConfig = JSON.parse(fs.readFileSync('test-dsl-components-showcase.json', 'utf-8'));

    // 使用 JSON 配置中的 context 和 title，确保与 JSON 版本输出一致
    const result = await compile(dsl, {
      context: jsonConfig.context,
      ssr: {
        title: jsonConfig.screens[0].title,
        lang: 'zh-CN',
      },
    });

    console.log('=== 编译成功 ===');
    console.log('HTML 大小:', (result.ssr.html.length / 1024).toFixed(2), 'KB');
    console.log('节点数量:', result.stats.nodeCount);
    console.log('解析耗时:', result.stats.parseTime.toFixed(2), 'ms');
    console.log('总耗时:', result.stats.totalTime.toFixed(2), 'ms');

    fs.writeFileSync('test-dsl-components-showcase-new.html', result.ssr.html);
    console.log('\n输出文件: test-dsl-components-showcase-new.html');
  });
});

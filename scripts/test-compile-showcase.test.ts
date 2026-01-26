/**
 * 编译 Components Showcase DSL
 */
import { describe, it } from 'vitest';
import * as fs from 'fs';
import { compile } from '../src/lib/compiler';

describe('Compile Components Showcase', () => {
  it('compiles DSL components showcase', async () => {
    const dsl = fs.readFileSync('test-dsl-components-showcase.dsl', 'utf-8');

    const result = await compile(dsl, {
      context: 'DSL Components Showcase',
      ssr: {
        title: 'Components Showcase',
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

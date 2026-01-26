import { compile } from '../src/lib/compiler/index.ts';
import * as fs from 'fs';

const dsl = fs.readFileSync('test-dsl-components-showcase.dsl', 'utf-8');

try {
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

  fs.writeFileSync('test-dsl-components-showcase-new.html', result.ssr.html);
  console.log('输出: test-dsl-components-showcase-new.html');
} catch (error) {
  console.error('编译失败:', error);
  console.error(error.stack);
  process.exit(1);
}

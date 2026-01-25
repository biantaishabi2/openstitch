import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';

describe('Debug Structure', () => {
  it('should print AST structure', async () => {
    const dslPath = path.join(__dirname, '../../../../demo-dashboard.dsl');
    const dsl = fs.readFileSync(dslPath, 'utf-8');

    const result = await compile(dsl, {
      context: '用户管理系统仪表盘',
      ssr: { title: 'Test', lang: 'zh-CN' },
    });

    console.log('\n=== AST 结构 ===');
    console.log(JSON.stringify(result.ast, null, 2));

    console.log('\n=== UINode/React 树结构 ===');
    console.log(JSON.stringify(result.uiNodes, null, 2));
  });
});

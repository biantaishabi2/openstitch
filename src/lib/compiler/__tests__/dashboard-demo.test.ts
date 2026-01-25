/**
 * 仪表盘演示测试
 *
 * 运行: npx vitest run src/lib/compiler/__tests__/dashboard-demo.test.ts
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';

describe('Dashboard Demo', () => {
  it('should compile dashboard page and save HTML', async () => {
    // 读取 DSL 文件
    const dslPath = path.join(__dirname, '../../../../demo-dashboard.dsl');
    const dsl = fs.readFileSync(dslPath, 'utf-8');

    console.log('\n=== DSL 源码 ===');
    console.log(dsl);

    // 编译
    const result = await compile(dsl, {
      context: '用户管理系统仪表盘',
      ssr: {
        title: 'Stitch Dashboard Demo',
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

    // 保存 HTML
    const outputPath = path.join(__dirname, '../../../../demo-dashboard.html');
    fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

    console.log('\n=== 输出文件 ===');
    console.log(`HTML 已保存到: ${outputPath}`);

    // 验证
    expect(result.ast.children.length).toBeGreaterThan(0);
    expect(result.ssr.html).toContain('<!DOCTYPE html>');
    expect(result.ssr.html).toContain('用户管理仪表盘');
    expect(result.ssr.html).toContain('用户总数');
    expect(result.ssr.html).toContain('活跃用户');
    expect(result.ssr.html).toContain('新增用户');
    expect(result.ssr.html).toContain('新增用户');
    expect(result.ssr.html).toContain('DSL 编译');
    expect(result.ssr.html).not.toContain('[object Object]');
  });
});

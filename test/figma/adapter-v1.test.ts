/**
 * Adapter V1 测试
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { convertFigmaToStitchV1 } from '../../src/figma/adapter-v1';

describe('Adapter V1', () => {
  const figmaJson = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../test-fixtures/figma-to-stitch-demo/figma.json'),
      'utf-8'
    )
  );

  it('should process Figma file with decoration filtering', async () => {
    const result = await convertFigmaToStitchV1(figmaJson, {
      context: '胸科医院首页',
      filterDecorations: true,
      inferLayout: true,
      smartCardDetection: true,
    });

    console.log('\n=== Adapter V1 处理日志 ===');
    result.logs.forEach(log => console.log(log));

    console.log('\n=== 生成的 DSL ===');
    console.log(result.dsl);

    console.log('\n=== 统计信息 ===');
    console.log('总节点数:', result.stats.totalNodes);
    console.log('过滤节点数:', result.stats.filteredNodes);
    console.log('推断布局数:', result.stats.inferredLayouts);
    console.log('识别卡片数:', result.stats.detectedCards);

    // 验证结果
    expect(result.dsl).toBeTruthy();
    expect(result.dsl.length).toBeGreaterThan(0);
    expect(result.stats.totalNodes).toBeGreaterThan(0);
    
    // 保存结果
    const output = {
      meta: {
        context: '胸科医院首页',
        platform: 'mobile',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      },
      screens: [{
        id: 'chest_hospital_home',
        title: '胸科医院首页',
        dsl: result.dsl,
        tokens: result.tokens,
      }],
      stats: result.stats,
      logs: result.logs,
    };

    fs.writeFileSync(
      'test-fixtures/figma-to-stitch-demo/stitch-config-v1.json',
      JSON.stringify(output, null, 2)
    );
    console.log('\n✅ 已保存到 stitch-config-v1.json');
  });

  it('should detect card patterns', async () => {
    const result = await convertFigmaToStitchV1(figmaJson, {
      context: '胸科医院首页',
      filterDecorations: true,
      inferLayout: true,
      smartCardDetection: true,
    });

    // 应该识别出功能入口卡片
    expect(result.stats.detectedCards).toBeGreaterThanOrEqual(5);
    
    // DSL 中应该包含 CARD 标签
    expect(result.dsl).toContain('[CARD:');
  });

  it('should filter decoration nodes', async () => {
    const resultWithFilter = await convertFigmaToStitchV1(figmaJson, {
      filterDecorations: true,
    });

    const resultWithoutFilter = await convertFigmaToStitchV1(figmaJson, {
      filterDecorations: false,
    });

    // 过滤后应该节点更少
    expect(resultWithFilter.stats.filteredNodes).toBeGreaterThan(0);
    expect(resultWithFilter.stats.totalNodes - resultWithFilter.stats.filteredNodes)
      .toBeLessThan(resultWithoutFilter.stats.totalNodes);
  });

  it('should infer layout classes', async () => {
    const result = await convertFigmaToStitchV1(figmaJson, {
      inferLayout: true,
    });

    // 应该有布局推断
    expect(result.stats.inferredLayouts).toBeGreaterThan(0);
    
    // DSL 中应该包含 ClassName
    expect(result.dsl).toContain('{ ClassName:');
  });
});

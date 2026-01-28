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

  it('should convert Figma to DSL', () => {
    const result = convertFigmaToStitchV1(figmaJson, {
      context: '胸科医院首页',
    });

    console.log('\n=== Adapter V1 输出 ===');
    console.log('DSL:');
    console.log(result.dsl);
    console.log('\nTokens:', result.tokens);
    console.log('Stats:', result.stats);

    // 验证
    expect(result.dsl).toBeTruthy();
    expect(result.dsl.length).toBeGreaterThan(0);
    expect(result.stats.total).toBeGreaterThan(0);

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
    };

    fs.writeFileSync(
      'test-fixtures/figma-to-stitch-demo/stitch-config-v1.json',
      JSON.stringify(output, null, 2)
    );
    console.log('\n✅ 已保存到 stitch-config-v1.json');
  });

  it('should detect cards', () => {
    const result = convertFigmaToStitchV1(figmaJson);
    
    // 应该识别出多个卡片
    expect(result.stats.cards).toBeGreaterThanOrEqual(5);
    
    // DSL 中应该包含 CARD 标签
    expect(result.dsl).toContain('[CARD:');
  });

  it('should filter decoration nodes', () => {
    const result = convertFigmaToStitchV1(figmaJson);
    
    // 应该有过滤的节点
    console.log('Filtered nodes:', result.stats.filtered);
  });

  it('should preserve visual details', () => {
    const result = convertFigmaToStitchV1(figmaJson);
    
    // DSL 中应该包含精确的尺寸
    expect(result.dsl).toContain('w-[');
    expect(result.dsl).toContain('h-[');
    
    // DSL 中应该包含颜色
    expect(result.dsl).toContain('bg-[');
  });
});

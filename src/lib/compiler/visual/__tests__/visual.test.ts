/**
 * 视觉引擎测试
 *
 * 测试用例覆盖：
 * - TC-TOKENS-01: Design Tokens 确定性
 * - TC-TOKENS-02: 不同 context 产生不同 Tokens
 * - TC-TOKENS-03: 5 维度完整性
 *
 * 扩展测试：
 * - 6 种场景识别 (technical/finance/medical/education/creative/enterprise)
 * - 边界条件 (空 context、超长 context、特殊字符、Unicode)
 * - 色阶完整性 (50-900 渐变)
 * - 哈希确定性验证
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateDesignTokens,
  tokensToCss,
  tokensToStyle,
  createSession,
  getSession,
  getOrCreateSession,
  getSessionTokens,
  clearAllSessions,
  getTokens,
} from '../index';

// 每个测试前清除 session 缓存
beforeEach(() => {
  clearAllSessions();
});

// ============================================
// TC-TOKENS-01: Design Tokens 确定性
// ============================================

describe('Design Tokens Determinism (TC-TOKENS-01)', () => {
  it('should generate identical tokens for same context + sessionId', () => {
    const options = {
      context: '技术架构文档',
      sessionId: 'sess_001',
    };

    const tokens1 = generateDesignTokens(options);
    const tokens2 = generateDesignTokens(options);

    // 移除时间戳比较
    const { _meta: meta1, ...rest1 } = tokens1;
    const { _meta: meta2, ...rest2 } = tokens2;

    expect(JSON.stringify(rest1)).toBe(JSON.stringify(rest2));
  });

  it('should generate identical tokens with same seed', () => {
    const tokens1 = generateDesignTokens({
      context: 'any context',
      seed: 12345,
    });

    const tokens2 = generateDesignTokens({
      context: 'different context',
      seed: 12345,
    });

    // 相同 seed 应该产生相同的随机变化
    expect(tokens1['--spacing-md']).toBe(tokens2['--spacing-md']);
  });

  it('should include seed in metadata', () => {
    const tokens = generateDesignTokens({
      context: '技术架构',
      sessionId: 'test_123',
    });

    expect(tokens._meta).toBeDefined();
    expect(tokens._meta?.context).toBe('技术架构');
    expect(tokens._meta?.sessionId).toBe('test_123');
    expect(typeof tokens._meta?.seed).toBe('number');
  });
});

// ============================================
// TC-TOKENS-02: 不同 context 产生不同 Tokens
// ============================================

describe('Different Context Different Tokens (TC-TOKENS-02)', () => {
  it('should generate different primary colors for different contexts', () => {
    const techTokens = generateDesignTokens({ context: '技术调研', sessionId: 'test' });
    const eduTokens = generateDesignTokens({ context: '儿童教育', sessionId: 'test' });

    expect(techTokens['--primary-color']).not.toBe(eduTokens['--primary-color']);
  });

  it('should generate different radius for different contexts', () => {
    const financeTokens = generateDesignTokens({ context: '金融后台', sessionId: 'test' });
    const creativeTokens = generateDesignTokens({ context: '创意营销', sessionId: 'test' });

    // 金融用 sharp 风格，创意用 soft 风格
    expect(financeTokens['--radius-md']).not.toBe(creativeTokens['--radius-md']);
  });

  it('should generate different spacing for different contexts', () => {
    const financeTokens = generateDesignTokens({ context: '金融系统', sessionId: 'test' });
    const eduTokens = generateDesignTokens({ context: '儿童教育平台', sessionId: 'test' });

    // 金融用 compact，教育用 spacious
    // 由于随机变化，我们比较基础值差异
    const financeSpacing = parseInt(financeTokens['--spacing-md']);
    const eduSpacing = parseInt(eduTokens['--spacing-md']);

    // 教育场景的间距应该更大
    expect(eduSpacing).toBeGreaterThanOrEqual(financeSpacing);
  });

  it('should detect scene style correctly', () => {
    const techTokens = generateDesignTokens({ context: '系统架构设计' });
    const medTokens = generateDesignTokens({ context: '医疗健康管理' });

    // 技术场景应该是蓝色系
    expect(techTokens['--primary-color']).toMatch(/^#[0-9a-f]{6}$/i);

    // 医疗场景应该是青色系
    expect(medTokens['--primary-color']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(techTokens['--primary-color']).not.toBe(medTokens['--primary-color']);
  });
});

// ============================================
// TC-TOKENS-03: 5 维度完整性
// ============================================

describe('5 Dimensions Completeness (TC-TOKENS-03)', () => {
  it('should include spacing tokens (Dimension A)', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    expect(tokens['--base-unit']).toBeDefined();
    expect(tokens['--spacing-xs']).toBeDefined();
    expect(tokens['--spacing-sm']).toBeDefined();
    expect(tokens['--spacing-md']).toBeDefined();
    expect(tokens['--spacing-lg']).toBeDefined();
    expect(tokens['--spacing-xl']).toBeDefined();
    expect(tokens['--gap-card']).toBeDefined();
    expect(tokens['--padding-card']).toBeDefined();
    expect(tokens['--line-height-body']).toBeDefined();
  });

  it('should include typography tokens (Dimension B)', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    expect(tokens['--font-scale']).toBeDefined();
    expect(tokens['--font-size-xs']).toBeDefined();
    expect(tokens['--font-size-sm']).toBeDefined();
    expect(tokens['--font-size-base']).toBeDefined();
    expect(tokens['--font-size-lg']).toBeDefined();
    expect(tokens['--font-size-xl']).toBeDefined();
    expect(tokens['--font-weight-normal']).toBeDefined();
    expect(tokens['--font-weight-bold']).toBeDefined();
  });

  it('should include shape tokens (Dimension C)', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    expect(tokens['--radius-sm']).toBeDefined();
    expect(tokens['--radius-md']).toBeDefined();
    expect(tokens['--radius-lg']).toBeDefined();
    expect(tokens['--radius-full']).toBeDefined();
    expect(tokens['--shadow-sm']).toBeDefined();
    expect(tokens['--shadow-md']).toBeDefined();
    expect(tokens['--shadow-lg']).toBeDefined();
  });

  it('should include ornament tokens (Dimension D)', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    expect(tokens['--pattern-dots']).toBeDefined();
    expect(tokens['--pattern-dots-size']).toBeDefined();
    expect(tokens['--pattern-grid']).toBeDefined();
    expect(tokens['--noise-opacity']).toBeDefined();
  });

  it('should include color tokens (Dimension E)', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    expect(tokens['--primary-color']).toBeDefined();
    expect(tokens['--primary-50']).toBeDefined();
    expect(tokens['--primary-100']).toBeDefined();
    expect(tokens['--primary-500']).toBeDefined();
    expect(tokens['--primary-900']).toBeDefined();
    expect(tokens['--secondary-color']).toBeDefined();
    expect(tokens['--accent-color']).toBeDefined();
    expect(tokens['--background']).toBeDefined();
    expect(tokens['--foreground']).toBeDefined();
    expect(tokens['--muted']).toBeDefined();
    expect(tokens['--border']).toBeDefined();
  });

  it('should generate valid CSS variable values', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    // 检查像素值格式
    expect(tokens['--spacing-md']).toMatch(/^\d+px$/);
    expect(tokens['--radius-md']).toMatch(/^\d+px$/);

    // 检查颜色格式
    expect(tokens['--primary-color']).toMatch(/^#[0-9a-f]{6}$/i);

    // 检查数字格式
    expect(tokens['--line-height-body']).toMatch(/^\d+(\.\d+)?$/);
  });
});

// ============================================
// 工具函数测试
// ============================================

describe('Utility Functions', () => {
  it('should convert tokens to CSS string', () => {
    const tokens = generateDesignTokens({ context: 'test' });
    const css = tokensToCss(tokens);

    expect(css).toContain(':root {');
    expect(css).toContain('--primary-color:');
    expect(css).toContain('--spacing-md:');
    expect(css).toContain('}');
  });

  it('should convert tokens to style object', () => {
    const tokens = generateDesignTokens({ context: 'test' });
    const style = tokensToStyle(tokens);

    expect(style['--primary-color']).toBeDefined();
    expect(style['--spacing-md']).toBeDefined();
    // 不应包含 _meta
    expect(style['_meta']).toBeUndefined();
  });
});

// ============================================
// Session 管理测试
// ============================================

describe('Session Management', () => {
  it('should create and retrieve session', () => {
    const session = createSession('技术文档', 'sess_test');

    expect(session.sessionId).toBe('sess_test');
    expect(session.context).toBe('技术文档');

    const retrieved = getSession('sess_test');
    expect(retrieved).toEqual(session);
  });

  it('should return undefined for non-existent session', () => {
    const session = getSession('non_existent');
    expect(session).toBeUndefined();
  });

  it('should get or create session', () => {
    // 创建新的
    const session1 = getOrCreateSession('context1', 'sess_1');
    expect(session1.sessionId).toBe('sess_1');

    // 获取已存在的
    const session2 = getOrCreateSession('context2', 'sess_1');
    expect(session2).toBe(session1);
    expect(session2.context).toBe('context1'); // context 不变
  });

  it('should cache tokens in session', () => {
    const session = createSession('技术架构', 'sess_cache');

    // 第一次获取
    const tokens1 = getSessionTokens('sess_cache');
    expect(tokens1).toBeDefined();

    // 第二次获取应该是缓存
    const tokens2 = getSessionTokens('sess_cache');
    expect(tokens2).toBe(tokens1);
  });

  it('should provide convenient getTokens function', () => {
    const tokens = getTokens({
      context: '企业管理系统',
      sessionId: 'sess_convenient',
    });

    expect(tokens['--primary-color']).toBeDefined();

    // session 应该被创建
    const session = getSession('sess_convenient');
    expect(session).toBeDefined();
  });
});

// ============================================
// 覆盖测试
// ============================================

describe('Token Overrides', () => {
  it('should apply overrides', () => {
    const tokens = generateDesignTokens({
      context: 'test',
      overrides: {
        '--primary-color': '#ff0000',
        '--spacing-md': '20px',
      },
    });

    expect(tokens['--primary-color']).toBe('#ff0000');
    expect(tokens['--spacing-md']).toBe('20px');
  });

  it('should preserve non-overridden tokens', () => {
    const baseTokens = generateDesignTokens({ context: 'test' });
    const overriddenTokens = generateDesignTokens({
      context: 'test',
      overrides: { '--primary-color': '#ff0000' },
    });

    expect(overriddenTokens['--spacing-md']).toBe(baseTokens['--spacing-md']);
    expect(overriddenTokens['--radius-md']).toBe(baseTokens['--radius-md']);
  });
});

// ============================================
// 6 种场景识别测试
// ============================================

describe('Scene Detection (All 6 Scenes)', () => {
  // 场景预期配置
  const sceneExpectations = [
    {
      name: 'technical',
      context: '系统架构设计文档',
      expectedSpacing: 'normal',  // baseUnit: 8, multiplier: 1.0
      expectedShape: 'rounded',   // radiusMd: 6
      expectedOrnament: 'none',   // noiseOpacity: 0
    },
    {
      name: 'finance',
      context: '金融财务银行',  // 纯 finance 关键词，避免匹配其他场景
      expectedSpacing: 'compact', // baseUnit: 4, multiplier: 0.8
      expectedShape: 'sharp',     // radiusMd: 4
      expectedOrnament: 'subtle', // noiseOpacity: 0.02
    },
    {
      name: 'medical',
      context: '医疗健康管理平台',
      expectedSpacing: 'normal',
      expectedShape: 'soft',      // radiusMd: 12
      expectedOrnament: 'none',
    },
    {
      name: 'education',
      context: '儿童教育学习平台',
      expectedSpacing: 'spacious', // baseUnit: 8, multiplier: 1.5
      expectedShape: 'pill',       // radiusMd: 16
      expectedOrnament: 'moderate',
    },
    {
      name: 'creative',
      context: '创意营销设计展示',
      expectedSpacing: 'spacious',
      expectedShape: 'soft',
      expectedOrnament: 'rich',   // noiseOpacity: 0.05
    },
    {
      name: 'enterprise',
      context: '企业管理运营系统',
      expectedSpacing: 'compact',
      expectedShape: 'rounded',
      expectedOrnament: 'subtle',
    },
  ];

  it.each(sceneExpectations)(
    'should detect $name scene from context "$context"',
    ({ context, expectedShape }) => {
      const tokens = generateDesignTokens({ context, sessionId: 'scene_test' });

      // 验证生成了有效的 tokens
      expect(tokens['--primary-color']).toMatch(/^#[0-9a-f]{6}$/i);
      expect(tokens['--spacing-md']).toMatch(/^\d+px$/);
      expect(tokens['--radius-md']).toMatch(/^\d+px$/);

      // 验证形状风格符合预期
      const radiusMd = parseInt(tokens['--radius-md']);
      if (expectedShape === 'sharp') {
        expect(radiusMd).toBeLessThanOrEqual(4);
      } else if (expectedShape === 'pill') {
        expect(radiusMd).toBeGreaterThanOrEqual(16);
      } else if (expectedShape === 'soft') {
        expect(radiusMd).toBeGreaterThanOrEqual(10);
      }
    }
  );

  it('should generate unique primary colors for each scene', () => {
    const colors = sceneExpectations.map(({ context }) => {
      const tokens = generateDesignTokens({ context, seed: 42 }); // 固定 seed 消除随机
      return tokens['--primary-color'];
    });

    // 至少应该有 4 种不同的颜色（允许部分场景相近）
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBeGreaterThanOrEqual(4);
  });

  it('should apply different ornament levels for each scene', () => {
    const technicalTokens = generateDesignTokens({ context: '技术架构' });
    const creativeTokens = generateDesignTokens({ context: '创意设计' });

    const techNoise = parseFloat(technicalTokens['--noise-opacity']);
    const creativeNoise = parseFloat(creativeTokens['--noise-opacity']);

    // 创意场景的装饰强度应该更高
    expect(creativeNoise).toBeGreaterThan(techNoise);
  });
});

// ============================================
// 边界条件测试
// ============================================

describe('Edge Cases', () => {
  it('should handle empty context gracefully', () => {
    const tokens = generateDesignTokens({ context: '' });

    // 应该回退到 default 场景
    expect(tokens['--primary-color']).toBeDefined();
    expect(tokens['--spacing-md']).toBeDefined();
    expect(tokens._meta?.context).toBe('');
  });

  it('should handle very long context', () => {
    const longContext = '这是一个非常长的上下文描述'.repeat(100);
    const tokens = generateDesignTokens({ context: longContext });

    // 应该正常生成
    expect(tokens['--primary-color']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens['--spacing-md']).toMatch(/^\d+px$/);
  });

  it('should handle context with special characters', () => {
    const specialContext = '技术架构 @#$%^&*() 设计文档 <script>alert(1)</script>';
    const tokens = generateDesignTokens({ context: specialContext });

    // 应该正常生成，且识别为技术场景
    expect(tokens['--primary-color']).toBeDefined();
  });

  it('should handle unicode context', () => {
    const unicodeContext = '技術アーキテクチャ 🚀 설계 документация';
    const tokens = generateDesignTokens({ context: unicodeContext });

    expect(tokens['--primary-color']).toBeDefined();
  });

  it('should handle context with only whitespace', () => {
    const tokens = generateDesignTokens({ context: '   \t\n   ' });

    // 应该回退到 default 场景
    expect(tokens['--primary-color']).toBeDefined();
  });

  it('should generate different tokens for different sessionIds with same context', () => {
    const tokens1 = generateDesignTokens({ context: '技术文档', sessionId: 'session_a' });
    const tokens2 = generateDesignTokens({ context: '技术文档', sessionId: 'session_b' });

    // 不同 sessionId 应该产生不同的随机变化
    // 由于场景相同，主色调相近，但随机变化会导致微小差异
    const { _meta: m1, ...rest1 } = tokens1;
    const { _meta: m2, ...rest2 } = tokens2;

    // 至少有一个 token 应该不同
    expect(JSON.stringify(rest1)).not.toBe(JSON.stringify(rest2));
  });
});

// ============================================
// 色阶完整性测试
// ============================================

describe('Color Scale Completeness', () => {
  const colorSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  it('should generate complete primary color scale (50-900)', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    colorSteps.forEach(step => {
      const key = `--primary-${step}` as keyof typeof tokens;
      expect(tokens[key]).toBeDefined();
      expect(tokens[key]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('should generate progressively darker colors from 50 to 900', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    // 简单检查：50 应该比 900 更亮（hex 值更大）
    const color50 = tokens['--primary-50'] as string;
    const color900 = tokens['--primary-900'] as string;

    // 提取亮度（简单用 RGB 平均值近似）
    const hexToRgbAvg = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return (r + g + b) / 3;
    };

    expect(hexToRgbAvg(color50)).toBeGreaterThan(hexToRgbAvg(color900));
  });

  it('should generate consistent color scale across different scenes', () => {
    const scenes = ['技术架构', '金融后台', '医疗健康', '儿童教育'];

    scenes.forEach(context => {
      const tokens = generateDesignTokens({ context });

      // 每个场景都应该有完整的色阶
      colorSteps.forEach(step => {
        const key = `--primary-${step}` as keyof typeof tokens;
        expect(tokens[key]).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  it('should have primary-500 close to primary-color', () => {
    const tokens = generateDesignTokens({ context: 'test' });

    // primary-500 是色阶中间值，应该接近主色
    // 由于 HSL 转换，可能不完全相同，但应该在同一色系
    const primaryColor = tokens['--primary-color'] as string;
    const primary500 = tokens['--primary-500'] as string;

    // 至少前两位（红色通道）应该接近
    const rDiff = Math.abs(
      parseInt(primaryColor.slice(1, 3), 16) - parseInt(primary500.slice(1, 3), 16)
    );
    expect(rDiff).toBeLessThan(50); // 允许一定误差
  });
});

// ============================================
// 哈希确定性测试
// ============================================

describe('Hash Determinism', () => {
  it('should produce same hash for same input across multiple calls', () => {
    const context = '技术架构文档';
    const sessionId = 'test_hash';

    // 调用 100 次，结果应该完全一致
    const results = Array(100).fill(null).map(() => {
      const tokens = generateDesignTokens({ context, sessionId });
      const { _meta, ...rest } = tokens;
      return JSON.stringify(rest);
    });

    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBe(1);
  });

  it('should produce different tokens for slightly different contexts', () => {
    const tokens1 = generateDesignTokens({ context: '技术架构' });
    const tokens2 = generateDesignTokens({ context: '技术架构设计' });

    // 不同 context 应该产生不同的 seed
    expect(tokens1._meta?.seed).not.toBe(tokens2._meta?.seed);
  });
});

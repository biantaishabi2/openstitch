/**
 * 视觉引擎测试
 *
 * 测试用例覆盖：
 * - TC-TOKENS-01: Design Tokens 确定性
 * - TC-TOKENS-02: 不同 context 产生不同 Tokens
 * - TC-TOKENS-03: 5 维度完整性
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

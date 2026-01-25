/**
 * 设计系统合成器 (Design System Synthesizer)
 *
 * 核心职责：context + Hash 种子 → Design Tokens (5 维度)
 *
 * 5 个控制维度：
 * - A. 空间尺度 (Spacing) - 呼吸感
 * - B. 字体排版 (Typography) - 字阶比率
 * - C. 形状边框 (Shape) - 圆角、阴影
 * - D. 装饰纹理 (Ornamentation) - 背景纹理
 * - E. 语义颜色 (Semantic Mapping) - 颜色映射
 */

import type {
  DesignTokens,
  SceneStyle,
  SpacingDensity,
  TypeScale,
  ShapeStyle,
  OrnamentLevel,
  SynthesizerOptions,
} from './types';

// ============================================
// Hash 函数 - 确定性种子生成
// ============================================

/**
 * 简单的字符串哈希函数 (djb2 算法)
 * 保证同样输入 → 同样输出
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // 转为无符号整数
}

/**
 * 基于种子的伪随机数生成器 (Mulberry32)
 * 确定性：同样的种子产生同样的序列
 */
function createRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * 从数组中根据种子确定性选择
 */
function pickFromSeed<T>(arr: T[], random: () => number): T {
  const index = Math.floor(random() * arr.length);
  return arr[index];
}

// ============================================
// 场景识别
// ============================================

/** 场景关键词映射 */
const SCENE_KEYWORDS: Record<SceneStyle, string[]> = {
  technical: ['技术', '架构', '开发', '代码', '系统', 'API', '工程'],
  finance: ['金融', '财务', '银行', '投资', '交易', '支付', '账户'],
  medical: ['医疗', '健康', '医院', '诊断', '患者', '药品', '护理'],
  education: ['教育', '儿童', '学习', '课程', '学生', '培训', '教学'],
  creative: ['创意', '营销', '设计', '品牌', '广告', '艺术', '展示'],
  enterprise: ['企业', '管理', '办公', '后台', '运营', '数据', '报表'],
  default: [],
};

/**
 * 根据 context 识别场景风格
 */
function detectSceneStyle(context: string): SceneStyle {
  for (const [style, keywords] of Object.entries(SCENE_KEYWORDS)) {
    if (keywords.some(kw => context.includes(kw))) {
      return style as SceneStyle;
    }
  }
  return 'default';
}

// ============================================
// 维度 A: 空间尺度生成
// ============================================

/** 空间密度预设 */
const SPACING_PRESETS: Record<SpacingDensity, {
  baseUnit: number;
  multiplier: number;
  lineHeight: number;
}> = {
  compact: { baseUnit: 4, multiplier: 0.8, lineHeight: 1.4 },
  normal: { baseUnit: 8, multiplier: 1.0, lineHeight: 1.5 },
  spacious: { baseUnit: 8, multiplier: 1.5, lineHeight: 1.75 },
};

/** 场景到空间密度的映射 */
const SCENE_TO_SPACING: Record<SceneStyle, SpacingDensity> = {
  technical: 'normal',
  finance: 'compact',
  medical: 'normal',
  education: 'spacious',
  creative: 'spacious',
  enterprise: 'compact',
  default: 'normal',
};

function generateSpacingTokens(scene: SceneStyle, random: () => number): Partial<DesignTokens> {
  const density = SCENE_TO_SPACING[scene];
  const preset = SPACING_PRESETS[density];
  const { baseUnit, multiplier, lineHeight } = preset;

  // 添加少量随机变化 (±10%)
  const variation = 0.9 + random() * 0.2;
  const m = multiplier * variation;

  return {
    '--base-unit': `${baseUnit}px`,
    '--spacing-xs': `${Math.round(baseUnit * 0.5 * m)}px`,
    '--spacing-sm': `${Math.round(baseUnit * 1 * m)}px`,
    '--spacing-md': `${Math.round(baseUnit * 2 * m)}px`,
    '--spacing-lg': `${Math.round(baseUnit * 3 * m)}px`,
    '--spacing-xl': `${Math.round(baseUnit * 4 * m)}px`,
    '--gap-card': `${Math.round(baseUnit * 2 * m)}px`,
    '--padding-card': `${Math.round(baseUnit * 2 * m)}px`,
    '--padding-section': `${Math.round(baseUnit * 3 * m)}px`,
    '--line-height-body': lineHeight.toFixed(2),
  };
}

// ============================================
// 维度 B: 字体排版生成
// ============================================

/** 字阶比率值 */
const TYPE_SCALE_VALUES: Record<TypeScale, number> = {
  'minor-second': 1.067,
  'major-second': 1.125,
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'golden-ratio': 1.618,
};

/** 场景到字阶比率的映射 */
const SCENE_TO_TYPE_SCALE: Record<SceneStyle, TypeScale> = {
  technical: 'major-second',
  finance: 'major-second',
  medical: 'minor-third',
  education: 'major-third',
  creative: 'perfect-fourth',
  enterprise: 'major-second',
  default: 'major-third',
};

function generateTypographyTokens(scene: SceneStyle, random: () => number): Partial<DesignTokens> {
  const typeScale = SCENE_TO_TYPE_SCALE[scene];
  const scale = TYPE_SCALE_VALUES[typeScale];
  const baseSize = 16;

  // 计算各级字号
  const sizes = {
    xs: baseSize / scale / scale,
    sm: baseSize / scale,
    base: baseSize,
    lg: baseSize * scale,
    xl: baseSize * scale * scale,
    '2xl': baseSize * scale * scale * scale,
    '3xl': baseSize * scale * scale * scale * scale,
  };

  return {
    '--font-scale': scale.toFixed(3),
    '--font-size-xs': `${sizes.xs.toFixed(2)}px`,
    '--font-size-sm': `${sizes.sm.toFixed(2)}px`,
    '--font-size-base': `${sizes.base}px`,
    '--font-size-lg': `${sizes.lg.toFixed(2)}px`,
    '--font-size-xl': `${sizes.xl.toFixed(2)}px`,
    '--font-size-2xl': `${sizes['2xl'].toFixed(2)}px`,
    '--font-size-3xl': `${sizes['3xl'].toFixed(2)}px`,
    '--font-weight-normal': '400',
    '--font-weight-medium': '500',
    '--font-weight-semibold': '600',
    '--font-weight-bold': '700',
  };
}

// ============================================
// 维度 C: 形状边框生成
// ============================================

/** 形状风格预设 */
const SHAPE_PRESETS: Record<ShapeStyle, {
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
  shadowIntensity: number;
}> = {
  sharp: { radiusSm: 2, radiusMd: 4, radiusLg: 6, shadowIntensity: 0.15 },
  rounded: { radiusSm: 4, radiusMd: 6, radiusLg: 8, shadowIntensity: 0.1 },
  soft: { radiusSm: 8, radiusMd: 12, radiusLg: 16, shadowIntensity: 0.06 },
  pill: { radiusSm: 12, radiusMd: 16, radiusLg: 24, shadowIntensity: 0.04 },
};

/** 场景到形状风格的映射 */
const SCENE_TO_SHAPE: Record<SceneStyle, ShapeStyle> = {
  technical: 'rounded',
  finance: 'sharp',
  medical: 'soft',
  education: 'pill',
  creative: 'soft',
  enterprise: 'rounded',
  default: 'rounded',
};

function generateShapeTokens(scene: SceneStyle, random: () => number): Partial<DesignTokens> {
  const shape = SCENE_TO_SHAPE[scene];
  const preset = SHAPE_PRESETS[shape];
  const { radiusSm, radiusMd, radiusLg, shadowIntensity } = preset;

  return {
    '--radius-sm': `${radiusSm}px`,
    '--radius-md': `${radiusMd}px`,
    '--radius-lg': `${radiusLg}px`,
    '--radius-full': '9999px',
    '--shadow-sm': `0 1px 2px rgba(0,0,0,${(shadowIntensity * 0.5).toFixed(2)})`,
    '--shadow-md': `0 4px 6px rgba(0,0,0,${shadowIntensity.toFixed(2)})`,
    '--shadow-lg': `0 10px 15px rgba(0,0,0,${(shadowIntensity * 1.2).toFixed(2)})`,
  };
}

// ============================================
// 维度 D: 装饰纹理生成
// ============================================

/** 场景到装饰强度的映射 */
const SCENE_TO_ORNAMENT: Record<SceneStyle, OrnamentLevel> = {
  technical: 'none',
  finance: 'subtle',
  medical: 'none',
  education: 'moderate',
  creative: 'rich',
  enterprise: 'subtle',
  default: 'subtle',
};

/** 装饰强度预设 */
const ORNAMENT_PRESETS: Record<OrnamentLevel, { noiseOpacity: number; patternOpacity: number }> = {
  none: { noiseOpacity: 0, patternOpacity: 0 },
  subtle: { noiseOpacity: 0.02, patternOpacity: 0.02 },
  moderate: { noiseOpacity: 0.03, patternOpacity: 0.03 },
  rich: { noiseOpacity: 0.05, patternOpacity: 0.05 },
};

function generateOrnamentTokens(scene: SceneStyle, random: () => number): Partial<DesignTokens> {
  const level = SCENE_TO_ORNAMENT[scene];
  const preset = ORNAMENT_PRESETS[level];

  return {
    '--pattern-dots': `radial-gradient(circle, rgba(0,0,0,${preset.patternOpacity}) 1px, transparent 1px)`,
    '--pattern-dots-size': '20px 20px',
    '--pattern-grid': `linear-gradient(rgba(0,0,0,${preset.patternOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${preset.patternOpacity}) 1px, transparent 1px)`,
    '--pattern-grid-size': '24px 24px',
    '--gradient-fade': 'linear-gradient(180deg, transparent 0%, var(--background) 100%)',
    '--noise-opacity': preset.noiseOpacity.toFixed(2),
  };
}

// ============================================
// 维度 E: 语义颜色生成
// ============================================

/** 场景主色预设 */
const SCENE_PRIMARY_COLORS: Record<SceneStyle, { h: number; s: number; l: number }> = {
  technical: { h: 217, s: 91, l: 60 },   // 蓝色 #3B82F6
  finance: { h: 243, s: 75, l: 59 },     // 靛蓝 #6366F1
  medical: { h: 188, s: 78, l: 41 },     // 青色 #0891B2
  education: { h: 25, s: 95, l: 53 },    // 橙色 #F97316
  creative: { h: 280, s: 87, l: 56 },    // 紫色 #A855F7
  enterprise: { h: 221, s: 83, l: 53 },  // 蓝色 #2563EB
  default: { h: 217, s: 91, l: 60 },     // 蓝色
};

/**
 * HSL 转 Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * HSL 转 CSS HSL 值格式 (用于 CSS 变量)
 * 例如: hslToCSSValue(217, 91, 60) => "217 91% 60%"
 */
function hslToCSSValue(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

/**
 * 生成色阶 (50-900)
 */
function generateColorScale(h: number, s: number): Record<string, string> {
  const lightnesses = [97, 93, 86, 76, 62, 50, 42, 34, 26, 17];
  const scale: Record<string, string> = {};
  const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  steps.forEach((step, i) => {
    scale[`--primary-${step}`] = hslToHex(h, s, lightnesses[i]);
  });

  return scale;
}

function generateColorTokens(scene: SceneStyle, random: () => number): Partial<DesignTokens> {
  const primary = SCENE_PRIMARY_COLORS[scene];

  // 添加少量色相变化 (±5度)
  const hVariation = (random() - 0.5) * 10;
  const h = Math.round(primary.h + hVariation);
  const s = primary.s;
  const l = primary.l;

  const colorScale = generateColorScale(h, s);

  // HSL CSS 值格式 (用于 Tailwind/shadcn)
  const primaryHSL = hslToCSSValue(h, s, l);
  const secondaryH = (h + 30) % 360;
  const accentH = (h + 180) % 360;

  return {
    // 保留 HEX 格式用于兼容
    '--primary-color': hslToHex(h, s, l),
    ...colorScale,
    '--secondary-color': hslToHex(secondaryH, s * 0.7, l + 10),
    '--accent-color': hslToHex(accentH, s * 0.8, l),

    // HSL CSS 值格式 (用于 Tailwind/shadcn 类名)
    '--background': '0 0% 100%',
    '--foreground': '222 47% 11%',
    '--card': '0 0% 100%',
    '--card-foreground': '222 47% 11%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222 47% 11%',
    '--primary': primaryHSL,
    '--primary-foreground': '0 0% 100%',
    '--secondary': hslToCSSValue(secondaryH, s * 0.7, 96),
    '--secondary-foreground': hslToCSSValue(secondaryH, s * 0.7, 20),
    '--muted': '210 40% 96%',
    '--muted-foreground': '215 16% 47%',
    '--accent': hslToCSSValue(accentH, 40, 96),
    '--accent-foreground': hslToCSSValue(accentH, s * 0.8, 20),
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '214 32% 91%',
    '--input': '214 32% 91%',
    '--ring': primaryHSL,
  };
}

// ============================================
// 合成器主函数
// ============================================

/**
 * 生成 Design Tokens
 *
 * @param options 合成器选项
 * @returns 完整的 Design Tokens
 *
 * @example
 * ```typescript
 * const tokens = generateDesignTokens({
 *   context: '技术架构文档',
 *   sessionId: 'sess_123',
 * });
 * ```
 */
export function generateDesignTokens(options: SynthesizerOptions): DesignTokens {
  const { context, sessionId = 'default', seed: customSeed, overrides } = options;

  // 1. 计算确定性种子
  const seed = customSeed ?? hashString(`${context}:${sessionId}`);
  const random = createRandom(seed);

  // 2. 识别场景风格
  const scene = detectSceneStyle(context);

  // 3. 生成各维度 Tokens
  const spacing = generateSpacingTokens(scene, random);
  const typography = generateTypographyTokens(scene, random);
  const shape = generateShapeTokens(scene, random);
  const ornament = generateOrnamentTokens(scene, random);
  const colors = generateColorTokens(scene, random);

  // 4. 合并所有 Tokens
  const tokens: DesignTokens = {
    ...spacing,
    ...typography,
    ...shape,
    ...ornament,
    ...colors,
    _meta: {
      context,
      sessionId,
      seed,
      generatedAt: new Date().toISOString(),
    },
  } as DesignTokens;

  // 5. 应用覆盖
  if (overrides) {
    Object.assign(tokens, overrides);
  }

  return tokens;
}

/**
 * 将 Design Tokens 转换为 CSS 字符串
 */
export function tokensToCss(tokens: DesignTokens): string {
  const lines = [':root {'];

  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('--')) {
      lines.push(`  ${key}: ${value};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * 将 Design Tokens 转换为 style 对象 (用于 React)
 */
export function tokensToStyle(tokens: DesignTokens): Record<string, string> {
  const style: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('--')) {
      style[key] = value as string;
    }
  }

  return style;
}

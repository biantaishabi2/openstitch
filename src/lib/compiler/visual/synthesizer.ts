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
 *
 * 配置外置：所有可调参数从 config/*.json 读取
 */

import type { DesignTokens, SynthesizerOptions } from './types';
import {
  type SceneStyle,
  type ShapeStyle,
  type OrnamentLevel,
  detectSceneStyle,
  getSceneConstraints,
  getTypeScale,
  getShapeStyle,
  getShadowIntensity,
  getOrnamentLevel,
  TYPOGRAPHY_CONFIG,
  ORNAMENT_CONFIG,
} from '../config';

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

// ============================================
// 维度 A: 空间尺度生成
// ============================================

/**
 * 空间尺度生成
 *
 * 规则:
 *   baseUnit = (Hash % 2 == 0) ? 4px : 8px
 *   步进序列: 几何级数 (2^n)
 *   场景修正: multiplier = 场景系数 (compact: 0.8, spacious: 1.5)
 */
function generateSpacingTokens(seed: number, scene: SceneStyle): Partial<DesignTokens> {
  // 基础单位由 Hash 决定
  const baseUnit = (seed % 2 === 0) ? 4 : 8;

  // 场景修正系数（从配置读取）
  const constraints = getSceneConstraints(scene);
  const multiplier = constraints.spacingMultiplier;

  // 行高根据场景调整
  const lineHeight = multiplier >= 1.3 ? 1.75 : (multiplier <= 0.85 ? 1.4 : 1.5);

  // 几何级数间距 (2^n)
  const space1 = Math.round(baseUnit * 1 * multiplier);   // XS
  const space2 = Math.round(baseUnit * 2 * multiplier);   // SM
  const space3 = Math.round(baseUnit * 4 * multiplier);   // MD
  const space4 = Math.round(baseUnit * 8 * multiplier);   // LG
  const space5 = Math.round(baseUnit * 16 * multiplier);  // XL

  return {
    '--base-unit': `${baseUnit}px`,
    '--spacing-xs': `${space1}px`,
    '--spacing-sm': `${space2}px`,
    '--spacing-md': `${space3}px`,
    '--spacing-lg': `${space4}px`,
    '--spacing-xl': `${space5}px`,
    '--gap-card': `${space3}px`,
    '--padding-card': `${space3}px`,
    '--padding-section': `${space4}px`,
    '--line-height-body': lineHeight.toFixed(2),
  };
}

// ============================================
// 维度 B: 字体排版生成
// ============================================

/**
 * 字体排版生成
 *
 * 规则:
 *   scale = SCALES[Hash % n]（从配置读取）
 *   base = 16px
 *   size(n) = base * scale^n
 */
function generateTypographyTokens(seed: number): Partial<DesignTokens> {
  // 字阶比率由 Hash 决定（从配置读取）
  const scale = getTypeScale(seed);
  const baseSize = TYPOGRAPHY_CONFIG.baseSize;
  const maxFontSize = TYPOGRAPHY_CONFIG.maxFontSize;

  // 计算各级字号 (模块化比例)，限制最大值
  const sizes = {
    xs: baseSize / (scale * scale),
    sm: baseSize / scale,
    base: baseSize,
    lg: baseSize * scale,
    xl: baseSize * scale * scale,
    '2xl': Math.min(baseSize * scale * scale * scale, maxFontSize),
    '3xl': Math.min(baseSize * scale * scale * scale * scale, maxFontSize),
  };

  const weights = TYPOGRAPHY_CONFIG.weights;

  return {
    '--font-scale': scale.toFixed(3),
    '--font-size-xs': `${sizes.xs.toFixed(2)}px`,
    '--font-size-sm': `${sizes.sm.toFixed(2)}px`,
    '--font-size-base': `${sizes.base}px`,
    '--font-size-lg': `${sizes.lg.toFixed(2)}px`,
    '--font-size-xl': `${sizes.xl.toFixed(2)}px`,
    '--font-size-2xl': `${sizes['2xl'].toFixed(2)}px`,
    '--font-size-3xl': `${sizes['3xl'].toFixed(2)}px`,
    '--font-weight-normal': String(weights.normal),
    '--font-weight-medium': String(weights.medium),
    '--font-weight-semibold': String(weights.semibold),
    '--font-weight-bold': String(weights.bold),
  };
}

// ============================================
// 维度 C: 形状边框生成
// ============================================

/**
 * 形状边框生成
 *
 * 规则:
 *   baseRadius = (Hash % 4) * 2 + 2  // 结果: 2, 4, 6, 8
 *   场景修正: 从配置读取
 */
function generateShapeTokens(seed: number, scene: SceneStyle): Partial<DesignTokens> {
  // 基础圆角由 Hash 决定
  const baseRadius = (seed % 4) * 2 + 2;  // 2, 4, 6, 8

  // 场景修正（从配置读取）
  const constraints = getSceneConstraints(scene);
  const shapeStyle = constraints.shapeStyle as ShapeStyle;
  const config = getShapeStyle(shapeStyle);

  // 场景情绪修正：某些场景需要更大的最小圆角（如医疗 = 安全亲和）
  const sceneMinRadius = constraints.shapeMinRadius ?? config.minRadius;
  const effectiveMinRadius = Math.max(config.minRadius, sceneMinRadius);

  // 计算实际圆角，保证最小值
  const radiusSm = Math.max(Math.round(baseRadius * 0.5 * config.multiplier), Math.round(effectiveMinRadius * 0.5));
  const radiusMd = Math.max(Math.round(baseRadius * 1 * config.multiplier), effectiveMinRadius);
  const radiusLg = Math.max(Math.round(baseRadius * 2 * config.multiplier), Math.round(effectiveMinRadius * 2));

  // 阴影强度（从配置读取）
  const shadowBase = getShadowIntensity(shapeStyle);

  return {
    '--radius-sm': `${radiusSm}px`,
    '--radius-md': `${radiusMd}px`,
    '--radius-lg': `${radiusLg}px`,
    '--radius-full': '9999px',
    '--shadow-sm': `0 1px 2px rgba(0,0,0,${(shadowBase * 0.5).toFixed(2)})`,
    '--shadow-md': `0 4px 6px rgba(0,0,0,${shadowBase.toFixed(2)})`,
    '--shadow-lg': `0 10px 15px rgba(0,0,0,${(shadowBase * 1.2).toFixed(2)})`,
  };
}

// ============================================
// 维度 D: 装饰纹理生成
// ============================================

/**
 * 装饰纹理生成
 *
 * 规则:
 *   pattern = PATTERNS[Hash % n]（从配置读取）
 *   opacity = 场景约束
 */
function generateOrnamentTokens(seed: number, scene: SceneStyle): Partial<DesignTokens> {
  // 图案类型由 Hash 决定（从配置读取）
  const patterns = ORNAMENT_CONFIG.patterns;
  const patternIndex = seed % patterns.length;
  const patternType = patterns[patternIndex];

  // 基础透明度由 Hash 决定
  const baseOpacity = (seed % 5) / 100;  // 0.00 - 0.04

  // 场景修正（从配置读取）
  const constraints = getSceneConstraints(scene);
  const ornamentLevel = constraints.ornamentLevel as OrnamentLevel;
  const preset = getOrnamentLevel(ornamentLevel);

  // 最终透明度 = 场景约束
  const patternOpacity = ornamentLevel === 'none' ? 0 : Math.max(baseOpacity, preset.patternOpacity);
  const noiseOpacity = ornamentLevel === 'none' ? 0 : preset.noiseOpacity;

  return {
    '--pattern-type': patternType,
    '--pattern-dots': `radial-gradient(circle, rgba(0,0,0,${patternOpacity.toFixed(2)}) 1px, transparent 1px)`,
    '--pattern-dots-size': '20px 20px',
    '--pattern-grid': `linear-gradient(rgba(0,0,0,${patternOpacity.toFixed(2)}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${patternOpacity.toFixed(2)}) 1px, transparent 1px)`,
    '--pattern-grid-size': '24px 24px',
    '--gradient-fade': 'linear-gradient(180deg, transparent 0%, var(--background) 100%)',
    '--noise-opacity': noiseOpacity.toFixed(2),
  };
}

// ============================================
// 维度 E: 语义颜色生成
// ============================================

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

/**
 * 颜色系统生成
 *
 * 规则:
 *   主色相: Hue = Hash % 360
 *   饱和度/亮度: 场景约束范围（从配置读取）
 */
function generateColorTokens(seed: number, scene: SceneStyle, random: () => number): Partial<DesignTokens> {
  const constraints = getSceneConstraints(scene);

  // 主色相由 Hash 决定
  const h = seed % 360;

  // 饱和度和亮度由场景约束决定（从配置读取），加入少量随机变化
  const [sMin, sMax] = constraints.saturationRange;
  const [lMin, lMax] = constraints.lightnessRange;
  const s = sMin + random() * (sMax - sMin);
  const l = lMin + random() * (lMax - lMin);

  const colorScale = generateColorScale(h, s);

  // HSL CSS 值格式 (用于 Tailwind/shadcn)
  const primaryHSL = hslToCSSValue(h, s, l);

  // 互补色
  const secondaryH = (h + 30) % 360;   // 邻近色
  const accentH = (h + 180) % 360;     // 对比色

  // 场景情绪辅助色（从配置读取）
  const semanticColors = constraints.semanticColors;
  const positiveColor = semanticColors?.positive ?? '#22C55E';  // 默认绿色
  const negativeColor = semanticColors?.negative ?? '#EF4444';  // 默认红色

  return {
    // 保留 HEX 格式用于兼容
    '--primary-color': hslToHex(h, s, l),
    ...colorScale,
    '--secondary-color': hslToHex(secondaryH, s * 0.7, Math.min(l + 10, 90)),
    '--accent-color': hslToHex(accentH, s * 0.8, l),

    // 场景情绪辅助色
    '--positive-color': positiveColor,
    '--negative-color': negativeColor,

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
 * Token Generation Protocol:
 * 1. 计算 Hash 种子: seed = djb2(`${context}:${sessionId}`)
 * 2. 识别场景风格: scene = detectSceneStyle(context)（从配置读取关键词）
 * 3. 生成各维度 Tokens（从配置读取参数）
 *
 * @param options 合成器选项
 * @returns 完整的 Design Tokens
 */
export function generateDesignTokens(options: SynthesizerOptions): DesignTokens {
  const { context, sessionId = 'default', seed: customSeed, overrides } = options;

  // 1. 计算确定性种子 (djb2 算法)
  const seed = customSeed ?? hashString(`${context}:${sessionId}`);
  const random = createRandom(seed);

  // 2. 识别场景风格（从配置读取关键词）
  const scene = detectSceneStyle(context);

  // 3. 生成各维度 Tokens (Hash + 场景约束，从配置读取)
  const spacing = generateSpacingTokens(seed, scene);
  const typography = generateTypographyTokens(seed);
  const shape = generateShapeTokens(seed, scene);
  const ornament = generateOrnamentTokens(seed, scene);
  const colors = generateColorTokens(seed, scene, random);

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

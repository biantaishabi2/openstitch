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

import type { DesignTokens, SynthesizerOptions, AuditWarning } from './types';
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
import {
  generatePerceptualColorScale,
  applyPerceptualCorrection,
  adjustForContrast,
  validateContrast,
  auditColorContrast,
  hslToRgb,
  rgbToHex,
  type HSL,
} from './color-space';

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
// 维度 A: 空间尺度生成 (含垂直节奏系统)
// ============================================

/** 垂直节奏基准 */
const RHYTHM_BASE = 4;

/**
 * 对齐到节奏基准 (4px 倍数)
 */
function alignToRhythm(value: number): number {
  return Math.round(value / RHYTHM_BASE) * RHYTHM_BASE;
}

/**
 * 计算节奏感知的行高
 * 确保 fontSize * lineHeight 接近 4px 倍数
 */
function calculateRhythmicLineHeight(fontSize: number): number {
  // 目标: 行高 = 字号 + 合适的行间距，且总高度接近 4px 倍数
  const minLineHeight = 1.2;
  const idealLineHeight = 1.5;

  // 计算使 fontSize * lineHeight 为 4px 倍数的最接近 lineHeight
  const targetHeight = Math.ceil((fontSize * idealLineHeight) / RHYTHM_BASE) * RHYTHM_BASE;
  const rhythmicLineHeight = targetHeight / fontSize;

  return Math.max(minLineHeight, Math.min(rhythmicLineHeight, 2.0));
}

/**
 * 空间尺度生成 (含垂直节奏)
 *
 * 规则:
 *   baseUnit = 固定 4px (垂直节奏基准)
 *   步进序列: 几何级数 (2^n)，对齐到 4px 倍数
 *   场景修正: multiplier = 场景系数 (compact: 0.8, spacious: 1.5)
 *   垂直节奏: 所有垂直间距强制对齐到 4px 倍数
 */
function generateSpacingTokens(seed: number, scene: SceneStyle): Partial<DesignTokens> {
  // 垂直节奏基准固定为 4px
  const baseUnit = RHYTHM_BASE;

  // 场景修正系数（从配置读取）
  const constraints = getSceneConstraints(scene);
  const multiplier = constraints.spacingMultiplier;

  // 几何级数间距 (2^n)，对齐到 4px 倍数
  const space1 = alignToRhythm(baseUnit * 1 * multiplier);   // XS: 4px
  const space2 = alignToRhythm(baseUnit * 2 * multiplier);   // SM: 8px
  const space3 = alignToRhythm(baseUnit * 4 * multiplier);   // MD: 16px
  const space4 = alignToRhythm(baseUnit * 8 * multiplier);   // LG: 32px
  const space5 = alignToRhythm(baseUnit * 16 * multiplier);  // XL: 64px

  // 确保最小间距不小于基准
  const safeSpace1 = Math.max(space1, RHYTHM_BASE);
  const safeSpace2 = Math.max(space2, RHYTHM_BASE * 2);

  // 行高：基于 16px 基准字号计算节奏感知行高
  const baseLineHeight = calculateRhythmicLineHeight(16);

  // 不同字号的节奏感知行高
  const lineHeightXs = calculateRhythmicLineHeight(12);
  const lineHeightSm = calculateRhythmicLineHeight(14);
  const lineHeightBase = calculateRhythmicLineHeight(16);
  const lineHeightLg = calculateRhythmicLineHeight(20);
  const lineHeightXl = calculateRhythmicLineHeight(24);

  return {
    // 基础单位
    '--base-unit': `${baseUnit}px`,
    '--rhythm-base': `${RHYTHM_BASE}px`,

    // 间距序列 (对齐到 4px)
    '--spacing-xs': `${safeSpace1}px`,
    '--spacing-sm': `${safeSpace2}px`,
    '--spacing-md': `${space3}px`,
    '--spacing-lg': `${space4}px`,
    '--spacing-xl': `${space5}px`,

    // 组件间距
    '--gap-card': `${space3}px`,
    '--padding-card': `${space3}px`,
    '--padding-section': `${space4}px`,

    // 节奏感知行高
    '--line-height-body': baseLineHeight.toFixed(2),
    '--line-height-xs': lineHeightXs.toFixed(2),
    '--line-height-sm': lineHeightSm.toFixed(2),
    '--line-height-base': lineHeightBase.toFixed(2),
    '--line-height-lg': lineHeightLg.toFixed(2),
    '--line-height-xl': lineHeightXl.toFixed(2),

    // 垂直边距 (对齐到节奏)
    '--margin-block-xs': `${alignToRhythm(4)}px`,
    '--margin-block-sm': `${alignToRhythm(8)}px`,
    '--margin-block-md': `${alignToRhythm(16)}px`,
    '--margin-block-lg': `${alignToRhythm(24)}px`,
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
// 维度 C: 形状边框生成 (含 Padding Squeezing 和分层阴影)
// ============================================

/**
 * 计算 Padding Squeezing 因子
 * 圆角越大，需要的额外内边距越多
 * 公式: squeezingPadding = baseRadius * 0.2
 */
function calculateSqueezingFactor(radiusMd: number): number {
  // 圆角对内边距的影响系数 (0.2 = 每 1px 圆角增加 0.2px padding)
  const SQUEEZING_COEFFICIENT = 0.2;
  return radiusMd * SQUEEZING_COEFFICIENT;
}

/**
 * 生成分层阴影
 * 真实的阴影由多层组成：
 * - 环境光掩蔽层 (Ambient Occlusion): 深色、范围小、模糊小
 * - 漫反射层 (Diffuse): 浅色、范围大、模糊大
 */
function generateLayeredShadow(
  elevation: number,
  baseOpacity: number
): string {
  // 高度层级配置 (0-4)
  const elevationConfig = [
    { y: 1, blur: 2, spread: 0, ambientBlur: 1, ambientY: 0 },      // 0: 贴近
    { y: 2, blur: 4, spread: 0, ambientBlur: 2, ambientY: 1 },      // 1: 轻微抬起
    { y: 4, blur: 8, spread: -1, ambientBlur: 3, ambientY: 2 },     // 2: 标准卡片
    { y: 8, blur: 16, spread: -2, ambientBlur: 4, ambientY: 3 },    // 3: 浮动
    { y: 16, blur: 32, spread: -4, ambientBlur: 6, ambientY: 4 },   // 4: 悬浮
  ];

  const config = elevationConfig[Math.min(elevation, 4)];

  // 环境光掩蔽层 (更深、更集中)
  const ambientOpacity = (baseOpacity * 0.8).toFixed(2);
  const ambient = `0 ${config.ambientY}px ${config.ambientBlur}px rgba(0,0,0,${ambientOpacity})`;

  // 漫反射层 (更浅、更扩散)
  const diffuseOpacity = (baseOpacity * 0.5).toFixed(2);
  const diffuse = `0 ${config.y}px ${config.blur}px ${config.spread}px rgba(0,0,0,${diffuseOpacity})`;

  // 组合两层阴影
  return `${ambient}, ${diffuse}`;
}

/**
 * 形状边框生成 (含 Padding Squeezing 和分层阴影)
 *
 * 新增功能:
 * 1. Padding Squeezing: 圆角越大，内边距需要相应增加
 * 2. 分层阴影: 多层阴影实现真实 3D 效果
 * 3. 5 级高度表现: elevation-0 到 elevation-4
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

  // Padding Squeezing: 计算圆角导致的额外内边距
  const squeezingFactor = calculateSqueezingFactor(radiusMd);
  const squeezingFactorLg = calculateSqueezingFactor(radiusLg);

  // 阴影强度（从配置读取）
  const shadowBase = getShadowIntensity(shapeStyle);

  return {
    // 圆角
    '--radius-sm': `${radiusSm}px`,
    '--radius-md': `${radiusMd}px`,
    '--radius-lg': `${radiusLg}px`,
    '--radius-full': '9999px',

    // Padding Squeezing 因子 (供组件使用)
    '--squeezing-factor': squeezingFactor.toFixed(2),
    '--squeezing-factor-lg': squeezingFactorLg.toFixed(2),
    '--padding-squeezing': `${alignToRhythm(squeezingFactor)}px`,
    '--padding-squeezing-lg': `${alignToRhythm(squeezingFactorLg)}px`,

    // 传统阴影 (向后兼容)
    '--shadow-sm': `0 1px 2px rgba(0,0,0,${(shadowBase * 0.5).toFixed(2)})`,
    '--shadow-md': `0 4px 6px rgba(0,0,0,${shadowBase.toFixed(2)})`,
    '--shadow-lg': `0 10px 15px rgba(0,0,0,${(shadowBase * 1.2).toFixed(2)})`,

    // 分层阴影 (5 级高度表现)
    '--shadow-elevation-0': generateLayeredShadow(0, shadowBase),
    '--shadow-elevation-1': generateLayeredShadow(1, shadowBase),
    '--shadow-elevation-2': generateLayeredShadow(2, shadowBase),
    '--shadow-elevation-3': generateLayeredShadow(3, shadowBase),
    '--shadow-elevation-4': generateLayeredShadow(4, shadowBase),

    // 特殊阴影
    '--shadow-overlay': `0 0 0 1px rgba(0,0,0,0.05), ${generateLayeredShadow(3, shadowBase)}`,
    '--shadow-inset': `inset 0 2px 4px rgba(0,0,0,${(shadowBase * 0.3).toFixed(2)})`,
  };
}

// ============================================
// 维度 D: 装饰纹理生成 (含视觉降噪)
// ============================================

/**
 * 视觉降噪配置
 * 不同场景的噪声容忍度不同
 */
const NOISE_REDUCTION_CONFIG: Record<SceneStyle, { factor: number; simplify: boolean }> = {
  medical: { factor: 0, simplify: true },       // 医疗: 完全禁用噪声
  finance: { factor: 0.3, simplify: false },    // 金融: 低噪声
  technical: { factor: 0.5, simplify: false },  // 技术: 中等噪声
  enterprise: { factor: 0.4, simplify: false }, // 企业: 中低噪声
  education: { factor: 0.6, simplify: false },  // 教育: 中等噪声
  creative: { factor: 0.8, simplify: false },   // 创意: 高噪声
  default: { factor: 0.5, simplify: false },    // 默认: 中等噪声
};

/**
 * 计算视觉降噪因子
 * 对比度越高，允许的噪声越少
 */
function calculateNoiseFactor(scene: SceneStyle, contrastLevel: number = 1): number {
  const config = NOISE_REDUCTION_CONFIG[scene];
  // 高对比度时降低噪声
  const contrastAdjustment = contrastLevel > 1.2 ? 0.8 : 1.0;
  return config.factor * contrastAdjustment;
}

/**
 * 装饰纹理生成 (含视觉降噪)
 *
 * 新增功能:
 * 1. 智能降噪: 根据场景自动调整噪声级别
 * 2. 多层纹理: 分层图案实现细腻质感
 * 3. 同级元素消隐: 提供悬停时显示边框的 CSS 变量
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

  // 视觉降噪
  const noiseConfig = NOISE_REDUCTION_CONFIG[scene];
  const noiseFactor = calculateNoiseFactor(scene);

  // 应用降噪因子
  const adjustedPatternOpacity = ornamentLevel === 'none' || noiseConfig.simplify
    ? 0
    : Math.max(baseOpacity, preset.patternOpacity) * noiseFactor;
  const adjustedNoiseOpacity = ornamentLevel === 'none' || noiseConfig.simplify
    ? 0
    : preset.noiseOpacity * noiseFactor;

  // 多层纹理 (从底层到顶层，透明度递减)
  const layer1Opacity = (adjustedPatternOpacity * 0.6).toFixed(3);  // 底层: 纹理感
  const layer2Opacity = (adjustedPatternOpacity * 0.8).toFixed(3);  // 中层: 细节
  const layer3Opacity = (adjustedPatternOpacity * 1.0).toFixed(3);  // 顶层: 易见

  // 同级元素消隐: 相邻卡片边框处理
  // 默认边框透明度降低，悬停时恢复
  const siblingBorderOpacity = noiseConfig.simplify ? '0' : '0.08';
  const siblingBorderHoverOpacity = '0.15';
  const siblingBgOffset = noiseConfig.simplify ? '0%' : '2%'; // 微弱灰色偏移

  return {
    // 图案类型
    '--pattern-type': patternType,

    // 传统图案 (向后兼容)
    '--pattern-dots': `radial-gradient(circle, rgba(0,0,0,${adjustedPatternOpacity.toFixed(2)}) 1px, transparent 1px)`,
    '--pattern-dots-size': '20px 20px',
    '--pattern-grid': `linear-gradient(rgba(0,0,0,${adjustedPatternOpacity.toFixed(2)}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${adjustedPatternOpacity.toFixed(2)}) 1px, transparent 1px)`,
    '--pattern-grid-size': '24px 24px',
    '--gradient-fade': 'linear-gradient(180deg, transparent 0%, var(--background) 100%)',
    '--noise-opacity': adjustedNoiseOpacity.toFixed(2),

    // 多层纹理
    '--pattern-layer-1': `rgba(0,0,0,${layer1Opacity})`,
    '--pattern-layer-2': `rgba(0,0,0,${layer2Opacity})`,
    '--pattern-layer-3': `rgba(0,0,0,${layer3Opacity})`,

    // 视觉降噪因子
    '--noise-factor': noiseFactor.toFixed(2),
    '--noise-simplify': noiseConfig.simplify ? '1' : '0',

    // 同级元素消隐
    '--sibling-border-opacity': siblingBorderOpacity,
    '--sibling-border-hover-opacity': siblingBorderHoverOpacity,
    '--sibling-bg-offset': siblingBgOffset,

    // 色差修正 (减少颜色过渡时的视觉噪声)
    '--chromatic-aberration': '0.3%',
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
 * 生成色阶 (50-900) - 使用 OKLCH 感知均匀色彩空间
 */
function generateColorScale(h: number, s: number): Record<string, string> {
  // 使用 OKLCH 生成感知均匀的色阶
  const perceptualScale = generatePerceptualColorScale(h, s);
  const scale: Record<string, string> = {};

  // 转换为 CSS 变量格式
  Object.entries(perceptualScale).forEach(([step, hex]) => {
    scale[`--primary-${step}`] = hex;
  });

  return scale;
}

/**
 * 颜色系统生成
 *
 * 规则:
 *   主色相: Hue = Hash % 360
 *   饱和度/亮度: 场景约束范围（从配置读取）
 *   感知校正: 使用 OKLCH 确保视觉一致性
 *   对比度: 自动调整以符合 WCAG AA 标准
 */
function generateColorTokens(
  seed: number,
  scene: SceneStyle,
  random: () => number,
  warnings: AuditWarning[] = []
): Partial<DesignTokens> {
  const constraints = getSceneConstraints(scene);

  // 主色相由 Hash 决定
  const h = seed % 360;

  // 饱和度和亮度由场景约束决定（从配置读取），加入少量随机变化
  const [sMin, sMax] = constraints.saturationRange;
  const [lMin, lMax] = constraints.lightnessRange;
  const s = sMin + random() * (sMax - sMin);
  let l = lMin + random() * (lMax - lMin);

  // 应用感知校正 - 确保不同色相视觉亮度一致
  const correctedHsl = applyPerceptualCorrection({ h, s, l });
  l = correctedHsl.l;

  // 生成感知均匀的色阶
  const colorScale = generateColorScale(h, s);

  // 背景和前景色
  const backgroundHex = '#ffffff';
  const foregroundHex = '#1e293b'; // slate-800

  // 计算主色并验证对比度
  let primaryHsl: HSL = { h, s, l };
  const primaryHex = rgbToHex(hslToRgb(primaryHsl));
  const contrastResult = validateContrast(primaryHex, backgroundHex);

  // 如果对比度不足，自动调整
  if (!contrastResult.wcagAALarge) {
    warnings.push({
      type: 'contrast',
      message: `Primary on Background contrast is ${contrastResult.ratio}:1 (Required: 3:1)`,
      severity: 'warning',
      suggestion: 'Adjusting Primary lightness for WCAG compliance',
    });
    // 调整主色以达到目标对比度
    primaryHsl = adjustForContrast(primaryHsl, backgroundHex, 3.0, 'darken');
  }

  // HSL CSS 值格式 (用于 Tailwind/shadcn)
  const primaryHSL = hslToCSSValue(primaryHsl.h, primaryHsl.s, primaryHsl.l);
  const adjustedPrimaryHex = rgbToHex(hslToRgb(primaryHsl));

  // 互补色
  const secondaryH = (h + 30) % 360;   // 邻近色
  const accentH = (h + 180) % 360;     // 对比色

  // 场景情绪辅助色（从配置读取）
  const semanticColors = constraints.semanticColors;
  const positiveColor = semanticColors?.positive ?? '#22C55E';  // 默认绿色
  const negativeColor = semanticColors?.negative ?? '#EF4444';  // 默认红色

  return {
    // 保留 HEX 格式用于兼容
    '--primary-color': adjustedPrimaryHex,
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
/** 设计审查结果 */
export interface DesignAuditResult {
  tokens: DesignTokens;
  warnings: AuditWarning[];
}

/**
 * 生成 Design Tokens (带设计审查)
 */
export function generateDesignTokens(options: SynthesizerOptions): DesignTokens {
  const result = generateDesignTokensWithAudit(options);
  return result.tokens;
}

/**
 * 生成 Design Tokens 并返回设计审查警告
 */
export function generateDesignTokensWithAudit(options: SynthesizerOptions): DesignAuditResult {
  const { context, sessionId = 'default', seed: customSeed, overrides } = options;

  // 设计审查警告收集
  const warnings: AuditWarning[] = [];

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
  const colors = generateColorTokens(seed, scene, random, warnings);

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

  return { tokens, warnings };
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

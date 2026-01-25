/**
 * 色彩空间转换与感知校正
 *
 * 实现 OKLCH 感知均匀色彩空间，确保：
 * 1. 不同色相的感知亮度一致
 * 2. 对比度符合 WCAG 无障碍标准
 */

// ============================================
// 类型定义
// ============================================

export interface RGB {
  r: number; // 0-255
  g: number;
  b: number;
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface OKLCH {
  L: number; // 0-1 感知亮度
  C: number; // 0-0.4 色度
  h: number; // 0-360 色相
}

export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;      // >= 4.5:1 (正常文本)
  wcagAALarge: boolean; // >= 3:1 (大文本)
  wcagAAA: boolean;     // >= 7:1 (增强)
}

// ============================================
// 基础转换函数
// ============================================

/**
 * HEX → RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * RGB → HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * HSL → RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * RGB → HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// ============================================
// OKLCH 色彩空间 (感知均匀)
// ============================================

/**
 * RGB → Linear RGB (去 gamma)
 */
function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Linear RGB → sRGB (加 gamma)
 */
function delinearize(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, v)) * 255);
}

/**
 * RGB → OKLAB
 */
function rgbToOklab(rgb: RGB): { L: number; a: number; b: number } {
  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

/**
 * OKLAB → RGB
 */
function oklabToRgb(lab: { L: number; a: number; b: number }): RGB {
  const l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.L - 0.0894841775 * lab.a - 1.2914855480 * lab.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return {
    r: delinearize(r),
    g: delinearize(g),
    b: delinearize(b),
  };
}

/**
 * RGB → OKLCH
 */
export function rgbToOklch(rgb: RGB): OKLCH {
  const lab = rgbToOklab(rgb);
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { L: lab.L, C, h };
}

/**
 * OKLCH → RGB
 */
export function oklchToRgb(oklch: OKLCH): RGB {
  const hRad = oklch.h * (Math.PI / 180);
  const lab = {
    L: oklch.L,
    a: oklch.C * Math.cos(hRad),
    b: oklch.C * Math.sin(hRad),
  };
  return oklabToRgb(lab);
}

/**
 * HSL → OKLCH
 */
export function hslToOklch(hsl: HSL): OKLCH {
  return rgbToOklch(hslToRgb(hsl));
}

/**
 * OKLCH → HSL
 */
export function oklchToHsl(oklch: OKLCH): HSL {
  return rgbToHsl(oklchToRgb(oklch));
}

/**
 * OKLCH → HEX
 */
export function oklchToHex(oklch: OKLCH): string {
  return rgbToHex(oklchToRgb(oklch));
}

// ============================================
// 对比度计算 (WCAG 2.1)
// ============================================

/**
 * 计算相对亮度 (Relative Luminance)
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function relativeLuminance(rgb: RGB): number {
  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 计算对比度比率
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function contrastRatio(fg: RGB, bg: RGB): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 验证对比度是否符合 WCAG 标准
 */
export function validateContrast(fgHex: string, bgHex: string): ContrastResult {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const ratio = contrastRatio(fg, bg);

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAALarge: ratio >= 3.0,
    wcagAAA: ratio >= 7.0,
  };
}

// ============================================
// 感知校正
// ============================================

/**
 * 色相感知亮度系数
 * 人眼对不同色相的感知亮度不同，黄色最亮，蓝色最暗
 */
const HUE_PERCEPTUAL_LIGHTNESS: Record<number, number> = {
  0: 0.95,    // 红色
  30: 1.0,    // 橙色
  60: 1.1,    // 黄色 (最亮)
  90: 1.05,   // 黄绿
  120: 1.0,   // 绿色
  150: 0.95,  // 青绿
  180: 0.9,   // 青色
  210: 0.85,  // 蓝青
  240: 0.8,   // 蓝色 (最暗)
  270: 0.85,  // 蓝紫
  300: 0.9,   // 紫色
  330: 0.95,  // 红紫
  360: 0.95,  // 红色
};

/**
 * 获取色相的感知亮度系数 (插值)
 */
function getHuePerceptualFactor(hue: number): number {
  const normalized = ((hue % 360) + 360) % 360;
  const keys = Object.keys(HUE_PERCEPTUAL_LIGHTNESS).map(Number).sort((a, b) => a - b);

  for (let i = 0; i < keys.length - 1; i++) {
    if (normalized >= keys[i] && normalized < keys[i + 1]) {
      const t = (normalized - keys[i]) / (keys[i + 1] - keys[i]);
      const v1 = HUE_PERCEPTUAL_LIGHTNESS[keys[i]];
      const v2 = HUE_PERCEPTUAL_LIGHTNESS[keys[i + 1]];
      return v1 + t * (v2 - v1);
    }
  }

  return HUE_PERCEPTUAL_LIGHTNESS[0];
}

/**
 * 应用感知校正到 HSL 亮度
 * 确保不同色相在视觉上有一致的亮度感知
 */
export function applyPerceptualCorrection(hsl: HSL): HSL {
  const factor = getHuePerceptualFactor(hsl.h);
  // 校正亮度：黄色系降低亮度，蓝色系提高亮度
  const correctedL = hsl.l / factor;
  return {
    ...hsl,
    l: Math.max(0, Math.min(100, correctedL)),
  };
}

/**
 * 调整颜色以达到目标对比度
 */
export function adjustForContrast(
  fgHsl: HSL,
  bgHex: string,
  targetRatio: number = 4.5,
  direction: 'lighten' | 'darken' | 'auto' = 'auto'
): HSL {
  const bg = hexToRgb(bgHex);
  const bgLuminance = relativeLuminance(bg);

  // 自动选择方向：背景亮则前景暗，背景暗则前景亮
  const actualDirection = direction === 'auto'
    ? (bgLuminance > 0.5 ? 'darken' : 'lighten')
    : direction;

  let adjusted = { ...fgHsl };
  const step = actualDirection === 'lighten' ? 2 : -2;
  const limit = actualDirection === 'lighten' ? 100 : 0;

  // 迭代调整亮度直到达到目标对比度
  for (let i = 0; i < 50; i++) {
    const fgRgb = hslToRgb(adjusted);
    const ratio = contrastRatio(fgRgb, bg);

    if (ratio >= targetRatio) {
      break;
    }

    adjusted.l += step;
    if ((step > 0 && adjusted.l >= limit) || (step < 0 && adjusted.l <= limit)) {
      adjusted.l = limit;
      break;
    }
  }

  return adjusted;
}

// ============================================
// 感知均匀色阶生成
// ============================================

/**
 * 生成感知均匀的色阶
 * 使用 OKLCH 确保每一级的亮度差异在视觉上是均匀的
 */
export function generatePerceptualColorScale(
  baseHue: number,
  baseSaturation: number,
  steps: number[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
): Record<string, string> {
  const scale: Record<string, string> = {};

  // OKLCH 亮度值 (感知均匀)
  const oklchLightness: Record<number, number> = {
    50: 0.97,
    100: 0.93,
    200: 0.86,
    300: 0.76,
    400: 0.64,
    500: 0.52,
    600: 0.43,
    700: 0.35,
    800: 0.27,
    900: 0.18,
  };

  // 计算基准色度 (基于饱和度)
  const baseChroma = (baseSaturation / 100) * 0.15;

  for (const step of steps) {
    const L = oklchLightness[step] ?? 0.5;
    // 色度随亮度变化：中间值最高，两端降低
    const chromaFactor = 1 - Math.abs(L - 0.5) * 0.6;
    const C = baseChroma * chromaFactor;

    const oklch: OKLCH = { L, C, h: baseHue };
    scale[`${step}`] = oklchToHex(oklch);
  }

  return scale;
}

// ============================================
// 设计审查 (Design Audit)
// ============================================

export interface AuditWarning {
  type: 'contrast' | 'perceptual' | 'accessibility';
  message: string;
  severity: 'info' | 'warning' | 'error';
  suggestion?: string;
}

/**
 * 审查颜色对比度
 */
export function auditColorContrast(
  primaryHex: string,
  backgroundHex: string,
  foregroundHex: string
): AuditWarning[] {
  const warnings: AuditWarning[] = [];

  // 检查主色在背景上的对比度
  const primaryOnBg = validateContrast(primaryHex, backgroundHex);
  if (!primaryOnBg.wcagAA) {
    warnings.push({
      type: 'contrast',
      message: `Primary on Background contrast is ${primaryOnBg.ratio}:1 (Required: 4.5:1)`,
      severity: 'warning',
      suggestion: 'Adjusting Primary lightness for WCAG AA compliance',
    });
  }

  // 检查前景色在背景上的对比度
  const fgOnBg = validateContrast(foregroundHex, backgroundHex);
  if (!fgOnBg.wcagAA) {
    warnings.push({
      type: 'contrast',
      message: `Foreground on Background contrast is ${fgOnBg.ratio}:1 (Required: 4.5:1)`,
      severity: 'error',
      suggestion: 'Text may be unreadable for some users',
    });
  }

  return warnings;
}

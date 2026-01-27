/**
 * 颜色工具函数
 * RGB ↔ LAB ↔ HSL 转换，色差计算
 */

import type { FigmaColor } from '../types';

// === RGB 工具 ===

export interface RGB {
  r: number;  // 0-255
  g: number;
  b: number;
}

export interface HSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

export type LAB = [number, number, number];  // L: 0-100, a: -128~128, b: -128~128

/**
 * Figma 颜色 (0-1) 转 RGB (0-255)
 */
export function figmaColorToRgb(color: FigmaColor): RGB {
  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
  };
}

/**
 * RGB 转 Hex
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Figma 颜色转 Hex
 */
export function figmaColorToHex(color: FigmaColor): string {
  return rgbToHex(figmaColorToRgb(color));
}

/**
 * Hex 转 RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// === LAB 转换 ===

/**
 * RGB 转 XYZ (CIE 1931)
 */
function rgbToXyz(rgb: RGB): [number, number, number] {
  // sRGB to linear RGB
  const linearize = (c: number) => {
    c = c / 255;
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  };

  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);

  // Linear RGB to XYZ (D65 illuminant)
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  return [x * 100, y * 100, z * 100];
}

/**
 * XYZ 转 LAB
 */
function xyzToLab(xyz: [number, number, number]): LAB {
  // D65 白点
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  const f = (t: number) => {
    const delta = 6 / 29;
    return t > Math.pow(delta, 3)
      ? Math.pow(t, 1 / 3)
      : t / (3 * delta * delta) + 4 / 29;
  };

  const fx = f(xyz[0] / refX);
  const fy = f(xyz[1] / refY);
  const fz = f(xyz[2] / refZ);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

/**
 * RGB 转 LAB
 */
export function rgbToLab(rgb: RGB): LAB {
  return xyzToLab(rgbToXyz(rgb));
}

/**
 * Figma 颜色转 LAB
 */
export function figmaColorToLab(color: FigmaColor): LAB {
  return rgbToLab(figmaColorToRgb(color));
}

/**
 * Hex 转 LAB
 */
export function hexToLab(hex: string): LAB {
  return rgbToLab(hexToRgb(hex));
}

// === 色差计算 ===

/**
 * CIE76 色差公式 (ΔE)
 * 一般认为 ΔE < 1 人眼无法区分
 * ΔE < 3 基本相同
 * ΔE < 10 相近
 */
export function deltaE(lab1: LAB, lab2: LAB): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}

/**
 * 判断是否为彩色（非中性色）
 * 在 LAB 空间中，a* 和 b* 的绝对值越大，颜色越鲜艳
 */
export function isChromatic(lab: LAB, threshold = 10): boolean {
  return Math.abs(lab[1]) > threshold || Math.abs(lab[2]) > threshold;
}

/**
 * 计算 LAB 颜色的饱和度 (chroma)
 */
export function chroma(lab: LAB): number {
  return Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
}

// === HSL 转换 ===

/**
 * RGB 转 HSL
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
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * HSL 转 RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Hex 转 HSL
 */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * HSL 转 Hex
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// === 色阶生成 ===

/**
 * 生成颜色色阶 (50-900)
 */
export function generateColorScale(baseHex: string): Record<string, string> {
  const hsl = hexToHsl(baseHex);

  // 生成从亮到暗的色阶
  const scale: Record<string, string> = {};

  const levels = [
    { key: '50', l: 97, sDelta: -30 },
    { key: '100', l: 94, sDelta: -20 },
    { key: '200', l: 86, sDelta: -10 },
    { key: '300', l: 74, sDelta: 0 },
    { key: '400', l: 60, sDelta: 0 },
    { key: '500', l: null, sDelta: 0 },  // 基准色
    { key: '600', l: null, sDelta: 5 },
    { key: '700', l: null, sDelta: 10 },
    { key: '800', l: null, sDelta: 15 },
    { key: '900', l: null, sDelta: 20 },
  ];

  for (const level of levels) {
    if (level.key === '500') {
      scale[level.key] = baseHex;
      continue;
    }

    let newL = level.l;
    if (newL === null) {
      // 暗色阶：基于基准色降低明度
      const offset = parseInt(level.key) - 500;
      newL = Math.max(hsl.l - offset / 25, 5);
    }

    const newS = Math.max(Math.min(hsl.s + (level.sDelta || 0), 100), 10);
    scale[level.key] = hslToHex({ h: hsl.h, s: newS, l: newL });
  }

  return scale;
}

/**
 * 计算 LAB 颜色数组的平均值
 */
export function averageLab(labs: LAB[]): LAB {
  if (labs.length === 0) return [50, 0, 0];

  const sum = labs.reduce(
    (acc, lab) => [acc[0] + lab[0], acc[1] + lab[1], acc[2] + lab[2]],
    [0, 0, 0] as LAB
  );

  return [
    sum[0] / labs.length,
    sum[1] / labs.length,
    sum[2] / labs.length,
  ];
}

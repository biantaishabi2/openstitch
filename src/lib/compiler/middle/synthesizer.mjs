/**
 * Stitch 视觉引擎 - Design Tokens 合成器 (ESM)
 */

// ============================================
// Hash 种子生成器（确定性）
// ============================================

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed, index) {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

// ============================================
// 场景识别器
// ============================================

function detectScene(context) {
  const ctx = context.toLowerCase();

  if (ctx.includes('技术') || ctx.includes('架构') || ctx.includes('开发') || ctx.includes('tech')) {
    return 'tech';
  }
  if (ctx.includes('金融') || ctx.includes('银行') || ctx.includes('财务') || ctx.includes('finance')) {
    return 'finance';
  }
  if (ctx.includes('儿童') || ctx.includes('幼儿') || ctx.includes('kids') || ctx.includes('child')) {
    return 'children';
  }
  if (ctx.includes('教育') || ctx.includes('学习') || ctx.includes('课程') || ctx.includes('education')) {
    return 'education';
  }
  if (ctx.includes('营销') || ctx.includes('推广') || ctx.includes('活动') || ctx.includes('marketing')) {
    return 'marketing';
  }
  if (ctx.includes('创意') || ctx.includes('设计') || ctx.includes('艺术') || ctx.includes('creative')) {
    return 'creative';
  }

  return 'enterprise';
}

// ============================================
// 预设配置
// ============================================

const scenePresets = {
  tech: {
    spacingScale: 1.0,
    fontScale: 1.25,
    radiusStyle: 'neutral',
    shadowIntensity: 'medium',
    patternType: 'grid',
    patternOpacity: 0.02,
    primaryHue: 210,
    saturation: 70,
  },
  finance: {
    spacingScale: 0.8,
    fontScale: 1.125,
    radiusStyle: 'sharp',
    shadowIntensity: 'heavy',
    patternType: 'none',
    patternOpacity: 0,
    primaryHue: 220,
    saturation: 60,
  },
  education: {
    spacingScale: 1.2,
    fontScale: 1.333,
    radiusStyle: 'soft',
    shadowIntensity: 'light',
    patternType: 'dots',
    patternOpacity: 0.03,
    primaryHue: 200,
    saturation: 65,
  },
  children: {
    spacingScale: 1.5,
    fontScale: 1.5,
    radiusStyle: 'pill',
    shadowIntensity: 'light',
    patternType: 'dots',
    patternOpacity: 0.06,
    primaryHue: 35,
    saturation: 85,
  },
  marketing: {
    spacingScale: 1.5,
    fontScale: 1.618,
    radiusStyle: 'soft',
    shadowIntensity: 'light',
    patternType: 'gradient',
    patternOpacity: 0.04,
    primaryHue: 280,
    saturation: 75,
  },
  enterprise: {
    spacingScale: 1.0,
    fontScale: 1.25,
    radiusStyle: 'neutral',
    shadowIntensity: 'medium',
    patternType: 'none',
    patternOpacity: 0,
    primaryHue: 215,
    saturation: 65,
  },
  creative: {
    spacingScale: 1.3,
    fontScale: 1.5,
    radiusStyle: 'soft',
    shadowIntensity: 'light',
    patternType: 'gradient',
    patternOpacity: 0.05,
    primaryHue: 320,
    saturation: 80,
  },
};

// ============================================
// Tokens 生成器
// ============================================

function generateSpacingTokens(scale) {
  const base = scale >= 1.2 ? 8 : (scale <= 0.8 ? 4 : 8);

  return {
    baseUnit: `${base}px`,
    xs: `${Math.round(base * 0.5 * scale)}px`,
    sm: `${Math.round(base * 1 * scale)}px`,
    md: `${Math.round(base * 2 * scale)}px`,
    lg: `${Math.round(base * 3 * scale)}px`,
    xl: `${Math.round(base * 4 * scale)}px`,
    gapCard: `${Math.round(base * 2 * scale)}px`,
    paddingCard: `${Math.round(base * 2 * scale)}px`,
    paddingSection: `${Math.round(base * 3 * scale)}px`,
    lineHeightBody: scale >= 1.3 ? '1.75' : (scale <= 0.9 ? '1.4' : '1.5'),
  };
}

function generateTypographyTokens(fontScale) {
  return {
    scale: fontScale,
    sizeXs: `${(1 / fontScale / fontScale).toFixed(3)}rem`,
    sizeSm: `${(1 / fontScale).toFixed(3)}rem`,
    sizeBase: '1rem',
    sizeLg: `${fontScale.toFixed(3)}rem`,
    sizeXl: `${(fontScale * fontScale).toFixed(3)}rem`,
    size2xl: `${(fontScale * fontScale * fontScale).toFixed(3)}rem`,
    size3xl: `${(fontScale * fontScale * fontScale * fontScale).toFixed(3)}rem`,
    weightNormal: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,
  };
}

function generateShapeTokens(style, intensity) {
  const radiusMap = {
    sharp: { sm: '2px', md: '4px', lg: '6px' },
    neutral: { sm: '4px', md: '8px', lg: '12px' },
    soft: { sm: '8px', md: '12px', lg: '16px' },
    pill: { sm: '12px', md: '16px', lg: '24px' },
  };

  const shadowMap = {
    heavy: {
      sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
      lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    },
    medium: {
      sm: '0 1px 2px rgba(0,0,0,0.06)',
      md: '0 2px 4px rgba(0,0,0,0.08)',
      lg: '0 4px 8px rgba(0,0,0,0.10)',
    },
    light: {
      sm: '0 1px 2px rgba(0,0,0,0.04)',
      md: '0 4px 8px rgba(0,0,0,0.06)',
      lg: '0 8px 16px rgba(0,0,0,0.08)',
    },
  };

  const r = radiusMap[style];
  const s = shadowMap[intensity];

  return {
    radiusSm: r.sm,
    radiusMd: r.md,
    radiusLg: r.lg,
    radiusFull: '9999px',
    shadowSm: s.sm,
    shadowMd: s.md,
    shadowLg: s.lg,
  };
}

function generateOrnamentationTokens(type, opacity) {
  return {
    patternType: type,
    patternOpacity: opacity,
    noiseOpacity: type === 'gradient' ? 0.03 : 0,
  };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateColorTokens(hue, saturation) {
  return {
    primary: hslToHex(hue, saturation, 50),
    primaryLight: hslToHex(hue, saturation - 10, 65),
    primaryDark: hslToHex(hue, saturation + 5, 35),
    secondary: hslToHex((hue + 180) % 360, saturation - 20, 50),
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  };
}

// ============================================
// 主入口
// ============================================

export function synthesizeDesignTokens(input) {
  const { context, sessionId = 'default' } = input;

  const seed = hashString(context + sessionId);
  const scene = detectScene(context);
  const preset = scenePresets[scene];

  const variation = seededRandom(seed, 0) * 0.2 - 0.1;
  const adjustedSpacingScale = preset.spacingScale * (1 + variation);
  const adjustedHue = (preset.primaryHue + Math.round(seededRandom(seed, 1) * 20 - 10)) % 360;

  return {
    spacing: generateSpacingTokens(adjustedSpacingScale),
    typography: generateTypographyTokens(preset.fontScale),
    shape: generateShapeTokens(preset.radiusStyle, preset.shadowIntensity),
    ornamentation: generateOrnamentationTokens(preset.patternType, preset.patternOpacity),
    colors: generateColorTokens(adjustedHue, preset.saturation),
  };
}

export function tokensToCSSVariables(tokens) {
  return `
:root {
  /* 空间尺度 */
  --base-unit: ${tokens.spacing.baseUnit};
  --spacing-xs: ${tokens.spacing.xs};
  --spacing-sm: ${tokens.spacing.sm};
  --spacing-md: ${tokens.spacing.md};
  --spacing-lg: ${tokens.spacing.lg};
  --spacing-xl: ${tokens.spacing.xl};
  --gap-card: ${tokens.spacing.gapCard};
  --padding-card: ${tokens.spacing.paddingCard};
  --padding-section: ${tokens.spacing.paddingSection};
  --line-height-body: ${tokens.spacing.lineHeightBody};

  /* 字体排版 */
  --font-scale: ${tokens.typography.scale};
  --font-size-xs: ${tokens.typography.sizeXs};
  --font-size-sm: ${tokens.typography.sizeSm};
  --font-size-base: ${tokens.typography.sizeBase};
  --font-size-lg: ${tokens.typography.sizeLg};
  --font-size-xl: ${tokens.typography.sizeXl};
  --font-size-2xl: ${tokens.typography.size2xl};
  --font-size-3xl: ${tokens.typography.size3xl};
  --font-weight-normal: ${tokens.typography.weightNormal};
  --font-weight-medium: ${tokens.typography.weightMedium};
  --font-weight-semibold: ${tokens.typography.weightSemibold};
  --font-weight-bold: ${tokens.typography.weightBold};

  /* 形状与阴影 */
  --radius-sm: ${tokens.shape.radiusSm};
  --radius-md: ${tokens.shape.radiusMd};
  --radius-lg: ${tokens.shape.radiusLg};
  --radius-full: ${tokens.shape.radiusFull};
  --shadow-sm: ${tokens.shape.shadowSm};
  --shadow-md: ${tokens.shape.shadowMd};
  --shadow-lg: ${tokens.shape.shadowLg};

  /* 颜色 */
  --color-primary: ${tokens.colors.primary};
  --color-primary-light: ${tokens.colors.primaryLight};
  --color-primary-dark: ${tokens.colors.primaryDark};
  --color-secondary: ${tokens.colors.secondary};
  --color-background: ${tokens.colors.background};
  --color-surface: ${tokens.colors.surface};
  --color-text: ${tokens.colors.text};
  --color-text-muted: ${tokens.colors.textMuted};
  --color-border: ${tokens.colors.border};
  --color-success: ${tokens.colors.success};
  --color-warning: ${tokens.colors.warning};
  --color-error: ${tokens.colors.error};
}
`.trim();
}

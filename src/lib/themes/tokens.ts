/**
 * Stitch Design Tokens - 基础规格（强制执行）
 *
 * 所有组件必须基于这些 Token 进行渲染，确保视觉一致性
 */

// ============================================
// 1. 颜色阶梯 (Color Scales)
// ============================================

export const colors = {
  // 中性色 (Neutral)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // 蓝色系 (Blue)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // 绿色系 (Green)
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // 红色系 (Red)
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // 黄色系 (Yellow/Amber)
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },

  // 紫色系 (Purple)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // 青色系 (Cyan)
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },

  // 橙色系 (Orange)
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // 粉色系 (Pink)
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },

  // 棕色系 (Brown)
  brown: {
    50: '#fdf8f6',
    100: '#f2e8e5',
    200: '#eaddd7',
    300: '#d6c4b9',
    400: '#b8a398',
    500: '#9c8578',
    600: '#846358',
    700: '#6d5247',
    800: '#5c453b',
    900: '#4e3b31',
    950: '#2a1f1a',
  },
} as const;

// ============================================
// 2. 间距规范 (Spacing)
// ============================================

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',      // xs
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',     // sm
  5: '20px',
  6: '24px',     // md
  7: '28px',
  8: '32px',     // lg
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',    // xl
  14: '56px',
  16: '64px',    // 2xl
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
} as const;

// 语义化间距别名
export const spacingAlias = {
  xs: spacing[2],   // 8px
  sm: spacing[4],   // 16px
  md: spacing[6],   // 24px
  lg: spacing[8],   // 32px
  xl: spacing[12],  // 48px
  '2xl': spacing[16], // 64px
} as const;

// ============================================
// 3. 圆角规范 (Border Radius)
// ============================================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ============================================
// 4. 阴影规范 (Shadows)
// ============================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ============================================
// 5. 字体规范 (Typography)
// ============================================

export const fontFamily = {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
} as const;

export const fontSize = {
  xs: ['12px', { lineHeight: '16px' }],
  sm: ['14px', { lineHeight: '20px' }],
  base: ['16px', { lineHeight: '24px' }],
  lg: ['18px', { lineHeight: '28px' }],
  xl: ['20px', { lineHeight: '28px' }],
  '2xl': ['24px', { lineHeight: '32px' }],
  '3xl': ['30px', { lineHeight: '36px' }],
  '4xl': ['36px', { lineHeight: '40px' }],
  '5xl': ['48px', { lineHeight: '48px' }],
  '6xl': ['60px', { lineHeight: '60px' }],
  '7xl': ['72px', { lineHeight: '72px' }],
} as const;

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// ============================================
// 6. 边框规范 (Borders)
// ============================================

export const borderWidth = {
  0: '0px',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const;

// ============================================
// 7. 过渡动画 (Transitions)
// ============================================

export const transitions = {
  none: 'none',
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
} as const;

// ============================================
// 8. Z-Index 层级
// ============================================

export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',     // dropdown
  100: '100',   // sticky
  200: '200',   // modal backdrop
  300: '300',   // modal
  400: '400',   // popover
  500: '500',   // tooltip
  999: '999',   // toast
} as const;

// ============================================
// 导出所有 Tokens
// ============================================

export const tokens = {
  colors,
  spacing,
  spacingAlias,
  borderRadius,
  shadows,
  fontFamily,
  fontSize,
  fontWeight,
  borderWidth,
  transitions,
  zIndex,
} as const;

export type Tokens = typeof tokens;

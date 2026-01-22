/**
 * Stitch Theme Presets - 主题预设（场景触发）
 *
 * 根据上下文自动选择主题，AI 也可以指定特定主题
 */

import { colors, borderRadius, shadows, fontFamily } from './tokens';

// ============================================
// 主题类型定义
// ============================================

export interface ThemePreset {
  name: string;
  description: string;
  // 触发关键词 - AI 根据这些词自动选择主题
  triggers: string[];
  // 颜色配置
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    ring: string;
    // 语义色
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // 样式配置
  style: {
    borderRadius: string;
    shadow: string;
    fontFamily: string;
  };
}

// ============================================
// 主题预设定义
// ============================================

export const themePresets: Record<string, ThemePreset> = {
  // ------------------------------------------
  // 1. 企业技术风 (Enterprise Tech)
  // ------------------------------------------
  tech: {
    name: '企业技术风',
    description: '深蓝/青色主色，高对比度，字体硬朗。适合 SaaS、Dashboard、开发工具',
    triggers: ['技术', '科技', 'saas', 'dashboard', '控制台', '监控', '架构', 'api', '开发', '后台管理'],
    colors: {
      primary: colors.blue[600],
      primaryForeground: '#ffffff',
      secondary: colors.neutral[100],
      secondaryForeground: colors.neutral[900],
      background: '#ffffff',
      foreground: colors.neutral[900],
      card: '#ffffff',
      cardForeground: colors.neutral[900],
      muted: colors.neutral[100],
      mutedForeground: colors.neutral[500],
      accent: colors.cyan[500],
      accentForeground: '#ffffff',
      border: colors.neutral[200],
      ring: colors.blue[600],
      success: colors.green[500],
      warning: colors.yellow[500],
      error: colors.red[500],
      info: colors.blue[500],
    },
    style: {
      borderRadius: borderRadius.md,
      shadow: shadows.md,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 2. 极简主义 (Minimalist)
  // ------------------------------------------
  minimalist: {
    name: '极简主义',
    description: '白背景、极细边框、大量留白。适合工具、笔记、阅读',
    triggers: ['极简', '简洁', '干净', '留白', '工具', '笔记', '阅读', 'minimalist', 'clean'],
    colors: {
      primary: colors.neutral[900],
      primaryForeground: '#ffffff',
      secondary: colors.neutral[100],
      secondaryForeground: colors.neutral[900],
      background: '#ffffff',
      foreground: colors.neutral[800],
      card: '#ffffff',
      cardForeground: colors.neutral[800],
      muted: colors.neutral[50],
      mutedForeground: colors.neutral[500],
      accent: colors.neutral[100],
      accentForeground: colors.neutral[900],
      border: colors.neutral[200],
      ring: colors.neutral[900],
      success: colors.green[600],
      warning: colors.yellow[600],
      error: colors.red[600],
      info: colors.blue[600],
    },
    style: {
      borderRadius: borderRadius.sm,
      shadow: shadows.sm,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 3. 暗黑模式 (Dark Mode)
  // ------------------------------------------
  dark: {
    name: '暗黑模式',
    description: '深色背景，适合开发者、监控面板、夜间使用',
    triggers: ['暗色', '深色', 'dark', '夜间', '开发者', '代码', '终端', 'terminal'],
    colors: {
      primary: colors.blue[500],
      primaryForeground: '#ffffff',
      secondary: colors.neutral[800],
      secondaryForeground: colors.neutral[100],
      background: colors.neutral[950],
      foreground: colors.neutral[100],
      card: colors.neutral[900],
      cardForeground: colors.neutral[100],
      muted: colors.neutral[800],
      mutedForeground: colors.neutral[400],
      accent: colors.neutral[800],
      accentForeground: colors.neutral[100],
      border: colors.neutral[800],
      ring: colors.blue[500],
      success: colors.green[400],
      warning: colors.yellow[400],
      error: colors.red[400],
      info: colors.blue[400],
    },
    style: {
      borderRadius: borderRadius.md,
      shadow: shadows.lg,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 4. 温暖友好 (Warm & Friendly)
  // ------------------------------------------
  warm: {
    name: '温暖友好',
    description: '橙黄暖色调，圆润字体。适合餐饮、社区、教育',
    triggers: ['温暖', '友好', '餐饮', '美食', '社区', '教育', '儿童', 'warm', 'friendly', 'cozy'],
    colors: {
      primary: colors.orange[500],
      primaryForeground: '#ffffff',
      secondary: colors.orange[50],
      secondaryForeground: colors.orange[900],
      background: '#fffbf5',
      foreground: colors.brown[900],
      card: '#ffffff',
      cardForeground: colors.brown[900],
      muted: colors.orange[50],
      mutedForeground: colors.brown[500],
      accent: colors.yellow[400],
      accentForeground: colors.brown[900],
      border: colors.orange[200],
      ring: colors.orange[500],
      success: colors.green[500],
      warning: colors.yellow[500],
      error: colors.red[500],
      info: colors.blue[500],
    },
    style: {
      borderRadius: borderRadius.lg,
      shadow: shadows.md,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 5. 优雅奢华 (Elegant & Luxurious)
  // ------------------------------------------
  elegant: {
    name: '优雅奢华',
    description: '黑金配色，衬线字体。适合奢侈品、时尚、高端品牌',
    triggers: ['优雅', '奢华', '高端', '时尚', '奢侈品', '珠宝', '酒店', 'elegant', 'luxury', 'premium'],
    colors: {
      primary: colors.neutral[900],
      primaryForeground: '#ffffff',
      secondary: '#d4af37', // 金色
      secondaryForeground: colors.neutral[900],
      background: '#faf9f7',
      foreground: colors.neutral[900],
      card: '#ffffff',
      cardForeground: colors.neutral[900],
      muted: colors.neutral[100],
      mutedForeground: colors.neutral[500],
      accent: '#d4af37',
      accentForeground: colors.neutral[900],
      border: colors.neutral[300],
      ring: colors.neutral[900],
      success: colors.green[600],
      warning: colors.yellow[600],
      error: colors.red[600],
      info: colors.blue[600],
    },
    style: {
      borderRadius: borderRadius.none,
      shadow: shadows.sm,
      fontFamily: fontFamily.serif,
    },
  },

  // ------------------------------------------
  // 6. 活力运动 (Vibrant & Energetic)
  // ------------------------------------------
  vibrant: {
    name: '活力运动',
    description: '高饱和度、动感配色。适合健身、运动、音乐',
    triggers: ['活力', '运动', '健身', '音乐', '派对', 'vibrant', 'energetic', 'fitness', 'sport'],
    colors: {
      primary: colors.orange[500],
      primaryForeground: '#ffffff',
      secondary: colors.neutral[900],
      secondaryForeground: '#ffffff',
      background: colors.neutral[950],
      foreground: '#ffffff',
      card: colors.neutral[900],
      cardForeground: '#ffffff',
      muted: colors.neutral[800],
      mutedForeground: colors.neutral[400],
      accent: colors.green[400],
      accentForeground: colors.neutral[900],
      border: colors.neutral[700],
      ring: colors.orange[500],
      success: colors.green[400],
      warning: colors.yellow[400],
      error: colors.red[400],
      info: colors.cyan[400],
    },
    style: {
      borderRadius: borderRadius.sm,
      shadow: shadows.lg,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 7. 赛博朋克 (Cyberpunk)
  // ------------------------------------------
  cyberpunk: {
    name: '赛博朋克',
    description: '霓虹色、深色背景、故障效果。适合游戏、科幻、未来',
    triggers: ['赛博朋克', 'cyberpunk', '霓虹', '游戏', '科幻', '未来', 'neon', 'game', 'futuristic'],
    colors: {
      primary: colors.cyan[400],
      primaryForeground: colors.neutral[900],
      secondary: colors.pink[500],
      secondaryForeground: '#ffffff',
      background: '#0a0a0f',
      foreground: colors.cyan[100],
      card: '#12121a',
      cardForeground: colors.cyan[100],
      muted: '#1a1a25',
      mutedForeground: colors.cyan[300],
      accent: colors.pink[500],
      accentForeground: '#ffffff',
      border: colors.cyan[800],
      ring: colors.cyan[400],
      success: colors.green[400],
      warning: colors.yellow[400],
      error: colors.red[400],
      info: colors.cyan[400],
    },
    style: {
      borderRadius: borderRadius.md,
      shadow: '0 0 20px rgba(6, 182, 212, 0.3)',
      fontFamily: fontFamily.mono,
    },
  },

  // ------------------------------------------
  // 8. 清新自然 (Fresh & Natural)
  // ------------------------------------------
  fresh: {
    name: '清新自然',
    description: '绿色系、自然感。适合健康、环保、户外、有机',
    triggers: ['清新', '自然', '绿色', '健康', '环保', '有机', 'fresh', 'natural', 'organic', 'eco'],
    colors: {
      primary: colors.green[600],
      primaryForeground: '#ffffff',
      secondary: colors.green[50],
      secondaryForeground: colors.green[900],
      background: '#f8fdf8',
      foreground: colors.green[900],
      card: '#ffffff',
      cardForeground: colors.green[900],
      muted: colors.green[50],
      mutedForeground: colors.green[600],
      accent: colors.green[400],
      accentForeground: colors.green[900],
      border: colors.green[200],
      ring: colors.green[600],
      success: colors.green[500],
      warning: colors.yellow[500],
      error: colors.red[500],
      info: colors.blue[500],
    },
    style: {
      borderRadius: borderRadius.lg,
      shadow: shadows.md,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 9. 可信专业 (Trustworthy & Professional)
  // ------------------------------------------
  trustworthy: {
    name: '可信专业',
    description: '深蓝稳重、专业感。适合金融、保险、政府、医疗',
    triggers: ['专业', '可信', '金融', '银行', '保险', '政府', '医疗', 'professional', 'trustworthy', 'finance', 'bank'],
    colors: {
      primary: colors.blue[800],
      primaryForeground: '#ffffff',
      secondary: colors.blue[50],
      secondaryForeground: colors.blue[900],
      background: '#ffffff',
      foreground: colors.neutral[900],
      card: '#ffffff',
      cardForeground: colors.neutral[900],
      muted: colors.neutral[100],
      mutedForeground: colors.neutral[500],
      accent: colors.blue[100],
      accentForeground: colors.blue[900],
      border: colors.neutral[200],
      ring: colors.blue[800],
      success: colors.green[600],
      warning: colors.yellow[600],
      error: colors.red[600],
      info: colors.blue[600],
    },
    style: {
      borderRadius: borderRadius.sm,
      shadow: shadows.sm,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 10. 活泼童趣 (Playful)
  // ------------------------------------------
  playful: {
    name: '活泼童趣',
    description: '多彩、圆润、有趣。适合儿童、游戏、创意',
    triggers: ['活泼', '童趣', '儿童', '卡通', '有趣', 'playful', 'fun', 'kids', 'creative'],
    colors: {
      primary: colors.purple[500],
      primaryForeground: '#ffffff',
      secondary: colors.pink[400],
      secondaryForeground: '#ffffff',
      background: '#fefcff',
      foreground: colors.purple[900],
      card: '#ffffff',
      cardForeground: colors.purple[900],
      muted: colors.purple[50],
      mutedForeground: colors.purple[500],
      accent: colors.yellow[400],
      accentForeground: colors.purple[900],
      border: colors.purple[200],
      ring: colors.purple[500],
      success: colors.green[400],
      warning: colors.yellow[400],
      error: colors.red[400],
      info: colors.blue[400],
    },
    style: {
      borderRadius: borderRadius.xl,
      shadow: shadows.lg,
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 11. 毛玻璃 (Glassmorphism)
  // ------------------------------------------
  glass: {
    name: '毛玻璃',
    description: '半透明、模糊背景、光泽感。适合现代、科技、iOS风格',
    triggers: ['毛玻璃', 'glass', 'glassmorphism', '透明', '模糊', 'blur', 'ios'],
    colors: {
      primary: colors.blue[500],
      primaryForeground: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.1)',
      secondaryForeground: '#ffffff',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      foreground: '#ffffff',
      card: 'rgba(255, 255, 255, 0.1)',
      cardForeground: '#ffffff',
      muted: 'rgba(255, 255, 255, 0.05)',
      mutedForeground: 'rgba(255, 255, 255, 0.7)',
      accent: 'rgba(255, 255, 255, 0.2)',
      accentForeground: '#ffffff',
      border: 'rgba(255, 255, 255, 0.2)',
      ring: colors.blue[400],
      success: colors.green[400],
      warning: colors.yellow[400],
      error: colors.red[400],
      info: colors.blue[400],
    },
    style: {
      borderRadius: borderRadius.lg,
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      fontFamily: fontFamily.sans,
    },
  },

  // ------------------------------------------
  // 12. 野兽派 (Brutalist)
  // ------------------------------------------
  brutalist: {
    name: '野兽派',
    description: '粗边框、系统字体、原始感。适合艺术、实验、个性表达',
    triggers: ['野兽派', 'brutalist', '粗犷', '原始', '艺术', 'raw', 'experimental'],
    colors: {
      primary: '#000000',
      primaryForeground: '#ffffff',
      secondary: '#ffffff',
      secondaryForeground: '#000000',
      background: '#ffffff',
      foreground: '#000000',
      card: '#ffffff',
      cardForeground: '#000000',
      muted: colors.neutral[100],
      mutedForeground: colors.neutral[600],
      accent: colors.yellow[300],
      accentForeground: '#000000',
      border: '#000000',
      ring: '#000000',
      success: colors.green[600],
      warning: colors.yellow[500],
      error: colors.red[600],
      info: colors.blue[600],
    },
    style: {
      borderRadius: borderRadius.none,
      shadow: '4px 4px 0px #000000',
      fontFamily: fontFamily.mono,
    },
  },
};

// ============================================
// 主题选择器 - 根据关键词自动匹配主题
// ============================================

export function matchTheme(context: string): ThemePreset {
  const lowerContext = context.toLowerCase();

  for (const [, theme] of Object.entries(themePresets)) {
    for (const trigger of theme.triggers) {
      if (lowerContext.includes(trigger.toLowerCase())) {
        return theme;
      }
    }
  }

  // 默认返回 tech 主题
  return themePresets.tech;
}

// ============================================
// 获取所有主题名称
// ============================================

export function getThemeNames(): string[] {
  return Object.keys(themePresets);
}

// ============================================
// 获取主题
// ============================================

export function getTheme(name: string): ThemePreset | undefined {
  return themePresets[name];
}

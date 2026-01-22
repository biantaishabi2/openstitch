/**
 * daisyUI 主题映射
 *
 * 将 daisyUI 的 29+ 预设主题映射到 Stitch 系统
 * 每个主题包含触发关键词，用于 AI 自动选择
 */

export interface DaisyUITheme {
  name: string;
  description: string;
  triggers: string[];
  category: 'light' | 'dark' | 'colorful';
  vibe: string[];
  industry: string[];
}

// daisyUI 内置主题映射
export const daisyuiThemes: Record<string, DaisyUITheme> = {
  // ============================================
  // 基础主题
  // ============================================
  light: {
    name: '浅色',
    description: '默认浅色主题，干净简洁',
    triggers: ['浅色', '亮色', 'light', '默认', '简洁'],
    category: 'light',
    vibe: ['minimalist', 'clean', 'professional'],
    industry: ['通用', '企业', '工具'],
  },

  dark: {
    name: '深色',
    description: '默认深色主题，护眼舒适',
    triggers: ['深色', '暗色', 'dark', '夜间', '护眼'],
    category: 'dark',
    vibe: ['modern', 'sleek', 'professional'],
    industry: ['开发', '科技', '工具'],
  },

  // ============================================
  // 风格主题
  // ============================================
  cyberpunk: {
    name: '赛博朋克',
    description: '霓虹色、未来感、科技风',
    triggers: ['赛博朋克', 'cyberpunk', '霓虹', '未来', '科幻', 'neon', '游戏'],
    category: 'dark',
    vibe: ['futuristic', 'bold', 'energetic'],
    industry: ['游戏', '科技', '娱乐'],
  },

  synthwave: {
    name: '合成波',
    description: '80年代复古未来风，紫粉渐变',
    triggers: ['合成波', 'synthwave', '80年代', 'retro-futurism', '蒸汽波', 'vaporwave'],
    category: 'dark',
    vibe: ['retro', 'nostalgic', 'vibrant'],
    industry: ['音乐', '娱乐', '创意'],
  },

  retro: {
    name: '复古',
    description: '复古怀旧风，暖色调',
    triggers: ['复古', 'retro', '怀旧', 'vintage', '老式'],
    category: 'light',
    vibe: ['retro', 'warm', 'nostalgic'],
    industry: ['咖啡', '餐饮', '文创'],
  },

  valentine: {
    name: '情人节',
    description: '粉红浪漫风',
    triggers: ['情人节', 'valentine', '浪漫', '粉色', '爱情', 'romantic'],
    category: 'light',
    vibe: ['romantic', 'soft', 'feminine'],
    industry: ['约会', '礼品', '美妆'],
  },

  halloween: {
    name: '万圣节',
    description: '橙黑神秘风',
    triggers: ['万圣节', 'halloween', '神秘', '恐怖', '暗黑'],
    category: 'dark',
    vibe: ['mysterious', 'dark', 'bold'],
    industry: ['娱乐', '游戏', '活动'],
  },

  garden: {
    name: '花园',
    description: '自然绿色，清新',
    triggers: ['花园', 'garden', '自然', '植物', '绿色', '清新'],
    category: 'light',
    vibe: ['fresh', 'natural', 'calm'],
    industry: ['环保', '健康', '农业'],
  },

  forest: {
    name: '森林',
    description: '深绿自然风',
    triggers: ['森林', 'forest', '深绿', '户外', '探险'],
    category: 'dark',
    vibe: ['natural', 'earthy', 'calm'],
    industry: ['户外', '环保', '旅游'],
  },

  aqua: {
    name: '水蓝',
    description: '水蓝色主题，清爽',
    triggers: ['水蓝', 'aqua', '海洋', '清爽', '水'],
    category: 'light',
    vibe: ['fresh', 'cool', 'clean'],
    industry: ['饮料', '健康', '科技'],
  },

  lofi: {
    name: 'Lo-Fi',
    description: '低保真、柔和、放松',
    triggers: ['lofi', '低保真', '放松', '柔和', 'chill'],
    category: 'light',
    vibe: ['calm', 'soft', 'relaxed'],
    industry: ['音乐', '冥想', '学习'],
  },

  pastel: {
    name: '粉彩',
    description: '柔和粉彩色系',
    triggers: ['粉彩', 'pastel', '柔和', '马卡龙', '糖果色'],
    category: 'light',
    vibe: ['soft', 'gentle', 'playful'],
    industry: ['儿童', '美妆', '甜品'],
  },

  fantasy: {
    name: '幻想',
    description: '梦幻紫色主题',
    triggers: ['幻想', 'fantasy', '梦幻', '魔法', '紫色'],
    category: 'light',
    vibe: ['dreamy', 'magical', 'creative'],
    industry: ['游戏', '创意', '儿童'],
  },

  wireframe: {
    name: '线框',
    description: '极简线框风格，适合原型',
    triggers: ['线框', 'wireframe', '原型', '草稿', 'sketch'],
    category: 'light',
    vibe: ['minimal', 'raw', 'functional'],
    industry: ['设计', '开发', '原型'],
  },

  black: {
    name: '纯黑',
    description: 'OLED 纯黑，高对比',
    triggers: ['纯黑', 'black', 'oled', '省电', '高对比'],
    category: 'dark',
    vibe: ['bold', 'minimal', 'high-contrast'],
    industry: ['开发', '阅读', '工具'],
  },

  luxury: {
    name: '奢华',
    description: '金黑配色，高端感',
    triggers: ['奢华', 'luxury', '高端', '金色', '尊贵'],
    category: 'dark',
    vibe: ['luxurious', 'elegant', 'premium'],
    industry: ['奢侈品', '金融', '酒店'],
  },

  dracula: {
    name: '德古拉',
    description: '程序员最爱的暗色主题',
    triggers: ['德古拉', 'dracula', '程序员', '代码', 'ide'],
    category: 'dark',
    vibe: ['developer', 'dark', 'comfortable'],
    industry: ['开发', '科技', '工具'],
  },

  cmyk: {
    name: 'CMYK',
    description: '印刷四色，设计感',
    triggers: ['cmyk', '印刷', '设计', '四色', '平面'],
    category: 'light',
    vibe: ['creative', 'bold', 'artistic'],
    industry: ['设计', '印刷', '创意'],
  },

  autumn: {
    name: '秋天',
    description: '秋季暖色调',
    triggers: ['秋天', 'autumn', '秋季', '落叶', '橙色'],
    category: 'light',
    vibe: ['warm', 'cozy', 'natural'],
    industry: ['餐饮', '家居', '时尚'],
  },

  business: {
    name: '商务',
    description: '专业商务风格',
    triggers: ['商务', 'business', '企业', '办公', '专业'],
    category: 'light',
    vibe: ['professional', 'trustworthy', 'formal'],
    industry: ['企业', 'B2B', '金融'],
  },

  acid: {
    name: '酸性',
    description: '高饱和霓虹色',
    triggers: ['酸性', 'acid', '荧光', '高饱和', '大胆'],
    category: 'light',
    vibe: ['bold', 'vibrant', 'energetic'],
    industry: ['时尚', '音乐', '派对'],
  },

  lemonade: {
    name: '柠檬水',
    description: '清爽黄绿色',
    triggers: ['柠檬水', 'lemonade', '柠檬', '清爽', '夏天'],
    category: 'light',
    vibe: ['fresh', 'cheerful', 'bright'],
    industry: ['饮料', '健康', '夏季'],
  },

  night: {
    name: '夜晚',
    description: '深蓝夜色主题',
    triggers: ['夜晚', 'night', '深蓝', '星空', '夜空'],
    category: 'dark',
    vibe: ['calm', 'peaceful', 'deep'],
    industry: ['冥想', '睡眠', '天文'],
  },

  coffee: {
    name: '咖啡',
    description: '咖啡棕色系',
    triggers: ['咖啡', 'coffee', '棕色', '咖啡厅', '温暖'],
    category: 'dark',
    vibe: ['warm', 'cozy', 'inviting'],
    industry: ['咖啡', '餐饮', '阅读'],
  },

  winter: {
    name: '冬天',
    description: '冷色调冬季主题',
    triggers: ['冬天', 'winter', '冬季', '雪', '冰'],
    category: 'light',
    vibe: ['cool', 'crisp', 'clean'],
    industry: ['节日', '户外', '时尚'],
  },

  dim: {
    name: '昏暗',
    description: '柔和暗色，减少眼睛疲劳',
    triggers: ['昏暗', 'dim', '柔和暗色', '护眼'],
    category: 'dark',
    vibe: ['soft', 'comfortable', 'muted'],
    industry: ['阅读', '工具', '通用'],
  },

  nord: {
    name: 'Nord',
    description: '北欧风格，冷色调',
    triggers: ['nord', '北欧', '斯堪的纳维亚', '极简'],
    category: 'dark',
    vibe: ['minimal', 'cool', 'clean'],
    industry: ['设计', '科技', '工具'],
  },

  sunset: {
    name: '日落',
    description: '橙红渐变，温暖',
    triggers: ['日落', 'sunset', '黄昏', '橙红', '傍晚'],
    category: 'light',
    vibe: ['warm', 'romantic', 'vibrant'],
    industry: ['旅游', '摄影', '生活'],
  },
};

// ============================================
// 自定义主题（在 tailwind.config 中定义）
// ============================================
export const customThemes: Record<string, DaisyUITheme> = {
  tech: {
    name: '科技',
    description: 'SaaS/Dashboard 专用蓝色主题',
    triggers: ['科技', 'tech', 'saas', 'dashboard', '后台', '管理系统'],
    category: 'light',
    vibe: ['professional', 'modern', 'clean'],
    industry: ['科技', 'SaaS', '企业'],
  },

  warm: {
    name: '温暖',
    description: '橙色暖色调，适合餐饮社区',
    triggers: ['温暖', 'warm', '餐饮', '社区', '温馨'],
    category: 'light',
    vibe: ['warm', 'friendly', 'inviting'],
    industry: ['餐饮', '社区', '教育'],
  },

  elegant: {
    name: '优雅',
    description: '黑金配色，奢侈品风',
    triggers: ['优雅', 'elegant', '奢侈品', '高端', '金色'],
    category: 'light',
    vibe: ['luxurious', 'elegant', 'premium'],
    industry: ['奢侈品', '时尚', '酒店'],
  },

  fresh: {
    name: '清新',
    description: '绿色环保主题',
    triggers: ['清新', 'fresh', '绿色', '环保', '健康'],
    category: 'light',
    vibe: ['fresh', 'natural', 'healthy'],
    industry: ['健康', '环保', '有机'],
  },

  trustworthy: {
    name: '可信',
    description: '深蓝专业风，金融保险用',
    triggers: ['可信', 'trustworthy', '金融', '银行', '保险', '专业'],
    category: 'light',
    vibe: ['trustworthy', 'professional', 'stable'],
    industry: ['金融', '保险', '政府'],
  },

  playful: {
    name: '活泼',
    description: '紫粉多彩，儿童创意用',
    triggers: ['活泼', 'playful', '儿童', '创意', '有趣'],
    category: 'light',
    vibe: ['playful', 'fun', 'creative'],
    industry: ['儿童', '教育', '创意'],
  },

  brutalist: {
    name: '野兽派',
    description: '黑白粗犷，艺术实验用',
    triggers: ['野兽派', 'brutalist', '艺术', '实验', '粗犷'],
    category: 'light',
    vibe: ['raw', 'bold', 'artistic'],
    industry: ['艺术', '设计', '实验'],
  },
};

// ============================================
// 获取所有主题
// ============================================
export function getAllThemes(): Record<string, DaisyUITheme> {
  return { ...daisyuiThemes, ...customThemes };
}

// ============================================
// 根据关键词匹配主题
// ============================================
export function matchDaisyUITheme(context: string): string {
  const lowerContext = context.toLowerCase();
  const allThemes = getAllThemes();

  for (const [themeName, theme] of Object.entries(allThemes)) {
    for (const trigger of theme.triggers) {
      if (lowerContext.includes(trigger.toLowerCase())) {
        return themeName;
      }
    }
  }

  // 默认返回 light
  return 'light';
}

// ============================================
// 根据行业获取推荐主题
// ============================================
export function getThemesByIndustry(industry: string): string[] {
  const allThemes = getAllThemes();
  const results: string[] = [];

  for (const [themeName, theme] of Object.entries(allThemes)) {
    if (theme.industry.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))) {
      results.push(themeName);
    }
  }

  return results;
}

// ============================================
// 根据 Vibe 获取推荐主题
// ============================================
export function getThemesByVibe(vibe: string): string[] {
  const allThemes = getAllThemes();
  const results: string[] = [];

  for (const [themeName, theme] of Object.entries(allThemes)) {
    if (theme.vibe.some(v => v.toLowerCase().includes(vibe.toLowerCase()))) {
      results.push(themeName);
    }
  }

  return results;
}

// ============================================
// 主题统计
// ============================================
export function getThemeStats() {
  const allThemes = getAllThemes();
  const total = Object.keys(allThemes).length;
  const light = Object.values(allThemes).filter(t => t.category === 'light').length;
  const dark = Object.values(allThemes).filter(t => t.category === 'dark').length;
  const colorful = Object.values(allThemes).filter(t => t.category === 'colorful').length;

  return {
    total,
    light,
    dark,
    colorful,
    daisyui: Object.keys(daisyuiThemes).length,
    custom: Object.keys(customThemes).length,
  };
}

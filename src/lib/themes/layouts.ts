/**
 * Stitch Layout Presets - 布局预设
 *
 * 定义常用的页面布局模板，AI 根据场景自动选择
 */

export interface LayoutPreset {
  name: string;
  description: string;
  triggers: string[];
  // 布局结构描述
  structure: {
    type: 'single' | 'sidebar' | 'split' | 'grid' | 'stack';
    columns?: number;
    gap?: string;
    areas?: string[];
  };
  // 推荐组件
  components: string[];
  // 适用场景
  scenes: string[];
}

export const layoutPresets: Record<string, LayoutPreset> = {
  // ============================================
  // 页面级布局
  // ============================================

  dashboard: {
    name: '仪表盘',
    description: 'Header + Sidebar + Main，数据监控型',
    triggers: ['仪表盘', 'dashboard', '监控', '后台', '管理', 'admin', 'panel'],
    structure: {
      type: 'sidebar',
      areas: ['header', 'sidebar', 'main'],
    },
    components: ['sidebar', 'card', 'chart', 'table', 'statistic', 'progress'],
    scenes: ['SaaS', '企业后台', '数据监控', 'CRM'],
  },

  landing: {
    name: '落地页',
    description: 'Hero + Features + CTA，营销转化型',
    triggers: ['落地页', 'landing', '首页', '营销', '产品页', 'homepage'],
    structure: {
      type: 'stack',
      areas: ['navbar', 'hero', 'features', 'testimonials', 'cta', 'footer'],
    },
    components: ['hero', 'bento-grid', 'card', 'avatar-circles', 'marquee', 'shimmer-button'],
    scenes: ['产品推广', '营销', 'SaaS', '品牌'],
  },

  blog: {
    name: '博客/文章',
    description: '文章内容为主，阅读优化',
    triggers: ['博客', 'blog', '文章', '阅读', '新闻', 'article', 'news'],
    structure: {
      type: 'single',
      columns: 1,
    },
    components: ['breadcrumb', 'typography', 'separator', 'avatar', 'timeline'],
    scenes: ['博客', '新闻', '文档', '内容'],
  },

  ecommerce: {
    name: '电商',
    description: '商品展示、购物车、筛选',
    triggers: ['电商', 'ecommerce', '商城', '购物', '商品', 'shop', 'store'],
    structure: {
      type: 'grid',
      columns: 4,
      gap: '24px',
    },
    components: ['card', 'badge', 'button', 'carousel', 'pagination', 'select'],
    scenes: ['电商', '商城', '产品列表'],
  },

  settings: {
    name: '设置页',
    description: '表单设置、配置项',
    triggers: ['设置', 'settings', '配置', '账号', 'profile', 'preferences'],
    structure: {
      type: 'sidebar',
      areas: ['nav', 'form'],
    },
    components: ['tabs', 'form', 'input', 'switch', 'select', 'button', 'separator'],
    scenes: ['用户设置', '系统配置', '账号管理'],
  },

  auth: {
    name: '认证页',
    description: '登录、注册、找回密码',
    triggers: ['登录', 'login', '注册', 'register', '认证', 'auth', 'signin', 'signup'],
    structure: {
      type: 'split',
      columns: 2,
    },
    components: ['card', 'form', 'input', 'button', 'checkbox', 'separator'],
    scenes: ['登录', '注册', '认证'],
  },

  pricing: {
    name: '定价页',
    description: '价格对比、套餐选择',
    triggers: ['定价', 'pricing', '价格', '套餐', '会员', 'plans'],
    structure: {
      type: 'grid',
      columns: 3,
      gap: '32px',
    },
    components: ['card', 'badge', 'button', 'separator', 'checkbox'],
    scenes: ['SaaS定价', '会员', '套餐'],
  },

  // ============================================
  // 组件级布局
  // ============================================

  bentoGrid: {
    name: 'Bento Grid',
    description: '不规则网格，视觉层次丰富',
    triggers: ['bento', '不规则网格', '苹果风', 'apple', '卡片网格'],
    structure: {
      type: 'grid',
      columns: 4,
      gap: '16px',
    },
    components: ['bento-grid', 'magic-card', 'card'],
    scenes: ['功能展示', '产品特性', '仪表盘'],
  },

  splitScreen: {
    name: '分屏',
    description: '左右对称或不对称分割',
    triggers: ['分屏', 'split', '对称', '双栏', '50-50', '70-30'],
    structure: {
      type: 'split',
      columns: 2,
    },
    components: ['card', 'hero'],
    scenes: ['注册页', '对比展示', '功能介绍'],
  },

  masonry: {
    name: '瀑布流',
    description: '不等高卡片瀑布流',
    triggers: ['瀑布流', 'masonry', 'pinterest', '图片墙', 'gallery'],
    structure: {
      type: 'grid',
      columns: 3,
    },
    components: ['card', 'aspect-ratio'],
    scenes: ['图片展示', '作品集', '社交'],
  },

  timeline: {
    name: '时间线',
    description: '时间顺序展示',
    triggers: ['时间线', 'timeline', '历史', '进度', '流程', 'roadmap'],
    structure: {
      type: 'single',
    },
    components: ['timeline', 'stepper', 'card'],
    scenes: ['发展历程', '流程展示', '进度追踪'],
  },

  kanban: {
    name: '看板',
    description: '多列任务看板',
    triggers: ['看板', 'kanban', '任务', 'trello', '项目管理'],
    structure: {
      type: 'grid',
      columns: 4,
      gap: '16px',
    },
    components: ['card', 'badge', 'avatar', 'scroll-area'],
    scenes: ['项目管理', '任务管理', '工作流'],
  },

  chat: {
    name: '聊天',
    description: '聊天对话界面',
    triggers: ['聊天', 'chat', '对话', '消息', 'message', 'im'],
    structure: {
      type: 'stack',
      areas: ['messages', 'input'],
    },
    components: ['scroll-area', 'avatar', 'input', 'button'],
    scenes: ['即时通讯', '客服', 'AI对话'],
  },

  fileManager: {
    name: '文件管理',
    description: '文件列表、导航树',
    triggers: ['文件', 'file', '文档', '资源', '管理器', 'explorer'],
    structure: {
      type: 'sidebar',
      areas: ['tree', 'list'],
    },
    components: ['tree', 'table', 'breadcrumb', 'context-menu'],
    scenes: ['文件管理', '资源管理', '文档系统'],
  },
};

// ============================================
// 根据场景匹配布局
// ============================================

export function matchLayout(context: string): LayoutPreset {
  const lowerContext = context.toLowerCase();

  for (const [, layout] of Object.entries(layoutPresets)) {
    for (const trigger of layout.triggers) {
      if (lowerContext.includes(trigger.toLowerCase())) {
        return layout;
      }
    }
  }

  // 默认返回 landing
  return layoutPresets.landing;
}

// ============================================
// 获取布局推荐的组件
// ============================================

export function getLayoutComponents(layoutName: string): string[] {
  const layout = layoutPresets[layoutName];
  return layout ? layout.components : [];
}

// ============================================
// 布局统计
// ============================================

export function getLayoutStats() {
  return {
    total: Object.keys(layoutPresets).length,
    pageLevel: Object.values(layoutPresets).filter(l =>
      ['dashboard', 'landing', 'blog', 'ecommerce', 'settings', 'auth', 'pricing'].includes(l.name.toLowerCase())
    ).length,
    componentLevel: Object.values(layoutPresets).filter(l =>
      ['bento grid', '分屏', '瀑布流', '时间线', '看板', '聊天', '文件管理'].includes(l.name)
    ).length,
  };
}

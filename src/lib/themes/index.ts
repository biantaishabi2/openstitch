/**
 * Stitch Theme System - 主题系统入口
 *
 * 三层架构：
 * 1. Tokens（基础规格）- 强制执行的设计原子
 * 2. Presets（主题预设）- 场景触发的视觉风格
 * 3. Override（覆盖机制）- AI 的局部微调能力
 *
 * 主题来源：
 * - 自定义 presets: 12 个场景主题
 * - daisyUI: 26 个内置主题 + 7 个自定义主题
 * - 总计: 45+ 个主题预设
 */

// Tokens - 基础规格
export * from './tokens';

// Presets - 主题预设
export * from './presets';

// Override - 覆盖机制
export * from './override';

// daisyUI 主题映射
export * from './daisyui-themes';

// 布局预设
export * from './layouts';

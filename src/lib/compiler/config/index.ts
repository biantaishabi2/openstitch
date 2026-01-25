/**
 * 编译器配置加载器
 *
 * 从 JSON 文件加载配置，使用 Zod 校验
 */

import { z } from 'zod';

// 导入 JSON 配置
import sceneConfig from './scene.json';
import typographyConfig from './typography.json';
import shapeConfig from './shape.json';
import ornamentConfig from './ornament.json';
import componentPropsConfig from './component-props.json';

// ============================================
// Schema 定义
// ============================================

/** 场景风格 */
export const SceneStyleSchema = z.enum([
  'technical', 'finance', 'medical', 'education', 'creative', 'enterprise', 'default'
]);
export type SceneStyle = z.infer<typeof SceneStyleSchema>;

/** 形状风格 */
export const ShapeStyleSchema = z.enum(['sharp', 'rounded', 'soft', 'pill']);
export type ShapeStyle = z.infer<typeof ShapeStyleSchema>;

/** 装饰级别 */
export const OrnamentLevelSchema = z.enum(['none', 'subtle', 'moderate', 'rich']);
export type OrnamentLevel = z.infer<typeof OrnamentLevelSchema>;

/** 场景约束 */
export const SceneConstraintsSchema = z.object({
  saturationRange: z.tuple([z.number(), z.number()]),
  lightnessRange: z.tuple([z.number(), z.number()]),
  spacingMultiplier: z.number(),
  shapeStyle: ShapeStyleSchema,
  shapeMinRadius: z.number().optional(),
  ornamentLevel: OrnamentLevelSchema,
  semanticColors: z.object({
    positive: z.string(),
    negative: z.string(),
  }).optional(),
});
export type SceneConstraints = z.infer<typeof SceneConstraintsSchema>;

/** 场景配置 */
export const SceneConfigSchema = z.object({
  keywords: z.record(z.string(), z.array(z.string())),
  constraints: z.record(z.string(), SceneConstraintsSchema),
});

/** 字体配置 */
export const TypographyConfigSchema = z.object({
  scales: z.array(z.number()),
  scaleNames: z.array(z.string()),
  baseSize: z.number(),
  maxFontSize: z.number(),
  weights: z.record(z.string(), z.number()),
});

/** 形状配置 */
export const ShapeConfigSchema = z.object({
  styles: z.record(z.string(), z.object({
    minRadius: z.number(),
    multiplier: z.number(),
  })),
  shadows: z.record(z.string(), z.number()),
});

/** 装饰配置 */
export const OrnamentConfigSchema = z.object({
  patterns: z.array(z.string()),
  levels: z.record(z.string(), z.object({
    noiseOpacity: z.number(),
    patternOpacity: z.number(),
  })),
});

/** 组件 Props 配置 */
export const ComponentPropsConfigSchema = z.object({
  specialProps: z.record(z.string(), z.record(z.string(), z.unknown())),
  compositeComponents: z.array(z.string()),
});

// ============================================
// 配置加载与校验
// ============================================

/** 场景配置 */
export const SCENE_CONFIG = SceneConfigSchema.parse(sceneConfig);

/** 字体配置 */
export const TYPOGRAPHY_CONFIG = TypographyConfigSchema.parse(typographyConfig);

/** 形状配置 */
export const SHAPE_CONFIG = ShapeConfigSchema.parse(shapeConfig);

/** 装饰配置 */
export const ORNAMENT_CONFIG = OrnamentConfigSchema.parse(ornamentConfig);

/** 组件 Props 配置 */
export const COMPONENT_PROPS_CONFIG = ComponentPropsConfigSchema.parse(componentPropsConfig);

// ============================================
// 便捷访问函数
// ============================================

/**
 * 获取场景关键词
 */
export function getSceneKeywords(scene: SceneStyle): string[] {
  return SCENE_CONFIG.keywords[scene] || [];
}

/**
 * 获取场景约束
 */
export function getSceneConstraints(scene: SceneStyle): SceneConstraints {
  return SCENE_CONFIG.constraints[scene] || SCENE_CONFIG.constraints.default;
}

/**
 * 获取字阶比率
 */
export function getTypeScale(index: number): number {
  const scales = TYPOGRAPHY_CONFIG.scales;
  return scales[index % scales.length];
}

/**
 * 获取形状样式配置
 */
export function getShapeStyle(style: ShapeStyle): { minRadius: number; multiplier: number } {
  return SHAPE_CONFIG.styles[style];
}

/**
 * 获取阴影强度
 */
export function getShadowIntensity(style: ShapeStyle): number {
  return SHAPE_CONFIG.shadows[style] || 0.1;
}

/**
 * 获取装饰级别配置
 */
export function getOrnamentLevel(level: OrnamentLevel): { noiseOpacity: number; patternOpacity: number } {
  return ORNAMENT_CONFIG.levels[level];
}

/**
 * 获取组件特殊 Props
 */
export function getSpecialProps(componentType: string): Record<string, unknown> {
  return COMPONENT_PROPS_CONFIG.specialProps[componentType] || {};
}

/**
 * 判断是否为复合组件
 */
export function isCompositeComponent(componentType: string): boolean {
  return COMPONENT_PROPS_CONFIG.compositeComponents.includes(componentType);
}

/**
 * 根据 context 识别场景风格
 */
export function detectSceneStyle(context: string): SceneStyle {
  for (const [scene, keywords] of Object.entries(SCENE_CONFIG.keywords)) {
    if (keywords.some(kw => context.includes(kw))) {
      return scene as SceneStyle;
    }
  }
  return 'default';
}

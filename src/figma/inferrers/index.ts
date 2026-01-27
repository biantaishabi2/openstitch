/**
 * Figma 推断器模块
 */

export {
  inferVisuals,
  extractValidNodes,
  DEFAULT_TOKENS,
} from './visual-inferrer';

export {
  inferComponent,
  inferStructure,
  applyRules,
  applyHeuristics,
  buildAIPrompt,
  parseAIResponse,
  type ComponentType,
  type ComponentInference,
  type StructureInferenceResult,
} from './structure-inferrer';

export {
  inferColors,
  collectColors,
  clusterColors,
  assignColorRoles,
  generateColorScales,
  DEFAULT_COLORS,
  type ColorInferenceResult,
} from './color-inferrer';

export {
  inferTypography,
  collectFontSizes,
  clusterFontSizes,
  detectTypeScale,
  DEFAULT_TYPOGRAPHY,
  SCALE_RATIOS,
  type TypographyInferenceResult,
} from './typography-inferrer';

export {
  inferSpacing,
  collectSpacings,
  detectGridUnit,
  DEFAULT_SPACING,
  type SpacingInferenceResult,
} from './spacing-inferrer';

export {
  inferShapes,
  collectRadii,
  collectShadows,
  DEFAULT_SHAPES,
  type ShapeInferenceResult,
} from './shape-inferrer';

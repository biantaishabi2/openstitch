/**
 * 视觉引擎入口
 *
 * 提供 context + Hash 种子 → Design Tokens 的完整流程
 */

// 导出类型
export type {
  DesignTokens,
  SpacingTokens,
  TypographyTokens,
  ShapeTokens,
  OrnamentTokens,
  ColorTokens,
  SceneStyle,
  SpacingDensity,
  TypeScale,
  ShapeStyle,
  OrnamentLevel,
  SessionState,
  SynthesizerOptions,
  AuditWarning,
} from './types';

// 导出合成器
export {
  generateDesignTokens,
  generateDesignTokensWithAudit,
  tokensToCss,
  tokensToStyle,
  type DesignAuditResult,
} from './synthesizer';

// 导出质感补丁工具
export {
  compensateDarkMode,
  getLuminance,
  getLetterSpacingClass,
  calculateInnerRadius,
  getTouchFeedbackClasses,
  tintNeutralColor,
  getCompensatedLineHeight,
} from './synthesizer';

// 导出色彩空间工具
export {
  validateContrast,
  auditColorContrast,
  generatePerceptualColorScale,
  type ContrastResult,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
} from './color-space';

// 导出 Session 管理
export {
  createSession,
  getSession,
  getOrCreateSession,
  updateSessionContext,
  deleteSession,
  clearAllSessions,
  listSessions,
  getSessionTokens,
  refreshSessionTokens,
  overrideSessionTokens,
  exportSession,
  importSession,
  getTokens,
} from './session';

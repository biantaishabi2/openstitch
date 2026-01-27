/**
 * SSR 引擎入口
 *
 * 导出 SSR 引擎的所有公共 API
 */

// 类型导出
export type {
  SSROptions,
  SSRResult,
  SSRStats,
  CodeGenTarget,
  CodeGenOptions,
  SolidifyOptions,
  PurgeCSSOptions,
} from './types';

// SSR 渲染器
export {
  renderToStaticHTML,
  renderToHTML,
  renderFactoryOutput,
} from './renderer';

// HEEx 导出
export { renderToHEEx } from './heex-exporter';

// 脱水渲染
export {
  dehydrate,
  dehydrateBatch,
  dehydrateAsync,
  type DehydrateOptions,
  type DehydrateResult,
} from './dehydrator';

// 样式萃取
export {
  purgeCSS,
  generateInlineStyle,
  generateCSSVariables,
  mergeCSS,
  type PurgeResult,
} from './css-purger';

// 资源固化
export {
  solidifyAssets,
  generateStandaloneHTML,
  type SolidifyResult,
} from './solidifier';

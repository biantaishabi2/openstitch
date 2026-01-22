/**
 * Stitch 渲染引擎
 *
 * 使用示例：
 *
 * ```tsx
 * import { render, StitchRenderer } from '@/lib/renderer';
 *
 * // 方式1：函数调用
 * const element = render(schema);
 *
 * // 方式2：组件使用
 * <StitchRenderer schema={schema} />
 *
 * // 方式3：Hook
 * const element = useStitchRenderer(schema);
 *
 * // 方式4：导出 HTML
 * const html = exportToHTML(schema);
 *
 * // 方式5：导出图片（客户端）
 * await downloadAsImage(element, 'export.png');
 * ```
 */

export {
  render,
  StitchRenderer,
  useStitchRenderer,
  hasComponent,
  getComponent,
} from './renderer';

export { componentMap, getComponentNames } from './component-map';

export {
  exportToHTML,
  exportToHTMLFragment,
  exportToImage,
  downloadAsImage,
  downloadAsHTML,
  availableThemes,
} from './export';

export type {
  UINode,
  RendererConfig,
  RenderContext,
  ComponentMap,
  ExportOptions,
  ThemeName,
  ThemeConfig,
} from './types';

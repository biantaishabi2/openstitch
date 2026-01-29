/**
 * Figma 适配器
 *
 * 将 Figma JSON 转换为 Stitch 编译器可用的 DSL + Design Tokens
 */

export {
  convertFigmaToStitch,
  convertVisualResultToTokens,
  type FigmaToStitchResult,
  type FigmaAdapterOptions,
} from './figma-adapter';

export {
  fetchFigmaFile,
  downloadImage,
  saveFigmaJson,
  downloadFigmaData,
  type FigmaFetcherOptions,
  type FigmaFetchResult,
  type DownloadOptions,
  type DownloadResult,
} from './fetcher';

export {
  extractFonts,
  generateGoogleFontsLink,
  generateFontCSS,
  extractIcons,
  exportIconsAsSVG,
  downloadSVGIcons,
  generateIconMapping,
  exportAssets,
  type FontInfo,
  type IconInfo,
  type AssetExportOptions,
  type AssetExportResult,
} from './asset-exporter';

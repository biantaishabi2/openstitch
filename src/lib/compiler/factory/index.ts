/**
 * 组件工厂入口
 *
 * 导出组件工厂的所有公共 API
 */

// 类型导出
export type {
  UINode,
  FactoryInput,
  FactoryOptions,
  EventHandler,
  EventStubConfig,
  SlotRule,
  PropsNormalizer,
  NormalizedProps,
  SlotDistribution,
} from './types';

// 组件工厂
export {
  componentFactory,
  renderAST,
  StitchFactory,
  useStitchFactory,
  type FactoryOutput,
  type StitchFactoryProps,
} from './component-factory';

// ThemeProvider
export {
  ThemeProvider,
  useTheme,
  useThemeToken,
  useThemeTokens,
  withTheme,
  type ThemeProviderProps,
} from './theme-provider';

// IR 生成器
export { generateIR, generateNodeIR } from './ir-generator';

// Props 归一化
export { normalizeProps, applyTokensToStyle } from './props-normalizer';

// 插槽分发
export {
  SLOT_RULES,
  getSlotRule,
  distributeToSlots,
  isSlotEmpty,
  getSlotWrapper,
  distributeTabsContent,
  distributeTableContent,
} from './slot-distributor';

// 事件桩函数
export {
  EVENT_STUBS,
  getEventStubs,
  injectEventStubs,
  needsEventStubs,
  getEventStubComponents,
} from './event-stubs';

// 类型映射
export {
  TYPE_MAP,
  SPECIAL_TYPE_PROPS,
  getMappedType,
  getSpecialProps,
  COMPOSITE_COMPONENTS,
  isCompositeComponent,
} from './type-map';

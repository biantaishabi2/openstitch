/**
 * Stitch 组件工厂 - 导出入口
 */

export {
  createComponentTree,
  StitchRenderer,
  ThemeProvider,
  useTheme,
} from "./component-factory";

export type {
  ASTNode,
  FactoryContext,
  ComponentFactoryInput,
} from "./component-factory";

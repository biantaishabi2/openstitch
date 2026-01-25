/**
 * AST 类型定义
 *
 * 定义 Stitch DSL 编译器的抽象语法树结构
 * - CSTNode: 具体语法树节点 (Chevrotain Parser 输出)
 * - ASTNode: 抽象语法树节点 (Zod 语义收敛输出)
 * - StitchAST: 完整的 AST 根节点
 */

// ============================================
// CST (Concrete Syntax Tree) 类型
// Chevrotain Parser 输出的中间表示
// ============================================

/** CST 属性节点 - ATTR: Key("value") */
export interface CSTAttr {
  key: string;    // 如 "Title", "Icon", "Variant"
  value: string;  // 如 "OpenCode 接口调用", "Terminal"
}

/** CST 节点 - Parser 输出 */
export interface CSTNode {
  tag: string;                          // 标签类型: "SECTION", "CARD", "BUTTON" 等
  id?: string;                          // 可选 ID: [CARD: node_opencode] 中的 node_opencode
  text?: string;                        // 文本内容: [BUTTON: "运行调试"] 中的 "运行调试"
  layoutProps?: Record<string, string>; // 布局属性: { Gutter: "32px", Align: "Center" }
  attrs?: CSTAttr[];                    // 组件属性: ATTR: Title("xxx"), Icon("yyy")
  content?: string;                     // 内容: CONTENT: "xxx"
  children?: CSTNode[];                 // 子节点
}

// ============================================
// AST (Abstract Syntax Tree) 类型
// Zod 语义收敛后的标准化输出
// ============================================

/** 组件类型枚举 (51 种) */
export type ComponentType =
  // 根节点
  | 'Root'
  // 布局组件 (12 种)
  | 'Section'
  | 'Container'
  | 'Grid'
  | 'Flex'
  | 'Stack'
  | 'Columns'
  | 'Split'
  | 'Rows'
  | 'Center'
  | 'Page'
  | 'Hero'
  | 'Spacer'
  // 导航组件 (6 种)
  | 'Header'
  | 'Footer'
  | 'Sidebar'
  | 'Nav'
  | 'Tabs'
  | 'Breadcrumb'
  | 'Stepper'
  // 数据展示 (12 种)
  | 'Card'
  | 'Table'
  | 'List'
  | 'Timeline'
  | 'Accordion'
  | 'Statistic'
  | 'StatisticCard'
  | 'Avatar'
  | 'Text'
  | 'Image'
  | 'Icon'
  | 'Badge'
  | 'Code'
  | 'Quote'
  | 'Heading'
  // 表单组件 (9 种)
  | 'Button'
  | 'Input'
  | 'Label'
  | 'Checkbox'
  | 'Switch'
  | 'Slider'
  | 'Radio'
  | 'Select'
  | 'Form'
  // 反馈组件 (6 种)
  | 'Alert'
  | 'Modal'
  | 'Progress'
  | 'Tooltip'
  | 'Skeleton'
  | 'EmptyState'
  // 其他
  | 'Link'
  | 'Divider';

/** 通用 Props 类型 */
export interface BaseProps {
  // 布局相关
  gutter?: string;
  align?: 'left' | 'center' | 'right';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  direction?: 'row' | 'column';
  gap?: string;
  padding?: string;
  margin?: string;

  // 尺寸相关
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width?: string;
  height?: string;

  // 样式变体
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'default' | 'destructive';

  // 内容相关
  title?: string;
  content?: string;
  text?: string;
  label?: string;
  placeholder?: string;

  // 图标相关
  icon?: string;
  iconPosition?: 'left' | 'right';

  // 交互相关
  disabled?: boolean;
  loading?: boolean;
  onClick?: string;  // 事件桩函数标识

  // 其他自定义属性
  [key: string]: unknown;
}

/** AST 节点 */
export interface ASTNode {
  id: string;                 // 节点 ID (用于 Diff 和调试)
  type: ComponentType;        // 组件类型
  props: BaseProps;           // 组件属性
  children?: ASTNode[];       // 子节点
}

/** Stitch AST 根节点 */
export interface StitchAST {
  type: 'Root';
  children: ASTNode[];
  metadata?: {
    title?: string;
    context?: string;
    sessionId?: string;
    createdAt?: string;
  };
}

// ============================================
// 编译错误类型
// ============================================

/** 错误级别 */
export type ErrorLevel = 'error' | 'warning' | 'info';

/** 编译错误 */
export interface CompileError {
  level: ErrorLevel;
  message: string;
  line?: number;
  column?: number;
  nodeId?: string;
  suggestion?: string;  // 自动修复建议
}

/** 编译结果 */
export interface CompileResult {
  success: boolean;
  ast?: StitchAST;
  errors: CompileError[];
  warnings: CompileError[];
}

// ============================================
// 辅助类型
// ============================================

/** 属性键名映射表 (DSL 大写 → AST 小写) */
export const PROP_KEY_MAP: Record<string, string> = {
  'Title': 'title',
  'Icon': 'icon',
  'Variant': 'variant',
  'Size': 'size',
  'Gutter': 'gutter',
  'Align': 'align',
  'Justify': 'justify',
  'Direction': 'direction',
  'Gap': 'gap',
  'Padding': 'padding',
  'Margin': 'margin',
  'Width': 'width',
  'Height': 'height',
  'Text': 'text',
  'Label': 'label',
  'Placeholder': 'placeholder',
  'Disabled': 'disabled',
  'Loading': 'loading',
};

/** 属性值映射表 (DSL 别名 → 标准值) */
export const PROP_VALUE_MAP: Record<string, Record<string, string>> = {
  variant: {
    'Outline': 'outline',
    'Primary': 'primary',
    'Secondary': 'secondary',
    'Ghost': 'ghost',
    'Link': 'link',
    'Default': 'default',
    'Destructive': 'destructive',
  },
  size: {
    'XSmall': 'xs',
    'Small': 'sm',
    'Medium': 'md',
    'Large': 'lg',
    'XLarge': 'xl',
  },
  align: {
    'Left': 'left',
    'Center': 'center',
    'Right': 'right',
  },
  justify: {
    'Start': 'start',
    'Center': 'center',
    'End': 'end',
    'Between': 'between',
    'Around': 'around',
  },
  direction: {
    'Row': 'row',
    'Column': 'column',
  },
};

/** 默认属性值 */
export const DEFAULT_PROPS: Record<string, Record<string, string>> = {
  // 表单组件
  Button: { variant: 'primary', size: 'md' },
  Input: { size: 'md' },
  Checkbox: { size: 'md' },
  Switch: { size: 'md' },
  Slider: { size: 'md' },
  Radio: { size: 'md' },
  Select: { size: 'md' },
  // 数据展示
  Card: { variant: 'default' },
  Badge: { variant: 'default', size: 'sm' },
  Avatar: { size: 'md' },
  Statistic: { size: 'md' },
  StatisticCard: { size: 'md' },
  // 反馈组件
  Alert: { variant: 'default' },
  Progress: { value: '0', max: '100' },
  // 导航组件
  Stepper: { current: '0' },
  // 布局组件
  Stack: { direction: 'column' },
  Flex: { direction: 'row' },
  Grid: { columns: '1' },
};

/** 标签名到组件类型的映射 (51 种) */
export const TAG_TO_TYPE: Record<string, ComponentType> = {
  // 布局组件
  'SECTION': 'Section',
  'CONTAINER': 'Container',
  'GRID': 'Grid',
  'FLEX': 'Flex',
  'STACK': 'Stack',
  'COLUMNS': 'Columns',
  'SPLIT': 'Split',
  'ROWS': 'Rows',
  'CENTER': 'Center',
  'PAGE': 'Page',
  'HERO': 'Hero',
  'SPACER': 'Spacer',
  // 导航组件
  'HEADER': 'Header',
  'FOOTER': 'Footer',
  'SIDEBAR': 'Sidebar',
  'NAV': 'Nav',
  'TABS': 'Tabs',
  'BREADCRUMB': 'Breadcrumb',
  'STEPPER': 'Stepper',
  // 数据展示
  'CARD': 'Card',
  'TABLE': 'Table',
  'LIST': 'List',
  'TIMELINE': 'Timeline',
  'ACCORDION': 'Accordion',
  'STATISTIC': 'Statistic',
  'STATISTIC_CARD': 'StatisticCard',
  'AVATAR': 'Avatar',
  'TEXT': 'Text',
  'IMAGE': 'Image',
  'ICON': 'Icon',
  'BADGE': 'Badge',
  'CODE': 'Code',
  'QUOTE': 'Quote',
  'HEADING': 'Heading',
  // 表单组件
  'BUTTON': 'Button',
  'INPUT': 'Input',
  'LABEL': 'Label',
  'CHECKBOX': 'Checkbox',
  'SWITCH': 'Switch',
  'SLIDER': 'Slider',
  'RADIO': 'Radio',
  'SELECT': 'Select',
  'FORM': 'Form',
  // 反馈组件
  'ALERT': 'Alert',
  'MODAL': 'Modal',
  'PROGRESS': 'Progress',
  'TOOLTIP': 'Tooltip',
  'SKELETON': 'Skeleton',
  'EMPTY': 'EmptyState',
  'EMPTY_STATE': 'EmptyState',
  // 其他
  'LINK': 'Link',
  'DIVIDER': 'Divider',
};

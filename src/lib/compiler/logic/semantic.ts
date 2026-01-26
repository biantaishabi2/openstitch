/**
 * 语义收敛器 (Semantic)
 *
 * 使用 Zod 将 CST 转换为标准化 AST
 * 职责：
 * - 属性收敛：Title("xxx") → title: "xxx"
 * - 别名映射：Variant("Outline") → variant: "outline"
 * - 默认值补全：Button 无 variant → variant: "primary"
 * - ID 自动生成：DSL 没写 ID → 自动生成 card_1, btn_2 等
 * - 嵌套校验：检查非法嵌套关系
 */

import { z } from 'zod';
import type {
  CSTNode,
  CSTAttr,
  ASTNode,
  StitchAST,
  ComponentType,
  PlatformType,
  BaseProps,
  CompileError,
} from './ast';
import {
  PROP_KEY_MAP,
  PROP_VALUE_MAP,
  DEFAULT_PROPS,
  TAG_TO_TYPE,
} from './ast';

// ============================================
// ID 生成器
// ============================================

class IdGenerator {
  private counters: Map<string, number> = new Map();

  /**
   * 生成唯一 ID
   * @param type 组件类型
   * @returns 唯一 ID，如 "card_1", "button_2"
   */
  generate(type: string): string {
    const key = type.toLowerCase();
    const count = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, count);
    return `${key}_${count}`;
  }

  /**
   * 重置计数器（用于新的编译会话）
   */
  reset(): void {
    this.counters.clear();
  }
}

// ============================================
// 语义转换上下文
// ============================================

interface TransformContext {
  /** 页面上下文（如 "技术架构"、"儿童教育"） */
  context?: string;
  /** Session ID */
  sessionId?: string;
  /** ID 生成器 */
  idGenerator: IdGenerator;
  /** 收集的警告和错误 */
  errors: CompileError[];
}

// ============================================
// 嵌套规则
// ============================================

/** 允许的父子关系 */
const VALID_NESTING: Record<string, string[]> = {
  'Root': ['Section', 'Container', 'Grid', 'Flex', 'Card', 'Header', 'Footer', 'Sidebar', 'Nav'],
  'Section': ['Card', 'Grid', 'Flex', 'Text', 'Heading', 'Divider', 'Spacer', 'Button', 'Table', 'List', 'Form', 'Alert'],
  'Card': ['Text', 'Heading', 'Button', 'Image', 'Icon', 'Badge', 'Divider', 'List', 'Table', 'Code', 'Quote'],
  'Grid': ['Card', 'Text', 'Image', 'Button', 'Flex'],
  'Flex': ['Card', 'Text', 'Image', 'Button', 'Icon', 'Badge', 'Grid'],
  'Form': ['Input', 'Button', 'Text', 'Heading', 'Divider'],
  'List': ['Text', 'Link', 'Button', 'Badge'],
  'Table': ['Text'],
  'Nav': ['Link', 'Button', 'Icon'],
};

/** 不能包含子元素的叶子组件 */
const LEAF_COMPONENTS = new Set<string>([
  'Text', 'Button', 'Input', 'Image', 'Icon', 'Badge', 'Divider', 'Spacer', 'Link',
]);

/**
 * 检查嵌套是否合法
 */
function checkNesting(
  parentType: string,
  childType: string,
  ctx: TransformContext
): boolean {
  // 叶子组件不能有子元素
  if (LEAF_COMPONENTS.has(parentType)) {
    ctx.errors.push({
      level: 'warning',
      message: `${parentType} 是叶子组件，不能包含子元素 ${childType}`,
      suggestion: `将 ${childType} 移到 ${parentType} 外部`,
    });
    return false;
  }

  // 检查允许的嵌套关系
  const allowed = VALID_NESTING[parentType];
  if (allowed && !allowed.includes(childType)) {
    ctx.errors.push({
      level: 'warning',
      message: `${parentType} 不建议直接包含 ${childType}`,
      suggestion: `考虑在中间添加 Container 或 Flex 包装`,
    });
    // 允许继续，只是警告
  }

  return true;
}

// ============================================
// 属性转换
// ============================================

/**
 * 标准化属性键名
 * Title → title, Variant → variant
 */
function normalizeKey(key: string): string {
  return PROP_KEY_MAP[key] || key.toLowerCase();
}

/**
 * 标准化属性值
 * "Outline" → "outline", "Center" → "center"
 */
function normalizeValue(key: string, value: string): string {
  const normalizedKey = normalizeKey(key);
  const valueMap = PROP_VALUE_MAP[normalizedKey];
  if (valueMap && valueMap[value]) {
    return valueMap[value];
  }
  // 对于枚举类型，统一转小写
  if (['variant', 'size', 'align', 'justify', 'direction'].includes(normalizedKey)) {
    return value.toLowerCase();
  }
  return value;
}

/**
 * 将 CST 属性转换为标准化 props
 */
function transformAttrs(attrs: CSTAttr[] | undefined): Record<string, string> {
  if (!attrs) return {};

  const props: Record<string, string> = {};
  for (const { key, value } of attrs) {
    const normalizedKey = normalizeKey(key);
    const normalizedValue = normalizeValue(key, value);
    props[normalizedKey] = normalizedValue;
  }
  return props;
}

/**
 * 将布局属性转换为标准化 props
 */
function transformLayoutProps(
  layoutProps: Record<string, string> | undefined
): Record<string, string> {
  if (!layoutProps) return {};

  const props: Record<string, string> = {};
  for (const [key, value] of Object.entries(layoutProps)) {
    const normalizedKey = normalizeKey(key);
    const normalizedValue = normalizeValue(key, value);
    props[normalizedKey] = normalizedValue;
  }
  return props;
}

/**
 * 补全默认属性值
 */
function applyDefaults(type: string, props: Record<string, unknown>): void {
  const defaults = DEFAULT_PROPS[type];
  if (!defaults) return;

  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in props)) {
      props[key] = value;
    }
  }
}


// ============================================
// CST → AST 转换
// ============================================

/**
 * 转换单个 CST 节点为 AST 节点
 */
function transformNode(
  cst: CSTNode,
  ctx: TransformContext,
  parentType?: string
): ASTNode {
  // 1. 标签名映射
  const type = TAG_TO_TYPE[cst.tag] || (cst.tag.charAt(0) + cst.tag.slice(1).toLowerCase()) as ComponentType;

  // 2. 检查嵌套合法性
  if (parentType) {
    checkNesting(parentType, type, ctx);
  }

  // 3. 收集属性
  const props: BaseProps = {
    ...transformLayoutProps(cst.layoutProps),
    ...transformAttrs(cst.attrs),
  };

  // 4. 处理 CONTENT
  if (cst.content) {
    props.content = cst.content;
  }

  // 5. 处理 text（[BUTTON: "运行调试"] 中的 "运行调试"）
  if (cst.text) {
    props.text = cst.text;
  }

  // 6. 处理 CSS（样式透传通道）
  if (cst.css) {
    props.customClassName = cst.css;
  }

  // 7. 补全默认值
  applyDefaults(type, props);

  // 8. 生成 ID
  const id = cst.id || ctx.idGenerator.generate(type);

  // 9. 递归处理子节点
  let children: ASTNode[] | undefined;
  if (cst.children && cst.children.length > 0) {
    children = cst.children.map(child => transformNode(child, ctx, type));
  }

  // 10. 组装 AST 节点
  const node: ASTNode = {
    id,
    type,
    props,
  };
  if (children && children.length > 0) {
    node.children = children;
  }

  return node;
}

// ============================================
// Zod Schema 定义
// ============================================

/** 编译选项 Schema */
export const CompileOptionsSchema = z.object({
  title: z.string().optional(),
  context: z.string().optional(),
  sessionId: z.string().optional(),
  /** 平台类型 - 由规划层明确指定，独立于导航配置 */
  platform: z.enum(['web', 'mobile']).optional(),
  /** 移动端导航项 - 仅在 mobile 平台有效：有值时使用 BottomTabs，null 时使用 Drawer */
  mobileNavigation: z.array(z.string()).nullable().optional(),
});

export type CompileOptions = z.infer<typeof CompileOptionsSchema>;

/**
 * 验证 CST 节点结构（简化版本，避免 Zod v4 递归问题）
 */
function validateCSTNode(node: unknown): node is CSTNode {
  if (!node || typeof node !== 'object') return false;
  const n = node as Record<string, unknown>;
  if (typeof n.tag !== 'string') return false;
  // 其他字段是可选的，这里只做基本检查
  return true;
}

function validateCSTNodes(nodes: unknown): nodes is CSTNode[] {
  if (!Array.isArray(nodes)) return false;
  return nodes.every(validateCSTNode);
}

// ============================================
// 移动端平台适配
// ============================================

/**
 * 移动端禁用组件列表
 * 这些组件在移动端会产生警告
 */
const MOBILE_FORBIDDEN_COMPONENTS: Record<string, string> = {
  'Sidebar': '移动端请使用 DRAWER 或 BOTTOM_TABS 替代 SIDEBAR',
  'Tooltip': '移动端无 Hover 交互，请改用点击展开或 SHEET',
};

/**
 * 移动端组件替换建议
 */
const MOBILE_COMPONENT_SUGGESTIONS: Record<string, string> = {
  'Table': '移动端建议使用 LIST + CARD 替代 TABLE',
  'Modal': '移动端建议使用 SHEET 替代 MODAL',
  'Select': '移动端建议使用 ACTION_SHEET 替代 SELECT',
  'Tabs': '移动端建议使用 SEGMENT 替代 TABS',
};

/**
 * 应用移动端平台规则
 *
 * - 校验禁用组件（Sidebar、Tooltip）
 * - 添加组件替换建议（Table → List）
 * - 为布局组件注入移动端属性
 */
function applyMobilePlatformRules(nodes: ASTNode[], ctx: TransformContext): void {
  for (const node of nodes) {
    // 1. 检查禁用组件
    const forbidden = MOBILE_FORBIDDEN_COMPONENTS[node.type];
    if (forbidden) {
      ctx.errors.push({
        level: 'warning',
        message: `[Mobile] ${forbidden}`,
        nodeId: node.id,
        suggestion: forbidden,
      });
    }

    // 2. 添加替换建议
    const suggestion = MOBILE_COMPONENT_SUGGESTIONS[node.type];
    if (suggestion) {
      ctx.errors.push({
        level: 'info',
        message: `[Mobile] ${suggestion}`,
        nodeId: node.id,
        suggestion,
      });
    }

    // 3. 布局组件注入移动端属性
    if (node.type === 'Section' || node.type === 'Container') {
      // 移动端默认全宽，减少左右留白
      if (!node.props.fullWidth) {
        node.props.fullWidth = true;
      }
    }

    // 4. Grid 列数限制（移动端最多 2 列）
    if (node.type === 'Grid') {
      const columns = parseInt(node.props.columns as string || '1', 10);
      if (columns > 2) {
        ctx.errors.push({
          level: 'warning',
          message: `[Mobile] Grid 列数 ${columns} 超过移动端推荐值 2，已自动降级`,
          nodeId: node.id,
        });
        node.props.columns = '2';
      }
    }

    // 5. 递归处理子节点
    if (node.children && node.children.length > 0) {
      applyMobilePlatformRules(node.children, ctx);
    }
  }
}

// ============================================
// 导出函数
// ============================================

/**
 * 将 CST 转换为 AST
 * @param cstNodes CST 节点数组
 * @param options 编译选项
 * @returns AST 和错误信息
 */
export function transformToAST(
  cstNodes: CSTNode[],
  options: CompileOptions = {}
): {
  ast: StitchAST;
  errors: CompileError[];
} {
  // 验证输入（简化验证，避免 Zod v4 递归问题）
  if (!validateCSTNodes(cstNodes)) {
    throw new Error('Invalid CST input: expected array of CSTNode');
  }
  const validatedNodes = cstNodes;

  // 创建转换上下文
  const ctx: TransformContext = {
    context: options.context,
    sessionId: options.sessionId,
    idGenerator: new IdGenerator(),
    errors: [],
  };

  // 转换所有节点
  const children = validatedNodes.map(node => transformNode(node, ctx));

  // 组装 AST
  const ast: StitchAST = {
    type: 'Root',
    children,
  };

  // 设置平台（独立字段，由规划层明确指定）
  const platform = options.platform || 'web';
  ast.platform = platform;

  // 设置移动端导航（仅在 mobile 平台有效）
  if (options.mobileNavigation !== undefined) {
    ast.mobileNavigation = options.mobileNavigation;
  }

  // 移动端平台适配：组件校验和属性注入
  if (platform === 'mobile') {
    applyMobilePlatformRules(ast.children, ctx);
  }

  // 添加元数据
  if (options.title || options.context || options.sessionId) {
    ast.metadata = {
      title: options.title,
      context: options.context,
      sessionId: options.sessionId,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    ast,
    errors: ctx.errors,
  };
}

/**
 * 打印 AST（调试用）
 */
export function printAST(ast: StitchAST, indent: number = 0): void {
  const prefix = '  '.repeat(indent);

  console.log(`${prefix}Root`);
  if (ast.metadata) {
    console.log(`${prefix}  metadata:`, ast.metadata);
  }

  function printNode(node: ASTNode, level: number): void {
    const p = '  '.repeat(level);
    console.log(`${p}${node.type} (id: ${node.id})`);
    console.log(`${p}  props:`, node.props);
    if (node.children) {
      for (const child of node.children) {
        printNode(child, level + 1);
      }
    }
  }

  for (const child of ast.children) {
    printNode(child, indent + 1);
  }
}

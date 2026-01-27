/**
 * IR 生成器
 *
 * 将 AST 转换为 IR (UINode)，供渲染器使用
 */

import type { ASTNode, StitchAST } from '../logic/ast';
import type { DesignTokens } from '../visual/types';
import type { UINode, FactoryOptions } from './types';
import { getMappedType, getSpecialProps, isCompositeComponent } from './type-map';
import { normalizeProps } from './props-normalizer';
import { distributeToSlots, getSlotWrapper, isSlotEmpty, getSlotRule, SLOT_RULES } from './slot-distributor';
import { getTouchFeedbackClasses } from '../visual';

/**
 * 需要触摸反馈的组件类型
 * 移动端点击时添加 active:scale-[0.97] 等效果
 */
const TOUCHABLE_COMPONENTS = new Set([
  'Button',
  'Card',
  'Link',
  'BottomTabsTrigger',
  'ActionSheetItem',
  'AccordionTrigger',
]);

const TEXT_SIZE_CLASS_MAP: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
  '8xl': 'text-8xl',
  '9xl': 'text-9xl',
};

function removeTextSizeStyles(
  props: Record<string, unknown>,
  sizeValue: string
): void {
  const sizeClass = TEXT_SIZE_CLASS_MAP[sizeValue];
  if (sizeClass && typeof props.className === 'string') {
    const classes = props.className
      .split(' ')
      .filter((cls) => cls && cls !== sizeClass);
    props.className = classes.length > 0 ? classes.join(' ') : undefined;
  }

  if (props.style && typeof props.style === 'object') {
    const style = props.style as Record<string, string>;
    if (style.fontSize) {
      const { fontSize: _fontSize, ...rest } = style;
      props.style = Object.keys(rest).length > 0 ? rest : undefined;
    }
  }
}

function coerceBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return undefined;
}

function coerceNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    if (!Number.isNaN(num)) return num;
  }
  return undefined;
}

const CONTENT_PURE_TEXT_TYPES = new Set([
  'Link',
  'Badge',
  'Button',
  'BreadcrumbLink',
  'BreadcrumbPage',
  'CardTitle',
  'CardDescription',
  'AlertTitle',
  'AlertDescription',
  'DialogTrigger',
  'DialogTitle',
  'DialogDescription',
  'TooltipTrigger',
  'TooltipContent',
  'TabsTrigger',
  'AccordionTrigger',
  'AccordionContent',
  'TimelineTitle',
  'TimelineDescription',
  'TimelineEmpty',
  'Label',
  'InlineCode',
  'AvatarFallback',
  'Markdown',
  'span',
  'div',
  'TableHead',
  'TableCell',
]);

const EXPLICIT_CHILD_COMPONENTS: Record<string, Set<string>> = {
  Breadcrumb: new Set([
    'BreadcrumbList',
    'BreadcrumbItem',
    'BreadcrumbLink',
    'BreadcrumbPage',
    'BreadcrumbSeparator',
    'BreadcrumbEllipsis',
  ]),
  Card: new Set([
    'CardHeader',
    'CardTitle',
    'CardDescription',
    'CardContent',
    'CardFooter',
  ]),
  Tabs: new Set([
    'TabsList',
    'TabsTrigger',
    'TabsContent',
  ]),
};

function hasExplicitChildren(
  mappedType: string,
  children: ASTNode[] | undefined
): boolean {
  if (!children || children.length === 0) return false;
  const explicitTypes = EXPLICIT_CHILD_COMPONENTS[mappedType];
  if (!explicitTypes) return false;
  return children.some((child) => explicitTypes.has(child.type));
}

/**
 * 检查组件是否为特殊复合组件（需要直接传递 children 而非 slots）
 * 如 Timeline、Accordion 等需要将子节点直接作为 children
 *
 * 判断条件：
 * - special: true
 * - 且有非 null 的包装组件（如 TimelineItem）
 *
 * Table 虽然 special: true，但 render 都是 null，仍使用 slots 分发
 */
function isSpecialCompositeComponent(type: string): boolean {
  const rule = SLOT_RULES[type];
  if (!rule?.special) return false;

  // 检查是否有非 null 的包装组件
  const hasWrapper = Object.values(rule.render).some((v) => v !== null);
  return hasWrapper;
}
import { injectEventStubs } from './event-stubs';

/**
 * 将 AST 节点转换为 UINode
 */
function astNodeToUINode(
  node: ASTNode,
  tokens: DesignTokens,
  options: FactoryOptions = {}
): UINode {
  // 1. 获取映射后的组件类型
  const mappedType = getMappedType(node.type);

  // 2. 获取特殊类型的附加 props
  const specialProps = getSpecialProps(node.type);

  // 3. 归一化 props
  const normalizedProps = normalizeProps(node.props, tokens);

  // 4. 合并 props
  let mergedProps: Record<string, unknown> = {
    ...specialProps,
    ...normalizedProps,
  };

  // Button 的 Size 应作为组件 size prop，避免当作字体大小处理
  if (node.type === 'Button' && node.props.size) {
    const sizeValue = String(node.props.size);
    mergedProps.size = sizeValue;
    removeTextSizeStyles(mergedProps, sizeValue);
  }

  if (node.type === 'Icon' && node.props.size) {
    const sizeValue = String(node.props.size);
    mergedProps.size = sizeValue;
    removeTextSizeStyles(mergedProps, sizeValue);
  }

  if (node.type === 'Hero' && node.props.size) {
    const sizeValue = String(node.props.size);
    mergedProps.size = sizeValue;
    removeTextSizeStyles(mergedProps, sizeValue);
  }

  if (node.type === 'Container' && node.props.size) {
    const sizeValue = String(node.props.size);
    mergedProps.size = sizeValue;
    removeTextSizeStyles(mergedProps, sizeValue);
  }

  if (node.type === 'Spacer' && node.props.size !== undefined) {
    const sizeNumber = coerceNumber(node.props.size);
    mergedProps.size = sizeNumber ?? node.props.size;
  }

  if (node.type === 'Page') {
    const paddingValue = coerceNumber(node.props.padding);
    if (paddingValue !== undefined) {
      mergedProps.padding = paddingValue;
    }

    const fullHeightValue = coerceBoolean(node.props.fullHeight);
    if (fullHeightValue !== undefined) {
      mergedProps.fullHeight = fullHeightValue;
    }

    const centeredValue = coerceBoolean(node.props.centered);
    if (centeredValue !== undefined) {
      mergedProps.centered = centeredValue;
    }

    if (mergedProps.style && typeof mergedProps.style === 'object') {
      const style = mergedProps.style as Record<string, string>;
      if (style.padding) {
        const { padding: _padding, ...rest } = style;
        mergedProps.style = Object.keys(rest).length > 0 ? rest : undefined;
      }
    }
  }

  // Slider 期望 value/defaultValue 为 number[]
  if (mappedType === 'Slider') {
    const normalizeSliderValues = (value: unknown): unknown => {
      if (value == null) return value;
      if (Array.isArray(value)) {
        const parsed = value.map((v) => (typeof v === 'number' ? v : Number(v)));
        return parsed.every((v) => Number.isFinite(v)) ? parsed : value;
      }
      if (typeof value === 'number') return [value];
      if (typeof value === 'string') {
        const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
        if (parts.length > 1) {
          const parsed = parts.map((part) => Number(part));
          return parsed.every((v) => Number.isFinite(v)) ? parsed : value;
        }
        const single = Number(value);
        return Number.isFinite(single) ? [single] : value;
      }
      return value;
    };

    if ('defaultValue' in mergedProps) {
      mergedProps.defaultValue = normalizeSliderValues(mergedProps.defaultValue);
    }
    if ('value' in mergedProps) {
      mergedProps.value = normalizeSliderValues(mergedProps.value);
    }
  }

  // 5. 移动端触摸反馈（为可点击组件添加 active:scale-[0.97] 等类）
  const platform = options.platform || 'web';
  if (platform === 'mobile' && TOUCHABLE_COMPONENTS.has(mappedType)) {
    const touchClasses = getTouchFeedbackClasses('mobile');
    if (touchClasses.length > 0) {
      const existingClass = (mergedProps.className as string) || '';
      mergedProps.className = [existingClass, ...touchClasses].filter(Boolean).join(' ');
    }
  }

  // 6. 注入事件桩函数（如果启用）
  if (options.injectEvents !== false) {
    mergedProps = injectEventStubs(mappedType, node.id, mergedProps);
  }

  // 6. 处理子节点
  let children: UINode[] | undefined;
  let slots: Record<string, UINode> | undefined;

  if (node.children && node.children.length > 0) {
    if (mappedType === 'Tabs') {
      children = node.children.map((child) =>
        astNodeToUINode(child, tokens, options)
      );
    } else {
      const explicitChildren = hasExplicitChildren(mappedType, node.children);

      // 显式结构的子组件直接透传
      if (explicitChildren) {
        children = node.children.map((child) =>
          astNodeToUINode(child, tokens, options)
        );
      }
      // 特殊复合组件（Timeline、Accordion 等）：直接将子节点作为 children 传递
      // 这些组件期望从 children 中读取内容，而不是从 slots
      else if (isSpecialCompositeComponent(mappedType)) {
        const rule = getSlotRule(mappedType);
        const wrapperType = rule?.render[rule.slots[0]]; // 获取包装组件类型

        // 递归转换每个子节点，并用对应的包装组件包裹
        children = node.children.map((child) => {
          const childNode = astNodeToUINode(child, tokens, options);

          // 如果有包装类型（如 TimelineItem），将子节点包装
          if (wrapperType) {
            return {
              type: wrapperType,
              props: childNode.props,
              children: childNode.children,
            };
          }
          return childNode;
        });
      }
      // 普通复合组件需要插槽分发（Card、Alert 等）
      else if (isCompositeComponent(mappedType)) {
        const slotResult = distributeToSlots(mappedType, node.children, node.props);

        if (slotResult) {
          slots = {};
          const rule = getSlotRule(mappedType);

          for (const [slotName, slotChildren] of Object.entries(slotResult)) {
            // 跳过空插槽
            if (isSlotEmpty(slotResult, slotName)) continue;

            // 递归转换插槽内的子节点
            const slotChildNodes = slotChildren.map((child) =>
              astNodeToUINode(child, tokens, options)
            );

            const wrapperType = getSlotWrapper(mappedType, slotName);

            if (wrapperType) {
              // 创建插槽包装节点
              slots[slotName] = {
                type: wrapperType,
                children: slotChildNodes.length === 1 ? slotChildNodes[0] : slotChildNodes,
              };
            } else {
              // 无包装类型时，直接传递子节点数组
              slots[slotName] = slotChildNodes.length === 1 ? slotChildNodes[0] : slotChildNodes as unknown as UINode;
            }
          }
        }
      } else {
        // 非复合组件，直接递归转换子节点
        children = node.children.map((child) =>
          astNodeToUINode(child, tokens, options)
        );
      }
    }
  }

  // 7. 处理 icon prop（为 Button 等组件创建 Icon 子元素）
  // 这些组件期望 icon 作为子元素而不是 prop
  const COMPONENTS_WITH_ICON_CHILDREN = ['Button'];
  let iconChild: UINode | null = null;

  if (mergedProps.icon && typeof mergedProps.icon === 'string' && COMPONENTS_WITH_ICON_CHILDREN.includes(mappedType)) {
    iconChild = {
      type: 'Icon',
      props: { name: mergedProps.icon },
    };
    delete mergedProps.icon;
  }

  // 8. 处理 content prop（转换为 Text 子节点或直接作为 children）
  if (mergedProps.content && typeof mergedProps.content === 'string') {
    const contentText = mergedProps.content as string;

    // 特殊组件：content → value（Statistic、StatisticCard）
    if (mappedType === 'Statistic' || mappedType === 'StatisticCard') {
      mergedProps.value = contentText;
      delete mergedProps.content;
    }
    // CodeBlock：content → code
    else if (mappedType === 'CodeBlock') {
      mergedProps.code = contentText;
      delete mergedProps.content;
    }
    // Link/Badge/Button 等：content 直接作为纯文本，不包裹 Text 组件
    else if (CONTENT_PURE_TEXT_TYPES.has(mappedType) || mappedType === 'a') {
      delete mergedProps.content;
      if (!children && !slots) {
        if (iconChild) {
          children = [iconChild, contentText];
        } else {
          children = contentText; // 直接作为字符串，不包裹 Text
        }
      }
    }
    // 其他组件：content 作为文本子节点
    else {
      delete mergedProps.content;

      // 对于某些组件，content 直接作为文本子节点
      if (!children && !slots) {
        // Heading/Paragraph/Text 等自带样式的组件直接用纯文本，不包装 Text
        // 注意：需要检查原始 node.type，而不是 mappedType（因为 Heading 已经映射为 Text）
        const PURE_TEXT_COMPONENTS = ['Heading', 'Paragraph', 'Text'];
        const usePureText = PURE_TEXT_COMPONENTS.includes(node.type);

        // 如果有 icon 子元素，组合 icon + text
        if (iconChild) {
          children = [iconChild, contentText];
        } else {
          children = usePureText ? contentText : [{ type: 'Text', children: contentText }];
        }
      }
    }
  } else if (iconChild && !children && !slots) {
    // 只有 icon 没有 content
    children = [iconChild];
  }

  // Avatar Fallback：将 fallback props 转为 AvatarFallback 子节点
  if (mappedType === 'Avatar' && !children && !slots) {
    const fallbackValue = mergedProps.fallback ?? node.props.fallback;
    if (fallbackValue !== undefined && fallbackValue !== null) {
      const fallbackText = String(fallbackValue);
      delete mergedProps.fallback;
      children = [{ type: 'AvatarFallback', children: fallbackText }];
    }
  }

  // 9. 处理 text prop（用于 Button 等组件的文本）
  if (mergedProps.text && typeof mergedProps.text === 'string') {
    const textContent = mergedProps.text as string;
    delete mergedProps.text;

    // 文本作为 children
    if (!children && !slots) {
      return {
        type: mappedType,
        id: node.id,
        props: mergedProps,
        children: textContent,
      };
    }
  }

  // 10. 构建 UINode
  const uiNode: UINode = {
    type: mappedType,
    id: node.id,
    props: Object.keys(mergedProps).length > 0 ? mergedProps : undefined,
  };

  if (slots && Object.keys(slots).length > 0) {
    uiNode.slots = slots;
  }

  if (children && children.length > 0) {
    uiNode.children = children.length === 1 ? children[0] : children;
  }

  return uiNode;
}

/**
 * 将完整 AST 转换为 UINode 树
 *
 * @param ast Stitch AST
 * @param tokens Design Tokens
 * @param options 工厂选项
 * @returns UINode 根节点
 */
export function generateIR(
  ast: StitchAST,
  tokens: DesignTokens,
  options: FactoryOptions = {}
): UINode {
  // 从 AST 获取 platform，合并到 options 中
  const mergedOptions: FactoryOptions = {
    ...options,
    platform: options.platform || ast.platform || 'web',
  };

  // 转换所有子节点
  const contentNodes = ast.children.map((child) =>
    astNodeToUINode(child, tokens, mergedOptions)
  );

  // 获取内容节点（单个或多个用 Page 包裹）
  const content: UINode = contentNodes.length === 1
    ? contentNodes[0]
    : { type: 'Page', children: contentNodes };

  // 移动端平台：包裹 MobileShell + BottomTabs
  if (ast.platform === 'mobile' && ast.mobileNavigation) {
    return wrapWithMobileShell(content, ast.mobileNavigation);
  }

  return content;
}

/**
 * 用 MobileShell + BottomTabs 包裹内容
 *
 * 生成结构:
 * MobileShell (hasBottomNav=true)
 *   └─ BottomTabs (defaultValue="tab_0")
 *        ├─ BottomTabsContent (value="tab_0") ── 内容
 *        ├─ BottomTabsContent (value="tab_1") ── 空白占位
 *        ├─ ...
 *        └─ BottomTabsList
 *             ├─ BottomTabsTrigger (value="tab_0", label="首页", icon=Home)
 *             ├─ BottomTabsTrigger (value="tab_1", label="搜索", icon=Search)
 *             └─ ...
 */
function wrapWithMobileShell(content: UINode, navItems: string[]): UINode {
  // 默认图标映射（按导航项名称）
  const iconMap: Record<string, string> = {
    '首页': 'Home',
    '主页': 'Home',
    'home': 'Home',
    '搜索': 'Search',
    '查找': 'Search',
    'search': 'Search',
    '发现': 'Compass',
    'discover': 'Compass',
    '消息': 'MessageCircle',
    '通知': 'Bell',
    'notification': 'Bell',
    'message': 'MessageCircle',
    '我的': 'User',
    '个人': 'User',
    '我': 'User',
    'profile': 'User',
    'me': 'User',
    '设置': 'Settings',
    'settings': 'Settings',
    '收藏': 'Heart',
    'favorite': 'Heart',
    '购物车': 'ShoppingCart',
    'cart': 'ShoppingCart',
    '订单': 'FileText',
    'order': 'FileText',
  };

  // 生成 BottomTabsTrigger 节点
  const triggers: UINode[] = navItems.map((label, index) => ({
    type: 'BottomTabsTrigger',
    props: {
      value: `tab_${index}`,
      label,
      icon: iconMap[label.toLowerCase()] || iconMap[label] || 'Circle',
    },
  }));

  // 生成 BottomTabsContent 节点
  // 第一个 tab 放实际内容，其他为空白占位
  const contents: UINode[] = navItems.map((label, index) => ({
    type: 'BottomTabsContent',
    props: { value: `tab_${index}` },
    children: index === 0 ? content : {
      type: 'MobileContent',
      children: {
        type: 'Text',
        props: { className: 'p-4 text-muted-foreground' },
        children: `${label}页面内容`,
      },
    },
  }));

  // 组装完整结构
  return {
    type: 'MobileShell',
    props: { hasBottomNav: true },
    children: {
      type: 'BottomTabs',
      props: { defaultValue: 'tab_0' },
      children: [
        ...contents,
        {
          type: 'BottomTabsList',
          children: triggers,
        },
      ],
    },
  };
}

/**
 * 单节点转换（用于增量更新）
 */
export function generateNodeIR(
  node: ASTNode,
  tokens: DesignTokens,
  options: FactoryOptions = {}
): UINode {
  return astNodeToUINode(node, tokens, options);
}

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
import { distributeToSlots, getSlotWrapper, isSlotEmpty, getSlotRule } from './slot-distributor';
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

  // 5. 注入事件桩函数（如果启用）
  if (options.injectEvents !== false) {
    mergedProps = injectEventStubs(mappedType, node.id, mergedProps);
  }

  // 6. 处理子节点
  let children: UINode[] | undefined;
  let slots: Record<string, UINode> | undefined;

  if (node.children && node.children.length > 0) {
    // 检查是否为复合组件需要插槽分发
    if (isCompositeComponent(mappedType)) {
      const slotResult = distributeToSlots(mappedType, node.children);

      if (slotResult) {
        slots = {};
        const rule = getSlotRule(mappedType);

        for (const [slotName, slotChildren] of Object.entries(slotResult)) {
          // 跳过空插槽
          if (isSlotEmpty(slotResult, slotName)) continue;

          const wrapperType = getSlotWrapper(mappedType, slotName);
          if (!wrapperType) continue;

          // 递归转换插槽内的子节点
          const slotChildNodes = slotChildren.map((child) =>
            astNodeToUINode(child, tokens, options)
          );

          // 创建插槽包装节点
          slots[slotName] = {
            type: wrapperType,
            children: slotChildNodes.length === 1 ? slotChildNodes[0] : slotChildNodes,
          };
        }
      }
    } else {
      // 非复合组件，直接递归转换子节点
      children = node.children.map((child) =>
        astNodeToUINode(child, tokens, options)
      );
    }
  }

  // 7. 处理 content prop（转换为 Text 子节点或直接作为 children）
  if (mergedProps.content && typeof mergedProps.content === 'string') {
    const contentText = mergedProps.content as string;
    delete mergedProps.content;

    // 对于某些组件，content 直接作为文本子节点
    if (!children && !slots) {
      children = [{ type: 'Text', children: contentText }];
    }
  }

  // 8. 处理 text prop（用于 Button 等组件的文本）
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

  // 9. 构建 UINode
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
  // 如果 AST 只有一个顶层子节点，直接转换它
  if (ast.children.length === 1) {
    return astNodeToUINode(ast.children[0], tokens, options);
  }

  // 多个顶层子节点，用 Page 包裹
  const children = ast.children.map((child) =>
    astNodeToUINode(child, tokens, options)
  );

  return {
    type: 'Page',
    children: children,
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

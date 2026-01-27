import type { UINode } from '../../renderer/types';

type RenderContext = {
  parentType?: string;
  parentProps?: Record<string, any>;
  tabsActive?: string;
  childIndex?: number;
  siblingsCount?: number;
};

const EVENT_MAP: Record<string, string> = {
  onClick: 'phx-click',
  onChange: 'phx-change',
  onSubmit: 'phx-submit',
  onBlur: 'phx-blur',
  onFocus: 'phx-focus',
};

const ATTR_MAP: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
};

export function renderToHEEx(schema: UINode): string {
  return renderNode(schema, 0, {});
}

function renderNode(
  node: UINode | string | null | undefined,
  indent: number,
  context: RenderContext
): string {
  if (node == null) return '';
  if (typeof node === 'string') {
    const spaces = ' '.repeat(indent);
    return `${spaces}${node}`;
  }

  const type = node.type;
  let props = node.props || {};
  const slots = node.slots;
  let children = node.children;
  const id = node.id;

  ({ props, children } = normalizeNode(type, props, children));
  props = applyParentContext(type, props, context);
  const childContext = buildChildContext(type, props, context);

  const component = mapComponent(type);
  const attrs = renderAttrs(props, id);

  let inner = '';
  if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
    inner = renderSlotsFor(type, slots, props, indent + 2, childContext);
  } else if (Array.isArray(children)) {
    inner = renderChildren(children, indent + 2, childContext);
  } else if (typeof children === 'string') {
    inner = renderNode(children, indent + 2, childContext);
  } else if (children && typeof children === 'object') {
    inner = renderNode(children as UINode, indent + 2, childContext);
  }

  const spaces = ' '.repeat(indent);
  if (inner === '') {
    return `${spaces}<.${component}${attrs} />`;
  }

  return `${spaces}<.${component}${attrs}>\n${inner}\n${spaces}</.${component}>`;
}

function renderChildren(children: Array<UINode | string>, indent: number, context: RenderContext): string {
  const count = children.length;
  return children
    .map((child, index) =>
      renderNode(child as any, indent, {
        ...context,
        childIndex: index,
        siblingsCount: count,
      })
    )
    .filter((value) => value !== '')
    .join('\n');
}

function renderSlotsFor(
  type: string,
  slots: Record<string, UINode | string | null>,
  props: Record<string, any>,
  indent: number,
  context: RenderContext
): string {
  if (type === 'Columns') {
    const layout = props.layout || '1:1';
    const ratios = layout === 'equal'
      ? []
      : String(layout)
          .split(':')
          .map((value: string) => Number.parseInt(value, 10))
          .filter((value: number) => !Number.isNaN(value));

    return sortedSlotKeys(slots)
      .map((key, index) => {
        const spaces = ' '.repeat(indent);
        const content = renderNode(slots[key] as any, indent + 2, context);
        const ratio = ratios[index] ?? 1;
        return `${spaces}<div data-slot=\"${key}\" style=\"flex: ${ratio}\">\n${content}\n${spaces}</div>`;
      })
      .join('\n');
  }

  if (type === 'Split') {
    const ratio = props.ratio || '1:1';
    const vertical = props.vertical === true;
    const [first, second] = String(ratio)
      .split(':')
      .map((value: string) => Number.parseInt(value, 10));

    const [firstKey, secondKey] = vertical ? ['top', 'bottom'] : ['left', 'right'];
    const firstValue = slots[firstKey];
    const secondValue = slots[secondKey];
    const spaces = ' '.repeat(indent);

    return [
      `${spaces}<div data-slot=\"${firstKey}\" style=\"flex: ${Number.isNaN(first) ? 1 : first}\">\n${renderNode(firstValue as any, indent + 2, context)}\n${spaces}</div>`,
      `${spaces}<div data-slot=\"${secondKey}\" style=\"flex: ${Number.isNaN(second) ? 1 : second}\">\n${renderNode(secondValue as any, indent + 2, context)}\n${spaces}</div>`,
    ].join('\n');
  }

  return renderSlots(slots, indent, context);
}

function renderSlots(
  slots: Record<string, UINode | string | null>,
  indent: number,
  context: RenderContext
): string {
  return sortedSlotKeys(slots)
    .map((key) => {
      const spaces = ' '.repeat(indent);
      const content = renderNode(slots[key] as any, indent + 2, context);
      return `${spaces}<div data-slot=\"${key}\">\n${content}\n${spaces}</div>`;
    })
    .join('\n');
}

function applyParentContext(type: string, props: Record<string, any>, context: RenderContext): Record<string, any> {
  if (type === 'TabsTrigger' || type === 'TabsContent') {
    const parentProps = context.parentProps || {};
    const activeValue = context.tabsActive || parentProps.value || parentProps.defaultValue;
    if (activeValue != null && props.activeValue == null) {
      return { ...props, activeValue };
    }
    return props;
  }

  if (type === 'Step' && context.parentType === 'Stepper') {
    const parentProps = context.parentProps || {};
    const index = context.childIndex ?? 0;
    const count = context.siblingsCount ?? 0;
    return {
      ...props,
      index,
      stepNumber: index + 1,
      currentStep: parentProps.currentStep,
      orientation: parentProps.orientation,
      isLast: index === count - 1,
    };
  }

  if (type === 'TimelineItem' && context.parentType === 'Timeline') {
    const parentProps = context.parentProps || {};
    const count = context.siblingsCount ?? 0;
    const index = context.childIndex ?? 0;
    return {
      ...props,
      showConnector: index < count - 1,
      iconsize: parentProps.iconsize,
    };
  }

  return props;
}

function buildChildContext(type: string, props: Record<string, any>, context: RenderContext): RenderContext {
  const next: RenderContext = {
    ...context,
    parentType: type,
    parentProps: props,
  };

  if (type === 'Tabs') {
    next.tabsActive = props.value || props.defaultValue;
  }

  return next;
}

function normalizeNode(
  type: string,
  props: Record<string, any>,
  children: UINode | string | Array<UINode | string> | undefined
): { props: Record<string, any>; children: typeof children } {
  if (type === 'Markdown' && typeof children === 'string') {
    if (props.content == null) {
      return { props: { ...props, content: children }, children: undefined };
    }
  }

  return { props, children };
}

function renderAttrs(props: Record<string, any>, id?: string): string {
  const finalProps = id && props.id == null ? { ...props, id } : props;
  return Object.entries(finalProps)
    .map(([key, value]) => renderAttr(key, value))
    .filter((value) => value !== '')
    .join('');
}

function renderAttr(key: string, value: any): string {
  if (value == null) return '';
  const attr = mapAttr(key);

  if (typeof value === 'string') {
    return ` ${attr}="${escapeAttr(value)}"`;
  }

  if (typeof value === 'number') {
    return ` ${attr}={${value}}`;
  }

  if (typeof value === 'boolean') {
    return ` ${attr}={${value}}`;
  }

  return ` ${attr}={${serializeElixir(value)}}`;
}

function mapAttr(key: string): string {
  if (EVENT_MAP[key]) return EVENT_MAP[key];
  if (ATTR_MAP[key]) return ATTR_MAP[key];
  if (key.startsWith('data-') || key.startsWith('phx-')) return key;
  return snakeCase(key);
}

function mapComponent(type: string): string {
  return snakeCase(type);
}

function snakeCase(value: string): string {
  return value
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

function escapeElixirString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

function serializeElixir(value: any): string {
  if (value == null) return 'nil';
  if (typeof value === 'string') return `"${escapeElixirString(value)}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeElixir(item)).join(', ')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([key, val]) => {
      return `\"${escapeElixirString(key)}\" => ${serializeElixir(val)}`;
    });
    return `%{${entries.join(', ')}}`;
  }

  return `\"${escapeElixirString(String(value))}\"`;
}

function sortedSlotKeys(slots: Record<string, unknown>): string[] {
  return Object.keys(slots).sort((a, b) => {
    const aNum = Number.parseInt(a, 10);
    const bNum = Number.parseInt(b, 10);
    const aIsNum = !Number.isNaN(aNum) && String(aNum) === a;
    const bIsNum = !Number.isNaN(bNum) && String(bNum) === b;

    if (aIsNum && bIsNum) return aNum - bNum;
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return a.localeCompare(b);
  });
}

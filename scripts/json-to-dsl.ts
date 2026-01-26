#!/usr/bin/env npx tsx
/**
 * JSON Schema → DSL 转换器
 *
 * 将 components-showcase.json 转换为等效的 DSL 文本
 */

import * as fs from 'fs';
import * as path from 'path';

interface JsonNode {
  type: string;
  props?: Record<string, unknown>;
  children?: JsonNode[] | string;
}

// 类型映射：JSON type → DSL tag
const TYPE_TO_TAG: Record<string, string> = {
  'Flex': 'FLEX',
  'Stack': 'STACK',
  'Grid': 'GRID',
  'Text': 'TEXT',
  'Link': 'LINK',
  'Button': 'BUTTON',
  'Card': 'CARD',
  'Badge': 'BADGE',
  'Icon': 'ICON',
  'Image': 'IMAGE',
  'Avatar': 'AVATAR',
  'Input': 'INPUT',
  'Checkbox': 'CHECKBOX',
  'Switch': 'SWITCH',
  'Select': 'SELECT',
  'Slider': 'SLIDER',
  'Radio': 'RADIO',
  'Label': 'LABEL',
  'Textarea': 'TEXTAREA',
  'Alert': 'ALERT',
  'Progress': 'PROGRESS',
  'Skeleton': 'SKELETON',
  'Tooltip': 'TOOLTIP',
  'Dialog': 'DIALOG',
  'Tabs': 'TABS',
  'Breadcrumb': 'BREADCRUMB',
  'Stepper': 'STEPPER',
  'Table': 'TABLE',
  'List': 'LIST',
  'Timeline': 'TIMELINE',
  'Accordion': 'ACCORDION',
  'Section': 'SECTION',
  'Container': 'CONTAINER',
  'Hero': 'HERO',
  'Heading': 'HEADING',
  'Separator': 'SEPARATOR',
  'CodeBlock': 'CODE_BLOCK',
  'Div': 'DIV',
  'Span': 'SPAN',
  'EmptyState': 'EMPTY_STATE',
  'StatisticCard': 'STATISTIC_CARD',
  'Form': 'FORM',
};

// 布局属性映射
const LAYOUT_PROPS = new Set(['gap', 'direction', 'align', 'justify', 'columns', 'gutter']);

// 不需要转换的直接透传 props
const ATTR_PROPS = new Set([
  'variant', 'size', 'icon', 'href', 'placeholder',
  'disabled', 'title', 'description', 'value', 'fallback',
  'label', 'src', 'alt', 'language', 'code'
]);

let idCounter = 0;

function generateId(type: string): string {
  return `${type.toLowerCase()}_${++idCounter}`;
}

function convertNode(node: JsonNode | string, indent: number = 0): string {
  // 处理字符串子节点
  if (typeof node === 'string') {
    return '';  // 字符串内容在父节点处理
  }

  if (!node.type) {
    console.error('Node without type:', node);
    return '';
  }

  const tag = TYPE_TO_TAG[node.type] || node.type.toUpperCase();
  const id = generateId(tag.toLowerCase());
  const prefix = '  '.repeat(indent);

  const lines: string[] = [];

  // 开始标签
  lines.push(`${prefix}[${tag}: ${id}]`);

  // 解析 props
  const layoutProps: Record<string, string> = {};
  const attrProps: Record<string, string> = {};
  let className = '';
  let content = '';

  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      if (key === 'className') {
        className = String(value);
      } else if (key === 'id') {
        // 忽略，我们用自动生成的 id
      } else if (LAYOUT_PROPS.has(key)) {
        // 布局属性需要首字母大写
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        layoutProps[capitalizedKey] = String(value);
      } else if (ATTR_PROPS.has(key)) {
        // 属性需要首字母大写
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        attrProps[capitalizedKey] = String(value);
      }
    }
  }

  // 检查 children 是否是字符串内容
  if (typeof node.children === 'string') {
    content = node.children;
  }

  // 布局属性 { Key: "value", ... }
  if (Object.keys(layoutProps).length > 0) {
    const propsStr = Object.entries(layoutProps)
      .map(([k, v]) => `${k}: "${v}"`)
      .join(', ');
    lines.push(`${prefix}  { ${propsStr} }`);
  }

  // ATTR: Key("value"), ...
  if (Object.keys(attrProps).length > 0) {
    const attrsStr = Object.entries(attrProps)
      .map(([k, v]) => `${k}("${v.replace(/"/g, '\\"')}")`)
      .join(', ');
    lines.push(`${prefix}  ATTR: ${attrsStr}`);
  }

  // CONTENT: "text"
  if (content) {
    lines.push(`${prefix}  CONTENT: "${content.replace(/"/g, '\\"')}"`);
  }

  // ClassName: "tailwind classes" (使用新语法)
  if (className) {
    // 注意：根据之前的设计，className 应该放在 { } 布局属性中
    // 但为了兼容旧语法，我们使用 CSS:
    // 如果要用新语法，需要在 { } 中添加 ClassName
    lines.push(`${prefix}  CSS: "${className}"`);
  }

  // 子节点
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (typeof child === 'object' && child !== null) {
        const childDsl = convertNode(child, indent + 1);
        if (childDsl) {
          lines.push(childDsl);
        }
      }
    }
  }

  return lines.join('\n');
}

function convertJsonToDsl(jsonPath: string): string {
  const json: JsonNode = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  idCounter = 0;
  return convertNode(json);
}

// 主函数
const schemaPath = path.join(__dirname, '../src/data/schemas/components-showcase.json');
const dsl = convertJsonToDsl(schemaPath);

console.log('=== 生成的 DSL (前 200 行) ===');
const lines = dsl.split('\n');
console.log(lines.slice(0, 200).join('\n'));
console.log(`\n... 共 ${lines.length} 行`);

// 保存到文件
const outputPath = path.join(__dirname, '../test-dsl-components-showcase-generated.txt');
fs.writeFileSync(outputPath, dsl, 'utf-8');
console.log(`\n已保存到: ${outputPath}`);

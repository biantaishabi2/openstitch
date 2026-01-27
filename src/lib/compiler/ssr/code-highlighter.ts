import { codeToHtml } from 'shiki';
import type { UINode } from '../factory/types';

interface MarkdownBlock {
  code: string;
  language: string;
}

function extractMarkdownCodeBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(markdown)) !== null) {
    const language = match[1]?.trim() || 'text';
    const code = match[2]?.replace(/\n$/, '') ?? '';
    blocks.push({ code, language });
  }

  return blocks;
}

async function visitNode(value: unknown): Promise<void> {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const item of value) {
      await visitNode(item);
    }
    return;
  }

  if (typeof value !== 'object') return;

  const node = value as UINode & { children?: unknown; slots?: Record<string, unknown> };

  if (typeof node.type === 'string') {
    if (node.type === 'CodeBlock') {
      const props = (node.props || {}) as Record<string, unknown>;
      const code = typeof props.code === 'string' ? props.code : undefined;
      const language = typeof props.language === 'string' ? props.language : 'typescript';
      const theme = typeof props.theme === 'string' ? props.theme : 'github-dark';

      if (code && typeof props.highlightedCode !== 'string') {
        try {
          props.highlightedCode = await codeToHtml(code, {
            lang: language,
            theme,
          });
          node.props = props;
        } catch {
          // 忽略高亮失败，保留纯文本渲染
        }
      }
    }

    if (node.type === 'Markdown') {
      const props = (node.props || {}) as Record<string, unknown>;
      const markdown =
        typeof props.content === 'string'
          ? props.content
          : typeof node.children === 'string'
            ? node.children
            : undefined;

      if (markdown && !Array.isArray(props.highlightedBlocks)) {
        const blocks = extractMarkdownCodeBlocks(markdown);
        if (blocks.length > 0) {
          const highlightedBlocks: Array<string | undefined> = [];

          for (const block of blocks) {
            try {
              const html = await codeToHtml(block.code, {
                lang: block.language,
                theme: 'github-dark',
              });
              highlightedBlocks.push(html);
            } catch {
              highlightedBlocks.push(undefined);
            }
          }

          props.highlightedBlocks = highlightedBlocks;
          node.props = props;
        }
      }
    }

    if (node.children) {
      await visitNode(node.children);
    }

    if (node.slots && typeof node.slots === 'object') {
      for (const slotValue of Object.values(node.slots)) {
        await visitNode(slotValue);
      }
    }
  }
}

export async function precomputeCodeHighlights(ir: UINode): Promise<void> {
  await visitNode(ir);
}

'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { CodeBlock, InlineCode } from '@/components/ui/code-block';

export interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
  content?: string;
  highlightedBlocks?: Array<string | undefined>;
}

function normalizeMarkdownContent(value: React.ReactNode): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : '')).join('');
  }
  return '';
}

const Markdown = React.forwardRef<HTMLDivElement, MarkdownProps>(
  ({ className, content, highlightedBlocks, children, ...props }, ref) => {
    const markdown = content ?? normalizeMarkdownContent(children);
    let blockIndex = 0;

    return (
      <div
        ref={ref}
        className={cn('prose prose-sm max-w-none text-foreground', className)}
        {...props}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre: ({ children: preChildren }) => <>{preChildren}</>,
            code: ({ inline, className: codeClassName, children: codeChildren }) => {
              const code = String(codeChildren ?? '').replace(/\n$/, '');
              if (inline) {
                return <InlineCode>{code}</InlineCode>;
              }

              const match = /language-(\\w+)/.exec(codeClassName || '');
              const language = match?.[1] || 'text';
              const highlightedCode = highlightedBlocks?.[blockIndex];
              blockIndex += 1;
              return (
                <CodeBlock
                  code={code}
                  language={language}
                  highlightedCode={highlightedCode}
                />
              );
            },
            a: ({ children: linkChildren, ...linkProps }) => (
              <a className="text-primary underline" {...linkProps}>
                {linkChildren}
              </a>
            ),
            table: ({ children: tableChildren }) => (
              <div className="not-prose overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  {tableChildren}
                </table>
              </div>
            ),
            th: ({ children: thChildren }) => (
              <th className="border-b px-2 py-1 text-left font-medium">
                {thChildren}
              </th>
            ),
            td: ({ children: tdChildren }) => (
              <td className="border-b px-2 py-1 align-top">
                {tdChildren}
              </td>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    );
  }
);

Markdown.displayName = 'Markdown';

export { Markdown };

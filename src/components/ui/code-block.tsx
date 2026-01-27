'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { codeToHtml } from 'shiki';

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  theme?: 'github-dark' | 'github-light' | 'one-dark-pro' | 'dracula';
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      className,
      code,
      language = 'typescript',
      filename,
      showLineNumbers = true,
      theme = 'github-dark',
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);
    // 初始状态使用纯文本代码，用于 SSR
    // 添加 inline style 确保代码在深色背景上可见
    const [highlightedCode, setHighlightedCode] = React.useState<string>(
      `<pre style="color: #f4f4f5; margin: 0;"><code style="color: #f4f4f5;">${code?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''}</code></pre>`
    );

    React.useEffect(() => {
      const highlight = async () => {
        try {
          const html = await codeToHtml(code, {
            lang: language,
            theme: theme,
          });
          setHighlightedCode(html);
        } catch {
          // 如果高亮失败，显示纯文本（保持浅色文字）
          setHighlightedCode(`<pre style="color: #f4f4f5; margin: 0;"><code style="color: #f4f4f5;">${code}</code></pre>`);
        }
      };
      highlight();
    }, [code, language, theme]);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border bg-zinc-950 text-sm overflow-hidden',
          className
        )}
        {...props}
      >
        {/* 头部：文件名和复制按钮 */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <div className="flex items-center gap-2">
            {/* 模拟窗口按钮 */}
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            {filename && (
              <span className="ml-2 text-xs text-zinc-400">{filename}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                复制
              </>
            )}
          </button>
        </div>

        {/* 代码内容 */}
        <div
          className={cn(
            'overflow-x-auto p-4',
            showLineNumbers && '[&_pre]:!pl-12 [&_code]:relative [&_.line]:before:absolute [&_.line]:before:left-0 [&_.line]:before:w-8 [&_.line]:before:text-right [&_.line]:before:text-zinc-600 [&_.line]:before:pr-4 [&_.line]:before:content-[counter(line)] [&_.line]:before:[counter-increment:line] [&_code]:[counter-reset:line]'
          )}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    );
  }
);
CodeBlock.displayName = 'CodeBlock';

// 简单的内联代码组件
const InlineCode = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <code
    ref={ref}
    className={cn(
      'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
      className
    )}
    {...props}
  />
));
InlineCode.displayName = 'InlineCode';

export { CodeBlock, InlineCode };

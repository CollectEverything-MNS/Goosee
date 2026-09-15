'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  children: string;
  className?: string;
  compact?: boolean;
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return toText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}

export function MarkdownContent({ children, className, compact = false }: MarkdownContentProps) {
  const text = compact ? 'text-sm leading-snug' : 'text-[15px] leading-7';

  return (
    <div className={cn('break-words text-foreground', compact ? 'space-y-2' : 'space-y-4', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              id={slugify(toText(children))}
              className={cn(
                'scroll-mt-24 font-bold tracking-tight',
                compact ? 'text-base' : 'mb-2 text-3xl'
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={slugify(toText(children))}
              className={cn(
                'scroll-mt-24 font-semibold tracking-tight',
                compact
                  ? 'text-sm'
                  : 'mt-12 border-l-4 border-violet-600 pl-3 text-2xl first:mt-0'
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={slugify(toText(children))}
              className={cn(
                'scroll-mt-24 font-semibold',
                compact ? 'text-sm' : 'mt-10 border-b pb-2 text-xl first:mt-0'
              )}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={cn('font-semibold', compact ? 'text-sm' : 'mt-6 text-base')}>{children}</h4>
          ),
          p: ({ children }) => <p className={text}>{children}</p>,
          ul: ({ children }) => (
            <ul className={cn('list-disc space-y-1 pl-5 marker:text-violet-600', text)}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className={cn('list-decimal space-y-1 pl-5 marker:font-semibold marker:text-violet-600', text)}>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-violet-600 underline underline-offset-2 hover:text-violet-700"
              target={href?.startsWith('#') ? undefined : '_blank'}
              rel={href?.startsWith('#') ? undefined : 'noreferrer'}
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-violet-700 dark:text-violet-300">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="rounded-r-lg border-l-4 border-violet-400 bg-violet-50 px-4 py-3 text-sm text-foreground/90 dark:bg-violet-950/30 [&>p]:leading-relaxed">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-border" />,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b px-3 py-2 align-top last:border-b-0">{children}</td>,
          tr: ({ children }) => <tr className="even:bg-muted/30 [&:last-child>td]:border-b-0">{children}</tr>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

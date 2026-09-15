'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, ChevronRight, Loader2, Search } from 'lucide-react';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { MarkdownContent, slugify } from '@/components/markdown-content';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { useGuide } from './usecases/use-guide';

interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

interface TocGroup {
  part: Heading;
  children: Heading[];
}

const TOC_HEADING = /^##\s+sommaire\s*$/i;
const ACTIVE_OFFSET_PX = 140;

// Retire le bloc "## Sommaire" du guide : la page a son propre sommaire lateral.
function stripToc(markdown: string): string {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => TOC_HEADING.test(l));
  if (start === -1) return markdown;
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return [...lines.slice(0, start), ...lines.slice(end === -1 ? lines.length : end)].join('\n');
}

function extractHeadings(markdown: string): Heading[] {
  return markdown
    .split('\n')
    .map((line) => line.match(/^(##|###)\s+(.+?)\s*$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ level: m[1].length as 2 | 3, text: m[2], id: slugify(m[2]) }));
}

function groupHeadings(headings: Heading[]): TocGroup[] {
  const groups: TocGroup[] = [];
  for (const h of headings) {
    if (h.level === 2) groups.push({ part: h, children: [] });
    else if (groups.length) groups[groups.length - 1].children.push(h);
    else groups.push({ part: h, children: [] });
  }
  return groups;
}

// Coupe le guide en sections et ne garde que celles dont le texte contient la recherche.
function filterSections(markdown: string, query: string): string {
  const needle = query.trim().toLowerCase();
  if (!needle) return markdown;

  return markdown
    .split(/\n(?=##\s|###\s)/)
    .filter((block) => block.toLowerCase().includes(needle))
    .join('\n');
}

// Titre actif = dernier titre passe au-dessus de la ligne de lecture. Ecoute tous les
// evenements de scroll (capture) car l'admin scrolle dans un conteneur, pas dans window.
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!ids.length) {
      setActive(null);
      return;
    }
    let frame = 0;

    const compute = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) current = id;
        else break;
      }
      setActive(current ?? ids[0]);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    compute();
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);

  return active;
}

export function Documentation() {
  const t = useTranslations();
  const { data: guide, isLoading, isError } = useGuide();
  const [query, setQuery] = useState('');
  const [openParts, setOpenParts] = useState<Record<string, boolean>>({});

  const body = useMemo(() => (guide ? stripToc(guide) : ''), [guide]);
  const headings = useMemo(() => extractHeadings(body), [body]);
  const groups = useMemo(() => groupHeadings(headings), [headings]);
  const content = useMemo(() => filterSections(body, query), [body, query]);
  const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useActiveHeading(query ? [] : headingIds);

  const activePartId = useMemo(
    () => groups.find((g) => g.part.id === activeId || g.children.some((c) => c.id === activeId))?.part.id,
    [groups, activeId]
  );

  // La partie qui contient le titre actif se deplie toute seule.
  useEffect(() => {
    if (activePartId) setOpenParts((prev) => (prev[activePartId] ? prev : { ...prev, [activePartId]: true }));
  }, [activePartId]);

  // Le sommaire suit le scroll : l'entree active reste visible dans le panneau lateral.
  useEffect(() => {
    if (!activeId) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-toc-id="${activeId}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeId, activePartId]);

  const togglePart = useCallback((id: string) => {
    setOpenParts((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const searching = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.documentation')}
        subtitle={t('admin.documentation.subtitle')}
      />

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t('admin.documentation.loading')}
        </div>
      )}

      {isError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {t('admin.documentation.error')}
        </p>
      )}

      {guide && (
        <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-xl border bg-card p-4 shadow-sm lg:sticky lg:top-20">
            <label htmlFor="documentation-search" className="sr-only">
              {t('admin.documentation.search')}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="documentation-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('admin.documentation.search')}
                className="h-9 pl-8"
              />
            </div>

            <nav
              aria-label={t('admin.documentation.toc')}
              className="mt-4 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 text-sm"
            >
              <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {t('admin.documentation.toc')}
              </p>
              <ul className="space-y-1">
                {groups.map((group) => {
                  const isOpen = searching || !!openParts[group.part.id];
                  const partActive = group.part.id === activePartId;
                  return (
                    <li key={group.part.id}>
                      <div className="flex items-center">
                        <a
                          href={`#${group.part.id}`}
                          data-toc-id={group.part.id}
                          className={cn(
                            'flex-1 truncate rounded-md px-2 py-1.5 text-[13px] font-semibold hover:bg-muted',
                            partActive ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'
                          )}
                        >
                          {group.part.text}
                        </a>
                        {group.children.length > 0 && (
                          <button
                            type="button"
                            onClick={() => togglePart(group.part.id)}
                            aria-expanded={isOpen}
                            aria-controls={`toc-${group.part.id}`}
                            aria-label={group.part.text}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <ChevronRight
                              className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')}
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>
                      {group.children.length > 0 && (
                        <ul
                          id={`toc-${group.part.id}`}
                          hidden={!isOpen}
                          className="ml-2 mt-0.5 space-y-0.5 border-l pl-1"
                        >
                          {group.children.map((h) => {
                            const isActive = h.id === activeId;
                            return (
                              <li key={h.id}>
                                <a
                                  href={`#${h.id}`}
                                  data-toc-id={h.id}
                                  aria-current={isActive ? 'location' : undefined}
                                  className={cn(
                                    '-ml-[calc(0.25rem+1px)] block truncate rounded-r-md border-l-2 py-1.5 pl-3 pr-2 transition-colors',
                                    isActive
                                      ? 'border-violet-600 bg-violet-50 font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                                      : 'border-transparent text-foreground/75 hover:bg-muted hover:text-foreground'
                                  )}
                                >
                                  {h.text}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0 rounded-xl border bg-card px-6 py-8 shadow-sm sm:px-10">
            {content.trim() ? (
              <MarkdownContent className="mx-auto max-w-3xl">{content}</MarkdownContent>
            ) : (
              <p className="text-sm text-muted-foreground">{t('admin.documentation.noResult')}</p>
            )}
          </article>
        </div>
      )}
    </div>
  );
}

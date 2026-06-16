'use client';

import { Globe, ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  title: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
}

export function SettingsPreview({ title, description, logoUrl, faviconUrl, primaryColor }: Props) {
  const t = useTranslations('admin.siteSettings');
  const color = primaryColor || '#3b82f6';
  const displayTitle = title?.trim() || t('preview.noTitle');
  const displayDescription = description?.trim() || t('preview.noDescription');

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('sections.preview')}
        </h3>
        <span className="text-[11px] text-muted-foreground">{t('preview.tagline')}</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {faviconUrl ? (
              <img src={faviconUrl} alt="favicon" className="h-4 w-4 rounded-sm object-cover" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            )}
            <span className="text-xs font-medium text-foreground">{displayTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="h-full w-full object-contain" />
              ) : (
                <ImageOff className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold text-foreground">{displayTitle}</div>
              <div className="line-clamp-2 text-xs text-muted-foreground">{displayDescription}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {t('form.save')}
            </button>
            <span
              className="rounded-md border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: color, color }}
            >
              {t('form.primaryColor')}
            </span>
            <div
              className="ml-auto flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5"
              title={color}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[11px] uppercase text-muted-foreground">{color}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

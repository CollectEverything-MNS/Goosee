'use client';

import { useEffect, useState } from 'react';

import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';

type TemplateCategory = 'drive' | 'bakery' | 'restaurant' | 'beauty';

const VALID_CATEGORIES: TemplateCategory[] = ['drive', 'bakery', 'restaurant', 'beauty'];

function isTemplateCategory(value: unknown): value is TemplateCategory {
  return typeof value === 'string' && (VALID_CATEGORIES as string[]).includes(value);
}

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSettings();
  const [category, setCategory] = useState<TemplateCategory | null>(null);

  useEffect(() => {
    const raw = settings?.metadata?.templateCategory;
    setCategory(isTemplateCategory(raw) ? raw : null);
  }, [settings]);

  return (
    <div data-site-template={category ?? 'default'} className="site-themed">
      {children}
    </div>
  );
}

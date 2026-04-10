'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Page, PageStatus, PageType } from '@/features/personnalisation/pages/types/page.types';
import { PageRenderer } from '@/components/page-blocks/block-renderer';
import { Loader2 } from 'lucide-react';

function useHomePage() {
  return useQuery({
    queryKey: ['page', 'home'],
    queryFn: async () => {
      const data = await api.get<{ pages: Page[] }>('/pages');
      const pages = data.pages ?? data;
      const home = (Array.isArray(pages) ? pages : []).find(
        (p: Page) => p.type === PageType.HOME && p.status === PageStatus.PUBLISHED
      );
      return home ?? null;
    },
  });
}

export default function HomePage() {
  const { data: page, isLoading } = useHomePage();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Aucune page d&apos;accueil publiée</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <PageRenderer components={page.components} context={{ mode: 'front' }} />
    </main>
  );
}

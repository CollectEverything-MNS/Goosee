'use client';

import { Loader2 } from 'lucide-react';

import { useGetPageBySlug } from '@/features/personnalisation/pages/usecases/get-page-by-slug/use-get-page-by-slug';
import { PageRenderer } from '@/components/page-blocks/block-renderer';
import { ContactBlock } from '@/components/page-blocks/contact-block';
import { PageStatus } from '@/features/personnalisation/pages/types/page.types';

export default function ContactPage() {
  // La page contact est désormais pilotée par le page builder (seed / template).
  const { data: page, isLoading } = useGetPageBySlug('contact');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Page définie en base et publiée → rendu dynamique des blocs.
  if (page && page.status === PageStatus.PUBLISHED && page.components?.length) {
    return (
      <main className="min-h-screen">
        {!page.components.some((c) => c.type === 'hero') && (
          <h1 className="sr-only">{page.title}</h1>
        )}
        <PageRenderer components={page.components} context={{ mode: 'front' }} />
      </main>
    );
  }

  // Fallback : bloc contact par défaut si aucune page n'existe encore en base.
  return (
    <main className="min-h-screen">
      <h1 className="sr-only">Contact</h1>
      <ContactBlock context={{ mode: 'front' }} />
    </main>
  );
}

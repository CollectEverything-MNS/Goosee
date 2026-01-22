'use client';

import { useState } from 'react';
import { Page, PageComponent } from '../../types/page.types';
import { PageBuilder } from '../page-builder/page-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface PageEditorProps {
  page?: Page;
}

export function PageEditor({ page }: PageEditorProps) {
  const locale = useLocale();
  const [components, setComponents] = useState<PageComponent[]>(page?.components || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/goosee-admin/pages`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">
              {page ? 'Modifier la page' : 'Nouvelle page'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {page ? `Édition de "${page.title}"` : 'Créez une nouvelle page'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>
      <PageBuilder components={components} onChange={setComponents} />
    </div>
  );
}

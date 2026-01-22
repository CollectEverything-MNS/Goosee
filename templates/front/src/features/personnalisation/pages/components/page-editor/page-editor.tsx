'use client';

import { useState } from 'react';
import { Page, PageComponent, PageStatus, PageType } from '../../types/page.types';
import { PageBuilder } from '../page-builder/page-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface PageEditorProps {
  page?: Page;
  onSave: (data: Partial<Page>) => Promise<void>;
}

export function PageEditor({ page, onSave }: PageEditorProps) {
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [status, setStatus] = useState<PageStatus>(page?.status || PageStatus.DRAFT);
  const [type, setType] = useState<PageType>(page?.type || PageType.CUSTOM);
  const [components, setComponents] = useState<PageComponent[]>(page?.components || []);
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || '');

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({
        title,
        slug,
        status,
        type,
        components,
        metaTitle,
        metaDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!page) {
      setSlug(generateSlug(value));
    }
  };

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
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
      <PageBuilder components={components} onChange={setComponents} />
    </div>
  );
}

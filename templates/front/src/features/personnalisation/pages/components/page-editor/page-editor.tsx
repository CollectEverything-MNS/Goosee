'use client';

import { useState } from 'react';
import { Page, PageComponent, PageStatus, PageType } from '../../types/page.types';
import { PageBuilder } from '../page-builder/page-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <PageBuilder components={components} onChange={setComponents} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la page</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ma super page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL (slug)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ma-super-page"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de page</Label>
                <Select value={type} onValueChange={(v) => setType(v as PageType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PageType.CUSTOM}>Personnalisée</SelectItem>
                    <SelectItem value={PageType.HOME}>Accueil</SelectItem>
                    <SelectItem value={PageType.CATALOG}>Catalogue</SelectItem>
                    <SelectItem value={PageType.CONTACT}>Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PageStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PageStatus.DRAFT}>Brouillon</SelectItem>
                    <SelectItem value={PageStatus.PUBLISHED}>Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Titre SEO</Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Titre pour les moteurs de recherche"
              />
              <p className="text-xs text-muted-foreground">
                {metaTitle.length}/60 caractères recommandés
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Description SEO</Label>
              <Input
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Description pour les moteurs de recherche"
              />
              <p className="text-xs text-muted-foreground">
                {metaDescription.length}/160 caractères recommandés
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium text-primary">
                {metaTitle || title || 'Titre de la page'}
              </p>
              <p className="text-xs text-green-600">
                https://votresite.com/{slug || 'url-de-la-page'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {metaDescription || 'Description de la page...'}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

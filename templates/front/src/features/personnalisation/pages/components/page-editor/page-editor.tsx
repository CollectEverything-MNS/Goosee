'use client';

import { useState } from 'react';
import { Page, PageComponent, PageStatus, PageType } from '../../types/page.types';
import { PageBuilder } from '../page-builder/page-builder';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Save, Settings } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreatePage } from '../../usecases/create-page/use-create-page';
import { useUpdatePage } from '../../usecases/update-page/use-update-page';

interface PageEditorProps {
  page?: Page;
}

export function PageEditor({ page }: PageEditorProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('admin.pageBuilder.pageEditor');
  const tStatus = useTranslations('admin.pages.status');
  const [components, setComponents] = useState<PageComponent[]>(page?.components || []);
  const [status, setStatus] = useState<PageStatus>(page?.status || PageStatus.DRAFT);
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [type, setType] = useState<PageType>(page?.type || PageType.CUSTOM);
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || '');

  const updatePageMutation = useUpdatePage();
  const createPageMutation = useCreatePage();

  const isLoading = updatePageMutation.isPending || createPageMutation.isPending;

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!page) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    try {
      if (page) {
        await updatePageMutation.mutateAsync({
          id: page.id,
          data: {
            title,
            slug,
            type,
            metaTitle,
            metaDescription,
            components,
            status
          },
        });
        toast.success(t('saveSuccess'));
      } else {
        const newPage = await createPageMutation.mutateAsync({
          title: title || t('newPage'),
          slug: slug || `page-${Date.now()}`,
          type,
          metaTitle,
          metaDescription,
          components,
          status,
        });
        toast.success(t('createSuccess'));
        router.push(`/${locale}/goosee-admin/pages/${newPage.id}/edit`);
      }
    } catch {
      toast.error(t('saveError'));
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
              {page ? t('editPage') : t('newPage')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {page ? t('editing', { title: title || page.title }) : t('createNew')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('pageSettings')}</SheetTitle>
                <SheetDescription>{t('pageSettingsDescription')}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('title')}</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={t('titlePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">{t('slug')}</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={t('slugPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('type')}</Label>
                  <Select value={type} onValueChange={(value) => setType(value as PageType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PageType.HOME}>{t('types.home')}</SelectItem>
                      <SelectItem value={PageType.CATALOG}>{t('types.catalog')}</SelectItem>
                      <SelectItem value={PageType.CONTACT}>{t('types.contact')}</SelectItem>
                      <SelectItem value={PageType.CUSTOM}>{t('types.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">{t('metaTitle')}</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={t('metaTitlePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">{t('metaDescription')}</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={t('metaDescriptionPlaceholder')}
                    rows={3}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Select value={status} onValueChange={(value) => setStatus(value as PageStatus)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PageStatus.DRAFT}>{tStatus('draft')}</SelectItem>
              <SelectItem value={PageStatus.PUBLISHED}>{tStatus('published')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('save')}
          </Button>
        </div>
      </div>
      <PageBuilder components={components} onChange={setComponents} />
    </div>
  );
}

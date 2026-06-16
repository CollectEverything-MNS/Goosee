'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Palette, PencilLine, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import * as z from 'zod';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useSettings } from '../usecases/use-get-settings';
import { useUpdateSettings } from '../usecases/use-update-settings';
import { useUploadFile } from '../usecases/use-upload-file';

import { SettingsPreview } from './settings-preview';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const FALLBACK_COLOR = '#3b82f6';

export function SettingsForm() {
  const t = useTranslations('admin.siteSettings');
  const tPage = useTranslations('admin.pageTitles');
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const uploadMutation = useUploadFile();

  const handleUpload = async (file: File, folder: string) => {
    return uploadMutation.mutateAsync({ file, folder });
  };

  const initialValues = useMemo<FormValues>(
    () => ({
      title: settings?.title || '',
      description: settings?.description || '',
      logoUrl: settings?.logoUrl || '',
      faviconUrl: settings?.faviconUrl || '',
      primaryColor: settings?.primaryColor || FALLBACK_COLOR,
    }),
    [settings],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (settings) {
      form.reset(initialValues);
    }
  }, [settings, initialValues, form]);

  const handleReset = () => {
    form.reset(initialValues);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        logoUrl: values.logoUrl ?? undefined,
        faviconUrl: values.faviconUrl ?? undefined,
        primaryColor: values.primaryColor || undefined,
      });
      toast.success(t('form.saveSuccess'));
      form.reset(values);
    } catch {
      toast.error(t('form.saveError'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPending = updateMutation.isPending;
  const isDirty = form.formState.isDirty;
  const watched = form.watch();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdminTitle
          size="h1"
          title={tPage('siteSettings')}
          subtitle={t('subtitle')}
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending || !isDirty}
                onClick={handleReset}
                className="h-10 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {t('form.reset')}
              </Button>
              <Button type="submit" disabled={isPending || !isDirty} className="h-10 gap-2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t('form.save')}
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <PencilLine className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('sections.identity')}
                </h3>
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">{t('form.title')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.titlePlaceholder')}
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">{t('form.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.descriptionPlaceholder')}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      {t('form.descriptionHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('sections.branding')}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.logoUrl')}</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          onUpload={(file) => handleUpload(file, 'logos')}
                          accept={{
                            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
                          }}
                          placeholder={t('form.logoUrlPlaceholder')}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {t('form.logoHelp')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faviconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.faviconUrl')}</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          onUpload={(file) => handleUpload(file, 'favicons')}
                          accept={{ 'image/*': ['.ico', '.png', '.svg'] }}
                          maxSize={1 * 1024 * 1024}
                          placeholder={t('form.faviconUrlPlaceholder')}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {t('form.faviconHelp')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('sections.theme')}
                </h3>
              </div>
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">{t('form.primaryColor')}</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input
                          type="color"
                          className="h-10 w-14 cursor-pointer p-1"
                          {...field}
                          value={field.value || FALLBACK_COLOR}
                        />
                      </FormControl>
                      <Input
                        value={field.value || FALLBACK_COLOR}
                        onChange={field.onChange}
                        placeholder={FALLBACK_COLOR}
                        className="h-10 max-w-[180px] font-mono text-xs uppercase"
                      />
                      <span
                        className="h-10 flex-1 rounded-md border border-border"
                        style={{ backgroundColor: field.value || FALLBACK_COLOR }}
                      />
                    </div>
                    <FormDescription className="text-[11px]">
                      {t('form.primaryColorHint')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <SettingsPreview
                title={watched.title}
                description={watched.description}
                logoUrl={watched.logoUrl}
                faviconUrl={watched.faviconUrl}
                primaryColor={watched.primaryColor}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

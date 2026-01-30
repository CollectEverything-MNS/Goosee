'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useSettings } from '../usecases/use-get-settings';
import { useUpdateSettings } from '../usecases/use-update-settings';
import { useUploadFile } from '../usecases/use-upload-file';
import { Loader2, Save } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SettingsForm() {
  const t = useTranslations('admin.siteSettings');
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const uploadMutation = useUploadFile();

  const handleUpload = async (file: File, folder: string) => {
    const result = await uploadMutation.mutateAsync({ file, folder });
    return result;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#3b82f6',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        title: settings.title || '',
        description: settings.description || '',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        primaryColor: settings.primaryColor || '#3b82f6',
      });
    }
  }, [settings, form]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('form.siteDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.titlePlaceholder')} {...field} />
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
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('form.descriptionPlaceholder')}
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('form.descriptionHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.logoUrl')}</FormLabel>
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
                    <FormDescription>
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
                    <FormLabel>{t('form.faviconUrl')}</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        onUpload={(file) => handleUpload(file, 'favicons')}
                        accept={{
                          'image/*': ['.ico', '.png', '.svg'],
                        }}
                        maxSize={1 * 1024 * 1024}
                        placeholder={t('form.faviconUrlPlaceholder')}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('form.faviconHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.primaryColor')}</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input
                        type="color"
                        className="w-16 h-10 p-1 cursor-pointer"
                        {...field}
                      />
                    </FormControl>
                    <Input
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t('form.save')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

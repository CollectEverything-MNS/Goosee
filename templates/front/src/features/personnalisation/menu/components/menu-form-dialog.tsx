'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, Menu as MenuIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePages } from '@/features/personnalisation/pages/usecases/list-pages/use-list-pages';

import { useMenu } from '../context/menu-provider';
import { Menu } from '../types/menu.types';
import { useCreateMenu } from '../usecases/use-create-menu';
import { useMenus } from '../usecases/use-list-menus';
import { useUpdateMenu } from '../usecases/use-update-menu';

const formSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  linkType: z.enum(['page', 'external']),
  pageId: z.string().optional(),
  externalUrl: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean(),
  openInNewTab: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function MenuFormDialog() {
  const t = useTranslations('admin.menu');
  const { open, setOpen, currentRow } = useMenu();
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const { data: menus = [] } = useMenus();
  const { data: pagesData } = usePages();
  const pages = (Array.isArray(pagesData) ? pagesData : []) as Array<{ id: string; title: string }>;

  const isEditing = open === 'edit' && !!currentRow;
  const isOpen = open === 'create' || open === 'edit';

  const flattenMenus = (items: Menu[], exclude?: string): Menu[] => {
    return items.reduce<Menu[]>((acc, item) => {
      if (item.id !== exclude) {
        acc.push(item);
        if (item.children) {
          acc.push(...flattenMenus(item.children, exclude));
        }
      }
      return acc;
    }, []);
  };

  const availableParents = flattenMenus(menus, currentRow?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      linkType: 'page',
      pageId: 'none',
      externalUrl: '',
      parentId: 'none',
      isActive: true,
      openInNewTab: false,
    },
  });

  useEffect(() => {
    if (isEditing && currentRow) {
      form.reset({
        label: currentRow.label,
        linkType: currentRow.externalUrl ? 'external' : 'page',
        pageId: currentRow.pageId || 'none',
        externalUrl: currentRow.externalUrl || '',
        parentId: currentRow.parentId || 'none',
        isActive: currentRow.isActive,
        openInNewTab: currentRow.openInNewTab,
      });
    } else if (open === 'create') {
      form.reset({
        label: '',
        linkType: 'page',
        pageId: 'none',
        externalUrl: '',
        parentId: 'none',
        isActive: true,
        openInNewTab: false,
      });
    }
  }, [isEditing, currentRow, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        label: values.label,
        pageId: values.linkType === 'page' && values.pageId !== 'none' ? values.pageId : undefined,
        externalUrl: values.linkType === 'external' ? values.externalUrl || undefined : undefined,
        parentId: values.parentId !== 'none' ? values.parentId : undefined,
        isActive: values.isActive,
        openInNewTab: values.openInNewTab,
      };

      if (isEditing && currentRow) {
        await updateMutation.mutateAsync({ id: currentRow.id, data });
        toast.success(t('actions.updateSuccess'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('actions.createSuccess'));
      }
      setOpen(null);
    } catch {
      toast.error(isEditing ? t('actions.updateError') : t('actions.createError'));
    }
  };

  const linkType = form.watch('linkType');
  const isPending = createMutation.isPending || updateMutation.isPending;
  const handleClose = () => setOpen(null);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <MenuIcon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-semibold">
                {isEditing ? t('dialog.editTitle') : t('dialog.createTitle')}
              </DialogTitle>
              <DialogDescription className="text-xs">{t('form.label')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.label')}
                </h3>
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.label')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.labelPlaceholder')}
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.linkType')}
                </h3>
                <FormField
                  control={form.control}
                  name="linkType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.linkType')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('form.selectLinkType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="page">{t('form.linkTypePage')}</SelectItem>
                          <SelectItem value="external">{t('form.linkTypeExternal')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {linkType === 'page' && (
                  <FormField
                    control={form.control}
                    name="pageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t('form.page')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={t('form.selectPage')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('form.selectPage')}</SelectItem>
                            {pages.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {linkType === 'external' && (
                  <FormField
                    control={form.control}
                    name="externalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          {t('form.externalUrl')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.parent')}
                </h3>
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.parent')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('form.noParent')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t('form.noParent')}</SelectItem>
                          {availableParents.map((menu) => (
                            <SelectItem key={menu.id} value={menu.id}>
                              {menu.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">{t('form.isActive')}</FormLabel>
                        <FormDescription className="text-[11px]">
                          {t('status.active')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openInNewTab"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          {t('form.openInNewTab')}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>
                {t('form.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? t('form.update') : t('form.create')}
                {!isPending && !isEditing && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
